import logging

import requests
from django.conf import settings

from .models import Weather, WeatherSnapshot

logger = logging.getLogger(__name__)

_STORM_CODES = set(range(200, 300)) | set(range(900, 907))
_RAIN_CODES = set(range(500, 532))

BASE_URL = "https://api.openweathermap.org/data/2.5"


class OpenWeatherService:
    def __init__(self):
        self.api_key = getattr(settings, "OPENWEATHER_API_KEY", "")

    def _available(self):
        return bool(self.api_key)

    def fetch_current(self, lat, lon):
        resp = requests.get(
            f"{BASE_URL}/weather",
            params={"lat": lat, "lon": lon, "appid": self.api_key, "units": "metric"},
            timeout=5,
        )
        resp.raise_for_status()
        data = resp.json()
        weather_code = data.get("weather", [{}])[0].get("id", 0)
        wind = data.get("wind", {})
        rain = data.get("rain", {})
        return {
            "wind_speed": wind.get("speed", 0.0),
            "wind_gust": wind.get("gust"),
            "precipitation": rain.get("1h", 0.0),
            "temperature": data.get("main", {}).get("temp"),
            "weather_code": weather_code,
            "storm_indicator": weather_code in _STORM_CODES,
        }

    def fetch_forecast_max_wind(self, lat, lon):
        resp = requests.get(
            f"{BASE_URL}/forecast",
            params={"lat": lat, "lon": lon, "appid": self.api_key, "units": "metric", "cnt": 8},
            timeout=5,
        )
        resp.raise_for_status()
        data = resp.json()
        wind_speeds = [entry.get("wind", {}).get("speed", 0.0) for entry in data.get("list", [])]
        return max(wind_speeds) if wind_speeds else None

    def create_snapshot(self, tree):
        if not self._available():
            return self._fallback_snapshot(tree)
        try:
            current = self.fetch_current(tree.latitude, tree.longitude)
            forecast_max_wind = self.fetch_forecast_max_wind(tree.latitude, tree.longitude)
            return WeatherSnapshot.objects.create(
                tree=tree,
                wind_speed=current["wind_speed"],
                wind_gust=current.get("wind_gust"),
                precipitation=current["precipitation"],
                temperature=current.get("temperature"),
                storm_indicator=current["storm_indicator"],
                forecast_max_wind_24h=forecast_max_wind,
                weather_code=current.get("weather_code"),
                source="openweather",
            )
        except Exception as exc:
            logger.warning("OpenWeather fetch failed (%s), falling back to manual data.", exc)
            return self._fallback_snapshot(tree)

    def _fallback_snapshot(self, tree):
        manual = Weather.objects.order_by("-date").first()
        if manual:
            return WeatherSnapshot.objects.create(
                tree=tree,
                wind_speed=manual.wind_speed,
                precipitation=manual.precipitation,
                source="manual",
            )
        return WeatherSnapshot.objects.create(
            tree=tree,
            wind_speed=0.0,
            precipitation=0.0,
            source="manual",
        )
