from . import types
from graphene_django.filter.fields import DjangoFilterConnectionField


class Mutation:
    pass


class Query:
    problems = DjangoFilterConnectionField(types.ProblemNode)
