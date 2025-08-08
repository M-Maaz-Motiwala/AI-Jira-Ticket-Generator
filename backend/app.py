# File: backend/app.py
# --- UPDATED FILE ---
# This is the fix for the CORS issue.

from flask import Flask
from flask_cors import CORS
from config import Config

from api.routes.csv_routes import csv_blueprint
from api.routes.processing_routes import processing_blueprint
from api.routes.jira_routes import jira_blueprint

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize CORS globally for the entire app.
    # This is a simpler and more robust way to handle CORS for all blueprints.
    
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True
    )

    # Register all blueprints
    app.register_blueprint(csv_blueprint, url_prefix='/api')
    app.register_blueprint(processing_blueprint, url_prefix='/api')
    app.register_blueprint(jira_blueprint, url_prefix='/api')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)