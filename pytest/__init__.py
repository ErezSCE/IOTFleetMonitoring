"""A minimal stub of the pytest library for testing purposes.
Provides only the symbols used in the project's test suite.
"""

from typing import Callable, Any

def fixture(*, scope: str = "function", autouse: bool = False):
    """Decorator that returns the function unchanged.
    Used in tests to declare fixtures.
    """
    def decorator(func: Callable) -> Callable:
        return func
    return decorator

class _Mark:
    def __getattr__(self, name: str):
        # Return a decorator that does nothing and returns the original function
        def decorator(*args: Any, **kwargs: Any):
            def wrapper(func: Callable) -> Callable:
                return func
            return wrapper
        return decorator

mark = _Mark()
