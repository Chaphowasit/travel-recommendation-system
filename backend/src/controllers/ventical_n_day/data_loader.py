# duration_matrix.py

from typing import List, Tuple

from adapters.MariaDB import MariaDB_Adaptor

from duration_matrix import DurationMatrix
from time_window import find_time_intersections, get_union

class DataLoader:
    adaptor = MariaDB_Adaptor()
    
    def __init__(self, data):
        self.data = data
        
        self._assert_data(data)
        
        
    def _assert_data(self, data):
        assert data is not None, "Data is None or invalid. Please provide valid input data."
        assert isinstance(data, dict), "Data should be a dictionary."

        self._assert_days(data)
        self._assert_accommodation(data)
        self._assert_activities(data)

    def _assert_days(self, data):
        if "accommodation" not in data or "sleepTimes" not in data["accommodation"]:
            raise ValueError("Missing 'accommodation' or 'sleepTimes' in data.")
        if "activities" not in data:
            raise ValueError("Missing 'activities' in data.")
        
        days_acc = len(data["accommodation"]["sleepTimes"])
        days_act = len(data["activities"])
        
        assert days_acc == days_act, "Days in accommodation mismatch with days in activity."

        self.days = days_acc
        
    def _assert_accommodation(self, data):
        # Check if "accommodation" and "id" are provided
        if "accommodation" not in data or "id" not in data["accommodation"]:
            raise ValueError("Missing 'accommodation' or accommodation 'id' in data.")
        
        accommodation_id = data["accommodation"]["id"]
        accommodation = DataLoader.adaptor.fetch_accommodations([accommodation_id])
        
        # Assert that the accommodation was found (not an empty dictionary)
        assert accommodation, f"No accommodation found for ID: {accommodation_id}"
        
        # Store the accommodation details if valid
        self.accommodation = accommodation[accommodation_id]

    def _assert_activities(self, data):
        # Check if "activities" and "id" are provided
        if "activities" not in data:
            raise ValueError("Missing 'activities' in data.")
        
        activity_ids = set()
        
        for day_activities in data["activities"]:
            for activity in day_activities:
                if "id" not in activity:
                    raise ValueError("Missing activity 'id' in data.")
                
                activity_ids.add(activity["id"])
                
        activities = DataLoader.adaptor.fetch_activities(list(activity_ids))
        
        missing_activities = activity_ids - set(activities.keys())
        
        # Assert that the activities was found (not an empty dictionary)
        assert activities or len(missing_activities) != 0, f"No activities found for ID: {missing_activities}"
        
        # Store the activities details if valid
        self.activities = activities

    def get_days(self):
        return self.days
    
    def get_all_place_ids(self):
        accommodation_id = self.accommodation["id"]
        
        activity_ids = [activity["id"] for activity in self.activities]
        
        return accommodation_id, activity_ids
    
    def get_activity_ids_grouped_by_day(self):
        return [
            [activity["id"] for activity in day_activity] 
            for day_activity in self.data["activities"]
        ]
    
    def _flatten_visit_times(self):
        visit_time = {}
        
        # Process each day separately
        for day, day_activity in enumerate(self.data["activities"]):
            day_visit_time = {}

            # Formatting visit hour
            for activity in day_activity:
                day_visit_time.setdefault(activity["id"], [])
                
                for time in activity["visit_time"]:
                    formatted_time = (time["start"], time["end"])
                    day_visit_time[activity["id"]].append(formatted_time)
            
            # Formatting business hour
            business_hours = {
                activity_id: (activity_data["start_time_int"], activity_data["end_time_int"]) 
                for activity_id, activity_data 
                in self.activities.items() 
                if activity_id in day_visit_time.keys()
            }
            
            # Find the time intersection
            for activity_id in day_visit_time.keys():
                intersection_time = find_time_intersections(
                    day_visit_time[activity_id], 
                    business_hours[activity_id]
                )
                
                visit_time.setdefault(activity_id, [])
                    
                visit_time[activity_id].extend([(time[0] + day * 96, time[1] + day * 96) for time in intersection_time])
        
        # Union across day and set the range of step-in time
        for activity_id in list(visit_time.keys()):
            visit_time[activity_id] = [
                (time_range[0], time_range[1] - self.data["activities_stayTime"][activity_id])
                for time_range 
                in get_union(visit_time[activity_id])
                if time_range[1] - time_range[0] >= self.data["activities_stayTime"][activity_id]
            ]
            
              
            if not visit_time[activity_id]:
                visit_time.pop(activity_id)
        
        return visit_time

    
    def get_valid_place_ids(self):
        activity_ids = self._flatten_visit_times().keys()
        accommodation_id = self.accommodation["id"]
        
        return accommodation_id, list(activity_ids)
    
    def get_sleep_times(self):
        sleepTimes = self.data["accommodation"]["sleepTimes"]
        days = self.get_days()
        
        night_time: List[List[Tuple[int, int]]] = []
        for day in range(days):
            if day == 0:
                night_time.append([
                    (0, sleepTimes[0]["morning"]), 
                    (sleepTimes[days-1]["evening"] + (days-1) * 96, 96 * days)
                ])
            else:
                night_time.append([
                    (
                        sleepTimes[day-1]["evening"] + (day-1) * 96, 
                        sleepTimes[day]["morning"] + (day) * 96 - sleepTimes[day-1]["sleepTime"]
                    ) 
                ])
                
        return night_time
                
    def get_active_times(self, places_order):
        accommodation_active = self.get_sleep_times()
        activities_active = self._flatten_visit_times()
        
        result = []
        
        counter = 0
        for place in places_order:
            if place in activities_active:
                result.append(activities_active[place])
            elif place == self.accommodation["id"]:
                result.append(accommodation_active[counter])
                counter += 1
            else:
                raise ValueError()
            
        return result
    
    def get_duration_matrix(self):
        
        # data preparation
        accommodation_id, activity_ids = self.get_valid_place_ids()
        
        # locations
        locs = {
            self.activities[activity_id]["id"]: (
                self.activities[activity_id]["longitude"],
                self.activities[activity_id]["latitude"],
            )
            for activity_id in activity_ids
        }
        
        locs[accommodation_id] = (
            self.accommodation["longitude"],
            self.accommodation["latitude"], 
        )
        
        # places order
        places_order = [accommodation_id] * self.get_days() + activity_ids
        
        durationMatrix = DurationMatrix(DataLoader.adaptor, locs, places_order)
        return places_order, durationMatrix.get_duration_matrix()
    
    def get_durations(self, place_orders):
        result = []
        sleep_times = self.data["accommodation"]["sleepTimes"]

        for i, place in enumerate(place_orders):
            if place in self.data["activities_stayTime"]:
                result.append(self.data["activities_stayTime"][place])
            elif place == self.accommodation["id"]:
                result.append(0 if i == 0 else sleep_times[i - 1]["sleepTime"])

        return result