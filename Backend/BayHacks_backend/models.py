from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from uuid import uuid4

# Create your models here.
class CustomUserModelManager(BaseUserManager):
  def create_user(self, username, email, password=None):
    """
      Creates a custom user with the given fields
    """

    user = self.model(
      username = username,
      email = self.normalize_email(email),
    )

    user.set_password(password)
    user.save(using = self._db)

    return user

  
  def create_superuser(self, username, email, password):
    user = self.create_user(
      username,
      email,
      password = password
    )

    user.is_staff = True
    user.is_superuser = True
    user.save(using = self._db)

    return user


class CustomUserModel(AbstractBaseUser, PermissionsMixin):
  # userId    = models.CharField(max_length = 16, default = uuid4, primary_key = True, editable = False)
  username  = models.CharField(max_length = 16, unique = True, null = False, blank = False)
  email     = models.EmailField(max_length = 100, unique = True, null = False, blank = False)
  google_id = models.CharField(max_length=255, unique=True, default=uuid4, primary_key=True)
  cookies_num = models.IntegerField(default=0)
  companies_num = models.IntegerField(default=0)
  cookies_over_time = models.JSONField(null=True, blank=True)
  access_token = models.TextField(blank=True, null=True)  # OAuth tokens can be long
  refresh_token = models.TextField(blank=True, null=True) 
  USERNAME_FIELD = "username"
  REQUIRED_FIELDS = ["email"]

  active       = models.BooleanField(default = True)
  
  is_staff     = models.BooleanField(default = False)
  is_superuser = models.BooleanField(default = False)
  
  created_on   = models.DateTimeField(auto_now_add = True, blank = True, null = True)
  updated_at   = models.DateTimeField(auto_now = True)

  objects = CustomUserModelManager()

  class Meta:
    verbose_name = "Custom User"


class CookieData(models.Model):
  DANGER_LEVEL_CHOICES = [
      ('Danger', 'Danger'),
      ('Medium', 'Medium'),
      ('Low', 'Low'),
  ]

  user = models.ForeignKey(CustomUserModel, null=True, blank=True, on_delete=models.CASCADE, related_name="user")
  name = models.CharField(max_length=255)
  visit_count = models.IntegerField()
  cookie_num = models.IntegerField() 
  status = models.CharField(
      max_length=10,
      choices=DANGER_LEVEL_CHOICES,
      default='Low',
  )
  value = models.TextField()
  date_visited = models.DateTimeField(default=None)
  created_at = models.DateTimeField(auto_now=True)
  sent_email = models.BooleanField(default=False)
  is_active = models.BooleanField(default=True)
  image = models.CharField(max_length=255)


class Email(models.Model):
  user = models.ForeignKey(CustomUserModel, null=True, blank=True, on_delete=models.CASCADE, related_name="user_2")
  created_at = models.DateTimeField(auto_now=True)
  recipient = models.CharField(max_length=255)
  subject = models.CharField(max_length=255)
  body = models.TextField()
