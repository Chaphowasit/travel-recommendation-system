from common.utils import convert_time_to_int
import logging

logger = logging.getLogger("vrp")

def transform_time_to_int(start_time, end_time):
        """Convert start_time and end_time to integer representations, handling overnight times."""
        start_total_minutes = (
            start_time.hour * 60 + start_time.minute if start_time else None
        )
        end_total_minutes = end_time.hour * 60 + end_time.minute if end_time else None

        # Handle overnight times
        if (
            end_total_minutes is not None
            and start_total_minutes is not None
            and end_total_minutes <= start_total_minutes
        ):
            end_total_minutes += (
                24 * 60
            )  # Add 24 hours to end time if it’s past midnight

        start_int = convert_time_to_int(start_total_minutes, is_start=True)
        end_int = convert_time_to_int(end_total_minutes, is_start=False)
        return start_int, end_int