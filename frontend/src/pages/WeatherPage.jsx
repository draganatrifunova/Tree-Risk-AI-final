import { useEffect, useState } from "react";
import api from "../services/api";

export default function WeatherPage() {
  const [weather, setWeather] = useState([]);
  const [form, setForm] = useState({ wind_speed: "", precipitation: "", date: "" });

  const load = () => api.get("/weather").then((res) => setWeather(res.data.results || res.data));
  useEffect(() => load(), []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/weather", form);
    load();
  };

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="card grid grid-cols-1 md:grid-cols-4 gap-2">
        <input className="border rounded p-2" placeholder="Wind speed" onChange={(e) => setForm({ ...form, wind_speed: e.target.value })} />
        <input className="border rounded p-2" placeholder="Precipitation" onChange={(e) => setForm({ ...form, precipitation: e.target.value })} />
        <input className="border rounded p-2" type="date" onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <button className="bg-primary text-white rounded p-2">Save Weather</button>
      </form>
      <div className="card">
        {weather.map((w) => (
          <div key={w.id} className="py-2 border-b last:border-0">{w.date}: wind {w.wind_speed}, precipitation {w.precipitation}</div>
        ))}
      </div>
    </div>
  );
}
