from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    POSTGRES_URL: str
    MONGO_URL: str
    MONGO_DB: str
    REDIS_URL: str
    RATE_LIMIT: str = "1000/minute"
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
