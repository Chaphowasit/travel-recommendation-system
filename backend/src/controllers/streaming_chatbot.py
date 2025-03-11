# Standard library imports
import os
import uuid
from dotenv import load_dotenv
from typing import List, Dict, Annotated, Literal, Sequence

# Third-party imports
from langchain_openai import ChatOpenAI
from langchain_core.documents import Document
from langchain.schema import SystemMessage, HumanMessage
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Local imports
from controllers.ventical_n_day.vrp import VRPSolver
from controllers.interface import fetch_place_detail
from common.utils import read_txt_files
from langgraph.graph import MessagesState, StateGraph, END, START
from pydantic import BaseModel, Field


NEXT_STATE_NAME = ""

# Load environment variables
load_dotenv()

class State(MessagesState):
    payload: Dict
    messages: List[Dict]
    result: any

class UserIntent(BaseModel):
    """Determines intent of user query."""
    multi_classification: str = Field(description='Intent class "retrieve", "generate_route", "etc_travel", and "etc_other"')

class StreamingChatbot:
    def __init__(self, weaviate_adapter, mariadb_adaptor):
        self.api_key = os.getenv("OPENAI_APIKEY")
        self.llm = ChatOpenAI(api_key=self.api_key, model="gpt-4o", temperature=0, streaming=True, max_tokens=250)
        self.graph = self._build_graph()
        self.config = {"configurable": {"thread_id": str(uuid.uuid4())}}
        self.weaviate_adapter = weaviate_adapter
        self.mariadb_adaptor = mariadb_adaptor

    def _init_prompt_and_chain(self):
        parser = StrOutputParser()

        self.intent_classify_prompt = read_txt_files(
            "src/common/prompt/intent_classification.txt"
        )
        self.summarize_recommendation_prompt = read_txt_files(
            "src/common/prompt/summarize_place.txt"
        )

        self.etc_travel_answer_prompt = read_txt_files(
            "src/common/prompt/etc_travel_answer.txt"
        )

        self.etc_non_travel_answer_prompt = read_txt_files(
            "src/common/prompt/etc_non_travel_answer.txt"
        )

        # summarize only description
        summarize_description_prompt = read_txt_files(
            "src/common/prompt/summarize_description.txt"
        )
        self.summarize_description_prompt_template = PromptTemplate.from_template(
            summarize_description_prompt
        )

        # summarize only description
        ner_prompt = read_txt_files("src/common/prompt/ner.txt")
        ner_prompt_template = ChatPromptTemplate.from_messages(
            [("system", ner_prompt), ("user", "{text}")]
        )
        self.chain_ner = ner_prompt_template | self.llm | parser
    
    def summarize_description(self, des):
        result = self.summarize_description_prompt_template.format(des=des)
        response = self.model.invoke([HumanMessage(content=result)])
        return response.content
    
    def name_entity_recognition(self, text):
        result = self.chain_ner.invoke({"text": text})
        return result
    
    def classify_intent(self, state: State) -> Literal["retrieve", "generate_route", "etc_travel", "etc_other"]:
        """Classifies user intent and returns a dictionary with the intent category."""

        user_message = state["messages"][-1]["content"]
        prompt = self.intent_classify_prompt.format(user_message=user_message)
        
        
        llm_with_tool = self.llm.with_structured_output(UserIntent)
        chain = prompt | llm_with_tool
        classification_result = chain.invoke()

        intent = classification_result.multi_classification

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
        place_data = fetch_place_detail(query, self.weaviate_adapter, self.mariadb_adaptor, self.summarize_description, self.name_entity_recognition)
        retrieved_docs = [
            Document(
                page_content=item["description"],
                metadata={"id": item["id"], "name": item["name"], "category": category, "tag": item["tag"]}
            )
            for category, items in place_data.items() for item in items
        ]
        response = "\n".join([doc.page_content for doc in retrieved_docs])
        return {"state_name": "retrieve activities and places", "result": place_data, "messages": [{"role": "system", "content": response}]}

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
        
        yield {"state_name": "dogshit"}
    
    def streaming_summarize_chatbot(self, user_input, response, content, mode):
        response = dict()
        response["state_name"] = "summarize answer"
        
        chat_model = ChatOpenAI(
            api_key=self.api_key,
            streaming=True,
            model_name="gpt-3.5-turbo"
        )

        if mode == "summarize":
            system_prompt = self.summarize_recommendation_prompt.format(result=content, user_input=user_input)
        else:
            if content == "etc_other":
                system_prompt = self.etc_non_travel_answer_prompt
            elif content == "etc_travel":
                system_prompt = self.etc_travel_answer_prompt
            content = user_input

        for chunk in chat_model.stream(
            [
                SystemMessage(content=system_prompt),
                HumanMessage(content=str(content))
            ]
        ):
            response["message"] = chunk.content 
            yield response
