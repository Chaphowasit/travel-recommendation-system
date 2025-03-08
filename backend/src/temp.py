from typing import List, Dict, Literal
from langgraph.graph import MessagesState, StateGraph, END, START
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI
from flask import Flask, request, jsonify, render_template
from dotenv import load_dotenv
import os
import uuid
from controllers.ventical_n_day.vrp import VRPSolver
from controllers.interface import fetch_place_detail
from adapters.Weaviate import Weaviate_Adapter
from adapters.MariaDB import MariaDB_Adaptor
from common.mariadb_schema import Base
from flask_socketio import SocketIO, emit, send

# Load environment variables
load_dotenv()

app = Flask(__name__)
socketio = SocketIO(app)

class State(MessagesState):
    payload: Dict
    messages: List[Dict]
    state_name: str
    result: any

class Chatbot:
    def __init__(self, weaviate_adapter, mariadb_adaptor):
        self.api_key = os.getenv("OPENAI_APIKEY")
        self.llm = ChatOpenAI(api_key=self.api_key, model="gpt-4o", temperature=0, streaming=True, max_tokens=250)
        self.graph = self._build_graph()
        self.config = {"configurable": {"thread_id": str(uuid.uuid4())}}
        self.weaviate_adapter = weaviate_adapter
        self.mariadb_adaptor = mariadb_adaptor

    def classify_intent(self, state: State) -> Dict:
        """Classifies user intent and returns a dictionary with the intent category."""
        user_message = state["messages"][-1]["content"]
        prompt = f"""
        Classify the user message into one of the following categories:
        - retrieve (for travel recommendations)
        - generate_route (for travel planning)
        - etc_travel (for general travel-related questions):
          For travel-related questions that do not involve personal preferences (e.g., "How do I get a visa for Japan?", "Are there restrictions on liquids in carry-on luggage?", "When is the best time to visit Italy?", "How can I find cheap flights?", "What’s the fastest way to get from the airport to the city center?", "Do I need travel insurance for a trip to Europe?").
          (ChatGPT must answer the question accurately.)
        - etc_other (for unrelated questions)
          (not related to anything): For inputs unrelated to travel or general questions (e.g., "Tell me a joke", "Who is the president of the United States?", "What’s 2+2?", "What’s your favorite movie?").
          (ChatGPT must answer the question but encourage the user to discuss travel topics in Phuket. For example, "2+2 is 4! By the way, are you planning any upcoming trips?" or "That’s a great movie! Speaking of entertainment, are you interested in travel destinations with vibrant art and culture scenes?").
        
        
        User message: "{user_message}"
        Respond with only the category name.
        """
        response = self.llm.invoke(prompt)
        intent = response.content.strip().lower()
        return {"state_name": "intent classification", "intent": intent, "messages": [{"role": "system", "content": {"message": user_message, "intent" : intent}}]}

    def retrieve(self, state: State):
        """Fetch recommended places based on user query."""
        query = state["messages"][-1]["content"]["message"]
        _, _, data = fetch_place_detail(query, self.weaviate_adapter, self.mariadb_adaptor)
        retrieved_docs = [
            Document(
                page_content=item["description"],
                metadata={"id": item["id"], "name": item["name"], "category": category, "tag": item["tag"]}
            )
            for category, items in data.items() for item in items
        ]
        # response = "\n".join([doc.page_content for doc in retrieved_docs])
        response = "Here is your place!!!"
        return {"state_name": "retrieve activities and places", "result": data, "messages": [{"role": "system", "content": response}]}

    def generate_route(self, state: State):
        """Generates an optimized travel route."""
        payload = state["payload"]
        vrp_solver = VRPSolver(payload)
        vrp_result = vrp_solver.solve()
        # response = "Here's your optimize traveling route!!!\n\n" + str(vrp_result)
        return {"state_name": "Generate route", "result": vrp_result, "messages": [{"role": "system", "content": "Here's your optimize traveling route!!!"}]}

    def handle_general(self, state: State):
        """Handles general travel and unrelated questions."""
        intent = state["messages"][-1]["content"]["intent"]
        message = state["messages"][-1]["content"]["message"]
        if intent == "etc_travel":
            response = self.llm.invoke(message)
            response = response.content
        else:
            response = f"That's an interesting! But let's talk about travel!"
        return {"state_name":"general answer", "messages": [{"role": "system", "content": response}]}

    def _build_graph(self):
        workflow = StateGraph(State)
        workflow.add_node("classify", self.classify_intent)
        workflow.add_node("retrieve", self.retrieve)
        workflow.add_node("generate_route", self.generate_route)
        workflow.add_node("general", self.handle_general)
        
        workflow.add_edge(START, "classify")
        workflow.add_conditional_edges(
            "classify",
            lambda state: state["intent"],
            {
                "retrieve": "retrieve",
                "generate_route": "generate_route",
                "etc_travel": "general",
                "etc_other": "general",
            },
        )
        workflow.add_edge("retrieve", END)
        workflow.add_edge("generate_route", END)
        workflow.add_edge("general", END)
        
        return workflow.compile()
    
    def response(self, data):
        state = State(messages=[{"role": "user", "content": data.get("message", "")}], payload=data.get("payload", {}))
        for step in self.graph.stream(state, stream_mode="values", config=self.config):
            result = step["messages"][-1]
        return result["content"]

    def response_s(self, msg, payload):
        state = State(state_name="init", messages=[{"role": "user", "content": msg}], payload=payload)
        for step in self.graph.stream(state, stream_mode="values", config=self.config):
            result = step["messages"][-1]
            print(f"\n{step}\n")
            yield step
            
    async def handle_message(self, data):
        """Handles WebSocket message and streams GPT response."""
        state = State(state_name="initial state", messages=[{"role": "user", "content": data.get("message", "")}], payload=data.get("payload", {}))
        try:
            # Create an async generator that will yield responses as the GPT model streams
            async def stream_gpt_response():
                async for step in await self.graph.stream(state, stream_mode="values", config=self.config):
                    result = step["messages"][-1]
                    content = result["content"]
                    yield content  # Yield each chunk of the streaming response

            # Send each streaming chunk to the client
            async for chunk in stream_gpt_response():
                emit('message', {'content': chunk})

        except Exception as e:
            print(f"Error in WebSocket stream: {e}", exc_info=True)
            emit('message', {"error": "An error occurred while processing the request."})


