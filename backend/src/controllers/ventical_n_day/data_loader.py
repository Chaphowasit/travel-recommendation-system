# duration_matrix.py

import os
import logging
from typing import List, Dict, Any, Tuple

from sqlalchemy import (
    create_engine,
    Column,
    String,
    Float,
    Integer,
    or_,
    Time as SQLAlchemyTime,  # Alias to differentiate from datetime.time
)
from sqlalchemy.orm import declarative_base, sessionmaker

from duration_matrix import get_duration_matrix
from time_window import find_time_intersections, get_visit_hours

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment Variables
DATABASE_URI = os.getenv(
    "DATABASE_URI",
    "mariadb+pymysql://root:biggy1234@52.65.252.12:3306/travelRecommendation",
)

# SQLAlchemy Base
Base = declarative_base()

# Define ORM Models
class Activity(Base):
    __tablename__ = "Activity"

    id = Column(String(255), primary_key=True)
    name = Column(String(255))
    about_and_tags = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    start_time = Column(SQLAlchemyTime)  # SQLAlchemy Time datatype
    end_time = Column(SQLAlchemyTime)    # SQLAlchemy Time datatype
    reviews = Column(String)
    nearby_foodAndDrink1 = Column(String(255))
    nearby_foodAndDrink2 = Column(String(255))
    nearby_foodAndDrink3 = Column(String(255))
    nearby_activity1 = Column(String(255))
    nearby_activity2 = Column(String(255))
    nearby_activity3 = Column(String(255))
    duration = Column(Integer)


class Accommodation(Base):
    __tablename__ = "Accommodation"

    id = Column(String(255), primary_key=True)
    name = Column(String(255))
    about_and_tags = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    start_time = Column(SQLAlchemyTime)  # SQLAlchemy Time datatype
    end_time = Column(SQLAlchemyTime)    # SQLAlchemy Time datatype
    reviews = Column(String)
    nearby_foodAndDrink1 = Column(String(255))
    nearby_foodAndDrink2 = Column(String(255))
    nearby_foodAndDrink3 = Column(String(255))
    nearby_activity1 = Column(String(255))
    nearby_activity2 = Column(String(255))
    nearby_activity3 = Column(String(255))


def setup_database() -> (sessionmaker):
    """
    Sets up the database connection and returns a sessionmaker.

    :return: SQLAlchemy sessionmaker instance.
    """
    engine = create_engine(DATABASE_URI, echo=False)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return Session


def extract_place_ids(data: Dict[str, Any]) -> (List[str]):
    """
    Extracts all place IDs from the input JSON, including accommodation and activity places.

    :param data: Parsed JSON input.
    :return: List of unique place IDs.
    """
    place_ids = {}

    # Extract accommodation ID
    accommodation_id = data.get("accommodation")
    if accommodation_id:
        logger.debug(f"Extracted accommodation ID: {accommodation_id}")

    # Extract activity place IDs
    activities = data.get("activities", [])
    for day, activity in enumerate(activities):
        places = activity.get("place", [])
        for place in places:
            place_id = place.get("id")
            place_ids.setdefault(day, set())
            place_ids[day].add(place_id)
            logger.debug(f"Extracted activity place ID of day {day}: {place_id}")

        logger.info(f"Total unique place IDs extracted from day {day}: {len(place_ids[day])}")
        
        place_ids[day] = sorted(list(place_ids[day]))
        
    return accommodation_id, place_ids  # Sorted for consistent ordering


def convert_time_to_int(total_minutes: int, is_start: bool) -> (int):
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


