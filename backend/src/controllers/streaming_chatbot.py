from typing import List, Dict
from langgraph.graph import MessagesState, StateGraph, END, START
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os
import uuid
from controllers.ventical_n_day.vrp import VRPSolver
from controllers.interface import fetch_place_detail
from langchain.schema import SystemMessage, HumanMessage
import os

NEXT_STATE_NAME = ""

# Load environment variables
load_dotenv()

class State(MessagesState):
    payload: Dict
    messages: List[Dict]
    result: any

class StreamingChatbot:
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

        global NEXT_STATE_NAME
        if intent == "retrieve":
            NEXT_STATE_NAME = "retrieve activities and places"
        elif intent == "generate_route":
            NEXT_STATE_NAME = "generate route"
        elif intent == "etc_travel" or intent == "etc_other":
            NEXT_STATE_NAME = "general answer"
        
        return {"intent": intent, "messages": [{"role": "system", "content": user_message, "intent" : intent}]}

    def retrieve(self, state: State):
        """Fetch recommended places based on user query."""
        global NEXT_STATE_NAME
        NEXT_STATE_NAME = "summarize the place"
        query = state["messages"][-1]["content"]
        _, _, data = fetch_place_detail(query, self.weaviate_adapter, self.mariadb_adaptor)
        retrieved_docs = [
            Document(
                page_content=item["description"],
                metadata={"id": item["id"], "name": item["name"], "category": category, "tag": item["tag"]}
            )
            for category, items in data.items() for item in items
        ]
        response = "\n".join([doc.page_content for doc in retrieved_docs])
        return {"state_name": "retrieve activities and places", "result": data, "messages": [{"role": "system", "content": response}]}

    def generate_route(self, state: State):
        """Generates an optimized travel route."""
        global NEXT_STATE_NAME
        NEXT_STATE_NAME = "response route"
        payload = state["payload"]
        vrp_solver = VRPSolver(payload)
        vrp_result = vrp_solver.solve()
        response = "Here's your optimize traveling route!!!\n\n" + str(vrp_result)
        return {"state_name": "Generate route", "result": vrp_result, "messages": [{"role": "system", "content": response}]}

    def handle_general(self, state: State):
        global NEXT_STATE_NAME
        NEXT_STATE_NAME = "answer general question"
        """Handles general travel and unrelated questions."""
        intent = state["messages"][-1]["intent"]
        return {"state_name":"general answer", "messages": [{"role": "system", "content": intent}]}

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

    def response(self, msg, payload):
        global NEXT_STATE_NAME
        NEXT_STATE_NAME = "intent classification"
        mode="general"
        response = dict()
        response["state_name"] = "landing"
        yield response

        state = State(state_name="init", messages=[{"role": "user", "content": msg}], payload=payload)
        
        for step in self.graph.stream(state, stream_mode="values", config=self.config):
            lastest_step = step
            response["state_name"] = NEXT_STATE_NAME
            if NEXT_STATE_NAME == "summarize the place":
                response["recommendations"] = lastest_step["result"]
                mode="summarize"
            elif NEXT_STATE_NAME == "response route":
                response["route"] = lastest_step["result"]
                mode="summarize"
            yield response

        content = lastest_step["messages"][-1]["content"]
        yield from self.streaming_summarize_chatbot(msg, response, content, mode)
        
        yield {"state_name": "end"}
    
    def streaming_summarize_chatbot(self, user_input, response, content, mode):
        response = dict()
        response["state_name"] = "summarize answer"
        
        chat_model = ChatOpenAI(
            api_key=self.api_key,
            streaming=True,
            model_name="gpt-3.5-turbo"
        )

        if mode == "summarize":
            system_prompt = "You are an AI assistant that summarizes information, answers user queries, and generates engaging text efficiently."
        else:
            if content == "etc_other":
                system_prompt = "You are a creative AI assistant skilled in answering user queries and generating engaging text."
            elif content == "etc_travel":
                system_prompt = "You are a creative AI assistant skilled in answering user queries and generating engaging text."

        for chunk in chat_model.stream(
            [
                SystemMessage(content=system_prompt),
                HumanMessage(content=str(content))
            ]
        ):
            response["message"] = chunk.content 
            yield response
