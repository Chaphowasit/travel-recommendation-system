import weaviate
from weaviate.classes.init import Auth
from weaviate.classes.query import Rerank, MetadataQuery
from dotenv import load_dotenv
import os
from weaviate.classes.query import Filter

load_dotenv(override=True)
gpt_key = os.getenv("OPENAI_APIKEY")
cohere_key = os.getenv("COHERE_KEY")
url = os.getenv("WEAVIATE_HOST")

headers = {"X-OpenAI-Api-Key": gpt_key, "X-Cohere-Api-Key": cohere_key}


class Weaviate_Adapter:
    def __init__(self):
        self.client = None

    def connect(self):
        if self.client is None:
            self.client = weaviate.connect_to_local(host=url, headers=headers)
        else:
            print("Already connected to Weaviate.")

    def close(self):
        if self.client is not None:
            self.client.close()
            self.client = None
        else:
            print("Weaviate client is already closed.")

    def get_collections(self, collection_name: str):
        return self.client.collections.get(collection_name)

    def hybrid_query(self, collection, limit_num, prop_name, query):
        response = collection.query.hybrid(
            query=query,
            limit=limit_num,
            rerank=Rerank(prop=prop_name, query=query),
            return_metadata=MetadataQuery(score=True),
        )
        return response

    def remove_dup_and_get_id(
        self, collection_name, property_name, message, bridge_name, id_property
    ):
        """
        Helper function to fetch, process, and deduplicate recommendations.
        """
        collections = self.get_collections(collection_name)
        response = self.hybrid_query(collections, 10, "about_and_tags", message)
        print([obj.properties[property_name] for obj in response.objects])

        seen = set()
        response_json = [
            {
                **obj.properties,
                "score": obj.metadata.rerank_score,
            }
            for obj in response.objects
            if (
                obj.properties[property_name],
                obj.properties["latitude"],
                obj.properties["longitude"],
            )
            not in seen
            and not seen.add(
                (
                    obj.properties[property_name],
                    obj.properties["latitude"],
                    obj.properties["longitude"],
                )
            )
        ]

        bridge_collections = self.get_collections(bridge_name)
        for entry in response_json:
            bridge_response = bridge_collections.query.fetch_objects(
                filters=(
                    Filter.by_property(property_name).equal(entry.get(property_name))
                    # & Filter.by_property("longitude").equal(entry.get("longitude"))
                    # & Filter.by_property("latitude").equal(entry.get("latitude"))
                ),
                limit=1,
            )
            if bridge_response.objects:
                entry["id"] = bridge_response.objects[0].properties.get(id_property)

        return response_json
