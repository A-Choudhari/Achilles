import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline&response_type=code',
      authorization: {
        params: {
          scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.send'
        }
      },
      access_type: 'offline',
      prompt: 'consent'
    }),
  ],
  secret: "LlKq6ZtYbr+hTC073mAmAh9/h2HwMfsFo4hrfCx5mLg=",
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile, credentials }) {
       if (account.provider === "google") {
        // console.log(account.id_token);
        const id_value = account.id_token;
        // console.log("User: ", user);
        // console.log("Profile:", profile);
        console.log("Account: ", account);
        const accessToken = account.access_token;
        console.log("Refresh Token:", account.refresh_token);
        const requestBody = {
              access_token: accessToken,
              id_token: id_value
              // Other required fields
         };
         console.log(requestBody);
         try {
           const response = await axios.post(
             "http://127.0.0.1:8000/api/auth/google/", requestBody);
           const { access_token } = response.data;
           const response1 = await fetch('http://127.0.0.1:8000/api/csrf_token');
           const d = await response1.json();
           console.log(d);
           console.log("CSRF Token: ", d["csrfToken"]);
           const response2 = await axios.post(
            "http://127.0.0.1:8000/api/auth/google2/", {
              access_token: accessToken,
              email: user.email
            });
           user.accessToken = access_token;
          return true;
         } catch (error) {
           console.error(error);
           return false;
         }
       }
       return false;
     },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.accessToken = user.accessToken;
      }
      //  console.log("Token: ", token);
       return token;
     },
     async session({ session, token }) {
  //     session.accessToken = token.accessToken;
       session.user.id = token.sub;
       console.log("Session: ", session);
       return session;
     },
   },
};


export default NextAuth(authOptions);
