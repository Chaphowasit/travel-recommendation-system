import copy
import random

def randomize_payload(payload):
    # Create a deep copy so that the original payload is not updated.
    new_payload = copy.deepcopy(payload)
    
    # Iterate over each activity in the payload.
    for activity in new_payload.get("activities", []):
        # If the activity is not advanced, skip processing.
        if activity.get("isAdvance", False):
            continue
        
        # We assume that the zones to randomize are in the "visit_range" field.
        original_zones = activity.get("visit_range", [])
        # If there are no zones, nothing to randomize.
        if not original_zones:
            continue

        # Shuffle the zones using random.sample which returns a new list in random order.
        zones = random.sample(original_zones, len(original_zones))
        
        # Apply random deletion with a 50% chance until at least one zone remains.
        while True:
            filtered_zones = [zone for zone in zones if random.random() < 0.5]
            if filtered_zones:
                activity["visit_range"] = filtered_zones
                break
            else:
                # If no zones remain, reinitialize and reshuffle the zones.
                zones = random.sample(original_zones, len(original_zones))
    
    return new_payload

def validate_route(route):
    """
    Validates that no consecutive nodes have node_type "H".
    
    :param route: List of route nodes.
    :return: Boolean - True if no consecutive 'H' nodes, False otherwise.
    """
    for i in range(len(route) - 1):
        if route[i].get("node_type") == "H" and route[i + 1].get("node_type") == "H":
            return False  # Found consecutive 'H' nodes, so it's invalid
    return True  # No consecutive 'H' nodes found

