from django.contrib import admin
from problems.models import Problem


class ProblemAdmin(admin.ModelAdmin):
    list_display = ("setter", "name")
    readonly_fields = ("start_holds", "end_holds", "holds")


admin.site.register(Problem, ProblemAdmin)