@app.route('/page')
def index():
    return render_template('index.html')

payload = {
    "accommodation": {
        "place_id": "H0491",
        "sleep_times": [
            {
                "start": 0,
                "end": 32
            },
            {
                "start": 96,
                "end": 128
            }
        ]
    },
    "activities": [
        {
            "place_id": "A2291",
            "stay_time": 50,
            "visit_range": [
                {
                    "start": 0,
                    "end": 96
                },
                {
                    "start": 96,
                    "end": 192
                }
            ],
            "must": False
        },
        {
            "place_id": "A0736",
            "stay_time": 32,
            "visit_range": [
                {
                    "start": 40,
                    "end": 76
                },
                {
                    "start": 136,
                    "end": 172
                }
            ],
            "must": False
        },
        {
            "place_id": "A0265",
            "stay_time": 12,
            "visit_range": [
                {
                    "start": 32,
                    "end": 68
                },
                {
                    "start": 128,
                    "end": 164
                }
            ],
            "must": False
        },
        {
            "place_id": "A0314",
            "stay_time": 16,
            "visit_range": [
                {
                    "start": 48,
                    "end": 88
                },
                {
                    "start": 144,
                    "end": 184
                }
            ],
            "must": False
        }
    ]
}

# Event to handle the connection
@socketio.on('connect')
def handle_connect():
    print("Client connected")

# Event to handle disconnection
@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")
    
@socketio.on('message')
def handle_message(message):
    socketio.emit('message', f"User: {message}")
    
    response = chatbot.response_s(message, payload)
    for item in response:
        state_name = item.get("state_name", "None")
        result = item.get("result", "None")
        graph_message = item.get("messages", "None")
        socketio.emit('message', f"currently working at {state_name}")
        socketio.emit('message', f"                                 ")
        socketio.sleep(0.2)
        socketio.emit('message', f"get a result {result}")
        socketio.emit('message', f"                                 ")
        socketio.sleep(0.2)
        socketio.emit('message', f"where gen ai response {graph_message}")
        socketio.emit('message', f"=====================================")
        socketio.sleep(0.2)
    
@app.route('/get-message', methods=['POST'])
def get_message():
    data = request.json
    return app.response_class(chatbot.response(data), content_type='text/plain')

if __name__ == '__main__':
    weaviate_adapter = Weaviate_Adapter()
    with MariaDB_Adaptor() as mariadb_adaptor:
        Base.metadata.create_all(mariadb_adaptor.get_engine())

    chatbot = Chatbot(weaviate_adapter, mariadb_adaptor)
    app.run(debug=True)