from adapters.Weaviate import Weaviate_Adapter
from adapters.MariaDB import MariaDB_Adaptor
from common.mariadb_schema import Accommodation, Activity
from controllers.chatbot import Chatbot
from common.utils import rename_field
import json
chatbot = Chatbot()


def fetch_place_detail(
    message: str, weaviate_adapter: Weaviate_Adapter, mariadb_adaptor: MariaDB_Adaptor
):
    weaviate_adapter.connect()
    
    # Fetch and process activity recommendations
    activity_response_json = weaviate_adapter.remove_dup_and_get_id(
        collection_name="Activity_Embedded",
        property_name="name",
        message=message,
        bridge_name="Activity_Bridge",
        id_property="activity_id",
    )

    # Fetch and process accommodation recommendations
    accommodation_response_json = weaviate_adapter.remove_dup_and_get_id(
        collection_name="Accommodation_Embedded",
        property_name="name",
        message=message,
        bridge_name="Accommodation_Bridge",
        id_property="accommodation_id",
    )

    weaviate_adapter.close()

    # Step 1: Sort the JSON responses by score
    activity_response_json.sort(key=lambda x: x.get("score", 0), reverse=True)
    accommodation_response_json.sort(key=lambda x: x.get("score", 0), reverse=True)

    # Step 2: Fetch related activities and accommodations
    activities = mariadb_adaptor.fetch_activities(
        [item.get("id") for item in activity_response_json]
    )
    accommodations = mariadb_adaptor.fetch_accommodations(
        [item.get("id") for item in accommodation_response_json]
    )

    # Step 3: Map scores to the fetched data
    activity_score_map = {
        item.get("id"): item.get("score", 0) for item in activity_response_json
    }
    accommodation_score_map = {
        item.get("id"): item.get("score", 0) for item in accommodation_response_json
    }

    # Step 4: Rename fields and include scores for sorting
    activities = [
        {**rename_field(key, value), "score": activity_score_map.get(key)}
        for key, value in activities.items()
    ]
    accommodations = [
        {**rename_field(key, value), "score": accommodation_score_map.get(key)}
        for key, value in accommodations.items()
    ]

    # Step 5: Final sorting by score (to ensure correct order)
    activities.sort(key=lambda x: x["score"], reverse=True)
    accommodations.sort(key=lambda x: x["score"], reverse=True)

    # Step 6: Return results without the score in the final output
    for activity in activities:
        activity.pop("score")
    for accommodation in accommodations:
        accommodation.pop("score")

    for place in activities:
        if place.get("description") == None:
            place["description"] = summarize_description(place.get("tag"))
            place["tag"] = NER(place.get("tag"))

            mariadb_adaptor.update_value_by_place_id(
                Activity,
                place["id"],
                {"description": place["description"], "about_and_tags": place["tag"]},
            )

    for place in accommodations:
        if place.get("description") == None:
            place["description"] = summarize_description(place.get("tag"))
            place["tag"] = NER(place.get("tag"))

            mariadb_adaptor.update_value_by_place_id(
                Accommodation,
                place["id"],
                {"description": place["description"], "about_and_tags": place["tag"]},
            )

    output_data = {
        "activities": activities,
        "accommodations": accommodations
    }

    with open("place_details.json", "w", encoding="utf-8") as file:
        json.dump(output_data, file, ensure_ascii=False, indent=4)

    return activities, accommodations, output_data


# Summarize descriptions in the response
def summarize_description(value):
    return chatbot.summarize_description(value)


# Named Entity Recognition (NER) for tagging
def NER(value):
    return chatbot.name_entity_recognition(text=value)
