import logging

# Initialize the logger
logger = logging.getLogger("ResponseArranger")
logger.setLevel(logging.DEBUG)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)

def arrange_respone(response, type):
    logger.info("Starting to arrange response")
    result = dict()
    
    a = type + "_name"

    try:
        for r in response.objects:
            place = r.properties
            place_name = place.get(a, "Unknown Activity")
            about_and_tags = place.get("about_and_tags", "Description not available")
            reviews = place.get("reviews", [])
            score = r.metadata.rerank_score  # Extract score from rerank if available

            logger.debug(f"Processing place: {place_name}")
            logger.debug(f"Description: {about_and_tags}, Score: {score}")

            if place_name in result:
                logger.debug(f"Appending reviews for existing place: {place_name}")
                # Append reviews if the place already exists in the result
                result[place_name]["People also reviews"].append(reviews)
            else:
                logger.debug(f"Adding new place: {place_name}")
                result[place_name] = {
                    "Description": about_and_tags,
                    "People also reviews": (
                        reviews if reviews else ["No reviews available"]
                    ),
                    "Score": score,  # Add the score
                }
        
        logger.info("Response arranged successfully")
    except Exception as e:
        logger.error(f"An error occurred while arranging response: {e}", exc_info=True)
        raise

    logger.debug(f"Arranged response: {result}")
    return result
