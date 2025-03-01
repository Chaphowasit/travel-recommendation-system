# duration_matrix.py

from typing import List, Tuple

from adapters.MariaDB import MariaDB_Adaptor

from duration_matrix import DurationMatrix
from time_window import find_time_intersections, get_union


class DataLoader:
    # adaptor = MariaDB_Adaptor()

    def __init__(self, data):
        self.data = data
        self.days = len(data["accommodation"]["sleep_times"])

        self._assert_data(data)

    def _assert_data(self, data):
        assert (
            data is not None
        ), "Data is None or invalid. Please provide valid input data."
        assert isinstance(data, dict), "Data should be a dictionary."

        self._assert_accommodation(data)
        self._assert_activities(data)

    def _assert_accommodation(self, data):
        # Check if "accommodation" and "id" are provided
        if "accommodation" not in data or "place_id" not in data["accommodation"]:
            raise ValueError("Missing 'accommodation' or accommodation 'place_id' in data.")

        accommodation_id = data["accommodation"]["place_id"]
        with MariaDB_Adaptor() as session:
            accommodation = session.fetch_accommodations([accommodation_id])

        # Assert that the accommodation was found (not an empty dictionary)
        assert accommodation, f"No accommodation found for ID: {accommodation_id}"

        # Store the accommodation details if valid
        self.accommodation = accommodation[accommodation_id]

    def _assert_activities(self, data):
        # Check if "activities" and "id" are provided
        if "activities" not in data:
            raise ValueError("Missing 'activities' in data.")

        activity_ids = [activity["place_id"] for activity in data["activities"]]

        with MariaDB_Adaptor() as session:
            activities = session.fetch_activities(activity_ids)

        missing_activities = set(activity_ids) - set(activities.keys())

        # Assert that the activities was found (not an empty dictionary)
        assert (
            activities or len(missing_activities) != 0
        ), f"No activities found for ID: {missing_activities}"

        # Store the activities details if valid
        self.activities = activities
        
    def get_days(self):
        return self.days

    def _flatten_visit_times(self):
        visit_time = {activity["place_id"]: [(visit["start"], visit["end"]) for visit in activity["visit_range"]] 
                      for activity in self.data["activities"]}

        # Union across day and set the range of step-in time
        for activity_id in list(visit_time.keys()):
            stay_time = next(
                (act["stay_time"] for act in self.data["activities"] if act["place_id"] == activity_id),
                0  # Default to 0 if no stay time is found
            )
            
            visit_time[activity_id] = [
                (
                    time_range[0],
                    max(time_range[1] - stay_time, time_range[0]),
                )
                for time_range in get_union(visit_time[activity_id])
            ]

            if not visit_time[activity_id]:
                visit_time.pop(activity_id)

        return visit_time

    def get_valid_place_ids(self):
        activity_ids = self._flatten_visit_times().keys()
        accommodation_id = self.accommodation["id"]

        return accommodation_id, list(activity_ids)

    def get_sleep_times(self):
        sleepTimes = self.data["accommodation"]["sleep_times"]
        days = self.get_days()

        night_time = [[(sleepTime["start"], sleepTime["end"])] for sleepTime in sleepTimes]
                
        night_time[0].append((days *96, days*96))
        
        print(night_time)

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
        with MariaDB_Adaptor() as session:
            durationMatrix = DurationMatrix(session, locs, places_order)
        return places_order, durationMatrix.get_duration_matrix()

    def get_durations(self, place_orders):
        result = []
        sleep_times = self.data["accommodation"]["sleep_times"]
        
        for i, place in enumerate(place_orders):
            # Find if the place exists in activities
            activity = next((act for act in self.data["activities"] if act["place_id"] == place), None)

            if activity:
                result.append(activity["stay_time"])
            elif place == self.accommodation["id"]:
                if i == 0:
                    result.append(sleep_times[0]["end"])
                else:
                    result.append(32)
            else:
                raise ValueError()
        
        return result

    def get_musts(self, place_orders):
        must_visit = []

        for place in place_orders:
            # Check if the place is an activity and marked as must-visit
            activity = next((act for act in self.data["activities"] if act["place_id"] == place), None)
            if activity and activity["must"] != None:
                must_visit.append(activity["must"])
            elif place == self.accommodation["id"]:
                must_visit.append(True)
            else:
                raise ValueError()

        return must_visit
