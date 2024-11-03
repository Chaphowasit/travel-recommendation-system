def arrange_respone(response):
    result = dict()
    for r in response.objects:
        place = r.properties
        place_name = place.get("activity_name", "Unknown Activity")
        about_and_tags = place.get("about_and_tags", "Description not available")
        reviews = place.get("reviews", [])
        # Extract score from rerank if available
        score = r.metadata.rerank_score

        if place_name in result:
            # append reviews
            result[place_name]["People also reviews"].append(
                reviews
            )
        else:
            result[place_name] = {
                "Description": about_and_tags,
                "People also reviews": (
                    reviews if reviews else ["No reviews available"]
                ),
                "Score": score,  # Add the score
            }
    return result