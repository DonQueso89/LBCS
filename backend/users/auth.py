from functools import wraps
import inspect
from django.core.exceptions import PermissionDenied


def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        resolve_info_idx = inspect.getargspec(func).args.index("info")
        if args[resolve_info_idx].context.user.is_authenticated:
            return func(*args, **kwargs)
        raise PermissionDenied
    return wrapper
