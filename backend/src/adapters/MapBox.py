import os
from typing import List, Literal, Tuple

import requests
from dotenv import load_dotenv

load_dotenv()

class MapBox:
    def __init__(self):
        self.MAPBOX_ACCESS_TOKEN = os.getenv("MAPBOX_API_KEY")
        pass
    
    def fetch_matrix_api(self, 
        profile: Literal["mapbox/driving", "mapbox/walking", "mapbox/cycling", "mapbox/driving-traffic"], 
        annotations: Literal["duration", "distance", "duration,distance"],
        approache: Literal["unrestricted", "curb"],
        default_speed: int,
        coords: List[Tuple[float, float]],
        sources: List[int],
        destinations: List[int],
    ):
        assert len(coords) >= len(sources), "Number of coordinates must be greater than or equal to the number of sources."
        assert len(coords) >= len(destinations), "Number of coordinates must be greater than or equal to the number of destinations."
        assert all(0 <= source < len(coords) for source in sources), "All source indices must be within the range of coordinates."
        assert all(0 <= destination < len(coords) for destination in destinations), "All destination indices must be within the range of coordinates."
        
        MAPBOX_MATRIX_URL = f"https://api.mapbox.com/directions-matrix/v1"
        
        coords_str = ";".join([f"{coord[0]},{coord[1]}" for coord in coords])
        sources_str = ";".join(str(source) for source in sources)
        destinations_str = ";".join(str(destination) for destination in destinations)
        approaches = ";".join([approache] * len(coords))
        
        request_url = f"{MAPBOX_MATRIX_URL}/{profile}/{coords_str}"
        
        params = {
            "access_token": self.MAPBOX_ACCESS_TOKEN,
            "annotations": annotations,
            "sources": sources_str,
            "destinations": destinations_str,
            "approaches": approaches,  # One for each coordinate
            "fallback_speed": default_speed,
        }
        
        response = requests.get(request_url, params=params)

        data = response.json()
        durations = data.get("durations")

        return durations
