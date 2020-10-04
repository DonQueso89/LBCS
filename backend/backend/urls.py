from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from graphene_django import views

urlpatterns = (
    [
        path("admin/", admin.site.urls),
        path(
            "api/graphql/",
            csrf_exempt(views.GraphQLView.as_view(graphiql=True)),
            name="graphql",
        ),
    ]
    + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
)