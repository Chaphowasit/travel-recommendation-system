import json
import os
import sys
from ortools.constraint_solver import routing_enums_pb2, pywrapcp

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from controllers.ventical_n_day.data_loader import DataLoader

class VRPSolver:
    def __init__(self, input_data):
        self.data_loader = DataLoader(input_data)
        self.data = self.create_data_model()
        self.manager = None
        self.routing = None
        self.solution = None

    def create_data_model(self):
        """Stores the data for the problem with multiple time windows per location."""
        data = {
            "days": self.data_loader.get_days(),
            "place_ids": [],
            "time_windows": [],
            "time_matrix": [],
            "time_services": [],
            "num_vehicles": 1,
            "depot": 0,
        }

        place_ids, duration_matrix = self.data_loader.get_duration_matrix()
        data["place_ids"] = place_ids
        data["time_windows"] = self.data_loader.get_active_times(place_ids)
        data["time_matrix"] = duration_matrix
        data["time_services"] = self.data_loader.get_durations(place_ids)
        
        print(data)
        
        return data

    def add_time_windows_constraints(self, time_dimension):
        """Adds constraints to handle multiple time windows per location, ensuring they are sorted."""
        for i, time_windows in enumerate(self.data["time_windows"]):
            sorted_time_windows = sorted(time_windows, key=lambda x: x[0])
            index = self.manager.NodeToIndex(i)

            for j, (start, end) in enumerate(sorted_time_windows):
                if j == 0:
                    time_dimension.CumulVar(index).SetRange(start, sorted_time_windows[-1][1])
                else:
                    previous_end = sorted_time_windows[j - 1][1]
                    time_dimension.CumulVar(index).RemoveInterval(previous_end, start)

    def compute_routes(self):
        """Computes routes with arrival, departure, waiting, and travel times."""
        time_dimension = self.routing.GetDimensionOrDie("Time")
        total_time, total_waiting_time, all_routes = 0, 0, []

        for vehicle_id in range(self.data["num_vehicles"]):
            index = self.routing.Start(vehicle_id)
            route, previous_departure_time = [], 0

            while not self.routing.IsEnd(index):
                node_index = self.manager.IndexToNode(index)
                node = self.data["place_ids"][node_index]
                arrival_time = self.solution.Value(time_dimension.CumulVar(index))
                service_time = self.data["time_services"][node_index]
                departure_time = arrival_time + service_time

                travel_time = (self.data["time_matrix"][route[-1]["index"]][node_index] 
                               if route else 0)
                waiting_time = max(0, arrival_time - (previous_departure_time + travel_time)) if route else 0
                previous_departure_time = departure_time

                node_info = {
                    "node": node,
                    "index": index,
                    "arrival_time": arrival_time,
                    "departure_time": departure_time,
                    "waiting_time": waiting_time,
                    "travel_time": travel_time,
                }
                route.append(node_info)
                index = self.solution.Value(self.routing.NextVar(index))

            # Final depot stop
            node_index = self.manager.IndexToNode(index)
            arrival_time = self.solution.Value(time_dimension.CumulVar(index))
            node = self.data["place_ids"][node_index]
            travel_time = (self.data["time_matrix"][route[-1]["index"]][node_index] if route else 0)
            waiting_time = max(0, arrival_time - (previous_departure_time + travel_time)) if route else 0

            node_info = {
                "node": node,
                "index": index,
                "arrival_time": arrival_time,
                "departure_time": arrival_time,
                "waiting_time": waiting_time,
                "travel_time": travel_time,
            }
            route.append(node_info)
            total_time += arrival_time
            total_waiting_time += sum([node["waiting_time"] for node in route])
            all_routes.append(route)
            
        return {"routes": all_routes, "total_time": total_time, "total_waiting_time": total_waiting_time}

    def print_routes(self, computed_routes):
        """Prints the computed routes in a human-readable format."""
        def format_time(quarters):
            minutes = quarters * 15
            days, remainder = divmod(minutes, 1440)
            hours, minutes = divmod(remainder, 60)
            return f"{days}d {hours}h {minutes}m" if days else f"{hours}h {minutes}m" if hours else f"{minutes}m"

        for vehicle_id, route in enumerate(computed_routes["routes"]):
            print(f"Route for vehicle {vehicle_id}:")
            for node in route:
                print(f"Node {node['node']} Arrival({format_time(node['arrival_time'])}) "
                      f"Departure({format_time(node['departure_time'])}) "
                      f"Wait({format_time(node['waiting_time'])}) Travel({format_time(node['travel_time'])})")

        print(f"Total route time: {format_time(computed_routes['total_time'])}")
        print(f"Total waiting time: {format_time(computed_routes['total_waiting_time'])}")

    def solve(self):
        """Solves the VRP using OR-Tools."""
        self.manager = pywrapcp.RoutingIndexManager(
            len(self.data["time_matrix"]), self.data["num_vehicles"], self.data["depot"]
        )
        self.routing = pywrapcp.RoutingModel(self.manager)

        def time_callback(from_index, to_index):
            from_node, to_node = self.manager.IndexToNode(from_index), self.manager.IndexToNode(to_index)
            travel_time = self.data["time_matrix"][from_node][to_node] + self.data["time_services"][from_node]
            print(f"Travel time from {from_node} to {to_node}: {travel_time}")
            return travel_time

        transit_callback_index = self.routing.RegisterTransitCallback(time_callback)
        self.routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

        self.routing.AddDimension(transit_callback_index, 96, 96 * self.data["days"], False, "Time")
        time_dimension = self.routing.GetDimensionOrDie("Time")
        self.add_time_windows_constraints(time_dimension)
        
        # Set mandatory and optional places
        for i in range(len(self.data["place_ids"])):
            index = self.manager.NodeToIndex(i)
            if i < self.data["days"]:
                self.routing.AddToAssignment(self.routing.NextVar(index))
            else:
                self.routing.AddDisjunction([index], 500)

        search_params = pywrapcp.DefaultRoutingSearchParameters()
        search_params.solution_limit = 3000  # Set solution limit
        search_params.time_limit.seconds = 60  # Set a time limit in seconds
        search_params.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.AUTOMATIC
        self.solution = self.routing.SolveWithParameters(search_params)

        if self.solution:
            computed_routes = self.compute_routes()
            with open("./result.json", "w") as json_file:
                json.dump(computed_routes, json_file, indent=4)
            self.print_routes(computed_routes)
            return computed_routes
        else:
            print("No solution found!")
            # Add debugging information:
            print(f"Routing status: {self.routing.status()}")


