import logging
import asyncio
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from adapters.Weaviate import Weaviate_Adapter
from usecases.query_response import arrange_respone
from controllers.chatbot import Chatbot
from weaviate.classes.query import Filter
from adapters.MariaDB import MariaDB_Adaptor
from common.mariadb_schema import Base, Activity, Accommodation, Duration

# Initialize Flask app
app = Flask(__name__)
app.config["APP_NAME"] = "Travel Recommendation System"

# Apply CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Set up logger
logger = logging.getLogger(app.config["APP_NAME"])
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)


# Register the Blueprint
@app.errorhandler(Exception)
def universal_exception_handler(exc):
    logger.error(f"Exception occurred: {type(exc).__name__}: {exc}", exc_info=True)
    return jsonify({"error": f"{type(exc).__name__}: {exc}"}), 500


@app.route("/", methods=["GET"])
def root():
    logger.info("Root endpoint accessed")
    return jsonify({"service": app.config["APP_NAME"]})


# @app.route("/sendMessage", methods=["POST"])
# def send_message():
#     logger.info("sendMessage endpoint accessed")
#     try:
#         # Extract data from the request
#         data = request.json  # Assuming you're sending JSON data in the body
#         if "message" not in data:
#             logger.warning("No message provided in request")
#             return (
#                 jsonify({"error": "No message provided"}),
#                 400,
#             )  # Return error if message is missing

#         message = data["message"]
#         logger.debug(f"User message received: {message}")

#         intent_result = chatbot.classify_intent(message)
#         logger.debug(f"Intent classified as: {intent_result}")

#         accommodation_response_json = []
#         activity_response_json = []

#         if "Recommended" in intent_result:
#             logger.info("Recommendation intent detected")

#             activity_collections = weaviate_adapter.get_collections("Activity_Embedded")
#             activity_response = weaviate_adapter.hybrid_query(
#                 activity_collections, 3, "activity_name", message
#             )
#             # activity_result = arrange_respone(activity_response, "activity")
#             # logger.debug(f"Activity results: {activity_result}")

#             seen = set()

#             activity_response_json = [
#                 {
#                     **i.properties,
#                     "score": i.metadata.rerank_score,
#                 }  # Add 'id' to the properties
#                 for i in activity_response.objects
#                 if (
#                     i.properties["activity_name"],
#                     i.properties["latitude"],
#                     i.properties["longitude"],
#                 )
#                 not in seen
#                 and not seen.add(
#                     (
#                         i.properties["activity_name"],
#                         i.properties["latitude"],
#                         i.properties["longitude"],
#                     )
#                 )
#             ]

#             activity_collections = weaviate_adapter.get_collections("Activity_Bridge")

#             for o in activity_response_json:
#                 response = activity_collections.query.fetch_objects(
#                     filters=(
#                         Filter.by_property("activity_name").equal(
#                             o.get("activity_name")
#                         )
#                         & Filter.by_property("longitude").equal(o.get("longitude"))
#                         & Filter.by_property("latitude").equal(o.get("latitude"))
#                     ),
#                     limit=1,
#                 )
#                 o["id"] = response.objects[0].properties.get("activity_id")

#             accommodation_collections = weaviate_adapter.get_collections(
#                 "Accommodation_Embedded"
#             )
#             accommodation_response = weaviate_adapter.hybrid_query(
#                 accommodation_collections, 3, "accommodation_name", message
#             )

#             seen = set()

#             # Use list comprehension to filter out duplicates and add 'id' from metadata.rerank_score
#             accommodation_response_json = [
#                 {
#                     **i.properties,
#                     "score": i.metadata.rerank_score,
#                 }  # Add 'id' to the properties
#                 for i in accommodation_response.objects
#                 if (
#                     i.properties["accommodation_name"],
#                     i.properties["latitude"],
#                     i.properties["longitude"],
#                 )
#                 not in seen
#                 and not seen.add(
#                     (
#                         i.properties["accommodation_name"],
#                         i.properties["latitude"],
#                         i.properties["longitude"],
#                     )
#                 )
#             ]

#             # accommodation_result = arrange_respone(
#             #     accommodation_response, "accommodation"
#             # )
#             # logger.debug(f"Accommodation results: {accommodation_result}")

#             accommodation_collections = weaviate_adapter.get_collections(
#                 "Accommodation_Bridge"
#             )

#             for o in accommodation_response_json:
#                 response = accommodation_collections.query.fetch_objects(
#                     filters=(
#                         Filter.by_property("accommodation_name").equal(
#                             o.get("accommodation_name")
#                         )
#                         & Filter.by_property("longitude").equal(o.get("longitude"))
#                         & Filter.by_property("latitude").equal(o.get("latitude"))
#                     ),
#                     limit=1,
#                 )

