# duration_matrix.py
from collections import defaultdict
import math
import os
import logging
import requests
from typing import List, Tuple, Dict
from itertools import product

from sqlalchemy import (
    create_engine,
    Column,
    String,
    Float,
    PrimaryKeyConstraint,
    tuple_,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from dotenv import load_dotenv


load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment Variables
DATABASE_URI = os.getenv(
    "DATABASE_URI", "mariadb+pymysql://root:biggy1234@52.65.252.12:3306/travelRecommendation"
)
MAPBOX_ACCESS_TOKEN = os.getenv("MAPBOX_API_KEY", "pk.eyJ1IjoiYmlncm9jazQ1MjIiLCJhIjoiY20ycjlkZDR3MTVvbTJrczl3MjU5amdoeCJ9.a4pE-ACRSuW-8zNeefeHw")
MAPBOX_MATRIX_URL = "https://api.mapbox.com/directions-matrix/v1/mapbox/driving/"

# SQLAlchemy Base
Base = declarative_base()


class Duration(Base):
    __tablename__ = "durations"
    source_id = Column(String(50), nullable=False)
    destination_id = Column(String(50), nullable=False)
    duration = Column(Float, nullable=False)
    __table_args__ = (PrimaryKeyConstraint("source_id", "destination_id"),)


# Helper Functions


def get_place_ids(input_places: List[Dict[str, float]]) -> (List[str]):
    """
    Maps input coordinates to place_ids.

    :param input_places: List of place dictionaries with 'place_id'.
    :return: List of place_ids.
    """
    return [place["place_id"] for place in input_places]


def get_coordinates(input_places: List[Dict[str, float]]) -> (List[Tuple[float, float]]):
    """
    Extracts (lat, lon) tuples from input_places.

    :param input_places: List of place dictionaries with 'lat' and 'lon'.
    :return: List of (lat, lon) tuples.
    """
    return [(place["lat"], place["lon"]) for place in input_places]


def create_matrix(rows: int, cols: int, default: float = 0.0) -> (List[List[float]]):
    """
    Creates a 2D matrix initialized with a default value.

    :param rows: Number of rows.
    :param cols: Number of columns.
    :param default: Default value for each cell.
    :return: 2D list representing the matrix.
    """
    return [[default for _ in range(cols)] for _ in range(rows)]


def generate_pairs(place_ids: List[str]) -> (List[Tuple[str, str]]):
    """
    Generates all possible source-destination pairs, excluding self-pairs.

    :param place_ids: List of place_ids.
    :return: List of (source_id, destination_id) tuples.
    """
    return [
        (source, destination)
        for source, destination in product(place_ids, repeat=2)
        if source != destination
    ]


def query_database(
    session, pairs: List[Tuple[str, str]]
) -> (List[Tuple[str, str, float]]):
    """
    Executes a query to retrieve existing durations.

    :param session: SQLAlchemy session.
    :param pairs: List of (source_id, destination_id) tuples.
    :return: List of tuples containing (source_id, destination_id, duration).
    """
    if not pairs:
        return []

    existing_records = (
        session.query(Duration)
        .filter(tuple_(Duration.source_id, Duration.destination_id).in_(pairs))
        .all()
    )

    return [
        (record.source_id, record.destination_id, record.duration)
        for record in existing_records
    ]


def populate_known_durations(
    duration_matrix: List[List[int]],
    existing_durations: List[Tuple[str, str, float]],
    place_ids: List[str],
    duplicates: Dict[str, List[int]],
) -> (List[Tuple[str, str]]):
    pairs_to_remove = []
    for source_id, destination_id, duration in existing_durations:
        source_indices = [place_ids.index(source_id)] + duplicates.get(source_id, [])
        destination_indices = [place_ids.index(destination_id)] + duplicates.get(destination_id, [])
        
        # Set duration for all source-destination pairs involving duplicates
        for s_idx in source_indices:
            for d_idx in destination_indices:
                duration_matrix[s_idx][d_idx] = int(round(duration))
        pairs_to_remove.append((source_id, destination_id))
    
    return pairs_to_remove


def identify_missing_pairs(
    all_pairs: List[Tuple[str, str]], fetched_pairs: List[Tuple[str, str]]
) -> (List[Tuple[str, str]]):
    """
    Identifies which pairs are missing in the database.

    :param all_pairs: List of all possible pairs.
    :param fetched_pairs: List of pairs that have been fetched from the database.
    :return: List of missing pairs.
    """
    return [pair for pair in all_pairs if pair not in fetched_pairs]


def unique(elements: List[str]) -> (List[str]):
    """
    Returns a list of unique elements.

    :param elements: List of elements.
    :return: List of unique elements.
    """
    return list(set(elements))


def fetch_duration_matrix_api(
    coordinates: List[Tuple[float, float]], sources: List[int], destinations: List[int]
) -> (List[List[float]]):
    """
    Fetches the duration matrix from Mapbox API.

    :param coordinates: List of (lat, lon) tuples.
    :param sources: List of source indices.
    :param destinations: List of destination indices.
    :return: 2D list representing the durations matrix.
    """
    # Prepare the coordinates string for the API
    all_loc_indices = sorted(list(set(sources + destinations)))
    all_coords = [f"{coordinates[i][1]},{coordinates[i][0]}" for i in all_loc_indices] # (lon, lat)
    
    indexing_sources = [all_loc_indices.index(source) for source in sources]
    indexing_destinations = [all_loc_indices.index(destination) for destination in destinations]
    
    print(indexing_sources)
    print(indexing_destinations)
    
    # Combine all coordinates
    coordinates_str = ";".join(all_coords)
    request_url = f"{MAPBOX_MATRIX_URL}{coordinates_str}"

    # Define parameters
    params = {
        "access_token": MAPBOX_ACCESS_TOKEN,
        "annotations": "duration",
        "sources": ";".join(str(source) for source in indexing_sources),
        "destinations": ";".join(str(destination) for destination in indexing_destinations),
        "approaches": ";".join(
            ["curb"] * len(all_coords)
        ),  # One for each coordinate
        "fallback_speed": 45,
    }

    logger.info("Sending request to Mapbox Matrix API.")
    response = requests.get(request_url, params=params)

    if response.status_code != 200:
        logger.error(f"Mapbox API Error: {response.status_code} - {response.text}")
        raise Exception(f"Mapbox API Error: {response.status_code} - {response.text}")

    data = response.json()
    durations = data.get("durations")

    if durations is None:
        logger.error("No durations found in the API response.")
        raise Exception("No durations found in the API response.")

    logger.info("Successfully fetched durations from Mapbox API.")
    return durations


def update_matrix_and_prepare_new_durations(
    duration_matrix: List[List[int]],
    api_durations: List[List[float]],
    missing_sources: List[str],
    missing_destinations: List[str],
    place_ids: List[str],
    duplicates: Dict[str, List[int]],
) -> (List[Tuple[str, str, float]]):
    new_durations = []
    for s_idx, source_id in enumerate(missing_sources):
        for d_idx, destination_id in enumerate(missing_destinations):
            duration = api_durations[s_idx][d_idx]
            duration = math.ceil((float(duration) / 3600) * 4)
            
            source_indices = [place_ids.index(source_id)] + duplicates.get(source_id, [])
            destination_indices = [place_ids.index(destination_id)] + duplicates.get(destination_id, [])
            
            # Set duration for all source-destination pairs involving duplicates
            for src_idx in source_indices:
                for dest_idx in destination_indices:
                    duration_matrix[src_idx][dest_idx] = duration
            new_durations.append((source_id, destination_id, duration))
    
    return new_durations


def insert_new_durations(
    session: Session, new_durations: List[Tuple[str, str, float]]
) -> (None):
    """
    Inserts new durations into the database or updates them if they already exist.
    Prevents insertion of records where source_id is the same as destination_id.

    :param session: SQLAlchemy session.
    :param new_durations: List of tuples containing (source_id, destination_id, duration).
    """
    if not new_durations:
        logger.info("No new durations to insert.")
        return

    # Step 1: Separate source-destination pairs
    source_ids = [src for src, _, _ in new_durations]
    destination_ids = [dest for _, dest, _ in new_durations]

    # Step 2: Fetch existing records
    existing_durations = (
        session.query(Duration)
        .filter(
            (Duration.source_id.in_(source_ids))
            & (Duration.destination_id.in_(destination_ids))
        )
        .all()
    )

    # Create a set of existing pairs for quick lookup
    existing_pairs = {(d.source_id, d.destination_id): d for d in existing_durations}

    # Prepare lists for insert and update
    to_insert = []
    to_update = []

    # Step 3: Determine which records to insert or update
    for src, dest, dur in new_durations:
        # Skip records where source_id is the same as destination_id
        if src == dest:
            logger.warning(
                f"Skipping record with identical source and destination: {src}"
            )
            continue

        if (src, dest) in existing_pairs:
            # Update existing record
            existing_record = existing_pairs[(src, dest)]
            existing_record.duration = dur  # Update the duration
            to_update.append(existing_record)
        else:
            # Prepare new record for insertion
            to_insert.append(Duration(source_id=src, destination_id=dest, duration=dur))

    # Step 4: Bulk insert new records
    if to_insert:
        session.bulk_save_objects(to_insert)

    # Step 5: Commit updates (existing records)
    if to_update:
        session.bulk_save_objects(to_update)  # This works for updates in bulk

    # Commit the session to save changes
    session.commit()
    logger.info(
        f"Inserted {len(to_insert)} new duration records and updated {len(to_update)} records in the database."
    )


# Main Function


def get_duration_matrix(session: Session, input_places: List[Dict[str, float]]) -> (List[List[int]]):
    """
    Main function to fetch and store duration matrix, then return the complete matrix.

    :param input_places: List of dictionaries with 'place_id', 'lat', 'lon'.
    :return: 2D list representing the duration matrix.
             Format: duration_matrix[i][j] gives the duration from place i to place j.
    """
    if not input_places:
        logger.warning("No input places provided.")
        return []

    # Step 1: Prepare Place Data
    place_ids = get_place_ids(input_places)
    coordinates = get_coordinates(input_places)
    N = len(place_ids)
    
    # Identify duplicate indices
    duplicates = defaultdict(list)
    for idx, place_id in enumerate(place_ids):
        duplicates[place_id].append(idx)
    duplicates = {k: v for k, v in duplicates.items() if len(v) > 1}  # Keep only actual duplicates

    logger.info(f"Number of places to create duration matrix: {N}")

    # Step 2: Initialize Duration Matrix with 0 for same source and destination
    duration_matrix = create_matrix(N, N, default=0)

    # Step 3: Generate All Possible Source-Destination Pairs (excluding same pairs)
    all_pairs = generate_pairs(place_ids)
    logger.info(f"Total pairs to fetch: {len(all_pairs)}")

    # Step 4: Retrieve Existing Durations from Database
    try:
        existing_durations = query_database(session, all_pairs)
        logger.info(f"Existing durations retrieved: {len(existing_durations)}")

        # Step 5: Populate Known Durations into the Matrix and Remove from PAIRS_TO_FETCH
        pairs_fetched = populate_known_durations(
            duration_matrix, existing_durations, place_ids, duplicates
        )
        # Update PAIRS_TO_FETCH by removing fetched pairs
        pairs_to_fetch = identify_missing_pairs(all_pairs, pairs_fetched)
        logger.info(f"Pairs remaining to fetch from API: {len(pairs_to_fetch)}")

        # Step 6: Identify Missing Pairs that Need to be Fetched from API
        if pairs_to_fetch:
            # Extract unique sources and destinations from missing pairs
            missing_sources = unique([src for src, _ in pairs_to_fetch])
            missing_destinations = unique([dest for _, dest in pairs_to_fetch])

            logger.info(f"Unique sources to fetch: {len(missing_sources)}")
            logger.info(f"Unique destinations to fetch: {len(missing_destinations)}")

            # Convert place_ids to indices in the coordinates list
            source_indices = sorted([place_ids.index(src) for src in missing_sources])
            destination_indices = sorted([
                place_ids.index(dest) for dest in missing_destinations
            ])

            # Step 7: Call API to Fetch Missing Durations
            try:
                api_duration_matrix = fetch_duration_matrix_api(
                    coordinates=coordinates,
                    sources=source_indices,
                    destinations=destination_indices,
                )
            except Exception as e:
                logger.error(f"Failed to fetch durations from API: {e}")
                return duration_matrix  # Return what we have so far

            # Step 8: Update Duration Matrix and Prepare Data for Database Insertion
            new_durations = update_matrix_and_prepare_new_durations(
                duration_matrix=duration_matrix,
                api_durations=api_duration_matrix,
                missing_sources=missing_sources,
                missing_destinations=missing_destinations,
                place_ids=place_ids,
                duplicates=duplicates,
            )

            # Step 9: Insert New Durations into Database
            insert_new_durations(session, new_durations)

        else:
            logger.info("All duration pairs are already available in the database.")

        # Step 10: Return the Complete Duration Matrix
        return duration_matrix

    finally:
        session.close()


# [     a    b   c
#   a  [0,   1, -1]
#   b  [1,   0, -1]
#   c  [-1, -1,  0]
# ]


# a <x> c
# c <x> b

# source = a, c
# destination = b, c

# a -> b xxxxxx
# a -> c
# c -> b
# c -> c = 0