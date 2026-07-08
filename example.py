"""
Astrology Compatibility API: scored compatibility between two birth charts through Western
synastry aspects. Returns an overall percent, five category scores, sign pair narratives,
and a relationship archetype. Roxy Ephemeris, verified against NASA JPL Horizons.
Call /location/search for each person first -- never hardcode coordinates.
"""

import os
from roxy_sdk import create_roxy

roxy = create_roxy(os.environ["ROXY_API_KEY"])


def main():
    # Step 1: geocode person 1 birth city
    loc1 = roxy.location.search_cities(q="New York")
    city1 = loc1["cities"][0]

    # Step 2: geocode person 2 birth city
    loc2 = roxy.location.search_cities(q="Los Angeles")
    city2 = loc2["cities"][0]

    # Step 3: score the astrology compatibility between the two charts
    result = roxy.astrology.calculate_compatibility(
        person1={
            "date": "1990-07-15",
            "time": "14:30:00",
            "latitude": city1["latitude"],
            "longitude": city1["longitude"],
            "timezone": city1["timezone"],
        },
        person2={
            "date": "1992-03-20",
            "time": "09:15:00",
            "latitude": city2["latitude"],
            "longitude": city2["longitude"],
            "timezone": city2["timezone"],
        },
    )

    print("Overall compatibility score:", result["overallScore"])
    print("Archetype:", result["archetype"]["label"])

    print("\nCategory scores:")
    for name, score in result["categories"].items():
        print(f"  {name}: {score}")

    breakdown = result["aspectBreakdown"]
    print(
        f"\nAspect breakdown: {breakdown['total']} total "
        f"({breakdown['harmonious']} harmonious, {breakdown['challenging']} challenging)"
    )

    print("\nTop 3 key aspects:")
    for aspect in result["keyAspects"][:3]:
        print(
            f"  {aspect['planet1']} {aspect['type']} {aspect['planet2']} "
            f"orb {aspect['orb']} [{aspect['interpretation']}]"
        )

    print("\nSummary:", result["summary"])


if __name__ == "__main__":
    main()
