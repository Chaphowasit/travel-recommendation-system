from adapters.Weaviate import Weaviate_Adapter
from adapters.MariaDB import MariaDB_Adaptor
from common.utils import rename_field


def fetch_place_detail(
    message: str, weaviate_adapter: Weaviate_Adapter, mariadb_adaptor: MariaDB_Adaptor
):
    # Fetch and process activity recommendations
    activity_response_json = weaviate_adapter.remove_dup_and_get_id(
        "Activity_Embedded", "name", message, "Activity_Bridge", "activity_id"
    )

    # Fetch and process accommodation recommendations
    accommodation_response_json = weaviate_adapter.remove_dup_and_get_id(
        "Accommodation_Embedded",
        "name",
        message,
        "Accommodation_Bridge",
        "accommodation_id",
    )

    # Fetch business hours for activities
    activity_response_json = mariadb_adaptor.get_place_detail(activity_response_json)

    activity_response_json = [rename_field(item) for item in activity_response_json]

    # Fetch business hours for accommodations
    accommodation_response_json = mariadb_adaptor.get_place_detail(
        accommodation_response_json
    )

    accommodation_response_json = [
        rename_field(item) for item in accommodation_response_json
    ]

    # Sort results by score
    activity_response_json.sort(key=lambda x: x.get("score", 0), reverse=True)
    accommodation_response_json.sort(key=lambda x: x.get("score", 0), reverse=True)

    # Determine response based on place type
    # results = {
    #     "activities": activity_response_json,
    #     "accommodations": accommodation_response_json,
    # }

    return activity_response_json, accommodation_response_json