def fetch_place_details(session, place_ids: List[str]) -> (Tuple[Dict[str, Dict[str, Any]], Dict[str, Dict[str, int]]]):
    """
    Fetches latitude, longitude, and business hours for each place ID from Activity and Accommodation tables.

    :param session: SQLAlchemy session.
    :param place_ids: List of place IDs.
    :return: Tuple containing:
             - Dictionary mapping place_id to its latitude, longitude, start_time, and end_time as integers.
             - Dictionary mapping place_id to its business hours (start_time and end_time) as integers.
    """
    place_details = {}

    def transform_time_to_int(start_time, end_time):
        """Convert start_time and end_time to integer representations, handling overnight times."""
        start_total_minutes = start_time.hour * 60 + start_time.minute if start_time else None
        end_total_minutes = end_time.hour * 60 + end_time.minute if end_time else None

        # Handle overnight times
        if end_total_minutes is not None and start_total_minutes is not None and end_total_minutes <= start_total_minutes:
            end_total_minutes += 24 * 60  # Add 24 hours to end time if it’s past midnight

        start_int = convert_time_to_int(start_total_minutes, is_start=True)
        end_int = convert_time_to_int(end_total_minutes, is_start=False)
        return start_int, end_int

    # Fetch from Activity
    activities = (
        session.query(Activity.id, Activity.latitude, Activity.longitude, Activity.start_time, Activity.end_time, Activity.duration)
        .filter(Activity.id.in_(place_ids))
        .all()
    )
    for activity in activities:
        start_int, end_int = transform_time_to_int(activity.start_time, activity.end_time)
        place_details[activity.id] = {
            "latitude": activity.latitude,
            "longitude": activity.longitude,
            "start_time_int": start_int or 0,
            "end_time_int": end_int or 96,
            "duration": activity.duration or 8
        }
        logger.debug(f"Fetched Activity - ID: {activity.id}, Lat: {activity.latitude}, Lon: {activity.longitude}, Start Int: {start_int}, End Int: {end_int}")

    # Identify remaining IDs to fetch from Accommodation
    fetched_ids = set(place_details.keys())
    remaining_ids = set(place_ids) - fetched_ids

    if remaining_ids:
        accommodations = (
            session.query(Accommodation.id, Accommodation.latitude, Accommodation.longitude, Accommodation.start_time, Accommodation.end_time)
            .filter(Accommodation.id.in_(remaining_ids))
            .all()
        )
        for acc in accommodations:
            start_int, end_int = transform_time_to_int(acc.start_time, acc.end_time)
            place_details[acc.id] = {
                "latitude": acc.latitude,
                "longitude": acc.longitude,
                "start_time_int": start_int or 0,
                "end_time_int": end_int or 96,
                "duration": 0
            }
            logger.debug(f"Fetched Accommodation - ID: {acc.id}, Lat: {acc.latitude}, Lon: {acc.longitude}, Start Int: {start_int}, End Int: {end_int}")

    # Check for any IDs not found
    missing_ids = set(place_ids) - set(place_details.keys())
    if missing_ids:
        logger.warning(f"Latitude, Longitude, or Business Hours not found for IDs: {missing_ids}")

    # Extract business hours as integers
    business_hours = {pid: ( details["start_time_int"], details["end_time_int"])
                      for pid, details in place_details.items()}

    return place_details, business_hours


def extract_stay_time(data: Dict[str, Any]) -> (List[List[Tuple[int, int]]]):
    activities = data.get("activities", [])
    
    # Extract time anchors by day
    time_anchors = {}
    for day, activity in enumerate(activities):
        time_anchor = activity.get("time_anchor", {})
        time_anchors[day] = time_anchor
    
    # Sort days to ensure ordered processing
    sorted_days = sorted(time_anchors.keys())
    days = len(sorted_days)
    
    # Initialize stay_time with the first day morning and the last day evening
    stay_time = [[(0, time_anchors[sorted_days[0]].get("morning", 0))]]  # Start with the first morning
    
    for i in range(days - 1):
        current_day = sorted_days[i]
        next_day = sorted_days[i + 1]
        
        current_evening = time_anchors[current_day].get("evening")
        next_morning = time_anchors[next_day].get("morning")
        
        # Only add if both current_evening and next_morning exist
        if current_evening is not None and next_morning is not None:
            start_time = current_evening + (current_day) * 96
            end_time = next_morning + (current_day + 1) * 96
            stay_time.append([(start_time, end_time)])
    
    # Append the last day evening to the first list to meet the requirement
    last_day = sorted_days[-1]
    last_evening = time_anchors[last_day].get("evening", 0) + (last_day * 96)
    stay_time[0].append((last_evening, (last_day + 1) * 96))
    
    return stay_time


