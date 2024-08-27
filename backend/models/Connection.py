from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session

from flask import current_app

# Define the base class for SQLAlchemy models
Base = declarative_base()

class Connection:
    def __init__(self):
        # Fetch the database configuration from the Flask app config
        self.db_host = current_app.config['DB_HOST']
        self.db_port = current_app.config['DB_PORT']
        self.db_user = current_app.config['DB_USER']
        self.db_password = current_app.config['DB_PASSWORD']
        self.db_name = current_app.config['DB_NAME']

        # Create the database connection URI
        self.DATABASE_URI = f"mysql+pymysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
        
        # Create the engine
        self.engine = create_engine(self.DATABASE_URI)
        
        # Create a configured "Session" class
        self.Session = scoped_session(sessionmaker(bind=self.engine))
        
        # Bind the engine to the Base's metadata
        Base.metadata.bind = self.engine

    def get_session(self):
        """Return a new session object"""
        return self.Session()
