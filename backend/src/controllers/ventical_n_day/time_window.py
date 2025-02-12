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

# Define the function to calculate intersections with single time window tuples
def find_time_intersections(visit_hours, time_windows):
    
    # Step 1: Get the union of visit hours
    union_visit_hours = get_union(visit_hours)
    
    # Step 2: Find intersections between the union_visit_hours and the time window
    intersected_times = []
    for union_time in union_visit_hours:
        intersection = get_intersection(time_windows, union_time)
        if intersection:
            intersected_times.append(intersection)

    return intersected_times


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