def load_data(data: Dict[str, Any]) -> (Tuple[List[str], List[List[int]], List[Tuple[int, int]], List[int]]):
    """
    Main function to retrieve the list of place_ids, the duration matrix, business hours, and individual durations.

    :param data_str: Input JSON as a string.
    :return: Tuple containing:
             - List of place_ids.
             - Duration matrix as a list of lists.
             - List of business hours tuples (start_time, end_time).
             - List of durations as integers.
    """

    # Extract place IDs and ensure accommodation ID is first
    accommodation_id, place_ids = extract_place_ids(data)
    stay_times = extract_stay_time(data)
    days = len(place_ids)

    # Setup database session
    Session = setup_database()
    session = Session()

    try:
        place_ids_old = set()
        for day, place_ids_by_day in place_ids.items():
            place_ids_old.update(place_ids_by_day)
        
        place_ids_old.add(accommodation_id)
        place_ids_old = sorted(list(place_ids_old), key=lambda id: (id[0] != 'H', id[0] != 'A', id[1:]))
            
        # Fetch latitude, longitude, and business hours
        place_details, business_hours = fetch_place_details(session, place_ids_old)
        logger.info(f"Fetched latitude, longitude, and business hours for {len(business_hours)} places.")
        
        place_ids_new = set()
        available_times = dict()
        for day, place_ids_by_day in place_ids.items():
            
            visit_hours = get_visit_hours(data, day)
            available_times_by_day = find_time_intersections(visit_hours, business_hours)
            
            place_ids_new_by_day = sorted(list(available_times_by_day.keys()))
            for place_id in place_ids_new_by_day:
                available_times.setdefault(place_id, [])
                available_times[place_id] += [(av_time[0] + 96 * day, av_time[1] + 96 * day) 
                                              for av_time in available_times_by_day[place_id]]
                
            place_ids_new.update(place_ids_new_by_day)
            
            logger.info(f"Place with unavailable visit time on day {day}: " + str(set(place_ids_by_day).difference(set(place_ids_new_by_day))))

        place_ids_new = sorted(list(place_ids_new))
        available_times = [available_times[place_id] for place_id in place_ids_new]
        durations = [place_details[place_id]['duration'] for place_id in place_ids_new]
        place_ids_new = [accommodation_id] * days + place_ids_new
        available_times = stay_times + available_times
        durations = [stay_time[0][1] - stay_time[0][0] for stay_time in stay_times] + durations
        
        # Build duration matrix
        place_locs = [{'place_id': place_id, 'lat': place_details[place_id]['latitude'], 'lon': place_details[place_id]['longitude']}
                    for place_id in place_ids_new]
        duration_matrix = get_duration_matrix(session, place_locs)
        logger.info("Duration matrix successfully built.")

    finally:
        session.close()

    return days, place_ids_new, duration_matrix, available_times, durations


# if __name__ == "__main__":
#     # Example usage
    # data = 
  

#     # Retrieve place_ids, duration matrix, visit hours, and durations
#     place_ids, matrix, available_times, durations = load_data(data)

#     # Output the results
#     print("List of Place IDs:")
#     print(place_ids)

#     print("\nDuration Matrix:")
#     for row in matrix:
#         print(row)

#     print("\nBusiness Hours (as list of tuples):")
#     print(available_times)

#     print("\nDurations (as list of ints):")
#     print(durations)
