"""Rule-based crop recommendation from a predicted climate vector."""

from typing import Tuple

# Feature order: [T2M_MAX, PRECTOTCORR, RH2M, GWETROOT, T2M_MIN]


def recommend(predicted) -> Tuple[str, str]:
    t2m_max = float(predicted[0])
    prectot = float(predicted[1])
    rh2m = float(predicted[2])
    gwetroot = float(predicted[3])
    t2m_min = float(predicted[4])

    if prectot >= 4.0 and gwetroot >= 0.6 and t2m_max <= 32.0:
        return (
            "Rice",
            "Predicted adequate precipitation and root-zone wetness support a water-intensive Rice cycle.",
        )
    if t2m_max > 28.0 and prectot < 2.0 and gwetroot < 0.4:
        return (
            "Millet",
            "Predicted high temperature with low precipitation and low soil wetness favors drought-tolerant Millet.",
        )
    if 18.0 <= t2m_max <= 28.0 and 2.0 <= prectot < 4.0 and gwetroot >= 0.4:
        return (
            "Wheat",
            "Predicted moderate temperature and rainfall suit a Wheat cycle.",
        )
    if t2m_max > 32.0 and prectot < 1.5:
        return (
            "Millet",
            "Predicted extreme heat and very low rainfall make drought-tolerant Millet the safest choice.",
        )
    if prectot >= 3.0 and gwetroot >= 0.5:
        return (
            "Rice",
            "Predicted sufficient water availability supports Rice over drier crops.",
        )
    return (
        "Wheat",
        "Predicted conditions are closest to a moderate Wheat cycle; monitor water and temperature.",
    )
