import json
import os
import matplotlib.pyplot as plt
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import sys

sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from data_loader import load_data


def create_data_model(input):
    """Stores the data for the problem with multiple time windows per location."""
    data = {}

    days, place_ids, matrix, available_times, durations = load_data(input)

    data["days"] = days
    data["place_ids"] = place_ids
    data["time_windows"] = (
        available_times  # Expecting `visit_hours` to provide the list of time windows per location
    )
    data["time_matrix"] = matrix  # Add time matrix data as needed
    data["time_services"] = durations  # Define service times for each node if necessary
    data["num_vehicles"] = 1
    data["depot"] = 0
    return data


def add_multiple_time_windows_constraints(routing, manager, data, time_dimension):
    """Adds constraints to handle multiple time windows per location, ensuring the time windows are sorted."""
    for i, time_windows in enumerate(data["time_windows"]):
        # Sort time windows by the start time to ensure correct ordering
        sorted_time_windows = sorted(time_windows, key=lambda x: x[0])

        index = manager.NodeToIndex(i)

        # Initialize time variable constraints for each time window at this location
        for i, (start, end) in enumerate(sorted_time_windows):
            if i == 0:
                # Set the range for the first window
                time_dimension.CumulVar(index).SetRange(start, end)
            else:
                # For subsequent time windows, remove intervals between previous end and new start
                previous_end = sorted_time_windows[i - 1][1]
                time_dimension.CumulVar(index).RemoveInterval(previous_end, start)


def compute_routes(data, manager, routing, solution):
    """Computes routes with arrival, departure, waiting times, and travel times for visualization."""
    time_dimension = routing.GetDimensionOrDie("Time")
    total_time = 0
    total_waiting_time = 0
    all_routes = []

    for vehicle_id in range(data["num_vehicles"]):
        index = routing.Start(vehicle_id)
        route = []
        previous_departure_time = 0

        while not routing.IsEnd(index):
            time_var = time_dimension.CumulVar(index)
            node_index = manager.IndexToNode(index)
            node = data["place_ids"][node_index]
            arrival_time = solution.Value(time_var)
            service_time = data["time_services"][node_index]
            departure_time = arrival_time + service_time

            # Calculate travel time
            if route:
                previous_node_index = route[-1]["index"]
                travel_time = data["time_matrix"][previous_node_index][node_index]
            else:
                travel_time = 0  # No travel time for the first node

            # Calculate waiting time
            if route:
                expected_arrival = previous_departure_time + travel_time
                waiting_time = max(0, arrival_time - expected_arrival)
            else:
                waiting_time = 0

            # Update previous departure time
            previous_departure_time = departure_time

            # Store node information
            node_info = {
                "node": node,
                "index": node_index,
                "arrival_time": arrival_time,
                "departure_time": departure_time,
                "waiting_time": waiting_time,
                "travel_time": travel_time,
            }
            route.append(node_info)
            index = solution.Value(routing.NextVar(index))

        # Final depot stop
        time_var = time_dimension.CumulVar(index)
        node_index = manager.IndexToNode(index)
        arrival_time = solution.Value(time_var)
        node = data["place_ids"][node_index]

        node_info = {
            "node": node,
            "index": node_index,
            "arrival_time": arrival_time,
            "departure_time": arrival_time,
            "waiting_time": 0,
            "travel_time": 0,  # No travel time for the depot
        }
        route.append(node_info)
        total_time += arrival_time
        total_waiting_time += sum([node["waiting_time"] for node in route])
        all_routes.append(route)

    return {
        "routes": all_routes,
        "total_time": total_time,
        "total_waiting_time": total_waiting_time,
    }


def print_routes(computed_routes):
    """Prints the computed routes in a human-readable format."""

    def format_time(total_quarters):
        total_minutes = total_quarters * 15  # Convert quarters to minutes
        days = total_minutes // (24 * 60)
        remaining_minutes = total_minutes % (24 * 60)
        hours = remaining_minutes // 60
        minutes = remaining_minutes % 60
        if days > 0:
            return f"{days}d {hours}h {minutes}m"
        elif hours > 0:
            return f"{hours}h {minutes}m"
        else:
            return f"{minutes}m"

    for vehicle_id, route in enumerate(computed_routes["routes"]):
        plan_output = f"Route for vehicle {vehicle_id}:\n"
        for node in route:
            plan_output += (
                f"Node {node['node']} "
                f"ArrivalTime({format_time(node['arrival_time'])}) "
                f"ServiceTime({(node['departure_time'] - node['arrival_time']) * 15}m) "
                f"DepartureTime({format_time(node['departure_time'])}) "
                f"WaitingTime({format_time(node['waiting_time'])}) "
                f"TravelTime({format_time(node['travel_time'])}) ->\n"
            )
        plan_output += f"Time of the route: {format_time(route[-1]['arrival_time'])}\n"
        print(plan_output)

    print(f"Total time of all routes: {format_time(computed_routes['total_time'])}")
    print(
        f"Total waiting time of all routes: {format_time(computed_routes['total_waiting_time'])}"
    )


