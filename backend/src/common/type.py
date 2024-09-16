import re

class PlaceIdStr(str):
    """Place ID represented as a string with a prefix ('A', 'H', or 'F') followed by a number in the range '0000' to '9999'."""
    PLACE_ID_PATTERN = re.compile(r'^[AHF]\d{4}$')

    def __new__(cls, value):
        if not cls.PLACE_ID_PATTERN.match(value):
            raise ValueError(
                f"'{value}' is not a valid Place ID. Must be in the format 'A0000' to 'A9999', 'H0000' to 'H9999', or 'F0000' to 'F9999'."
            )
        return str.__new__(cls, value)
