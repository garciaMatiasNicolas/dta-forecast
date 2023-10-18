from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from rest_framework import status
from .models import User
from .serializers import UserSerializer
from rest_framework.decorators import api_view
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import authentication_classes, permission_classes




class UserViews:
    @api_view(['GET'])
    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def get_all_users(request):
        queryset = User.objects.all()
        user_serializer = UserSerializer(queryset, many=True)
        return Response(user_serializer.data, status=status.HTTP_200_OK)

    @api_view(['POST'])
    def create_user(request):
        user_serializer = UserSerializer(data=request.data)

        if request.method == 'POST':
            if user_serializer.is_valid():
                user_serializer.save()

                return Response({'message': 'user_saved', 'user': user_serializer.data},
                                status=status.HTTP_201_CREATED)

            else:
                return Response({'error': 'bad_request', 'logs': user_serializer.errors},
                                status=status.HTTP_400_BAD_REQUEST)

        else:
            return Response({'error': 'method_not_allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @api_view(['PUT', 'DELETE', 'GET'])
    @authentication_classes([TokenAuthentication])
    @permission_classes([IsAuthenticated])
    def detail_user(request, pk):
        user = User.objects.filter(id=pk).first()
        user_serializer = UserSerializer(user, data=request.data)

        if user:

            if request.method == 'GET':
                user_data = UserSerializer(user)
                return Response(user_data.data)

            if request.method == 'PUT':
                if user_serializer.is_valid():
                    user_serializer.save()
                    return Response({'message': 'user_updated', 'user': user_serializer.data},
                                    status=status.HTTP_200_OK)
                else:
                    return Response({'error': 'bad_request', 'logs': user_serializer.errors},
                                    status=status.HTTP_400_BAD_REQUEST)

            elif request.method == 'DELETE':
                user.delete()
                return Response({'message': 'user_deleted'}, status=status.HTTP_200_OK)

            else:
                return Response({'error': 'method_not_allowed'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

        else:
            return Response({'error': 'user_not_exists'}, status=status.HTTP_400_BAD_REQUEST)
