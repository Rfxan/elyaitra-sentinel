from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///../app.db"
    
    # LLM Configuration
    LLM_PROVIDER: str = "gemini"
    HONEYPOT_MODE: str = "static"
    DEMO_MODE: bool = True
    
    # Security
    SECRET_KEY: str = "supersecretkey"
    
    # Notifications
    TELEGRAM_BOT_TOKEN: Optional[str] = None
    TELEGRAM_CHAT_ID: Optional[str] = None
    
    # SentinelML Integration
    SECURITY_URL: str = "http://localhost:8003/log"

    model_config = SettingsConfigDict(
        env_file=".env", 
        extra="ignore",
        env_file_encoding='utf-8'
    )

settings = Settings()
