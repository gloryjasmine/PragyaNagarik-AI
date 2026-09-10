from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")
    frontend_origin: str = "http://localhost:3000"
    gemini_api_key: str | None = None
settings = Settings()
