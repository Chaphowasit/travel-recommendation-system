import os

# Application name and version
APP_NAME = 'Travel Recommendation System'
APP_VERSION = '3'

# Enable/disable logging of SQL statements
SQLALCHEMY_ECHO = os.environ.get('SQLALCHEMY_ECHO', '').lower() == 'true'

# Set the isolation level for the database connection
SQLALCHEMY_ISOLATION_LEVEL = os.environ.get('SQLALCHEMY_ISOLATION_LEVEL') or 'SERIALIZABLE'

# Database connection string:
# - sqlite+aiosqlite:///sqlite.db (SQLite3)
# - sqlite+aiosqlite:///:memory: (SQLite3 in-memory)
# - mysql+asyncmy://<username>:<password>@<host>:<port>/<dbname> (MySQL / MariaDB)
# - postgresql+asyncpg://<username>:<password>@<host>:<port>/<dbname> (PostgreSQL)
# - mongodb://<username>:<password>@<host>:<port>/<dbname> (MongoDB)

DB_USER = os.environ.get('DB_USER', 'username')
DB_PASSWORD = os.environ.get('DB_PASSWORD', 'password')
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_PORT = os.environ.get('DB_PORT', '3306')  # Default port for MariaDB
DB_NAME = os.environ.get('DB_NAME', 'database_name')

DATABASE_URI = os.environ.get(
    'DATABASE_URI',
    f'mysql+asyncmy://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
)

# If "reinitialize" query parameter is set to "true", existing tables will be dropped before
# creating new tables. Example connection string with reinitialization:
# mysql+asyncmy://user:password@localhost:3306/mydatabase?reinitialize=true
