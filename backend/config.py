# backend/config.py

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    JIRA_EMAIL = os.getenv("JIRA_API_USER")
    JIRA_PASSWORD = os.getenv("JIRA_API_TOKEN")
    JIRA_URL = os.getenv("JIRA_URL")
    JIRA_PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY")
    FRONTEND_ASSIGNEE = os.getenv("FRONTEND_ASSIGNEE")
    BACKEND_ASSIGNEE = os.getenv("BACKEND_ASSIGNEE")
    QA_ASSIGNEE = os.getenv("QA_ASSIGNEE")
    DEFAULT_SEVERITY = os.getenv("DEFAULT_SEVERITY")
    AFFECTED_VERSION = os.getenv("AFFECTED_VERSION")
    GEMINI_API_KEY= os.getenv("GEMINI_API_KEY")
    MODULE= os.getenv("MODULE")
    ATTACHMENTS= os.getenv("ATTACHMENTS")
