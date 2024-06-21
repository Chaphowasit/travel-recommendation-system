from flask import Flask, send_from_directory
from flask_cors import CORS
from routes.routes import blueprint

def create_app():
    app = Flask(__name__)
    CORS(app)

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