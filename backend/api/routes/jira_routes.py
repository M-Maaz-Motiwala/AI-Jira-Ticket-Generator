# File: backend/api/routes/jira_routes.py
# --- UPDATED FILE ---
# Now uses credentials from the frontend config.

from flask import Blueprint, request, jsonify
import os, sys, glob
import json
from playwright.sync_api import sync_playwright
import time

jira_blueprint = Blueprint("jira_routes", __name__)

def log_step(step):
    print(f"\n--- STEP: {step} ---")

def fail_and_exit(step, error):
    print(f"\n❌ FAILED at step: {step}\nError: {error}")
    sys.exit(1)

@jira_blueprint.route('/create-jira-ticket', methods=['POST'])
def create_jira_ticket_playwright():
    data = request.get_json()
    config = data.get('config', {})
    
    # Get credentials from the incoming request
    JIRA_EMAIL = config.get("JIRA_EMAIL")
    JIRA_PASSWORD = config.get("JIRA_PASSWORD")
    JIRA_URL = config.get('JIRA_URL')
    AFFECTED_VERSION = config.get('AFFECTED_VERSION')
    FRONTEND_ASSIGNEE = config.get('FRONTEND_ASSIGNEE')
    BACKEND_ASSIGNEE = config.get('BACKEND_ASSIGNEE')
    QA_ASSIGNEE = config.get('QA_ASSIGNEE')
    MODULE = config.get('MODULE')
    DEFAULT_SEVERITY = config.get('DEFAULT_SEVERITY')
    ATTACHMENTS = config.get('ATTACHMENTS')
    
    if not JIRA_EMAIL or not JIRA_PASSWORD:
        return jsonify({"error": "Jira credentials must be provided in the configuration."}), 400

    summary = data.get('summary')
    description = data.get('description')
    issue_type = data.get('issueType')
    label = data.get('label')
    domain = data.get('domain')
    bug_data = data.get('originalData')
    bug_id = bug_data['BUG ID']
    
    print(f"--- PLAYWRIGHT: Starting ticket creation for '{summary}' ---")

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False, slow_mo=150)
            page = browser.new_page()

            # Step 1: Login
            try:
                log_step("Navigating to Jira login page")
                page.goto(JIRA_URL)
                page.wait_for_timeout(2000)

                page.fill('input[name="username"]', JIRA_EMAIL)
                page.wait_for_timeout(1000)
                page.click('button[id="login-submit"]')
                page.wait_for_timeout(1500)

                page.fill('input[name="password"]', JIRA_PASSWORD)
                page.wait_for_timeout(1000)
                page.click('button[id="login-submit"]')

                page.wait_for_selector('[data-testid="atlassian-navigation--create-button"]', timeout=1300000)
                page.wait_for_timeout(2000)
                print("✅ Login successful")
            except Exception as e:
                fail_and_exit("Login", e)

            # Step 2: Open Create Issue dialog
            try:
                log_step("Opening Create Issue dialog")
                page.wait_for_timeout(10000)
                page.click('[data-testid="atlassian-navigation--create-button"]')
                page.wait_for_selector('label:has-text("Work Type")', timeout=1300000)
                page.wait_for_timeout(2000)
                print("✅ Create dialog opened")
            except Exception as e:
                fail_and_exit("Open Create Dialog", e)

            # Step 3: Select Issue Type
            try:
                log_step(f"Selecting Issue Type: {issue_type}")
                page.wait_for_selector('[data-testid="inline-config-buttons-for-select.atlaskit-select-inline-tab-activator"]')
                page.click('[data-testid="inline-config-buttons-for-select.atlaskit-select-inline-tab-activator"]')
                page.wait_for_timeout(1000)
                page.keyboard.type(issue_type)
                page.wait_for_timeout(500)
                page.keyboard.press("Enter")

                page.wait_for_timeout(1500)
                print(f"✅ Issue type selected: {issue_type}")
            except Exception as e:
                fail_and_exit("Select Issue Type", e)

            # Step 4: Fill Summary
            try:
                log_step("Filling Summary")
                page.wait_for_timeout(2000)
                page.fill('input[name="summary"]', summary)
                page.wait_for_timeout(2000)
                print(f"✅ Summary added: {summary}")
            except Exception as e:
                fail_and_exit("Fill Summary", e)

            # Step 5: Select module/component
            try:
                log_step(f"Selecting Component: {MODULE}")
                page.click('[data-testid="issue-field-components-field.ui.edit.components-field-select-select--control"]')
                page.wait_for_timeout(800)

                page.get_by_text(MODULE, exact=True).click()
                page.wait_for_timeout(1500)
                print(f"✅ Component added: {MODULE}")
            except Exception as e:
                fail_and_exit("Select Component", e)

            # Step 6: Fill description safely
            try:
                log_step("Filling Description Safely")

                # Wait for editor
                desc_box = page.get_by_role("textbox", name="Description area, start typing to enter text.")
                desc_box.wait_for(state="visible", timeout=60000)  # Wait up to 60s

                # Focus editor
                desc_box.click()
                page.wait_for_timeout(1000)

                # Clear existing content
                page.keyboard.press("Control+A")
                page.keyboard.press("Backspace")
                page.wait_for_timeout(500)

                # Insert text instantly (keeps formatting)
                page.keyboard.insert_text(description)  # <<< This replaces .type()

                page.wait_for_timeout(1500)
                print("✅ Description added safely")

            except Exception as e:
                fail_and_exit("Fill Description", e)



            # Step 7: Add label if bug
            if issue_type.lower() == "bug":
                try:
                    log_step(f"Adding Label: {label}")
                    page.click('#labels-field')
                    page.wait_for_timeout(1000)

                    page.fill('#labels-field', label)
                    page.wait_for_timeout(1000)
                    page.keyboard.press("Enter")

                    page.wait_for_timeout(1500)
                    print(f"✅ Label added: {label}")
                except Exception as e:
                    fail_and_exit("Add Label", e)

            # Step 8: Environment Affected checkbox
            try:
                log_step("Selecting Environment Affected checkbox")
                page.wait_for_timeout(1500)
                checkbox = page.locator('input[name="customfield_10231"][value="11210"]')
                page.wait_for_timeout(1000)
                checkbox.check()
                print("✅ Environment Affected checkbox selected")
            except Exception as e:
                fail_and_exit("Checking Environment Affected checkbox", e)

            
            # Step 9: Attachments
            try:
                log_step("Attaching media files")
                attachments_folder = "./ScreenShots/Reporting Dashboard"
                
                page.wait_for_timeout(1500)
                matching_files = glob.glob(os.path.join(ATTACHMENTS, f"{bug_id}*.png")) + \
                                glob.glob(os.path.join(ATTACHMENTS, f"{bug_id}*.jpg")) + \
                                glob.glob(os.path.join(ATTACHMENTS, f"{bug_id}*.mov"))

                if not matching_files:
                    print(f"⚠ No matching attachment files found for {bug_id} at {ATTACHMENTS}")
                else:
                    print(f"📎 Found {len(matching_files)} matching attachments: {matching_files}")
                    # Locate only the attachment-area file input (not the one in the description editor)
                    file_input = page.locator(
                        'div#attachment-dropzone-container input[data-testid="media-picker-file-input"]'
                    )

                    # Set the files
                    page.wait_for_timeout(1500)
                    file_input.first.set_input_files(matching_files)
                    print("✅ Attachments uploaded successfully")

                page.wait_for_timeout(2000)
            except Exception as e:
                fail_and_exit("Attach Files", e)

            # Step 10: Select Affects Version
            try:
                log_step("Selecting Affects Version: 1.135")
                page.wait_for_timeout(1500)
                page.click('#versions-field')  # Click the dropdown field
                page.wait_for_timeout(1000)
                page.fill('#versions-field', AFFECTED_VERSION)  # Type the version
                page.wait_for_timeout(3000)  # wait 2 sec before pressing Enter
                page.keyboard.press('Enter')  # Select it from dropdown
                print(f"✅ Affects Version selected: {AFFECTED_VERSION}")
            except Exception as e:
                fail_and_exit("Select Affects Version", e)
            
            # Step 11: Select Assignee
            try:
                log_step("Selecting Assignee")

                if domain.lower() == "frontend":
                    assignee_name = FRONTEND_ASSIGNEE
                elif domain.lower() == "backend":
                    assignee_name = BACKEND_ASSIGNEE
                else:
                    assignee_name = "Automatic"

                print(f"🧑 Assigning to: {assignee_name}")

                # Focus and type directly in the real assignee field
                page.wait_for_timeout(1500)
                page.locator('input#assignee-field').click(force=True)
                page.wait_for_timeout(2000)
                page.fill('input#assignee-field', assignee_name)

                # Give Jira a moment to process the typed value
                page.wait_for_timeout(4000)

                # Hit Enter to confirm selection
                page.keyboard.press('Enter')

                page.wait_for_timeout(2000)
                print(f"✅ Assignee selected: {assignee_name}")

            except Exception as e:
                fail_and_exit("Select Assignee", e)

            # Step 12: Select Severity
            try:
                log_step(f"Selecting Severity: {DEFAULT_SEVERITY}")
                page.click('#customfield_10195-field')
                page.wait_for_timeout(2000)

                page.fill('#customfield_10195-field', DEFAULT_SEVERITY)
                page.wait_for_timeout(4000)
                page.keyboard.press('Enter')

                page.wait_for_timeout(2000)
                print(f"✅ Severity selected: {DEFAULT_SEVERITY}")
            except Exception as e:
                fail_and_exit("Select Severity", e)

            # Step 13: Select QA Assignee
            try:
                log_step(f"Selecting QA Assignee: {QA_ASSIGNEE}")
                page.click('#customfield_10105-field')
                page.wait_for_timeout(3000)

                page.fill('#customfield_10105-field', QA_ASSIGNEE)
                page.wait_for_timeout(4000)
                page.keyboard.press('Enter')

                page.wait_for_timeout(2000)
                print(f"✅ QA Assignee selected: {QA_ASSIGNEE}")
            except Exception as e:
                fail_and_exit("Select QA Assignee", e)

            # Wait before close so you can inspect UI
            print("\n🛑 Script finished without creating the issue (Create button not clicked).")
            print("🔍 Review the Jira UI now...")
            page.wait_for_timeout(10000)  # 10 seconds pause

            browser.close()
            # # Step 14: Submit Ticket
            # try:
            #     log_step("Submitting Ticket")
            #     page.click('[data-testid="issue-create.common.ui.footer.create-button"]')
            #     print("✅ Create button clicked")
            # except Exception as e:
            #     fail_and_exit("Submit Ticket", e)

            # page.wait_for_timeout(10000)  # wait 10 seconds for confirmation UI

            # # Step 15: Confirm success
            # try:
            #     log_step("Waiting for Ticket Key")

            #     # Wait for the "View" link inside the success flag
            #     view_link = page.wait_for_selector('a[href*="/browse/"]', timeout=60000)
                
            #     ticket_url = view_link.get_attribute('href')
            #     ticket_key = ticket_url.split("/")[-1]

            #     print(f"✅ Successfully created ticket {ticket_key}")
            #     print(f"🔗 Ticket URL: {ticket_url}")

            # except Exception as e:
            #     fail_and_exit("Get Ticket Key", e)

            # time.sleep(1)
            # browser.close()
            ticket_key= " "
            ticket_url= " "
            return jsonify({
                "message": "Ticket created successfully via Playwright!",
                "ticket_key": ticket_key,
                "ticket_url": f"{JIRA_URL.rstrip('/')}{ticket_url}"
            })

    except Exception as e:
        error_message = f"Playwright automation failed: {str(e)}"
        print(f"--- PLAYWRIGHT: ERROR --- \n{error_message}")
        return jsonify({"error": error_message}), 500