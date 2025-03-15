import sqlalchemy

import logging
import os
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.mysql import insert
from common.mariadb_schema import Activity, Accommodation, Duration
from common.utils import transform_sec_to_int, transform_time_to_int
from typing import Dict, List, Tuple, Any


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MariaDB_Adaptor:
    def __init__(self):
        # Ensure your environment variable MARIADB_URI is set to your connection string.
        # Format example: "mysql+mysqldb://user:password@host:port/dbname"
        mariadb_uri = os.getenv("MARIADB_URI")
        if not mariadb_uri:
            raise ValueError("MARIADB_URI environment variable not set.")

        self.engine = sqlalchemy.create_engine(
            mariadb_uri,
            pool_size=10,            # Maximum number of connections in the pool
            max_overflow=5,          # Additional connections beyond the pool_size
            pool_recycle=600,        # Recycle connections after 600 seconds to avoid stale connections
            pool_timeout=600,        # Maximum wait time of 600 seconds for getting a connection from the pool
            pool_pre_ping=True,      # Checks connection liveness before using it
            connect_args={
                "connect_timeout": 3600,  # Timeout in seconds for establishing a connection
                "read_timeout": 3600,     # Timeout in seconds for reading from the connection (similar to net_read_timeout)
                # Note: wait_timeout and interactive_timeout are server-side settings and must be set on MySQL.
            }
        )
        self.Session = sessionmaker(bind=self.engine)

    def __enter__(self):
        # Open a new session when entering the context
        self.session = self.Session()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        # If an exception occurred, roll back the session
        if exc_type:
            print(f"Exception: {exc_type}, {exc_val}, {exc_tb}")
            self.session.rollback()
        self.session.close()

    def get_engine(self):
        return self.engine

    def fetch_accommodations(self, place_ids: List[str]) -> Dict[str, Dict[str, int]]:
        """
        Fetches latitude, longitude, and business hours for each place ID from Activity and Accommodation tables.

        :param session: SQLAlchemy session.
        :param place_ids: List of place IDs.
        :return: Tuple containing:
                - Dictionary mapping place_id to its details.
        """
        place_details = {}

        try:
            accommodations = (
                self.session.query(
                    Accommodation.id,
                    Accommodation.name,
                    Accommodation.about_and_tags,
                    Accommodation.description,
                    Accommodation.latitude,
                    Accommodation.longitude,
                    Accommodation.start_time,
                    Accommodation.end_time,
                    Accommodation.image_url,
                )
                .filter(Accommodation.id.in_(place_ids))
                .all()
        )
        except Exception as e:
            self.session.rollback()
            logger.error(f"Error fetching accommodations: {e}")
            accommodations = (
                self.session.query(
                    Accommodation.id,
                    Accommodation.name,
                    Accommodation.about_and_tags,
                    Accommodation.description,
                    Accommodation.latitude,
                    Accommodation.longitude,
                    Accommodation.start_time,
                    Accommodation.end_time,
                    Accommodation.image_url,
                )
                .filter(Accommodation.id.in_(place_ids))
                .all()
        )
            return {}
            
        for acc in accommodations:
            start_int, end_int = transform_time_to_int(acc.start_time, acc.end_time)
            place_details[acc.id] = {
                "id": acc.id,
                "name": acc.name,
                "about_and_tags": acc.about_and_tags,
                "description": acc.description,
                "latitude": acc.latitude,
                "longitude": acc.longitude,
                "start_time_int": start_int or 0,
                "end_time_int": end_int or 96,
                "image_url": acc.image_url or "https://via.placeholder.com/150",
            }
            logger.debug(
                f"Fetched Accommodation - ID: {acc.id}, Lat: {acc.latitude}, Lon: {acc.longitude}, Start Int: {start_int}, End Int: {end_int}"
            )

        missing_ids = set(place_ids) - set(place_details.keys())
        if missing_ids:
            logger.warning(f"Accommodation details not found for IDs: {missing_ids}")

        return place_details

    def fetch_activities(self, place_ids: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Fetches latitude, longitude, and business hours for each place ID from Activity and Accommodation tables.

        :param session: SQLAlchemy session.
        :param place_ids: List of place IDs.
        :return: Tuple containing:
                - Dictionary mapping place_id to its latitude, longitude, start_time, and end_time as integers.
                - Dictionary mapping place_id to its business hours (start_time and end_time) as integers.
        """
        place_details = {}

        try:
            activities = (
                self.session.query(
                    Activity.id,
                    Activity.name,
                    Activity.about_and_tags,
                    Activity.description,
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
        except Exception as e:
            self.session.rollback()
            logger.error(f"Error fetching activities: {e}")
            activities = (
                self.session.query(
                    Activity.id,
                    Activity.name,
                    Activity.about_and_tags,
                    Activity.description,
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
            return {}
            
        for activity in activities:
            start_int, end_int = transform_time_to_int(
                activity.start_time, activity.end_time
            )
            place_details[activity.id] = {
                "id": activity.id,
                "name": activity.name,
                "about_and_tags": activity.about_and_tags,
                "description": activity.description,
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

        missing_ids = set(place_ids) - set(place_details.keys())
        if missing_ids:
            logger.warning(f"Activity details not found for IDs: {missing_ids}")

        return place_details

    def update_value_by_place_id(
        self, table: Activity | Accommodation, record_id: str, updates: Dict[str, Any]
    ) -> bool:
        """
        Updates the specified fields of a record in the given table.

        :param table: The SQLAlchemy table class (Activity or Accommodation).
        :param record_id: The ID of the record to update.
        :param updates: A dictionary of column names and values to update.
        :return: True if the update was successful, False otherwise.
        """

        try:

            record = self.session.query(table).filter(table.id == record_id).first()
            if not record:
                logger.warning(
                    f"Record with ID {record_id} not found in {table.__tablename__}."
                )
                return False

            for column, value in updates.items():
                if hasattr(record, column):
                    setattr(record, column, value)
                else:
                    logger.warning(
                        f"Column '{column}' does not exist on {table.__tablename__}."
                    )

            self.session.commit()
            logger.info(
                f"Record with ID {record_id} in {table.__tablename__} updated successfully."
            )
            return True
        except Exception as e:
            self.session.rollback()
            logger.error(
                f"Error updating record {record_id} in {table.__tablename__}: {e}"
            )
            return False

    def fetch_durations(self, pairs):
        """
        Executes a query to retrieve durations.

        :param pairs: List of (source_id, destination_id) tuples.
        :return: List of tuples containing (source_id, destination_id, duration).
        """
        if not pairs:
            return []

        records = (
            self.session.query(Duration)
            .filter(
                sqlalchemy.tuple_(Duration.source_id, Duration.destination_id).in_(
                    pairs
                )
            )
            .all()
        )

        return [
            (
                record.source_id,
                record.destination_id,
                transform_sec_to_int(record.duration),
            )
            for record in records
        ]

    def upsert_durations(self, pairs: List[Tuple[int, int, float]]):
        """
        Upserts the Duration table with new durations or updates existing records if conflicts occur.

        :param pairs: List of (source_id, destination_id, duration) tuples.
        """
        if not pairs:
            return

        records = [
            {"source_id": pair[0], "destination_id": pair[1], "duration": pair[2]}
            for pair in pairs
        ]

        stmt = insert(Duration).values(records)

        stmt = stmt.on_duplicate_key_update(duration=stmt.inserted.duration)

        self.session.execute(stmt)
        self.session.commit()
