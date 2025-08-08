# File: backend/api/routes/csv_routes.py
# This file contains a robust version of your upload route.

from flask import Blueprint, request, jsonify # type: ignore
import pandas as pd # type: ignore
import io

# Define the blueprint
csv_blueprint = Blueprint("csv_routes", __name__)

@csv_blueprint.route('/upload-csv', methods=['POST'])
def upload_csv():
    """
    Receives a CSV file, parses it robustly, and returns a full preview.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and file.filename.endswith('.csv'):
        try:
            # Use io.StringIO for robust, in-memory file handling
            csv_data = io.StringIO(file.read().decode('utf-8'))
            df = pd.read_csv(csv_data)

            df.fillna('', inplace=True) # This replaces all NaN values with an empty string

            # Get all columns and all records for a full preview
            columns = df.columns.tolist()
            records = df.to_dict(orient='records')

            return jsonify({
                'preview': records,
                'columns': columns
            })
        except Exception as e:
            # Catch any parsing errors and return a helpful message
            return jsonify({'error': f'Failed to parse CSV file: {e}'}), 500
    
    return jsonify({'error': 'Invalid file type, please upload a .csv file'}), 400