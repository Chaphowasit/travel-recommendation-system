import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.query import Rerank, MetadataQuery
from dotenv import load_dotenv
import os

class Weaviate_Adapter:
    def __init__(self):
        load_dotenv()
        gpt_key = os.getenv("OPENAI_APIKEY")
        cohere_key = os.getenv("COHERE_KEY")
        url = os.getenv("WEAVIATE_URL")
        api_key = os.getenv("WEAVIATE_API_KEY")

        headers = {"X-OpenAI-Api-Key": gpt_key, "X-Cohere-Api-Key": cohere_key}
        self.client = weaviate.connect_to_weaviate_cloud(
            cluster_url=url,
            auth_credentials=Auth.api_key(api_key),
            headers=headers,
            )
        
    def get_collections(self, collection_name:str):
        return self.client.collections.get(collection_name)
    
    def hybrid_query(self, collection, limit_num, prop_name, query):
        response = collection.query.hybrid(
            query=query,
            limit=limit_num,
            rerank=Rerank(prop=prop_name, query=query),
            return_metadata=MetadataQuery(score=True),
        )
        return response