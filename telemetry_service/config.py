from pydantic import BaseSettings

class Settings(BaseSettings):
    db_dsn: str = "postgresql://postgres:postgres@localhost:5432/iot"
    rabbitmq_url: str = "amqp://guest:guest@localhost/"
    telemetry_queue: str = "telemetry"

    class Config:
        env_prefix = ""
        fields = {
            "db_dsn": {"env": "DB_DSN"},
            "rabbitmq_url": {"env": "RABBITMQ_URL"},
            "telemetry_queue": {"env": "TELEMETRY_QUEUE"},
        }

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
