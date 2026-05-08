import { useEffect, useState } from "react";
import api from "../services/api";

function SourceBadge({ source }) {
  const isLive = source === "openweather";
  return (
    <span
      className="text-xs font-semibold px-1.5 py-0.5 rounded"
      style={
        isLive
          ? { background: "#1E8E5A22", color: "#1E8E5A" }
          : { background: "#e5e7eb", color: "#6b7280" }
      }
    >
      {isLive ? "Live" : "Manual"}
    </span>
  );
}

function ManualWeatherTab() {
  const [weather, setWeather] = useState([]);
  const [form, setForm] = useState({ wind_speed: "", precipitation: "", date: "" });

  const load = async () => {
    const res = await api.get("/weather");
    setWeather(res.data.results || res.data);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.wind_speed || !form.precipitation || !form.date) {
      alert("Fill all fields");
      return;
    }
    try {
      await api.post("/weather/", {
        wind_speed: parseFloat(form.wind_speed),
        precipitation: parseFloat(form.precipitation),
        date: form.date,
      });
      load();
      setForm({ wind_speed: "", precipitation: "", date: "" });
    } catch (err) {
      console.error(err);
      alert("Error saving weather");
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="card grid grid-cols-1 md:grid-cols-4 gap-2">
        <input
          type="number" step="0.1" min="0"
          value={form.wind_speed}
          className="border rounded p-2"
          placeholder="Wind speed (m/s)"
          onChange={(e) => setForm({ ...form, wind_speed: e.target.value })}
        />
        <input
          type="number" step="0.1" min="0"
          value={form.precipitation}
          className="border rounded p-2"
          placeholder="Precipitation (mm/h)"
          onChange={(e) => setForm({ ...form, precipitation: e.target.value })}
        />
        <input
          className="border rounded p-2" type="date" value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <button
          disabled={!form.wind_speed || !form.precipitation || !form.date}
          className="bg-primary text-white rounded p-2 disabled:opacity-50"
        >
          Save Weather
        </button>
      </form>
      <div className="card">
        {weather.length === 0 && <p className="text-sm text-gray-500">No manual weather records.</p>}
        {weather.map((w) => (
          <div key={w.id} className="py-2 border-b last:border-0 flex justify-between text-sm">
            <span className="text-gray-700">{w.date}</span>
            <span>Wind: <strong>{w.wind_speed}</strong> m/s · Precip: <strong>{w.precipitation}</strong> mm/h</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SnapshotsTab() {
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    api.get("/weather/snapshots/")
      .then((res) => setSnapshots(res.data.results || res.data))
      .catch(() => setSnapshots([]));
  }, []);

  if (snapshots.length === 0) {
    return (
      <div className="card text-sm text-gray-500">
        No weather snapshots yet. Use <strong>Recalculate</strong> on any tree to generate one.
      </div>
    );
  }

  return (
    <div className="card space-y-0">
      {snapshots.map((s) => (
        <div key={s.id} className="py-3 border-b last:border-0">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-medium text-sm">{s.tree_species || "Unknown tree"}</span>
              <div className="text-xs text-gray-500 mt-0.5 space-x-3">
                <span>Wind: <strong>{s.wind_speed}</strong> m/s</span>
                {s.wind_gust != null && <span>Gust: <strong>{s.wind_gust}</strong> m/s</span>}
                <span>Precip: <strong>{s.precipitation}</strong> mm/h</span>
                {s.temperature != null && <span>Temp: <strong>{s.temperature}</strong>°C</span>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <SourceBadge source={s.source} />
              {s.storm_indicator && (
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: "#EB575722", color: "#EB5757" }}>
                  ⚡ Storm
                </span>
              )}
              {s.forecast_max_wind_24h != null && (
                <span className="text-xs text-gray-400">
                  Forecast max: {s.forecast_max_wind_24h} m/s
                </span>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {new Date(s.timestamp).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WeatherPage() {
  const [tab, setTab] = useState("manual");

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold">Weather</h2>
      <div className="flex gap-2">
        {[["manual", "Manual Records"], ["snapshots", "Auto Snapshots"]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              tab === key
                ? "bg-primary text-white"
                : "bg-white border text-gray-600 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "manual" ? <ManualWeatherTab /> : <SnapshotsTab />}
    </div>
  );
}
