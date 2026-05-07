import {useEffect, useState} from "react";
import api from "../services/api";

export default function WeatherPage() {
    const [weather, setWeather] = useState([]);

    const [form, setForm] = useState({
        wind_speed: "",
        precipitation: "",
        date: ""
    });

    const load = async () => {
        const res = await api.get("/weather");
        setWeather(res.data.results || res.data);
    };

    useEffect(() => {
        load();
    }, []);

    const submit = async (e) => {
        e.preventDefault();

        if (
            form.wind_speed === "" ||
            form.precipitation === "" ||
            form.date === ""
        ) {
            alert("You must fill all fields");
            return;
        }

        try {
            await api.post("/weather/", {
                wind_speed: parseFloat(form.wind_speed),
                precipitation: parseFloat(form.precipitation),
                date: form.date
            });

            load();

            setForm({
                wind_speed: "",
                precipitation: "",
                date: ""
            });

        } catch (err) {
            console.error(err);
            alert("Error while saving weather");
        }
    };

    return (
        <div className="space-y-3">
            <form onSubmit={submit} className="card grid grid-cols-1 md:grid-cols-4 gap-2">
                <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.wind_speed}
                    className="border rounded p-2"
                    placeholder="Wind speed"
                    onChange={(e) => setForm({...form, wind_speed: e.target.value})}
                />
                <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.precipitation}
                    className="border rounded p-2"
                    placeholder="Precipitation"
                    onChange={(e) => setForm({...form, precipitation: e.target.value})}
                />
                <input className="border rounded p-2" type="date" value={form.date}
                       onChange={(e) => setForm({...form, date: e.target.value})}/>

                <button
                    disabled={!form.wind_speed || !form.precipitation || !form.date}
                    className="bg-primary text-white rounded p-2 disabled:opacity-50"
                >
                    Save Weather
                </button>
            </form>
            <div className="card">
                {weather.map((w) => (
                    <div key={w.id} className="py-2 border-b last:border-0">{w.date}: wind {w.wind_speed},
                        precipitation {w.precipitation}</div>
                ))}
            </div>
        </div>
    );
}
