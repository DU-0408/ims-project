import asyncio
import functools
import logging

logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

def with_retry(max_attempts: int = 3, base_delay: float = 0.5, exceptions: tuple = (Exception,)):
    """
    Decorator that retries an async function with exponential backoff.
    
    max_attempts: Total number of attempts (including first try)
    base_delay: Initial delay in seconds (doubles each retry)
    exceptions: Tuple of exception types to retry on
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None

            for attempt in range(1, max_attempts + 1):
                try:
                    return await func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    if attempt == max_attempts:
                        print(
                            f"[RETRY] {func.__name__} failed after {max_attempts} attempts."
                            # f" Final error: {e}" # Actually want to hide the error from the logs
                        )
                        raise
                    delay = base_delay * (2 ** (attempt - 1))
                    print(
                        f"[RETRY] {func.__name__} attempt {attempt} failed. "
                        f"Retrying in {delay:.1f}s..."
                    )
                    await asyncio.sleep(delay)

            raise last_exception
        return wrapper
    return decorator