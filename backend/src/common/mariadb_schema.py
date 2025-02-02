from sqlalchemy import Column, String, Float, Integer, PrimaryKeyConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Time as SQLAlchemyTime

# Initialize the base class for declarative models
Base = declarative_base()


class Activity(Base):
    __tablename__ = "Activity"

    id = Column(String(255), primary_key=True)
    name = Column(String(255))
    about_and_tags = Column(String)
    description = Column(String)
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
    image_url = Column(String)


class Accommodation(Base):
    __tablename__ = "Accommodation"

    id = Column(String(255), primary_key=True)
    name = Column(String(255))
    about_and_tags = Column(String)
    description = Column(String)
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
    image_url = Column(String)


class Duration(Base):
    __tablename__ = "durations"

    source_id = Column(String(255), nullable=False)
    destination_id = Column(String(255), nullable=False)
    duration = Column(Float, nullable=False)

    __table_args__ = (PrimaryKeyConstraint("source_id", "destination_id"),)
