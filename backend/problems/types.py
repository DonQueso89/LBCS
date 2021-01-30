from graphene import relay
from graphene_django import DjangoObjectType
from problems.models import Problem


class ProblemNode(DjangoObjectType):
    class Meta:
        model = Problem
        interfaces = (relay.Node,)
        filter_fields = ("name",)