#                 o["id"] = response.objects[0].properties.get("accommodation_id")

#             accommodation_response_json = sorted(
#                 accommodation_response_json,
#                 key=lambda x: x.get("score", 0),
#                 reverse=True,
#             )
#             activity_response_json = sorted(
#                 activity_response_json, key=lambda x: x.get("score", 0), reverse=True
#             )

#             results = {
#                 "activities": activity_response_json,
#                 "accommodations": accommodation_response_json,
#             }

#             if chatbot.classify_place_type(message) == "Activity":
#                 logger.info("Activity type detected for recommendation")
#                 response = chatbot.recommend_place(
#                     results["activities"], message
#                 ).content
#             else:
#                 logger.info("Accommodation type detected for recommendation")
#                 response = chatbot.recommend_place(
#                     results["accommodations"], message
#                 ).content
#             result = {
#                 "user_message": response,
#                 "accommodations": accommodation_response_json,
#                 "activities": activity_response_json,
#             }
#             print("====" * 10)
#             print(result)
#             return jsonify(result)
#         else:
#             logger.info("Non-recommendation intent detected")
#             response = chatbot.answer_etc(message)
#             return jsonify({"user_message": response})

#         # logger.debug(f"Response generated: {response}")
#         # Result

#     except Exception as e:
#         logger.error(f"Error in sendMessage: {e}", exc_info=True)
#         return jsonify({"error": "An error occurred"}), 500


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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
import os

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
    end_time = Column(SQLAlchemyTime)  # SQLAlchemy Time datatype
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
    end_time = Column(SQLAlchemyTime)  # SQLAlchemy Time datatype
    reviews = Column(String)
    nearby_foodAndDrink1 = Column(String(255))
    nearby_foodAndDrink2 = Column(String(255))
    nearby_foodAndDrink3 = Column(String(255))
    nearby_activity1 = Column(String(255))
    nearby_activity2 = Column(String(255))
    nearby_activity3 = Column(String(255))


def setup_database() -> sessionmaker:
    """
    Sets up the database connection and returns a sessionmaker.

    :return: SQLAlchemy sessionmaker instance.
    """
    engine = create_engine(DATABASE_URI, echo=False)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return Session


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


