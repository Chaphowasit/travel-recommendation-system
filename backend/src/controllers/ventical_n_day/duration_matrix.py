# duration_matrix.py
import logging
import math
from adapters.MariaDB import MariaDB_Adaptor
from adapters.MapBox import MapBox
from typing import List, Tuple
from itertools import product

from common.utils import transform_sec_to_int

class DurationMatrix:
    MAPBOX_ADAPTOR = MapBox()
    
    def __init__(self, adaptor: MariaDB_Adaptor, locations, order):
        self.adaptor = adaptor
        
        self.locations = locations
        self.order = order
    
    def _create_matrix(self, rows: int, cols: int, default: float = 0.0) -> (List[List[float]]):
        """
        Creates a 2D matrix initialized with a default value.

        :param rows: Number of rows.
        :param cols: Number of columns.
        :param default: Default value for each cell.
        :return: 2D list representing the matrix.
        """
        return [[default for _ in range(cols)] for _ in range(rows)]
    
    def _generate_pairs(self, place_ids: List[str]) -> (List[Tuple[str, str]]):
        """
        Generates all possible source-destination pairs, excluding self-pairs.

        :param place_ids: List of place_ids.
        :return: List of (source_id, destination_id) tuples.
        """
        return [
            (source, destination)
            for source, destination in product(place_ids, repeat=2)
            if source != destination
        ]
        
    def _populate_known_durations(self, matrix, pairs, keys: List):
        for source, destination, duration in pairs:
            matrix[keys.index(source)][keys.index(destination)] = duration
            
        for key_idx in range(len(keys)):
            matrix[key_idx][key_idx] = 0
            
        return matrix
    
    def _identify_missing_pairs(self, matrix, keys):
        pairs = []
        
        for row in range(len(matrix)):
            for col in range(len(matrix)):
                if matrix[row][col] == -1:
                    pairs.append((keys[row], keys[col]))
                    
        return pairs
                 
    def _get_col_idx(self, matrix, index):
        return [row[index] for row in matrix]   
    
    def _fetch_duration_matrix_api(self, pairs):
        
        # list of sources and destinations
        sources = sorted(set(self._get_col_idx(pairs, 0)))
        destinations = sorted(set(self._get_col_idx(pairs, 1)))
        
        places = sorted(set(sources + destinations))
        
        # fetch coordinates
        coords = [self.locations[place] for place in places]
        
        source_indices = [places.index(source) for source in sources]
        destination_indices = [places.index(destination) for destination in destinations]
        
        return places, source_indices, destination_indices, DurationMatrix.MAPBOX_ADAPTOR.fetch_matrix_api(
            "mapbox/driving", 
            "duration", 
            "curb", 
            45, 
            coords, 
            source_indices, 
            destination_indices)
        
    def _get_duration_pairs(self, places_order, source_indices, destination_indices, duration_matrix):
        result = []
        
        for i, row in enumerate(duration_matrix):
            for j, col in enumerate(row):
                source_index = source_indices[i]
                destination_index = destination_indices[j]
                result.append((places_order[source_index], places_order[destination_index], col))
                
        return result
       
    def _reorder_matrix(self, matrix, matrix_keys: List):
        matrix_size = len(self.order)
        
        new_matrix = self._create_matrix(matrix_size, matrix_size, 0)
        
        matrix_indices = { key: index for index, key in enumerate(matrix_keys) }
        new_matrix_indices = { index: key for index, key in enumerate(self.order) }
            
        for i in range(matrix_size):
            for j in range(matrix_size):
                source = new_matrix_indices[i]
                destination = new_matrix_indices[j]
                source_index = matrix_indices[source]
                destination_index = matrix_indices[destination]
                
                new_matrix[i][j] = matrix[source_index][destination_index]
                
        return new_matrix
        
        
    def get_duration_matrix(self):
        logging.info("Starting duration matrix generation.")
        
        count_locs = len(self.locations)
        if count_locs == 0:
            logging.warning("No locations provided. Returning an empty matrix.")
            return []

        logging.info(f"Number of locations: {count_locs}")
        
        negative_matrix = self._create_matrix(count_locs, count_locs, -1)
        logging.debug("Initialized negative matrix with -1.")

        all_pairs = self._generate_pairs(self.order)
        logging.debug(f"Generated all pairs: {all_pairs}")

        existed_pairs = self.adaptor.fetch_durations(all_pairs)
        logging.info(f"Fetched {len(existed_pairs)} existing duration pairs from the database.")

        filled_matrix = self._populate_known_durations(negative_matrix, existed_pairs, list(self.locations.keys()))
        logging.debug("Populated known durations into the matrix.")

        missing_pairs = self._identify_missing_pairs(filled_matrix, list(self.locations.keys()))
        logging.info(f"Identified {len(missing_pairs)} missing duration pairs.")

        if missing_pairs:
            logging.info("Fetching missing durations from the external API.")
            
            places_order, source_indices, destination_indices, duration_matrix = self._fetch_duration_matrix_api(missing_pairs)
            logging.info("Successfully fetched missing durations from the external API.")

            pairs = self._get_duration_pairs(places_order, source_indices, destination_indices, duration_matrix)
            logging.info(f"Fetched and organized {len(pairs)} duration pairs from the API.")
                
            self.adaptor.upsert_durations(pairs)
            logging.info("Inserted/Updated duration pairs into the database.")
            
            pairs = [(e[0], e[1], transform_sec_to_int(e[2])) for e in pairs]
            
            filled_matrix = self._populate_known_durations(filled_matrix, pairs, list(self.locations.keys()))
            logging.debug("Updated the matrix with the newly fetched durations.")

        final_matrix = self._reorder_matrix(filled_matrix, list(self.locations.keys()))
        logging.info("Successfully reordered the duration matrix.")

        return final_matrix
    
