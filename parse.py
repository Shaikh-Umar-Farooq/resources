import json
from bs4 import BeautifulSoup
import re
from typing import Dict, List, Any

def extract_youtube_id(url: str) -> str:
    """Extract YouTube video ID from URL."""
    # Handle playlist URLs
    if 'playlist' in url:
        playlist_pattern = r'list=([\w-]+)'
        match = re.search(playlist_pattern, url)
        return match.group(1) if match else ''
    
    # Handle regular video URLs
    patterns = [
        r'youtube\.com/watch\?v=([\w-]+)',
        r'youtu\.be/([\w-]+)',
        r'youtube\.com/embed/([\w-]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return ''

def get_youtube_thumbnail(url: str) -> str:
    """Generate YouTube thumbnail URL from video URL."""
    video_id = extract_youtube_id(url)
    if video_id:
        return f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
    return ""

def parse_resource_table(table, resource_type: str) -> List[Dict[str, Any]]:
    """Parse a table of resources (articles or videos) and return list of resource dictionaries."""
    resources = []
    rows = table.find_all('tr')[1:]  # Skip header row
    
    for row in rows:
        cells = row.find_all('td')
        if len(cells) < 4:
            continue
            
        title = cells[0].get_text(strip=True)
        author = cells[1].get_text(strip=True)
        description = cells[2].get_text(strip=True)
        url = cells[3].find('a')['href'] if cells[3].find('a') else ""
        
        resource = {
            'type': resource_type,
            'title': title,
            'description': description,
            'url': url,
            'author': author,
            'completed': False
        }
        
        if resource_type == "video":
            resource["thumbnail"] = get_youtube_thumbnail(url)
        else:
            resource["publisher"] = ""
            
        resources.append(resource)
    
    return resources

def parse_html_to_js_data(html_content: str) -> Dict[str, List[Dict[str, Any]]]:
    """Parse HTML content and convert to JavaScript data structure."""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Initialize the data structure
    js_data = {
        "chapters": []
    }
    
    # Find all strong tags which typically contain section titles
    strong_tags = soup.find_all('strong')
    current_chapter = None
    
    for tag in strong_tags:
        text = tag.get_text(strip=True)
        
        # Check if this is a main section title
        if text and not text.lower().startswith(('articles', 'videos')):
            # If we have a current chapter, add it to the list
            if current_chapter and current_chapter["resources"]:
                js_data["chapters"].append(current_chapter)
            
            # Start a new chapter
            current_chapter = {
                "title": text,
                "resources": []
            }
            
            # Find the next tables (for articles and videos)
            parent = tag.find_parent()
            if parent:
                next_elements = parent.find_next_siblings()
                for element in next_elements:
                    if element.name == 'table':
                        # Determine if this is articles or videos table
                        prev_p = element.find_previous('p')
                        if prev_p and prev_p.find('strong'):
                            section_type = prev_p.find('strong').get_text(strip=True).lower()
                            resource_type = "article" if "articles" in section_type else "video"
                            resources = parse_resource_table(element, resource_type)
                            if current_chapter:
                                current_chapter["resources"].extend(resources)
    
    # Add the last chapter if it exists
    if current_chapter and current_chapter["resources"]:
        js_data["chapters"].append(current_chapter)
    
    return js_data

def generate_js_file_content(data: Dict[str, List[Dict[str, Any]]]) -> str:
    """Generate JavaScript file content from the data structure."""
    # Convert the data to JSON string with proper formatting
    json_str = json.dumps(data, indent=2, ensure_ascii=False)
    
    # Create the JavaScript module content
    js_content = f"""// UX Design Resource Data
// Generated automatically from HTML content

const resourceData = {json_str};

export default resourceData;
"""
    return js_content

def convert_file(input_file: str, output_file: str):
    """Convert HTML file to JavaScript file."""
    # Read HTML file
    with open(input_file, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    # Parse HTML and convert to JavaScript data structure
    js_data = parse_html_to_js_data(html_content)
    
    # Generate JavaScript file content
    js_content = generate_js_file_content(js_data)
    
    # Write JavaScript file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_content)

if __name__ == "__main__":
    # Example usage
    input_file = "input.html"
    output_file = "resources.js"
    
    try:
        convert_file(input_file, output_file)
        print(f"Successfully converted {input_file} to {output_file}")
    except Exception as e:
        print(f"Error occurred: {str(e)}")