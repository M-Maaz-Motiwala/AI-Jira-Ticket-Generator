# AI Jira Ticket Generator

A powerful web application designed to automate the SQA workflow by generating Jira tickets for bugs and stories directly from a CSV file. This tool uses the Gemini API to intelligently create well-formatted summaries and descriptions, saving valuable time for QA engineers.

## Features

- **CSV Upload:** Easily upload your test case sheets.
- **AI-Powered Content Generation:** Automatically generates Jira-ready titles and descriptions for bugs and stories using the Gemini API.
- **Multi-Step Wizard UI:** A guided, user-friendly interface for a seamless experience.
- **Interactive Preview:** Review, sort, and filter your CSV data before processing.
- **Editable Results:** Fine-tune the AI-generated content before creating tickets.
- **Secure Configuration:** All your project settings and credentials are saved locally in your browser.

---

## Folder Structure

The project is organized into a separate frontend and backend.

```
/sqa-automation-app
├── /backend
│   ├── /api
│   │   ├── /routes
│   │   │   ├── csv_routes.py
│   │   │   ├── processing_routes.py
│   │   │   └── jira_routes.py
│   │   └── __init__.py
│   ├── .env
│   ├── app.py
│   ├── config.py
│   └── requirements.txt
│
└── /frontend
    ├── /src
    │   ├── /components
    │   │   ├── /steps
    │   │   │   ├── Step1_Configuration.jsx
    │   │   │   ├── Step2_Upload.jsx
    │   │   │   ├── Step3_Preview.jsx
    │   │   │   └── Step4_Results.jsx
    │   │   ├── ActionableIssues.jsx
    │   │   ├── ConfigForm.jsx
    │   │   ├── CsvUploader.jsx
    │   │   └── InteractiveDataTable.jsx
    │   ├── /utils
    │   │   └── api.js
    │   ├── App.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Tech Stack & Libraries

### Backend (Python/Flask)

- **Flask:** The web framework for building the API.
- **Flask-CORS:** For handling Cross-Origin Resource Sharing.
- **pandas:** For robust CSV file parsing.
- **python-dotenv:** For managing environment variables.
- **google-generativeai:** The official Python SDK for the Gemini API.
- **requests:** For making HTTP requests to the Jira API.
- **Playwright:** For browser automation to create Jira tickets.

### Frontend (React/Vite)

- **React:** The JavaScript library for building the user interface.
- **Vite:** The build tool for a fast development experience.
- **Tailwind CSS:** A utility-first CSS framework for styling.
- **Axios:** For making HTTP requests to the backend API.
- **Lucide React:** A library of beautiful and consistent icons.
- **@tanstack/react-table:** For the interactive data preview table.

---

## Setup and Installation

To get the project running locally, follow these steps.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ai-jira-ticket-generator
```

### 2. Backend Setup

Navigate to the backend directory and set up the Python environment.

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install the required Python packages
pip install -r requirements.txt

# Install Playwright browsers
playwright install
```

Next, create a `.env` file in the `/backend` directory and add your credentials. This file is ignored by git.

```env
# backend/.env

# Your Gemini API Key
GEMINI_API_KEY="AIzaSy..."

# Your Jira Credentials (for Playwright)
JIRA_API_USER="your.email@example.com"
JIRA_API_TOKEN="YourAtlassianApiToken" # Use an API token, not your password
```

### 3. Frontend Setup

In a new terminal, navigate to the frontend directory and install the Node.js dependencies.

```bash
cd frontend

# Install the required npm packages
npm install
```

### 4. Running the Application

You need to have both the backend and frontend servers running simultaneously.

- **Run the Backend Server:**
  In your first terminal (in the `/backend` directory with the virtual environment active):
  ```bash
  flask run
  ```
  The backend will be running at `http://localhost:5000`.

- **Run the Frontend Server:**
  In your second terminal (in the `/frontend` directory):
  ```bash
  npm run dev
  ```
  The frontend will be running at `http://localhost:5173`.

You can now open `http://localhost:5173` in your browser to use the application.
