from graphql import ResolveInfo
import graphene.relay
from . import mutations, types
from users.auth import login_required
from graphene_django import DjangoConnectionField


class Mutation:
    logout = mutations.Logout.Field()
    login = mutations.Login.Field()


class Query:
    users = DjangoConnectionField(types.UserNode)
    me = graphene.Field(types.UserNode)

    @staticmethod
    @login_required
    def resolve_me(root: None, info: ResolveInfo):
        assert info.context
        return info.context.user
