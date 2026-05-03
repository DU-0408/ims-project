from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    POSTGRES_URL: str
    MONGO_URL: str
    MONGO_DB: str
    REDIS_URL: str
    RATE_LIMIT: str = "1000/minute"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    class Config:
        env_file = ".env"

settings = Settings()