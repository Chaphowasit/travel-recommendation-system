import asyncio
from contextlib import contextmanager  # Use synchronous context manager
from flask import Flask, jsonify
from flask_cors import CORS

from entrypoints.http.vrp.router import vrp_router
from settings import APP_NAME, APP_VERSION
from settings.db import IS_RELATIONAL_DB, initialize_db

@contextmanager  # Use synchronous context manager
def lifespan(app: Flask):
    kwargs = {}
    if IS_RELATIONAL_DB:
        from repositories.relational_db.place.orm import Base  # fmt: skip
        kwargs = {'declarative_base': Base}

    initialize_db(**kwargs)  # This should be synchronous
    yield  # Yield control to the application

app = Flask(__name__)
app.config['APP_NAME'] = APP_NAME
app.config['APP_VERSION'] = APP_VERSION

# Apply CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize the database and other resources synchronously
def lifespan(app: Flask):
    kwargs = {}
    if IS_RELATIONAL_DB:
        from repositories.relational_db.place.orm import Base
        kwargs = {'declarative_base': Base}

    asyncio.run(initialize_db(**kwargs))  # Run async function synchronously
    yield

# Register the Blueprint
app.register_blueprint(vrp_router, url_prefix='/api')  # Register with a URL prefix if desired

@app.errorhandler(Exception)
def universal_exception_handler(exc):
    return jsonify({'error': f'{type(exc).__name__}: {exc}'}), 500

@app.route('/', methods=['GET'])
def root():
    return jsonify({'service': app.config['APP_NAME'], 'version': app.config['APP_VERSION']})

if __name__ == '__main__':
    app.run(debug=True)
