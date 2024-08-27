import ast
import datetime
from typing import Dict, List, Union
from sqlalchemy import Column, Double, Integer, String, Text, Float, Time, inspect
from sqlalchemy.orm import Session

from models.Connection import Connection, Base

class ActivityDetail_Engine(Base, Connection):
    __tablename__ = 'activity_Detail'
    
    id = Column(String(5), primary_key=True)
    activity_name = Column(String(255), nullable=False)
    about_and_tags = Column(Text)
    latitude = Column(Double)
    longitude = Column(Double)
    start_time = Column(Time)
    end_time = Column(Time)
    duration = Column(Float)
    reviews = Column(Text)
    nearby_foodAndDrink1 = Column(Text)
    nearby_foodAndDrink2 = Column(Text)
    nearby_foodAndDrink3 = Column(Text)
    nearby_activity1 = Column(Text)
    nearby_activity2 = Column(Text)
    nearby_activity3 = Column(Text)

    def __init__(self):
        """Initialize the Connection class to setup the DB connection"""
        Connection.__init__(self)
    
    def query_by_id(self, record_id: str, columns: List[str] = None) -> (Union['ActivityDetail', None]):
        """
        Query a record by its ID and return specified columns wrapped in an ActivityDetail instance.
        
        :param record_id: The ID of the record to query.
        :param columns: A list of column names to return. If None, return all columns.
        :return: An instance of ActivityDetail with the requested columns populated.
        """
        query = self.query(query_dict={"id": record_id}, columns=columns)
        
        if len(query) == 0:
            return None
        
        return query[0]
    
    def bulk_query_by_ids(self, record_ids: List[str], columns: List[str] = None) -> (List[Union['ActivityDetail', None]]):
        """
        Query multiple records by their IDs and return specified columns wrapped in ActivityDetail instances.
        
        :param record_ids: A list of IDs of the records to query.
        :param columns: A list of column names to return. If None, return all columns.
        :return: A list of ActivityDetail instances for the requested IDs.
        """
        if not record_ids:
            return []

        session: Session = self.get_session()
        query = session.query(ActivityDetail_Engine).filter(ActivityDetail_Engine.id.in_(record_ids))

        results = query.all()
        session.close()

        return [result.unpack_activity_detail(columns=columns) for result in results]

    
    def query(self, query_dict: Dict[str, Union[str, int, float]] = {}, columns: List[str] = None) -> (List['ActivityDetail']):
        """
        Query records by a dictionary of column names and values.
        
        :param query_dict: A dictionary where keys are column names and values are the values to filter by.
        :param columns: A list of column names to return. If None, return all columns.
        :return: A list of ActivityDetail instances that match the query.
        """
        session: Session = self.get_session()
        
        # Build the query dynamically based on the input dictionary
        query = session.query(ActivityDetail_Engine)
        
        for key, value in query_dict.items():
            if hasattr(ActivityDetail_Engine, key):  # Ensure the key is a valid column
                query = query.filter(getattr(ActivityDetail_Engine, key) == value)
        
        results = query.all()
        session.close()
        
        # Convert the results to ActivityDetail instances
        return [result.unpack_activity_detail(columns=columns) for result in results]
    
    def to_dict(self) -> (Dict[str, Union[str, int, float, None]]):
        """Convert the object to a dictionary"""
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}
    
    def unpack_activity_detail(engine_instance: 'ActivityDetail_Engine', columns: List[str] = None) -> ('ActivityDetail'):
        """Unpack an instance of ActivityDetail_Engine and return an instance of ActivityDetail with specified columns."""
        
        # Define a function to get the value of a column if it exists, or None if it doesn't
        def get_value_or_none(attribute: str) -> (Union[str, float, datetime.time, None]):
            return getattr(engine_instance, attribute, None)
        
        # If no columns are specified, return all available columns
        if columns is None or len(columns) == 0:
            columns = [
                'id', 'activity_name', 'about_and_tags', 'latitude', 'longitude',
                'start_time', 'end_time', 'duration', 'reviews', 'nearby_foodAndDrink1',
                'nearby_foodAndDrink2', 'nearby_foodAndDrink3',
                'nearby_activity1', 'nearby_activity2', 'nearby_activity3'
            ]
            
        return ActivityDetail(
            id=get_value_or_none('id') if 'id' in columns else None,
            activity_name=get_value_or_none('activity_name') if 'activity_name' in columns else None,
            about_and_tags=get_value_or_none('about_and_tags') if 'about_and_tags' in columns else None,
            latitude=get_value_or_none('latitude') if 'latitude' in columns else None,
            longitude=get_value_or_none('longitude') if 'longitude' in columns else None,
            start_time=get_value_or_none('start_time') if 'start_time' in columns else None,
            end_time=get_value_or_none('end_time') if 'end_time' in columns else None,
            duration=get_value_or_none('duration') if 'duration' in columns else None,
            reviews=get_value_or_none('reviews') if 'reviews' in columns else None,
            nearby_foodAndDrink1=get_value_or_none('nearby_foodAndDrink1') if 'nearby_foodAndDrink1' in columns else None,
            nearby_foodAndDrink2=get_value_or_none('nearby_foodAndDrink2') if 'nearby_foodAndDrink2' in columns else None,
            nearby_foodAndDrink3=get_value_or_none('nearby_foodAndDrink3') if 'nearby_foodAndDrink3' in columns else None,
            nearby_activity1=get_value_or_none('nearby_activity1') if 'nearby_activity1' in columns else None,
            nearby_activity2=get_value_or_none('nearby_activity2') if 'nearby_activity2' in columns else None,
            nearby_activity3=get_value_or_none('nearby_activity3') if 'nearby_activity3' in columns else None
        )

        

