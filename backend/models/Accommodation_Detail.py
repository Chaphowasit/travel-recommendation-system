import ast
import datetime
from typing import Dict, List, Union
from sqlalchemy import Column, Double, String, Text, Time, inspect
from sqlalchemy.orm import Session

from models.Connection import Connection, Base

class AccommodationDetail_Engine(Base, Connection):
    __tablename__ = 'accommodation_Detail'
    
    id = Column(String(5), primary_key=True)
    accommodation_name = Column(String(255), nullable=False)
    about_and_tags = Column(Text)
    latitude = Column(Double)
    longitude = Column(Double)
    start_time = Column(Time)
    end_time = Column(Time)
    reviews = Column(Text)
    nearby_foodAndDrink1 = Column(String(255))
    nearby_foodAndDrink2 = Column(String(255))
    nearby_foodAndDrink3 = Column(String(255))
    nearby_activity1 = Column(String(255))
    nearby_activity2 = Column(String(255))
    nearby_activity3 = Column(String(255))

    def __init__(self):
        """Initialize the Connection class to setup the DB connection"""
        Connection.__init__(self)
    
    def query_by_id(self, record_id: str, columns: List[str] = None) -> (Union['AccommodationDetail', None]):
        """
        Query a record by its ID and return specified columns wrapped in an AccommodationDetail instance.
        
        :param record_id: The ID of the record to query.
        :param columns: A list of column names to return. If None, return all columns.
        :return: An instance of AccommodationDetail with the requested columns populated.
        """
        query = self.query(query_dict={"id": record_id}, columns=columns)
        
        if len(query) == 0:
            return None
        
        return query[0]
    
    def bulk_query_by_ids(self, record_ids: List[str], columns: List[str] = None) -> (List[Union['AccommodationDetail', None]]):
        """
        Query multiple records by their IDs and return specified columns wrapped in AccommodationDetail instances.
        
        :param record_ids: A list of IDs of the records to query.
        :param columns: A list of column names to return. If None, return all columns.
        :return: A list of AccommodationDetail instances for the requested IDs.
        """
        if not record_ids:
            return []

        session: Session = self.get_session()
        query = session.query(AccommodationDetail_Engine).filter(AccommodationDetail_Engine.id.in_(record_ids))

        results = query.all()
        session.close()

        return [result.unpack_accommodation_detail(columns=columns) for result in results]

    
    def query(self, query_dict: Dict[str, Union[str, int, float]] = {}, columns: List[str] = None) -> (List['AccommodationDetail']):
        """
        Query records by a dictionary of column names and values.
        
        :param query_dict: A dictionary where keys are column names and values are the values to filter by.
        :param columns: A list of column names to return. If None, return all columns.
        :return: A list of AccommodationDetail instances that match the query.
        """
        session: Session = self.get_session()
        
        # Build the query dynamically based on the input dictionary
        query = session.query(AccommodationDetail_Engine)
        
        for key, value in query_dict.items():
            if hasattr(AccommodationDetail_Engine, key):  # Ensure the key is a valid column
                query = query.filter(getattr(AccommodationDetail_Engine, key) == value)
        
        results = query.all()
        session.close()
        
        # Convert the results to AccommodationDetail instances
        return [result.unpack_accommodation_detail(columns=columns) for result in results]
    
    def to_dict(self) -> (Dict[str, Union[str, int, float, None]]):
        """Convert the object to a dictionary"""
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}
    
    def unpack_accommodation_detail(engine_instance: 'AccommodationDetail_Engine', columns: List[str] = None) -> ('AccommodationDetail'):
        """Unpack an instance of AccommodationDetail_Engine and return an instance of AccommodationDetail with specified columns."""
        
        # Define a function to get the value of a column if it exists, or None if it doesn't
        def get_value_or_none(attribute: str) -> (Union[str, float, datetime.time, None]):
            return getattr(engine_instance, attribute, None)
        
        # If no columns are specified, return all available columns
        if columns is None or len(columns) == 0:
            columns = [
                'id', 'accommodation_name', 'about_and_tags', 'latitude', 'longitude',
                'start_time', 'end_time', 'reviews', 'nearby_foodAndDrink1',
                'nearby_foodAndDrink2', 'nearby_foodAndDrink3',
                'nearby_activity1', 'nearby_activity2', 'nearby_activity3'
            ]
            
        return AccommodationDetail(
            id=get_value_or_none('id') if 'id' in columns else None,
            accommodation_name=get_value_or_none('accommodation_name') if 'accommodation_name' in columns else None,
            about_and_tags=get_value_or_none('about_and_tags') if 'about_and_tags' in columns else None,
            latitude=get_value_or_none('latitude') if 'latitude' in columns else None,
            longitude=get_value_or_none('longitude') if 'longitude' in columns else None,
            start_time=get_value_or_none('start_time') if 'start_time' in columns else None,
            end_time=get_value_or_none('end_time') if 'end_time' in columns else None,
            reviews=get_value_or_none('reviews') if 'reviews' in columns else None,
            nearby_foodAndDrink1=get_value_or_none('nearby_foodAndDrink1') if 'nearby_foodAndDrink1' in columns else None,
            nearby_foodAndDrink2=get_value_or_none('nearby_foodAndDrink2') if 'nearby_foodAndDrink2' in columns else None,
            nearby_foodAndDrink3=get_value_or_none('nearby_foodAndDrink3') if 'nearby_foodAndDrink3' in columns else None,
            nearby_activity1=get_value_or_none('nearby_activity1') if 'nearby_activity1' in columns else None,
            nearby_activity2=get_value_or_none('nearby_activity2') if 'nearby_activity2' in columns else None,
            nearby_activity3=get_value_or_none('nearby_activity3') if 'nearby_activity3' in columns else None
        )

