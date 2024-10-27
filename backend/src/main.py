import asyncio
from flask import Flask, jsonify, request
from flask_cors import CORS
from controllers.chatbot import Chatbot

app = Flask(__name__)
app.config['APP_NAME'] = "Travel Recommendation System"

# Apply CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Register the Blueprint
@app.errorhandler(Exception)
def universal_exception_handler(exc):
    return jsonify({'error': f'{type(exc).__name__}: {exc}'}), 500

@app.route('/', methods=['GET'])
def root():
    return jsonify({'service': app.config['APP_NAME']})

@app.route('/sendMessage', methods=['POST'])
def send_message():
    # Extract data from the request
    data = request.json  # Assuming you're sending JSON data in the body
    if 'message' not in data:
        return jsonify({'error': 'No message provided'}), 400  # Return error if message is missing

    message = data['message']

    # You can process the message here (e.g., log it, save it, etc.)
    # Then, send a response
    return jsonify({
        'user_message': chatbot.idk(message)
    })


if __name__ == '__main__':
    chatbot = Chatbot()
    app.run(debug=True)