class ActivityDetail:
    
    def __init__(self, id: str, activity_name: str, about_and_tags: str, latitude: float, longitude: float, start_time: datetime.time, end_time: datetime.time, duration: float, reviews: str, 
                 nearby_foodAndDrink1: str = None, nearby_foodAndDrink2: str = None, nearby_foodAndDrink3: str = None,
                 nearby_activity1: str = None, nearby_activity2: str = None, nearby_activity3: str = None):
        self.id: int = id
        self.activity_name: str = activity_name
        self.about_and_tags: str = about_and_tags
        self.latitude: float = latitude
        self.longitude: float = longitude
        
        # Convert start_time and end_time to float (0-24) based on the time string
        self.start_time: float = self._convert_time_to_float(start_time)
        self.end_time: float = self._convert_time_to_float(end_time)
        
        self.duration: float = duration
        
        # Convert string representations of lists to actual lists
        self.reviews: List[str] = self._convert_string_to_list(reviews)
        self.best_nearby_foodAndDrinks: List[str] = [nearby_foodAndDrink1, nearby_foodAndDrink2, nearby_foodAndDrink3]
        self.best_nearby_activities: List[str] = [nearby_activity1, nearby_activity2, nearby_activity3]
    
    def _convert_time_to_float(self, time_obj: datetime.time|None) -> (float):
        """Convert a datetime.time object to a float representing the time on a 24-hour scale."""
        if time_obj is None:
            return None
        
        return time_obj.hour + time_obj.minute / 60.0
    
    def _convert_string_to_list(self, string_list: str|None) -> (List[str]):
        """Convert a string representation of a list to an actual list of strings."""
        if string_list is None:
            return None
        
        try:
            return ast.literal_eval(string_list)
        except (SyntaxError, ValueError):
            return []  # Return an empty list if there's an issue with conversion
    
    def to_dict(self) -> (Dict[str, Union[int, str, float, List[str]]]):
        """Convert the ActivityDetail instance to a dictionary."""
        return {
            "id": self.id,
            "activity_name": self.activity_name,
            "about_and_tags": self.about_and_tags,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "start_time": self.start_time,
            "end_time": self.end_time,
            "duration": self.duration,
            "reviews": self.reviews,
            "best_nearby_foodAndDrinks": self.best_nearby_foodAndDrinks,
            "best_nearby_activities": self.best_nearby_activities
        }