def fetch_place_details(
    session, place_ids: List[str]
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
        end_total_minutes = end_time.hour * 60 + end_time.minute if end_time else None

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
        session.query(
            Activity.id,
            Activity.latitude,
            Activity.longitude,
            Activity.start_time,
            Activity.end_time,
            Activity.duration,
            Activity.about_and_tags,
        )
        .filter(Activity.id.in_(place_ids))
        .all()
    )
    for activity in activities:
        start_int, end_int = transform_time_to_int(
            activity.start_time, activity.end_time
        )
        place_details[activity.id] = {
            "latitude": activity.latitude,
            "longitude": activity.longitude,
            "start_time_int": start_int or 0,
            "end_time_int": end_int or 96,
            "duration": activity.duration or 8,
            "tags": activity.about_and_tags,
        }
        logger.debug(
            f"Fetched Activity - ID: {activity.id}, Lat: {activity.latitude}, Lon: {activity.longitude}, Start Int: {start_int}, End Int: {end_int}"
        )

    # Identify remaining IDs to fetch from Accommodation
    fetched_ids = set(place_details.keys())
    remaining_ids = set(place_ids) - fetched_ids

    if remaining_ids:
        accommodations = (
            session.query(
                Accommodation.id,
                Accommodation.latitude,
                Accommodation.longitude,
                Accommodation.start_time,
                Accommodation.end_time,
                Accommodation.about_and_tags,
            )
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
                "duration": 0,
                "tags": acc.about_and_tags,
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


@app.route("/sendMessage", methods=["POST"])
def send_message():
    logger.info("sendMessage endpoint accessed")
    try:
        # Extract data from the request
        data = request.json  # Assuming you're sending JSON data in the body
        if "message" not in data:
            logger.warning("No message provided in request")
            return (
                jsonify({"error": "No message provided"}),
                400,
            )  # Return error if message is missing

        message = data["message"]
        logger.debug(f"User message received: {message}")

        intent_result = chatbot.classify_intent(message)
        logger.debug(f"Intent classified as: {intent_result}")

        if "Recommended" not in intent_result:
            logger.info("Non-recommendation intent detected")
            response = chatbot.answer_etc(message)
            return jsonify({"user_message": response})

        logger.info("Recommendation intent detected")

        # Initialize response containers
        activity_response_json = []
        accommodation_response_json = []

        # Fetch and process activity recommendations
        activity_response_json = remove_dup_and_get_id(
            "Activity_Embedded",
            "activity_name",
            message,
            "Activity_Bridge",
            "activity_id",
        )

        # Fetch and process accommodation recommendations
        accommodation_response_json = remove_dup_and_get_id(
            "Accommodation_Embedded",
            "accommodation_name",
            message,
            "Accommodation_Bridge",
            "accommodation_id",
        )

        # Fetch business hours for activities
        activity_response_json = get_place_detail(activity_response_json)

        activity_response_json = [rename_field(item) for item in activity_response_json]

        # Fetch business hours for accommodations
        accommodation_response_json = get_place_detail(accommodation_response_json)

        accommodation_response_json = [
            rename_field(item) for item in accommodation_response_json
        ]

        # Sort results by score
        activity_response_json.sort(key=lambda x: x.get("score", 0), reverse=True)
        accommodation_response_json.sort(key=lambda x: x.get("score", 0), reverse=True)

        # Determine response based on place type
        results = {
            "activities": activity_response_json,
            "accommodations": accommodation_response_json,
        }

        place_type = chatbot.classify_place_type(message)
        logger.info(f"{place_type} type detected for recommendation")

        if place_type == "Activity":
            response = chatbot.recommend_place(results["activities"], message).content
        else:
            response = chatbot.recommend_place(
                results["accommodations"], message
            ).content

        # Prepare and return the result
        result = {
            "user_message": response,
            "accommodations": accommodation_response_json,
            "activities": activity_response_json,
        }

        print("====" * 10)
        print(result)

        logger.debug(f"Response generated: {result}")
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error in sendMessage: {e}", exc_info=True)
        return jsonify({"error": "An error occurred"}), 500


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


def remove_dup_and_get_id(
    collection_name, property_name, message, bridge_name, id_property
):
    """
    Helper function to fetch, process, and deduplicate recommendations.
    """
    collections = weaviate_adapter.get_collections(collection_name)
    response = weaviate_adapter.hybrid_query(collections, 10, property_name, message)

    print([obj.properties[property_name] for obj in response.objects])

    seen = set()
    response_json = [
        {
            **obj.properties,
            "score": obj.metadata.rerank_score,
        }
        for obj in response.objects
        if (
            obj.properties[property_name],
            obj.properties["latitude"],
            obj.properties["longitude"],
        )
        not in seen
        and not seen.add(
            (
                obj.properties[property_name],
                obj.properties["latitude"],
                obj.properties["longitude"],
            )
        )
    ]

    bridge_collections = weaviate_adapter.get_collections(bridge_name)
    for entry in response_json:
        bridge_response = bridge_collections.query.fetch_objects(
            filters=(
                Filter.by_property(property_name).equal(entry.get(property_name))
                # & Filter.by_property("longitude").equal(entry.get("longitude"))
                # & Filter.by_property("latitude").equal(entry.get("latitude"))
            ),
            limit=1,
        )
        if bridge_response.objects:
            entry["id"] = bridge_response.objects[0].properties.get(id_property)

    return response_json


from typing import Dict


def get_place_detail(response_json: Dict) -> Dict[str, Dict[str, int]]:
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

    # Create a session
    Session = setup_database()
    session = Session()

    try:
        # Use fetch_place_details to get place details, including business hours
        place_detail, business_hours = fetch_place_details(session, place_ids)

        for entry in response_json:
            place_id = entry.get("id")
            if place_id in business_hours:
                start_time_int, end_time_int = business_hours[place_id]
                entry["business_hours"] = {
                    "start_time": start_time_int,
                    "end_time": end_time_int,
                }
                # entry["tag"] = place_detail[place_id].get("tags", "ku")
                entry["image"] = place_detail[place_id].get(
                    "image", "https://via.placeholder.com/150"
                )
                entry["tag"] = "bbb"

    finally:
        # Close the session
        session.close()

    return response_json  # Return the updated response_json with added business_hours


if __name__ == "__main__":
    chatbot = Chatbot()
    weaviate_adapter = Weaviate_Adapter()
    # main.py (or any script that uses the classes)

    # Create an instance of the adapter (which connects to the database)
    adaptor = MariaDB_Adaptor()

    id = "A0201"
    act = adaptor.select_activity_by_id(id)
    print(f"query with {id} got {act.name}")

    # Create tables in the database
    Base.metadata.create_all(adaptor.get_engine())
    logger.info("Starting Flask application")
    app.run(debug=True)
