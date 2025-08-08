# File: backend/api/routes/processing_routes.py
# --- UPDATED FILE ---
# Prompts have been refined for cleaner output.

from flask import Blueprint, request, jsonify
import os
import google.generativeai as genai
import json

# Global model configured with the default API key from .env
try:
    genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
    default_model = genai.GenerativeModel('gemini-2.5-flash')
except Exception as e:
    print(f"FATAL: Error configuring default Gemini API client. Is GEMINI_API_KEY set correctly in .env? Error: {e}")
    default_model = None

processing_blueprint = Blueprint("processing_routes", __name__)

def generate_bug_prompt(row, module_name):
    """Creates a refined prompt for generating a bug report."""
    return f"""
    Based on the following test case data, generate a Jira bug report.

    **Test Case Data:**
    - Module: {module_name}
    - Test Case Title: {row.get('Test Case Title', 'N/A')}
    - Test Steps: {row.get('Test Steps', 'N/A')}
    - Expected Result: {row.get('Expected Result', 'N/A')}
    - Actual Result: {row.get('Actual Result', 'Please infer from the title.')}
    - Issue: {row.get('Issue', 'N/A')}

    **Output Format:**
    Provide the output as a single JSON object with four keys: "summary", "description", "label", and "domain".
    - 'summary': A string in the format: "QA | {module_name} | [Concise Issue Title]"
    - 'description': A Markdown string containing ONLY these three sections: ### Steps to Reproduce, ### Expected Result, and ### Actual Result. Do NOT include anything else.
    - 'label': One of these strings: "Functionality_Issue", "UI/UX_Issue", or "Data_Discrepency_Issue".
    - 'domain': Either "Frontend" or "Backend".
    """

def generate_story_prompt(row, module_name):
    """Creates a refined prompt for generating a user story."""
    return f"""
    Based on the following enhancement data, generate a Jira user story.

    **Enhancement Data:**
    - Module: {module_name}
    - Title: {row.get('Test Case Title', 'N/A')}
    - Scenario/Issue: {row.get('Issue', 'N/A')}

    **Output Format:**
    Provide the output as a single JSON object with three keys: "summary", "description", and "domain".
    - 'summary': A string in the format: "QA | {module_name} | [Concise Enhancement Title]"
    - 'description': A Markdown string that clearly explains what improvement is required. ONLY these two sections: ### Description, and ### Improvement. Do NOT include anything else.
    - 'domain': Either "Frontend" or "Backend".
    """

@processing_blueprint.route('/process-issues', methods=['POST'])
def process_issues():
    data = request.get_json()
    config = data.get('config', {})
    rows = data.get('rows')
    
    module_name = config.get('module', 'General')
    user_api_key = config.get('geminiApiKey')

    model_to_use = default_model
    if user_api_key:
        print("--- DEBUG: Using custom API key provided by user. ---")
        try:
            temp_genai = genai.configure(api_key=user_api_key, transport='rest')
            model_to_use = genai.GenerativeModel('gemini-2.5-flash')
        except Exception as e:
            return jsonify({"error": f"Invalid custom Gemini API Key provided: {e}"}), 400
    
    if not model_to_use:
        return jsonify({"error": "Gemini API is not configured on the server."}), 500

    if not rows:
        return jsonify({"error": "No rows data provided"}), 400

    bugs = [row for row in rows if row.get('Bug/Story', '').strip().lower() == 'bug']
    stories = [row for row in rows if row.get('Bug/Story', '').strip().lower() in ['enhancement', 'story']]

    def process_item(item, item_type):
        item_id = item.get('Bug ID') or item.get('Test Case ID')
        print(f"\n--- DEBUG: Processing {item_type.upper()} '{item_id}' ---")
        
        prompt_function = generate_bug_prompt if item_type == 'bug' else generate_story_prompt
        prompt = prompt_function(item, module_name)
        
        try:
            response = model_to_use.generate_content(prompt)
            item['ai_response'] = response.text
            print(f"--- DEBUG: Successfully got AI response for '{item_id}'")
        except Exception as e:
            error_message = f"Failed to query Gemini for {item_id}: {e}"
            print(f"--- DEBUG: ERROR ---\n{error_message}\n--------------------")
            item['ai_response'] = json.dumps({"error": error_message})

    for bug in bugs:
        process_item(bug, 'bug')
    for story in stories:
        process_item(story, 'story')

    return jsonify({"bugs": bugs, "stories": stories})