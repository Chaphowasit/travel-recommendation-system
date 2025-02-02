import logging
from langchain_core.messages import HumanMessage
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from common.utils import read_txt_files
import os


class Chatbot:
    def __init__(self):
        # Setup logging
        self.logger = logging.getLogger("Chatbot")
        self.logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)

        self.logger.info("Initializing Chatbot")

        # Load environment variables
        load_dotenv()
        openai_api_key = os.getenv("OPENAI_APIKEY")
        if not openai_api_key:
            self.logger.error("OPENAI_APIKEY not found in environment variables")
            raise ValueError("OPENAI_APIKEY environment variable is required")
        self.model = ChatOpenAI(openai_api_key=openai_api_key, model_name="gpt-4o-mini")
        self.parser = StrOutputParser()

        self.logger.info("Setting up prompts and chains")

        # answer etc
        etc_answer_prompt = read_txt_files("src\\common\\prompt\\etc_answer.txt")
        self.logger.debug(f"Etc. Answer Prompt: {etc_answer_prompt}")
        self.etc_answer_prompt_template = ChatPromptTemplate.from_messages(
            [("system", etc_answer_prompt), ("user", "{text}")]
        )
        self.chain_answer_etc = (
            self.etc_answer_prompt_template | self.model | self.parser
        )

        # intent classify
        intent_classify_prompt = read_txt_files(
            "src\\common\\prompt\\intent_classify.txt"
        )
        self.logger.debug(f"Intent Classify Prompt: {intent_classify_prompt}")
        self.intent_classify_prompt_template = ChatPromptTemplate.from_messages(
            [("system", intent_classify_prompt), ("user", "{text}")]
        )
        self.chain_classify_intent = (
            self.intent_classify_prompt_template | self.model | self.parser
        )

        # intent place type
        place_type_classify_prompt = read_txt_files(
            "src\\common\\prompt\\place_type_classify.txt"
        )
        self.logger.debug(f"Place Type Classify Prompt: {place_type_classify_prompt}")
        self.place_type_classify_prompt_template = ChatPromptTemplate.from_messages(
            [("system", place_type_classify_prompt), ("user", "{text}")]
        )
        self.chain_classify_place_type = (
            self.place_type_classify_prompt_template | self.model | self.parser
        )

        # summarize
        summarize_prompt = read_txt_files("src\\common\\prompt\\summarize.txt")
        self.logger.debug(f"Summarize Prompt: {summarize_prompt}")
        self.summarize_prompt_template = PromptTemplate.from_template(summarize_prompt)

        # summarize only description
        summarize_description_prompt = read_txt_files(
            "src\\common\\prompt\\summarize_description.txt"
        )
        self.logger.debug(
            f"Summarize Description Prompt: {summarize_description_prompt}"
        )
        self.summarize_description_prompt_template = PromptTemplate.from_template(
            summarize_description_prompt
        )

        # Name Entity Recognition
        ner_prompt = read_txt_files("src\\common\\prompt\\ner.txt")
        self.logger.debug(f"NER Prompt: {ner_prompt}")
        self.ner_prompt_template = ChatPromptTemplate.from_messages(
            [("system", ner_prompt), ("user", "{text}")]
        )
        self.chain_ner = self.ner_prompt_template | self.model | self.parser

        self.logger.info("Chatbot initialized successfully")

    def classify_intent(self, text):
        self.logger.debug(f"Classifying intent for text: {text}")
        result = self.chain_classify_intent.invoke({"text": text})
        self.logger.debug(f"Intent classification result: {result}")
        return result

    def classify_place_type(self, text):
        self.logger.debug(f"Classifying place type for text: {text}")
        result = self.chain_classify_place_type.invoke({"text": text})
        self.logger.debug(f"Place type classification result: {result}")
        return result

    def answer_etc(self, text):
        self.logger.debug(f"Generating 'etc' answer for text: {text}")
        result = self.chain_answer_etc.invoke({"text": text})
        self.logger.debug(f"'Etc' answer result: {result}")
        return result

    def recommend_place(self, result, text):
        self.logger.debug(
            f"Generating recommendation for result: {result} and user input: {text}"
        )
        full_text = self.summarize_prompt_template.format(
            result=result, user_input=text
        )
        response = self.model.invoke([HumanMessage(content=full_text)])
        self.logger.debug(f"Recommendation response: {response}")
        return response

    def idk(self, text):
        self.logger.info(f"Handling user input: {text}")
        intent_result = self.classify_intent(text)
        self.logger.info(f"Intent classification result: {intent_result}")
        if "Recommended" in intent_result:
            self.logger.info("Detected intent for recommendation")
            return self.recommend_place(text)
        else:
            self.logger.info("Detected intent for 'etc' answer")
            return self.answer_etc(text)

    def summarize_description(self, des):
        self.logger.debug(f"Summarizing description for description: {des}")
        result = self.summarize_description_prompt_template.format(des=des)
        response = self.model.invoke([HumanMessage(content=result)])
        self.logger.debug(f"Summarized description response: {response}")
        return response.content

    def name_entity_recognition(self, text):
        self.logger.debug(f"Performing NER for text: {text}")
        result = self.chain_ner.invoke({"text": text})
        self.logger.debug(f"NER result: {result}")
        return result
