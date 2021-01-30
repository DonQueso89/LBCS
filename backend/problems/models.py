from django.db import models
from django.contrib.postgres.fields import ArrayField
from backend.models import UUIDModel


class Problem(UUIDModel):
    name = models.CharField(max_length=128)
    setter = models.ForeignKey("users.LBCSUser", on_delete=models.PROTECT)
    comment = models.TextField(blank=True)
    # grade = models.PositiveSmallIntegerField()
    # rating
    grid_width = models.PositiveSmallIntegerField()
    grid_height = models.PositiveSmallIntegerField()

    start_holds = ArrayField(base_field=models.IntegerField(), blank=True, null=True)
    holds = ArrayField(base_field=models.IntegerField(), blank=True, null=True)
    end_holds = ArrayField(base_field=models.IntegerField(), blank=True, null=True)