class AccommodationDetail:
    
    def __init__(self, id: str, accommodation_name: str, about_and_tags: str, latitude: float, longitude: float, start_time: datetime.time, end_time: datetime.time, reviews: str, 
                 nearby_foodAndDrink1: str = None, nearby_foodAndDrink2: str = None, nearby_foodAndDrink3: str = None,
                 nearby_activity1: str = None, nearby_activity2: str = None, nearby_activity3: str = None):
        self.id: str = id
        self.accommodation_name: str = accommodation_name
        self.about_and_tags: str = about_and_tags
        self.latitude: float = latitude
        self.longitude: float = longitude
        
        # Convert start_time and end_time to float (0-24) based on the time object
        self.start_time: float = self._convert_time_to_float(start_time)
        self.end_time: float = self._convert_time_to_float(end_time)
        
        # Convert string representations of lists to actual lists
        self.reviews: List[str] = self._convert_string_to_list(reviews)
        self.nearby_foodAndDrinks: List[str] = [nearby_foodAndDrink1, nearby_foodAndDrink2, nearby_foodAndDrink3]
        self.nearby_activities: List[str] = [nearby_activity1, nearby_activity2, nearby_activity3]

    def _convert_time_to_float(self, time_obj: datetime.time|None) -> (float):
        """Convert a datetime.time object to a float representing the time on a 24-hour scale."""
        if time_obj is None:
            return None
        
        return time_obj.hour + time_obj.minute / 60.0
    
    def _convert_string_to_list(self, string_list: str|None) -> (List[str]):
        """Convert a string representation of a list to an actual list of strings."""
        if string_list is None:
            return []
        
        try:
            return ast.literal_eval(string_list)
        except (SyntaxError, ValueError):
            return []  # Return an empty list if there's an issue with conversion
    
    def to_dict(self) -> (Dict[str, Union[str, int, float, List[str]]]):
        """Convert the AccommodationDetail instance to a dictionary."""
        return {
            "id": self.id,
            "accommodation_name": self.accommodation_name,
            "about_and_tags": self.about_and_tags,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "reviews": self.reviews,
            "nearby_foodAndDrinks": self.nearby_foodAndDrinks,
            "nearby_activities": self.nearby_activities
        }
