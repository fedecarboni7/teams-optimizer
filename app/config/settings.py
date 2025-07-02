import os
import pytz

from dotenv import load_dotenv

load_dotenv()

class Settings:
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL")
        self.secret_key = os.getenv("SECRET_KEY")
        self.logging_level = os.getenv("LOGGING_LEVEL", "INFO")
        self.smtp_server = os.getenv("SMTP_SERVER")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.brevo_smtp_username = os.getenv("BREVO_SMTP_USERNAME")
        self.brevo_smtp_password = os.getenv("BREVO_SMTP_PASSWORD")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:8000")
        self.run_db_migration = os.getenv("RUN_V2_PLAYERS_MIGRATION", "false").lower() == "true"
        self.arg_timezone = pytz.timezone("America/Argentina/Buenos_Aires")
