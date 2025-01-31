import json
import pandas as pd
import re

def extract_json_objects(js_file):
    """Extract and fix JSON objects from a JavaScript file."""
    with open(js_file, 'r', encoding='utf-8') as file:
        js_content = file.read()

    # Replace JavaScript object syntax with JSON-friendly format
    js_content = js_content.replace("'", '"')  # Convert JS single quotes to JSON double quotes
    js_content = re.sub(r'(\w+):', r'"\1":', js_content)  # Convert unquoted keys to JSON keys

    try:
        data = json.loads(js_content)  # Parse JSON
        return data
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        return None

def save_to_excel(js_file, output_excel):
    """Convert JavaScript objects to an Excel file."""
    data = extract_json_objects(js_file)

    if not data:
        print("No valid JSON data found.")
        return
    
    with pd.ExcelWriter(output_excel, engine='openpyxl') as writer:
        for section in data:
            title = section.get("title", "Unknown")  # Section title
            resources = section.get("resources", [])  # List of resources
            
            if resources:
                df = pd.DataFrame(resources)
                df.to_excel(writer, sheet_name=title[:31], index=False)  # Excel sheet names are max 31 chars
                
    print(f"Data successfully saved to {output_excel}")

# Example usage
js_filename = "data.json"  # Change this to your JS file
output_excel_file = "output.xlsx"

# Run conversion
save_to_excel(js_filename, output_excel_file)
