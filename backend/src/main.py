import logging
import asyncio
from flask import Flask, jsonify, request
from flask_cors import CORS
from adapters.Weaviate import Weaviate_Adapter
from usecases.query_response import arrange_respone
from controllers.chatbot import Chatbot

# Initialize Flask app
app = Flask(__name__)
app.config['APP_NAME'] = "Travel Recommendation System"

# Apply CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Set up logger
logger = logging.getLogger(app.config['APP_NAME'])
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

# Register the Blueprint
@app.errorhandler(Exception)
def universal_exception_handler(exc):
    logger.error(f"Exception occurred: {type(exc).__name__}: {exc}", exc_info=True)
    return jsonify({'error': f'{type(exc).__name__}: {exc}'}), 500

@app.route('/', methods=['GET'])
def root():
    logger.info("Root endpoint accessed")
    return jsonify({'service': app.config['APP_NAME']})

@app.route('/sendMessage', methods=['POST'])
def send_message():
    logger.info("sendMessage endpoint accessed")
    try:
        # Extract data from the request
        data = request.json  # Assuming you're sending JSON data in the body
        if 'message' not in data:
            logger.warning("No message provided in request")
            return jsonify({'error': 'No message provided'}), 400  # Return error if message is missing

        message = data['message']
        logger.debug(f"User message received: {message}")

        intent_result = chatbot.classify_intent(message)
        logger.debug(f"Intent classified as: {intent_result}")

        if "Recommended" in intent_result:
            logger.info("Recommendation intent detected")

            activity_collections = weaviate_adapter.get_collections("Activity_Embedded")
            activity_response = weaviate_adapter.hybrid_query(activity_collections, 3, 
                                                            "activity_name", message)
            activity_result = arrange_respone(activity_response, "activity")
            logger.debug(f"Activity results: {activity_result}")

            accommodation_collections = weaviate_adapter.get_collections("Accommodation_Embedded")
            accommodation_response = weaviate_adapter.hybrid_query(accommodation_collections, 3, 
                                                          "accommodation_name", message)
            accommodation_result = arrange_respone(accommodation_response, "accommodation")
            logger.debug(f"Accommodation results: {accommodation_result}")

            results = {"activities": activity_result, "accommodations": accommodation_result}

            if chatbot.classify_place_type(message) == "Activity":
                logger.info("Activity type detected for recommendation")
                response = chatbot.recommend_place(results["activities"], message).content
            else:
                logger.info("Accommodation type detected for recommendation")
                response = chatbot.recommend_place(results["accommodations"], message).content
        else:
            logger.info("Non-recommendation intent detected")
            response = chatbot.answer_etc(message)

        logger.debug(f"Response generated: {response}")
        return jsonify({'user_message': response})

    except Exception as e:
        logger.error(f"Error in sendMessage: {e}", exc_info=True)
        return jsonify({'error': 'An error occurred'}), 500

if __name__ == '__main__':
    chatbot = Chatbot()
    weaviate_adapter = Weaviate_Adapter()
    logger.info("Starting Flask application")
    app.run(debug=True)
