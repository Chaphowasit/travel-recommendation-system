# Define the function to calculate intersections with single time window tuples
def find_time_intersections(visit_hours, time_windows):
    # Function to calculate the union of multiple intervals
    def get_union(intervals):
        if not intervals:
            return []

        # Sort intervals by start time
        intervals.sort(key=lambda x: x[0])
        union_intervals = [intervals[0]]

        for current in intervals[1:]:
            last = union_intervals[-1]
            # If current interval overlaps or touches the last, merge them
            if current[0] <= last[1]:
                union_intervals[-1] = (last[0], max(last[1], current[1]))
            else:
                union_intervals.append(current)

        return union_intervals

    # Function to find intersection of two time intervals
    def get_intersection(window, visit):
        start = max(window[0], visit[0])
        end = min(window[1], visit[1])
        if start < end:  # Valid intersection if start < end
            return (start, end)
        return None

    # Find intersections between union of visit hours and time windows
    intersections = {}
    for place_id, visits in visit_hours.items():
        # Step 1: Get the union of visit hours for this place_id
        union_visit_hours = get_union(visits)

        # Step 2: Find intersections between the union_visit_hours and the time window, if it exists
        if place_id in time_windows:
            window = time_windows[place_id]
            intersected_times = []
            for union_time in union_visit_hours:
                intersection = get_intersection(window, union_time)
                if intersection:
                    intersected_times.append(intersection)

            # Only include places with valid intersections
            if intersected_times:
                intersections[place_id] = intersected_times

    return intersections


def get_visit_hours(data, day):
    # Extract visit hours
    visit_hours = {}
    for d, activity in enumerate(data["activities"]):
        if d != day:
            continue
        for place in activity["place"]:
            place_id = place["id"]
            if place_id not in visit_hours.keys():
                visit_hours[place_id] = []
            visit_times = [(vt["start"], vt["end"]) for vt in place["visit_time"]]
            visit_hours[place_id] += visit_times
        break
            
    return visit_hours