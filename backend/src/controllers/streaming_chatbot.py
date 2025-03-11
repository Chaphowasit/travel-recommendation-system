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
        response = "\n\n".join(["place name: " + doc.metadata["name"] + "\ndescriptions:" + doc.page_content for doc in retrieved_docs])
        return {"state_name": "retrieve activities and places", "result": data, "messages": [{"role": "system", "content": response}]}

    def generate_route(self, state: State):
        """Generates an optimized travel route."""
        global NEXT_STATE_NAME
        NEXT_STATE_NAME = "response route"
        payload = state["payload"]
        
        vrp_result= None
        routes = ""
        if not payload:
            routes = "Sorry, unable to generate route via some restrictions"
        else:
            vrp_solver = VRPSolver(payload)
            vrp_result = vrp_solver.solve()
        
            # for loop in vrp_result then adjust arrival time and departure time from quarter hour unit to 24-hour format
            import copy

            routes = []
            for entry in vrp_result["routes"][0]:
                entry_copy = copy.deepcopy(entry)
                for key in ["arrival_time", "departure_time"]:
                    unit = entry_copy[key] % 96
                    entry_copy[key] = f"{(unit * 15) // 60:02d}:{(unit * 15) % 60:02d}"
                entry_copy["arrival_day"] = entry["arrival_time"] // 96 + 1
                entry_copy["departure_day"] = entry["departure_time"] // 96 + 1
                routes.append(entry_copy)

            
        response = "Here's your optimize traveling route!!!\n\n" + str(object=routes)
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
                mode="summarize_place"
            elif NEXT_STATE_NAME == "response route":
                response["route"] = lastest_step["result"]
                mode="summarize_route"
            yield response

        content = lastest_step["messages"][-1]["content"]
        yield from self.streaming_summarize_chatbot(msg, response, content, mode)
        
        yield {"state_name": "dogshit"}
    
    def streaming_summarize_chatbot(self, user_input, response, content, mode):
        response = dict()
        response["state_name"] = "summarize answer"
        
        chat_model = ChatOpenAI(
            api_key=self.api_key,
            streaming=True,
            model_name="gpt-3.5-turbo"
        )
        
        print(content)

        if mode == "summarize_route":
            # Use ChatPromptTemplate for the summarize_route mode
            from langchain.prompts.chat import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate

            system_message_template = """
            ## Travel Route Explanation Assistant (Phuket)

            You are an assistant specialized in clearly and engagingly explaining travel routes in Phuket using natural language.

            ### Instructions:
            Focus **only** on these fields from the provided input data:
            - **Node**: Location name
            - **Node Type**: Identify with "H" for hotel 🏨 and "A" for accommodation 🏄.
            - **Arrival Time**: Time in 24-hour format (e.g., 14:30)
            - **Departure Time**: Time in 24-hour format (e.g., 15:00)
            - **Arrival Day**: Day identifier (e.g., Day 1, Day 2)
            - **Departure Day**: Day identifier (e.g., Day 1, Day 2)

            Based on this data, provide a concise and engaging natural-language explanation of the travel route, using emojis for clarity and adhering strictly to these guidelines:

            - Clearly separate explanations by day using markdown headers (e.g., **Day 1**, **Day 2**).
            - On **Day 1**, begin your description with the **departure time** of the first location (assume the user starts from their hotel; thus, arrival time at the first node isn't needed).
            - Explicitly indicate when a stop **spans overnight** (arrival and departure occur on different days).
            - Clearly state when stops occur **entirely within the same day**.
            - On the **final day**, if the departure time is identical to the arrival time, treat it as the journey concluding at midnight.
            - Include appropriate emojis after location names: 🏨 for hotels ("H") and 🏄 for accommodations ("A").
            - Add P.S. at the end of the explanation: "P.S. All time not specified in the travel plan is free time."

            ---

            ### Example Input:

            ```json
            [
                {
                    "Node": "Central Station",
                    "Node Type": "A",
                    "Arrival Time": "09:00",
                    "Departure Time": "09:15",
                    "Arrival Day": "Day 1",
                    "Departure Day": "Day 1"
                },
                {
                    "Node": "Mountain Inn",
                    "Node Type": "H",
                    "Arrival Time": "23:45",
                    "Departure Time": "00:10",
                    "Arrival Day": "Day 1",
                    "Departure Day": "Day 2"
                },
                {
                    "Node": "Riverside Cafe",
                    "Node Type": "A",
                    "Arrival Time": "00:50",
                    "Departure Time": "00:50",
                    "Arrival Day": "Day 2",
                    "Departure Day": "Day 2"
                }
            ]
            ```

            ---

            ### Example Explanation:

            ### 📅 Day 1
            * Your journey starts with departure from **Central Station**🏄 at **09:15**.

            * Later, you'll arrive at **Mountain Inn**🏨 late at night (**23:45**) and stay overnight.

            ### 📅 Day 2
            * Shortly after midnight (**00:10**), you'll depart from **Mountain Inn**🏨.

            * Your journey concludes at **Riverside Cafe**🏄 at **00:50**, marking the end of your travels for the day (midnight).
            
            **P.S.** All time not specified in the travel plan is free time.
            
            **Note:** Do not wrap explanations in code blocks. and If context is "Sorry, unable to generate route via some restrictions" you have to response that currently user's place note is not meet the requirements for generate route.
            """
            # # Create the system message and human message templates
            # system_message = SystemMessagePromptTemplate.from_template(system_message_template)
            # human_message = HumanMessagePromptTemplate.from_template(template="{content}", additional_kwargs={"name": "content"})

            # # Build the chat prompt template with both messages
            # chat_prompt = ChatPromptTemplate.from_messages([system_message, human_message])
            
            # # Format the prompt using the input data stored in `content`
            # messages = chat_prompt.invoke({"content": content})

            messages = [
                    ("system", system_message_template),
                    ("human", f"My route is: {content}"),
                ]
            
        else:
            # For other modes, use the existing approach
            if mode == "summarize_place":
                system_prompt = """
                ### AI Assistant Prompt
                You are a highly intelligent, precise, and engaging AI assistant with exceptional skills in:

                - **Summarization:** Clearly simplifying complex information into concise, easy-to-understand insights.
                - **Accuracy:** Answering user queries with precision, reliability, and clarity.
                - **Creativity:** Generating compelling, informative, and customized content aligned closely to user intentions.
                When providing information about places:

                - Format your responses clearly using organized Markdown. 
                - Begin with the fixed main heading: ### Accommodation and Activity Recommendation
                - Use smaller headings (`####`) for each place name, starting each with one of the following emojis: 🦀, 🐯, or 🐸. 
                - Provide a concise, single-paragraph description for each place.
                - Strictly exclude all unnecessary details, including ratings, stars, review counts but do not remove any place name 
                
                **Note:** Do not wrap explanations in code blocks.
                """
            else:
                if content == "etc_other":
                    system_prompt = "You are a creative and insightful AI assistant specializing in addressing diverse user inquiries with clarity and precision."
                elif content == "etc_travel":
                    system_prompt = "You are an engaging and knowledgeable AI assistant with expertise in providing personalized travel recommendations, tips, and insights."

                content = user_input
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=str(content))
            ]

        # Stream the output from the chat model using the messages prepared above
        for chunk in chat_model.stream(messages):
            response["message"] = chunk.content 
            yield response
