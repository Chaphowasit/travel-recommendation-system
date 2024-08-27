# controllers/vrp_controller.py
import json
import random
from typing import Dict, List, Set
from flask import request, jsonify
from ortools.constraint_solver import pywrapcp, routing_enums_pb2
import requests

from models.Activity_Detail import ActivityDetail_Engine
from models.FoodAndDrink_Detail import FoodAndDrinkDetail, FoodAndDrinkDetail_Engine  # Assuming you have a model for handling place data

class VrpController:

    @staticmethod
    def process_vrp(desired_places, intervals):
        
        # Hotel Record from Database
        hotelDetail_engine = FoodAndDrinkDetail_Engine()
        
        hotelDetail_record = hotelDetail_engine.query_by_id(
            record_id=0,
            columns=["id", "latitude", "longitude"]
        )
        
        # Restaurant Record from Database
        foodAndDrinkDetail_engine = FoodAndDrinkDetail_Engine()
        
        foodAndDrinkDetail_records = foodAndDrinkDetail_engine.bulk_query_by_ids(
            record_ids=list(set(desired_places["breakfast"] + desired_places["lunch"] + desired_places["dinner"])),
            columns=["id", "start_time", "end_time", "latitude", "longitude"]
        )
        foodAndDrinkDetail_records = {record.id: record for record in foodAndDrinkDetail_records}
        
        # activity Place Record from Database
        activityDetail_engine = ActivityDetail_Engine()
        
        activityDetail_records = activityDetail_engine.bulk_query_by_ids(
            record_ids=list(set(desired_places["travel1"] + desired_places["travel2"])),
            columns=["id", "start_time", "end_time", "latitude", "longitude"]
        )
        activityDetail_records = {record.id: record for record in activityDetail_records}

        # Step 1: Retrieve open and close times from the database
        time_windows = VrpController.calculate_time_windows(desired_places, intervals, foodAndDrinkDetail_records, activityDetail_records)

        # Step 2: Send API request to Google Maps API to get distance matrix
        distance_matrix, indexs_maps = VrpController.get_distance_matrix(hotelDetail_record, foodAndDrinkDetail_records, activityDetail_records)

        # # Step 3: Setup data for VRP
        # data = VrpController.create_data_model(desired_places, time_windows, distance_matrix)

        # # Step 4: Process VRP using OR-Tools
        # solution = VrpController.solve_vrp(data)

        # # Step 5: Return result
        # return jsonify(solution)

    @staticmethod
    def calculate_time_windows(
        desired_places: Dict[str, List[str]], 
        intervals: Dict[str, Dict[str, float]], 
        foodAndDrinkDetail_records: Dict[int, FoodAndDrinkDetail], 
        activityDetail_records: Dict[int, FoodAndDrinkDetail]
    ) -> (Dict[str, Dict[str, float]]):
        time_windows: Dict[str, Dict[str, float]] = {}

        # Consolidated keys for food and drink, and travel
        food_keys = {"breakfast", "lunch", "dinner"}
        travel_keys = {"travel1", "travel2"}
        
        for key, place_ids in desired_places.items():
            is_food = key in food_keys
            is_travel = key in travel_keys
            
            if is_food or is_travel:
                records = foodAndDrinkDetail_records if is_food else activityDetail_records
                
                for place_id in place_ids:
                    result = records[place_id]

                    # Ensure start_time and end_time are valid, or default as needed
                    business_hour = {
                        "start": result.start_time if result.start_time is not None else 0,
                        "end": result.end_time if result.end_time is not None else 24
                    }
                    
                    # Determine the appropriate interval
                    interval = intervals[key]
                    if is_travel:
                        if "lunch" not in intervals and place_id in desired_places.get("travel1", []) and place_id in desired_places.get("travel2", []):
                            interval = {"start": intervals["travel1"]["start"], "end": intervals["travel2"]["end"]}
                    
                    # Calculate the intersection with the provided intervals
                    time_window = VrpController._intersect(business_hour, interval)
                    
                    if not time_window:
                        continue  # Skip if there is no intersection

                    # Randomly choose between the existing and the new time window in case of a tie
                    if result.id in time_windows:
                        time_windows[result.id] = (
                            time_windows[result.id] if random.choice([True, False]) else time_window
                        )
                    else:
                        time_windows[result.id] = time_window
                        
        return time_windows
    
    @staticmethod
    def _intersect(interval1, interval2):
        # Check if the intervals do not overlap
        if interval1["end"] < interval2["start"] or interval2["end"] < interval1["start"]:
            return None
        
        # If they overlap, find the intersection
        return {
            "start": max(interval1["start"], interval2["start"]),
            "end": min(interval1["end"], interval2["end"])
        }


    @staticmethod
    def get_distance_matrix(place_ids):
        # Call Google Maps API to get distance matrix (or use your own service)
        # Assuming API key is set in your environment
        
        raise NotImplementedError()

    @staticmethod
    def create_data_model(place_ids, time_windows, distance_matrix):
        data = {}
        data['time_matrix'] = distance_matrix
        data['time_windows'] = time_windows
        data['num_vehicles'] = 1
        data['depot'] = 0
        return data

    @staticmethod
    def solve_vrp(data):
        # Create the routing index manager
        manager = pywrapcp.RoutingIndexManager(len(data['time_matrix']),
                                               data['num_vehicles'], data['depot'])

        # Create Routing Model
        routing = pywrapcp.RoutingModel(manager)

        # Create and register a transit callback
        def time_callback(from_index, to_index):
            """Returns the travel time between the two nodes."""
            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)
            return data['time_matrix'][from_node][to_node]

        transit_callback_index = routing.RegisterTransitCallback(time_callback)

        # Define cost of each arc
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        # Add Time Windows constraint
        def time_window_callback(from_index):
            return data['time_windows'][from_index]

        routing.AddDimensionWithVehicleCapacity(
            transit_callback_index,
            0,  # no slack
            30,  # vehicle maximum travel time
            False,  # Don't force start cumul to zero.
            'Time'
        )
        time_dimension = routing.GetDimensionOrDie('Time')
        for location_idx in range(1, len(data['time_windows'])):
            time_dimension.CumulVar(location_idx).SetRange(
                data['time_windows'][location_idx][0],
                data['time_windows'][location_idx][1]
            )

        # Set up the search parameters
        search_parameters = pywrapcp.DefaultRoutingSearchParameters()
        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

        # Solve the problem
        solution = routing.SolveWithParameters(search_parameters)

        if solution:
            return VrpController.get_solution(manager, routing, solution)
        else:
            return "No solution found."

    @staticmethod
    def get_solution(manager, routing, solution):
        """Prints solution on console."""
        index = routing.Start(0)
        plan_output = 'Route:\n'
        while not routing.IsEnd(index):
            plan_output += ' {} ->'.format(manager.IndexToNode(index))
            index = solution.Value(routing.NextVar(index))
        plan_output += ' {}\n'.format(manager.IndexToNode(index))
        return plan_output

