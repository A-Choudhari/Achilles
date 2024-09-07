# Create your views here.
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from django.views import View
from allauth.socialaccount.providers.oauth2.client import OAuth2Client, OAuth2Error
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
import jwt
from .models import CustomUserModel, CookieData, Email
import json
import base64
from django.shortcuts import redirect
from google.oauth2.credentials import Credentials
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from email.mime.text import MIMEText
from django.utils.decorators import method_decorator
from django.middleware.csrf import get_token
from datetime import datetime, timezone
from django.http import JsonResponse
import pytz
from openai import OpenAI
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication

class CustomGoogleOAuth2Adapter(GoogleOAuth2Adapter):
  def complete_login(self, request, app, token, response, **kwargs):
    try:
        print(response)
        identity_data = jwt.decode(
            response["id_token"], #another nested id_token was returned
            options={
                "verify_signature": False,
                "verify_iss": True,
                "verify_aud": True,
                "verify_exp": True,
            },
            issuer=self.id_token_issuer,
            audience=app.client_id,
        )
        login = self.get_provider().sociallogin_from_response(request, identity_data)
        return login
    except jwt.PyJWTError as e:
        raise OAuth2Error("Invalid id_token") from e
    login = self.get_provider().sociallogin_from_response(request, identity_data)
    return login


class GoogleLoginView(SocialLoginView):
  authentication_classes = [] # disable authentication, make sure to override `allowed origins` in settings.py in production!
  adapter_class = CustomGoogleOAuth2Adapter
  callback_url = "http://localhost:3000"  # frontend application url
  client_class = OAuth2Client


@method_decorator(csrf_exempt, name="dispatch")
class GoogleLoginView2(View):
    def post(self, request, *args, **kwargs):
        data = json.loads(request.body.decode('utf-8'))
        email = data.get("email")
        access_token = data.get("access_token")
        user = CustomUserModel.objects.get(email=email)
        user.access_token = access_token
        user.save()
        return JsonResponse({ "message": "Worked"}, status=200)


class GetCookies(View):
    def post(self, request, *args, **kwargs):
        # Access the Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header:
            # Split the "Bearer" prefix and the token
            try:
                auth_type, token = auth_header.split(' ')
                if auth_type != 'Bearer:':
                    return JsonResponse({"status": "error", "message": "Invalid Authorization type"}, status=400)
            except ValueError:
                return JsonResponse({"status": "error", "message": "Invalid Authorization header format"}, status=400)
            
            # Now you can use the token for further processing (e.g., verifying the token)
            print("Received Token:", token)
            user = CustomUserModel.objects.get(email=token)
        else:
            return JsonResponse({"status": "error", "message": "Authorization header missing"}, status=401)

        # Parse JSON data from the request body
        try:
            # print(request.body)
            body = json.loads(request.body.decode('utf-8'))
            data = body.get("data")
            print("Received Data:", data[0])  # Example: just printing the received data
            old_user_data = CookieData.objects.filter(user=user)
            for old_data in old_user_data:
               old_data.is_active = False
               old_data.save()
            user.companies_num = user.companies_num + len(data)

            for d in data:
                timestamp_ms = d["history"]["lastVisitTime"]
                name = d["history"]["title"]
                # Convert milliseconds to seconds
                timestamp_s = timestamp_ms / 1000

                # Convert to datetime object
                lastVisited = datetime.fromtimestamp(timestamp_s, tz=timezone.utc)
                local_tz = pytz.timezone('America/Los_Angeles')
                local_dt = lastVisited.astimezone(local_tz)
                print(local_dt)
                visitCount = d["history"]["visitCount"]
                iconUrl = d["history"]["faviconUrl"]
                cookies = d["cookies"]
                user.cookies_num = user.cookies_num + len(cookies)
                value = []
                for cookie in cookies:
                  cookie_dict = {
                      "domain": cookie["domain"],
                      "name": cookie["name"],
                      "value": cookie["value"],
                      "secure": cookie["secure"],
                      "httpOnly": cookie["httpOnly"],
                      "sameSite": cookie.get("sameSite", None),
                      "path": cookie["path"],
                      "session": cookie["session"]
                  }
                  if "expirationDate" in cookie:
                      cookie_dict["expirationDate"] = cookie["expirationDate"],
                  value.append(cookie_dict)
                json_data = json.dumps(value)
                grade = "A-"
                cookie_info = "20"
                client = OpenAI(api_key="")

                completion = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant."},
                        {
                            "role": "user",
                            "content": f"""
                                Based on the following information, you have to give a one-word output 
                                that will be High, Medium, or Low in terms of how safe the domain {name} 
                                and its usage of cookies are. 
                                The first information is about the cookies that our personal user is giving to the domain. 
                                Pay attention to aspects of whether or not it's being sent securely, whether it's on the same site, and the name values they have attributed to each cookie value.
                                {json_data}.

                                The next information we are giving is a ranking of the SSL Server of the domain and how it's configured.
                                The best servers will get an A+ rating and the worst will get an F. It's similar to how grades work in American schools.
                                {grade}

                                The final information we are giving is the purpose that each cookie has for the domain.
                                Cookies that have the purpose of Other and Advertisement should be frowned upon as those are not essential to using the service and they may be using that information for wrong purposes.
                                Keep in mind, if there are only a few other/advertisement cookies such as 8-10, then it's ok. However, the greater the quantity, the greater the risk.
                                {cookie_info} 
                                """
                        }
                    ]
                )

                support_email = completion.choices[0].message

                newData = CookieData(user=user, name=name,date_visited=local_dt, visit_count=visitCount, image=iconUrl, cookie_num=len(cookies), value=json_data)
                user.save()
                newData.save()
            # Return a JSON response
            return JsonResponse({"status": "success", "received_data": data})
        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON"}, status=400)
        except Exception as e:
          print(e)
          return JsonResponse({"status": "error", "message": str(e)}, status=500)

    def get(self, request, format=None):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                auth_type, email = auth_header.split(' ')
                if auth_type != 'Bearer':
                    return JsonResponse({"status": "error", "message": "Invalid Authorization type"}, status=400)
            except ValueError:
                return JsonResponse({"status": "error", "message": "Invalid Authorization header format"}, status=400)
            try:
                if not email:
                    return JsonResponse({"status": "error", "message": "Email not found in token"}, status=401)
            except Exception as e:
                print(e)
                
        user = CustomUserModel.objects.get(email=email)
        data_full = CookieData.objects.filter(user=user, is_active=True, cookie_num__gt=0)
        for data in data_full:
            values = data.value
            # print(values)
            # for value in values:
                # print(f"Value: {value}")
        # print(data_full)
        data_full_serialized = list(data_full.values())
        return JsonResponse({"data": data_full_serialized,"status": "success", "message": "GET request received"})
    
