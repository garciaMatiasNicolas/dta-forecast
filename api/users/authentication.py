from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.sessions.models import Session
from .models import User
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from django.conf import settings
from django.urls import reverse
from django.shortcuts import redirect


class UserAuthenticationViews:
    @api_view(['GET'])
    def confirm_email(self, pk: int):
        user = User.objects.filter(id=pk)
        user.is_active = True
        user.save()
        return redirect('http://localhost:3000/login')

    class LogInView(ObtainAuthToken):
        def post(self, request, *args, **kwargs):
            credentials = self.get_serializer(data=request.data,
                                              context={'request': request})

            if credentials.is_valid():
                user = credentials.validated_data['user']
                if user.is_active:
                    token, created = Token.objects.get_or_create(user=user)
                    if created:
                        return Response({
                            'token': token.key,
                            'user_id': user.pk,
                            'email': user.email
                        }, status=status.HTTP_200_OK)
                    else:
                        token.delete()
                        new_token = Token.objects.create(user=user)
                        return Response({
                            'token': new_token.key,
                            'user_id': user.pk
                        }, status=status.HTTP_200_OK)
                else:
                    return Response({'error': 'user_inactive'},
                                    status=status.HTTP_401_UNAUTHORIZED)

            else:
                return Response({'error': 'credentials_invalids'},
                                status=status.HTTP_400_BAD_REQUEST)

    class LogOutView(APIView):

        def post(self, request):

            try:
                request_token = request.GET.get("token")
                token = Token.objects.filter(key=request_token).first()
                if token:
                    user = token.user
                    all_sessions = Session.objects.filter(expire_date__gte=datetime.now())
                    if all_sessions.exists():
                        for session in all_sessions:
                            session_data = session.get_decoded()
                            if user.id == int(session_data.get('_auth_user_id')):
                                session.delete()
                    token.delete()
                    return Response({'message': 'logout_succeed'},
                                    status=status.HTTP_200_OK)
                else:
                    return Response({'error': 'token_invalid'},
                                    status=status.HTTP_400_BAD_REQUEST)

            except:
                return Response({'error': 'no_token_sent'},
                                status=status.HTTP_409_CONFLICT)


def send_confirmation_email(user_email: str, user_id):
    server_smtp = 'smtp.gmail.com'
    port_smtp = 25
    user_smtp = settings.DEFAULT_FROM_EMAIL
    pass_smtp = settings.PASSWORD_EMAIL
    msg = MIMEMultipart()
    txt_message = f'Para confirmar tu mail, ingresa a este link: {reverse(viewname="confirmation_endpoint", args=[user_id])}'
    msg['From'] = user_smtp
    msg['To'] = user_email
    msg['Subject'] = "Confirmación de email DTA-FORECAST"
    msg.attach(MIMEText(txt_message, "plain"))
    server = smtplib.SMTP(server_smtp, port=port_smtp)
    server.starttls()
    server.login(user_smtp, pass_smtp)
    server.sendmail(user_smtp, user_email, msg.as_string())
    server.quit()
