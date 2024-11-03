from langchain_core.messages import HumanMessage
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from common.utils import read_txt_files
import os

class Chatbot:
    def __init__(self):
        load_dotenv()
        self.model = ChatOpenAI(openai_api_key=os.getenv("OPENAI_APIKEY"), model_name="gpt-4o-mini")
        self.parser = StrOutputParser()

        # answer etc
        etc_answer_prompt = read_txt_files("common\\prompt\\etc_answer.txt")
        self.etc_answer_prompt_template = ChatPromptTemplate.from_messages(
            [("system", etc_answer_prompt), ("user", "{text}")]
        )

        self.chain_answer_etc = self.etc_answer_prompt_template | self.model | self.parser

        # intent classify
        intent_classify_prompt = read_txt_files("common\\prompt\\intent_classify.txt")
        self.intent_classify_prompt_template = ChatPromptTemplate.from_messages(
            [("system", intent_classify_prompt), ("user", "{text}")]
        )

        self.chain_classify_intent = self.intent_classify_prompt_template | self.model | self.parser

        # intent place type
        place_type_classify_prompt = read_txt_files("common\\prompt\\place_type_classify.txt")
        self.place_type_classify_prompt_template = ChatPromptTemplate.from_messages(
            [("system", place_type_classify_prompt), ("user", "{text}")]
        )

        self.chain_classify_place_type = self.place_type_classify_prompt_template | self.model | self.parser

        # summarize
        summarize_prompt = read_txt_files("common\\prompt\\summarize.txt")
        self.summarize_prompt_template = PromptTemplate.from_template(
            summarize_prompt
        )

    def classify_intent(self, text):
        return self.chain_classify_intent.invoke({"text": text})
    
    def classify_place_type(self, text):
        return self.chain_classify_place_type.invoke({"text": text})

    def answer_etc(self, text):
        return self.chain_answer_etc.invoke({"text": text})
    
    def recommend_place(self, result, text):
        full_text = self.summarize_prompt_template.format(result=result, user_input=text)
        return self.model.invoke([HumanMessage(content=full_text)])

    def idk(self, text):
        intent_result = self.classify_intent(text)
        print(f"intent_result: {intent_result}")
        if "Recommended" in intent_result:
            return self.recommend_place(text)
        else:
            return self.answer_etc(text)
        