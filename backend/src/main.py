import asyncio
from flask import Flask, jsonify, request
from flask_cors import CORS
from adapters.Weaviate import Weaviate_Adapter
from usecases.query_response import arrange_respone
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

    intent_result = chatbot.classify_intent(message)
    if "Recommended" in intent_result:
        activity_collections = weaviate_adapter.get_collections("Activity_Embedded")
        activity_response = weaviate_adapter.hybrid_query(activity_collections, 3, 
                                                        "activity_name", message)
        activity_result = arrange_respone(activity_response)


        accommodation_collections = weaviate_adapter.get_collections("Accommodation_Embedded")
        accommodation_response = weaviate_adapter.hybrid_query(accommodation_collections, 3, 
                                                      "accommodation_name", message)
        accommodation_result = arrange_respone(accommodation_response)
        results = {"activities": activity_result, "accommodations": accommodation_result}

        if chatbot.classify_place_type(message) == "Activity":
            print("activities")
            print(results["activities"])
            response = chatbot.recommend_place(results["activities"], message).content
        else:
            response = chatbot.recommend_place(results["accommodations"], message).content
            print("accommodations")
            print(results["activities"])
    else:
        response = chatbot.answer_etc(message)

    return jsonify({
        'user_message': response
    })


if __name__ == '__main__':
    chatbot = Chatbot()
    weaviate_adapter = Weaviate_Adapter()
    app.run(debug=True)
