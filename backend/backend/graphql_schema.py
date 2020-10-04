import graphene
from graphene import relay
from graphene.types import resolver

from users.auth import login_required
from users import graphql_schema as user_schema


class Query(user_schema.Query, graphene.ObjectType):
    node = relay.Node.Field()

    class Meta:
        default_resolver = login_required(resolver.default_resolver)


class Mutation(user_schema.Mutation, graphene.ObjectType):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)