class CSRF_Token(View):
    def get(self, request, format=None):
        final = get_token(request)
        # print(final)
        return JsonResponse({'csrfToken': final})


@method_decorator(csrf_exempt, name="dispatch")
class SendEmail(View):
    def post(self, request, format=None):
        print("Hi it was successful")
        # recipient = request.POST.get('recipient')

        body = json.loads(request.body.decode('utf-8'))
        cookie_id = CookieData.objects.get(id=body.get("id"))
        google_id = cookie_id.user_id
        user = CustomUserModel.objects.get(google_id=google_id)

        client = OpenAI(api_key="")

        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {
                    "role": "user",
                    "content": f"what is customer service for {cookie_id.name}. provide one email nothing else."
                }
            ]
        )

        support_email = completion.choices[0].message

        body =
        recipient = support_email
        subject = "Action Required- CCPA Request for Personal Information and Opt-Out"
        send_gmail(user, recipient, subject, body)
        new_email = Email(user=user, recipient=recipient, subject=subject, body=body)
        new_email.save()
        user.email_sent = user.email_sent + 1
        user.save()
        return JsonResponse({"status": "success", "message": "PUT request received"})

    def get(self, request, format=None):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                auth_type, email = auth_header.split(' ')
                if auth_type != 'Bearer':
                    return JsonResponse({"status": "error", "message": "Invalid Authorization type"}, status=400)
            except ValueError:
                return JsonResponse({"status": "error", "message": "Invalid Authorization header format"}, status=400)
            try:
                if not email:
                    return JsonResponse({"status": "error", "message": "Email not found in token"}, status=401)
            except Exception as e:
                print(e)
                
        user = CustomUserModel.objects.get(email=email)
        data_full = Email.objects.filter(user=user)
        data_full_serialized = list(data_full.values())
        return JsonResponse({"data": data_full_serialized,"status": "success", "message": "GET request received"})



SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def send_gmail(user, to, subject, body):
    # Add client id, secret, token_uri, refresh_token as well
    credentials = Credentials(token=user.access_token)

    service = build('gmail', 'v1', credentials=credentials)

    message = MIMEText(body)
    message['to'] = to
    message['subject'] = subject
    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')

    try:
        message = service.users().messages().send(userId='me', body={'raw': raw_message}).execute()
        print(f"Message Id: {message['id']}")
        return message
    except Exception as e:
        print(f"An error occurred: {e}")
        return None



class UserInfo(View):
    def get(self, request, format=None):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                auth_type, email = auth_header.split(' ')
                if auth_type != 'Bearer':
                    return JsonResponse({"status": "error", "message": "Invalid Authorization type"}, status=400)
            except ValueError:
                return JsonResponse({"status": "error", "message": "Invalid Authorization header format"}, status=400)
            try:
                if not email:
                    return JsonResponse({"status": "error", "message": "Email not found in token"}, status=401)
            except Exception as e:
                print(e)
                
        user = CustomUserModel.objects.get(email=email)
        emails = Email.objects.filter(user=user)
        cookie_data = CookieData.objects.filter(user=user, is_active=True)
        danger_total = 0
        length = 0
        for stat in cookie_data:
            length += 1
            if stat.status == "Danger":
                danger_total += 2
            elif stat.status == "Medium":
                danger_total += 1
        if length > 0:
            average_dan = float(danger_total) / float(length)
        if average_dan < 0.67:
            final_output = "Low"
        elif average_dan > 1.33:
            final_output = "High"
        else:
            final_output = "Medium" 
        len_email = len(emails)
        dictionary = {"cookie_num": user.cookies_num, "company_num": user.companies_num, "email_sent": len_email, "danger": final_output}
        return JsonResponse({"data": dictionary,"status": "success", "message": "GET request received"})