# {
#     'days': 2, 
#     'place_ids': ['H0303', 'H0303', 'A0736', 'A2291', 'A0265', 'A2103', 'A0130', 'A0247', 'A0243', 'A0206', 'A0597', 'A0234', 'A0319', 'A0381'], 
#     'time_windows': [
#         [(0, 33), (160, 192)], 
#         [(61, 80)], 
#         [(40, 45), (63, 65), (136, 136), (158, 161)], 
#         [(0, 16), (45, 105), (134, 150), (180, 180)], 
#         [(32, 32), (128, 128)], 
#         [(0, 54), (80, 116), (153, 176)], 
#         [(0, 0), (53, 123), (160, 168)], 
#         [(40, 40), (53, 60), (128, 144), (154, 156)], 
#         [(28, 69), (146, 146)], 
#         [(0, 24), (64, 96), (138, 165)], 
#         [(36, 36), (132, 133)], 
#         [(0, 0), (64, 116), (161, 170)], 
#         [(38, 45), (53, 53), (61, 67), (134, 146), (154, 163)], 
#         [(36, 62), (132, 158)], 
#     ]
#     'time_matrix': [
#         [0, 0, 1, 1, 13, 1, 2, 8, 6, 1, 3, 4, 6, 3], 
#         [0, 0, 1, 1, 13, 1, 2, 8, 6, 1, 3, 4, 6, 3], 
#         [1, 1, 0, 1, 13, 1, 2, 8, 6, 1, 3, 5, 6, 4], 
#         [1, 1, 1, 0, 13, 1, 2, 8, 6, 1, 3, 5, 6, 4], 
#         [11, 11, 12, 12, 0, 11, 12, 11, 8, 12, 10, 9, 7, 9], 
#         [1, 1, 1, 1, 13, 0, 2, 8, 6, 2, 3, 4, 6, 3], 
#         [2, 2, 1, 2, 13, 2, 0, 8, 6, 2, 3, 5, 6, 4], 
#         [8, 8, 8, 8, 13, 8, 8, 0, 6, 9, 6, 6, 6, 5], 
#         [5, 5, 6, 6, 9, 5, 6, 6, 0, 6, 4, 3, 2, 3], 
#         [1, 1, 1, 1, 14, 2, 2, 8, 7, 0, 4, 5, 6, 4], 
#         [3, 3, 3, 4, 11, 3, 4, 6, 4, 4, 0, 3, 4, 2], 
#         [4, 4, 4, 5, 10, 4, 5, 5, 2, 5, 3, 0, 3, 2], 
#         [5, 5, 6, 6, 8, 5, 6, 5, 2, 6, 4, 3, 0, 3], 
#         [3, 3, 4, 4, 11, 3, 4, 6, 4, 4, 2, 2, 4, 0]
#     ], 
#     'time_services': [0, 40, 11, 12, 36, 16, 24, 8, 15, 27, 20, 22, 7, 14], 
#     'num_vehicles': 1, 
#     'depot': 0
# }