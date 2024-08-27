import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.routes import blueprint

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Load environment variables into app config
    app.config['DB_HOST'] = os.getenv("DB_HOST")
    app.config['DB_PORT'] = os.getenv("DB_PORT")
    app.config['DB_USER'] = os.getenv("DB_USER")
    app.config['DB_PASSWORD'] = os.getenv("DB_PASSWORD")
    app.config['DB_NAME'] = os.getenv("DB_NAME")

    app.register_blueprint(
        blueprint, url_prefix="/"
    ) 

    # Route for serving other static files
    @app.route("/<path:path>")
    def static_proxy(path):
        return send_from_directory(app.static_folder, path)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
    