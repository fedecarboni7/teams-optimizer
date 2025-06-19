import os
import pytz

from dotenv import load_dotenv

load_dotenv()

class Settings:
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL")
        self.secret_key = os.getenv("SECRET_KEY")
        self.logging_level = os.getenv("LOGGING_LEVEL", "INFO")
        self.local_db = os.getenv("LOCAL_DB").lower() == "true"
        self.db_timeout = int(os.getenv("DB_TIMEOUT", 30))
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        self.smtp_server = os.getenv("SMTP_SERVER")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.brevo_smtp_username = os.getenv("BREVO_SMTP_USERNAME")
        self.brevo_smtp_password = os.getenv("BREVO_SMTP_PASSWORD")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:8000")
        self.run_db_migration = os.getenv("RUN_TIMESTAMP_MIGRATION", "false").lower() == "true"
        self.arg_timezone = pytz.timezone("America/Argentina/Buenos_Aires")
