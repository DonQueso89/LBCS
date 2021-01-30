import graphene
from django.contrib.auth import authenticate, login, logout
from graphene import relay
from users.auth import login_required


class Login(relay.ClientIDMutation):
    """Returns a user on succesful login. Otherwise null."""

    class Input:
        username = graphene.String(required=True)
        password = graphene.String(required=True)

    user = graphene.Field("users.types.UserNode")

    @classmethod
    def mutate_and_get_payload(cls, root, info, username, password):
        user = authenticate(info.context, username=username, password=password)
        if user is not None:
            login(info.context, user)
        return cls(user=user)


class Logout(graphene.Mutation):
    success = graphene.Boolean()

    @classmethod
    @login_required
    def mutate(cls, root, info):
        logout(info.context)
        return cls(success=True)
