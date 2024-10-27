import ast
import datetime
from typing import List, Optional


def create_list_notNone(*elements):
    return [e for e in elements if e is not None]

def convert_time_to_float(time_obj: Optional[datetime.time]) -> (float):
        """Convert a datetime.time object to a float representing the time on a 24-hour scale."""
        if time_obj is None:
            return None
        
        return time_obj.hour + time_obj.minute / 60.0
    
def convert_string_to_list(string_list: Optional[str]) -> (List[str]):
    """Convert a string representation of a list to an actual list of strings."""
    if string_list is None:
        return []
    
    try:
        return ast.literal_eval(string_list)
    except (SyntaxError, ValueError):
        return []  # Return an empty list if there's an issue with conversion
    
def read_txt_files(file_name):
    try:
        with open(file_name, 'r', encoding='utf-8') as file:
            file_content = file.read()
        return file_content
    except FileNotFoundError:
        return f"File '{file_name}' not found."