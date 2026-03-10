from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    UPLOAD_DIR: str = "/app/uploads"
    DATABASE_PATH: str = "/app/data/voss.db"

    STAGE_MIN_DELAY_S: float = 2.0
    STAGE_MAX_DELAY_S: float = 5.0
    MAX_FILE_SIZE_MB: int = 50
    MAX_RETRY_COUNT: int = 3
    ALLOWED_MIME_TYPES: str = (
        "audio/webm,audio/ogg,audio/wav,audio/mpeg,audio/mp4,"
        "video/webm,application/octet-stream"
    )

    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    model_config = {"env_prefix": "VOSS_", "env_file": ".env"}


settings = Settings()