def vehicle_routing_problem(input):
    """Solve the VRP with multiple interval time windows and service times."""
    data = create_data_model(input)
    print(data)
    manager = pywrapcp.RoutingIndexManager(
        len(data["time_matrix"]), data["num_vehicles"], data["depot"]
    )
    routing = pywrapcp.RoutingModel(manager)

    def time_callback(from_index, to_index):
        # Debug print statements
        # print(f"From index: {from_index}, To index: {to_index}")

        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)

        # print(f"From node: {from_node}, To node: {to_node}")
        travel_time = data["time_matrix"][from_node][to_node]
        service_time = data["time_services"][from_node]

        return travel_time + service_time

    transit_callback_index = routing.RegisterTransitCallback(time_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    time = "Time"
    routing.AddDimension(
        transit_callback_index,
        24,  # allow waiting time
        96 * data["days"],  # maximum time per vehicle
        False,  # Don't force start cumul to zero.
        time,
    )
    time_dimension = routing.GetDimensionOrDie(time)

    # Apply the custom function to add multiple time windows constraints
    add_multiple_time_windows_constraints(routing, manager, data, time_dimension)

    # Set mandatory and optional places
    for i in range(len(data["place_ids"])):
        index = manager.NodeToIndex(i)
        if i < data["days"]:
            # Set must-go locations: these are added to the route
            routing.AddToAssignment(routing.NextVar(index))
        else:
            # Set optional locations: these can be skipped
            routing.AddDisjunction([index], 1000)  # 1000 is a penalty for skipping

    for vehicle_id in range(data["num_vehicles"]):
        routing.AddVariableMinimizedByFinalizer(
            time_dimension.CumulVar(routing.Start(vehicle_id))
        )
        routing.AddVariableMinimizedByFinalizer(
            time_dimension.CumulVar(routing.End(vehicle_id))
        )

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    solution = routing.SolveWithParameters(search_parameters)

    if solution:
        computed_routes = compute_routes(data, manager, routing, solution)
        print(computed_routes)
        with open("./result.json", "w") as json_file:
            json.dump(computed_routes, json_file, indent=4)
        print("---------" * 20)
        print_routes(computed_routes)
        return computed_routes
    else:
        print("No solution found!")


# import json


# if __name__ == "__main__":
#     with open("vrp_testcases/2.json", "r") as file:
#         input = json.load(file)

#         vehicle_routing_problem(input)

# {
#     "days": 3,
#     "place_ids": [
#         "H0021",
#         "H0021",
#         "H0021",
#         "H0021",
#         "A0002",
#         "A0055",
#         "A0153",
#         "A0155",
#         "A0234",
#         "A0238",
#         "A0423",
#         "A0444",
#         "A0512",
#         "A0527",
#         "A0815",
#     ],
#     "time_windows": [
#         [(0, 28), (264, 288)],
#         [(72, 126)],
#         [(168, 220)],
#         [(156, 160)],
#         [(232, 240)],
#         [(56, 68)],
#         [(56, 68)],
#         [(260, 264)],
#         [(164, 168)],
#         [(40, 48)],
#         [(148, 156)],
#         [(64, 72)],
#         [(136, 144)],
#         [(244, 252)],
#     ],
#     "time_matrix": [
#         [0, 0, 0, 0, 2, 1, 4, 3, 3, 2, 1, 1, 2, 1, 3],
#         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
#         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
#         [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
#         [2, 0, 0, 0, 0, 2, 3, 3, 3, 2, 1, 2, 3, 2, 2],
#         [1, 0, 0, 0, 2, 0, 4, 3, 3, 2, 1, 1, 3, 1, 3],
#         [4, 0, 0, 0, 3, 4, 0, 5, 2, 3, 4, 4, 4, 4, 2],
#         [3, 0, 0, 0, 3, 3, 5, 0, 4, 2, 3, 3, 1, 3, 3],
#         [3, 0, 0, 0, 3, 3, 2, 4, 0, 2, 3, 3, 4, 3, 1],
#         [2, 0, 0, 0, 2, 2, 3, 2, 2, 0, 2, 3, 2, 3, 2],
#         [1, 0, 0, 0, 1, 1, 4, 3, 3, 2, 0, 1, 2, 1, 3],
#         [1, 0, 0, 0, 2, 1, 4, 3, 3, 3, 1, 0, 3, 1, 3],
#         [2, 0, 0, 0, 3, 2, 4, 1, 4, 2, 2, 2, 0, 2, 3],
#         [1, 0, 0, 0, 2, 1, 4, 3, 3, 3, 1, 1, 3, 0, 3],
#         [3, 0, 0, 0, 2, 3, 2, 3, 1, 2, 3, 3, 3, 3, 0],
#     ],
#     "time_services": [28, 54, 52, 3, 1, 8, 2, 3, 1, 8, 1, 8, 8, 8],
#     "num_vehicles": 1,
#     "depot": 0,
# }
