import sqlalchemy

import logging
import os
from sqlalchemy.orm import sessionmaker
from common.mariadb_schema import Activity, Accommodation, Duration
from common.utils import convert_time_to_int
from typing import Dict, List, Tuple, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MariaDB_Adaptor:
    def __init__(self):
        # Initialize the database connection using an environment variable
        self.engine = sqlalchemy.create_engine(os.getenv("DATABASE_URI"))

        # Create a session
        Session = sessionmaker(bind=self.engine)
        self.session = Session()

    def get_engine(self):
        return self.engine

    def select_activity_by_id(self, activity_id):
        activity = (
            self.session.query(Activity).filter(Activity.id == activity_id).first()
        )
        if activity:
            return activity
        else:
            return None

    def select_accommodation_by_id(self, accommodation_id):
        accommodation = (
            self.session.query(Accommodation)
            .filter(Accommodation.id == accommodation_id)
            .first()
        )
        if accommodation:
            return accommodation
        else:
            return None

    def fetch_place_details(
        self, place_ids: List[str]
    ) -> Tuple[Dict[str, Dict[str, Any]], Dict[str, Dict[str, int]]]:
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
            start_total_minutes = (
                start_time.hour * 60 + start_time.minute if start_time else None
            )
            end_total_minutes = (
                end_time.hour * 60 + end_time.minute if end_time else None
            )

            # Handle overnight times
            if (
                end_total_minutes is not None
                and start_total_minutes is not None
                and end_total_minutes <= start_total_minutes
            ):
                end_total_minutes += (
                    24 * 60
                )  # Add 24 hours to end time if it’s past midnight

            start_int = convert_time_to_int(start_total_minutes, is_start=True)
            end_int = convert_time_to_int(end_total_minutes, is_start=False)
            return start_int, end_int

        # Fetch from Activity
        activities = (
            self.session.query(
                Activity.id,
                Activity.name,
                Activity.about_and_tags,
                Activity.latitude,
                Activity.longitude,
                Activity.start_time,
                Activity.end_time,
                Activity.duration,
                Activity.image_url,
            )
            .filter(Activity.id.in_(place_ids))
            .all()
        )
        for activity in activities:
            start_int, end_int = transform_time_to_int(
                activity.start_time, activity.end_time
            )
            place_details[activity.id] = {
                "name": activity.name,
                "about_and_tags": activity.about_and_tags,
                "latitude": activity.latitude,
                "longitude": activity.longitude,
                "start_time_int": start_int or 0,
                "end_time_int": end_int or 96,
                "duration": activity.duration or 8,
                "image_url": activity.image_url or "https://via.placeholder.com/150",
            }
            logger.debug(
                f"Fetched Activity - ID: {activity.id}, Lat: {activity.latitude}, Lon: {activity.longitude}, Start Int: {start_int}, End Int: {end_int}"
            )

        # Identify remaining IDs to fetch from Accommodation
        fetched_ids = set(place_details.keys())
        remaining_ids = set(place_ids) - fetched_ids

        if remaining_ids:
            accommodations = (
                self.session.query(
                    Accommodation.id,
                    Accommodation.name,
                    Accommodation.about_and_tags,
                    Accommodation.latitude,
                    Accommodation.longitude,
                    Accommodation.start_time,
                    Accommodation.end_time,
                    Accommodation.image_url,
                )
                .filter(Accommodation.id.in_(remaining_ids))
                .all()
            )
            for acc in accommodations:
                start_int, end_int = transform_time_to_int(acc.start_time, acc.end_time)
                place_details[acc.id] = {
                    "name": acc.name,
                    "about_and_tags": acc.about_and_tags,
                    "latitude": acc.latitude,
                    "longitude": acc.longitude,
                    "start_time_int": start_int or 0,
                    "end_time_int": end_int or 96,
                    "image_url": acc.image_url or "https://via.placeholder.com/150",
                }
                logger.debug(
                    f"Fetched Accommodation - ID: {acc.id}, Lat: {acc.latitude}, Lon: {acc.longitude}, Start Int: {start_int}, End Int: {end_int}"
                )

        # Check for any IDs not found
        missing_ids = set(place_ids) - set(place_details.keys())
        if missing_ids:
            logger.warning(
                f"Latitude, Longitude, or Business Hours not found for IDs: {missing_ids}"
            )

        # Extract business hours as integers
        business_hours = {
            pid: (details["start_time_int"], details["end_time_int"])
            for pid, details in place_details.items()
        }

        return place_details, business_hours

    def get_place_detail(self, response_json: Dict) -> Dict[str, Dict[str, int]]:
        """
        Helper function to fetch business hours for recommendations.
        Converts the `start_time` and `end_time` from the database into a custom format and adds it to the response_json.

        :param response_json: JSON response containing information about activities or accommodations.
        :return: A dictionary with the business hours for activities and accommodations.
        """
        # Initialize an empty dictionary to store business hours
        business_hours = {}

        # Extract place IDs from response_json
        place_ids = [res.get("id") for res in response_json]

        try:
            # Use fetch_place_details to get place details, including business hours
            place_detail, business_hours = self.fetch_place_details(place_ids)

            for entry in response_json:
                place_id = entry.get("id")
                if place_id in business_hours:
                    start_time_int, end_time_int = business_hours[place_id]
                    entry["business_hours"] = {
                        "start_time": start_time_int,
                        "end_time": end_time_int,
                    }
                    entry["image"] = place_detail[place_id].get(
                        "image_url", "https://via.placeholder.com/150"
                    )

        finally:
            # Close the session
            self.session.close()

        return (
            response_json  # Return the updated response_json with added business_hours
        )
