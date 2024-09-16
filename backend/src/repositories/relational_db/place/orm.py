import datetime
from typing import Optional

from sqlalchemy import Double, Float, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass


class FoodAndDrink(Base):
    __tablename__ = 'FoodAndDrink'
    
    id: Mapped[str] = mapped_column(String(5), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    about_and_tags: Mapped[str] = mapped_column(Text)
    latitude: Mapped[float] = mapped_column(Double)
    longitude: Mapped[float] = mapped_column(Double)
    start_time: Mapped[datetime.time] = mapped_column(Time)
    end_time: Mapped[datetime.time] = mapped_column(Time)
    reviews: Mapped[str] = mapped_column(Text)
    nearby_accommodation1: Mapped[str] = mapped_column(Text)
    nearby_accommodation2: Mapped[str] = mapped_column(Text)
    nearby_accommodation3: Mapped[str] = mapped_column(Text)
    nearby_foodAndDrink1: Mapped[str] = mapped_column(Text)
    nearby_foodAndDrink2: Mapped[str] = mapped_column(Text)
    nearby_foodAndDrink3: Mapped[str] = mapped_column(Text)
    nearby_activity1: Mapped[str] = mapped_column(Text)
    nearby_activity2: Mapped[str] = mapped_column(Text)
    nearby_activity3: Mapped[str] = mapped_column(Text)

class Activity(Base):
    __tablename__ = 'Activity'

    id: Mapped[str] = mapped_column(String(5), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    about_and_tags: Mapped[str] = mapped_column(Text)
    latitude: Mapped[float] = mapped_column(Double)
    longitude: Mapped[float] = mapped_column(Double)
    start_time: Mapped[datetime.time] = mapped_column(Time)
    end_time: Mapped[datetime.time] = mapped_column(Time)
    duration: Mapped[Integer] = mapped_column(Integer)
    reviews: Mapped[str] = mapped_column(Text)
    nearby_foodAndDrink1: Mapped[str] = mapped_column(Text)
    nearby_foodAndDrink2: Mapped[str] = mapped_column(Text)
    nearby_foodAndDrink3: Mapped[str] = mapped_column(Text)
    nearby_activity1: Mapped[str] = mapped_column(Text)
    nearby_activity2: Mapped[str] = mapped_column(Text)
    nearby_activity3: Mapped[str] = mapped_column(Text)

class Accommodation(Base):
    __tablename__ = 'Accommodation'

    id: Mapped[str] = mapped_column(String(5), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    about_and_tags: Mapped[str] = mapped_column(Text)
    latitude: Mapped[float] = mapped_column(Double)
    longitude: Mapped[float] = mapped_column(Double)
    start_time: Mapped[datetime.time] = mapped_column(Time)
    end_time: Mapped[datetime.time] = mapped_column(Time)
    reviews: Mapped[str] = mapped_column(Text)
    nearby_foodAndDrink1: Mapped[str] = mapped_column(String(255))
    nearby_foodAndDrink2: Mapped[str] = mapped_column(String(255))
    nearby_foodAndDrink3: Mapped[str] = mapped_column(String(255))
    nearby_activity1: Mapped[str] = mapped_column(String(255))
    nearby_activity2: Mapped[str] = mapped_column(String(255))
    nearby_activity3: Mapped[str] = mapped_column(String(255))
    