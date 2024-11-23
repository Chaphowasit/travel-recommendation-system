import ast
import datetime
from typing import List, Optional


def create_list_notNone(*elements):
    return [e for e in elements if e is not None]


def convert_time_to_float(time_obj: Optional[datetime.time]) -> float:
    """Convert a datetime.time object to a float representing the time on a 24-hour scale."""
    if time_obj is None:
        return None

    return time_obj.hour + time_obj.minute / 60.0


def convert_string_to_list(string_list: Optional[str]) -> List[str]:
    """Convert a string representation of a list to an actual list of strings."""
    if string_list is None:
        return []

    try:
        return ast.literal_eval(string_list)
    except (SyntaxError, ValueError):
        return []  # Return an empty list if there's an issue with conversion


def read_txt_files(file_name):
    try:
        with open(file_name, "r", encoding="utf-8") as file:
            file_content = file.read()
        return file_content
    except FileNotFoundError:
        return f"File '{file_name}' not found."


def convert_time_to_int(total_minutes: int, is_start: bool) -> int:
    """
    Converts total minutes to an integer based on specified transformation rules.

    - If the time is exactly at 1440 (24:00 or 23:59), set it to 96.
    - If the time is on a 15-minute boundary: (hour + minutes/60) * 4.
    - If not on a 15-minute boundary:
        - For start_time: ceil to the next 15-minute interval.
        - For end_time: floor to the previous 15-minute interval.

    :param total_minutes: Total minutes since 00:00.
    :param is_start: Boolean indicating if the time is a start_time.
    :return: Transformed integer representation of the time.
    """
    # Handle special cases
    if total_minutes is None:
        return 0 if is_start else 96  # If None, map start to 0, end to 96

    if total_minutes == 1439:  # Any time >= 24:00 maps to 96
        return 96

    remainder = total_minutes % 15
    if remainder == 0:
        adjusted_minutes = total_minutes
    else:
        if is_start:
            # Ceil to the next 15-minute interval
            adjusted_minutes = total_minutes + (15 - remainder)
        else:
            # Floor to the previous 15-minute interval
            adjusted_minutes = total_minutes - remainder

    transformed_time = adjusted_minutes / 60.0
    transformed_int = int(transformed_time * 4)

    # Ensure transformed_int is within [0, 95] or explicitly 96
    transformed_int = max(0, min(transformed_int, 96))

    return transformed_int

def rename_field(item):
    return {
        "id": item.get("id"),
        "name": item.get("activity_name") or item.get("accommodation_name"),
        "description": item.get("about_and_tags", "No description provided"),
        "tag": item.get("tag"),
        "business_hour": {
            "start": item.get("business_hours", {}).get("start_time"),
            "end": item.get("business_hours", {}).get("end_time"),
        },
        "image": item.get("image"),
    }