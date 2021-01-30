from graphene import relay
from graphene_django import DjangoObjectType
from users.models import LBCSUser


class UserNode(DjangoObjectType):
    class Meta:
        model = LBCSUser
        interfaces = (relay.Node,)
