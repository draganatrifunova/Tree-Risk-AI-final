import { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import api from "../services/api";

function riskImpact(windSpeed, precipitation) {
    const w = parseFloat(windSpeed) || 0;
    const p = parseFloat(precipitation) || 0;
    const score = w * 0.4 + p * 0.6;
    if (score < 20) return { label: "Низок", color: "text-primary", sub: "+0-5%" };
    if (score < 40) return { label: "Среден", color: "text-warning", sub: "+5-15%" };
    return { label: "Висок", color: "text-danger", sub: "+15-30%" };
}

function formatChartDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString("mk", { month: "short" })}`;
}

export default function WeatherPage() {
    const [weather, setWeather] = useState([]);
    const [form, setForm] = useState({ wind_speed: "", precipitation: "", date: "" });
    const [loading, setLoading] = useState(false);

    const load = async () => {
        try {
            const res = await api.get("/weather");
            const data = res.data.results || res.data;
            setWeather(Array.isArray(data) ? data : []);
        } catch {
            setWeather([]);
        }
    };

    useEffect(() => { load(); }, []);

    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/weather/", {
                wind_speed: parseFloat(form.wind_speed),
                precipitation: parseFloat(form.precipitation),
                date: form.date,
            });
            setForm({ wind_speed: "", precipitation: "", date: "" });
            await load();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const latest = weather[weather.length - 1];
    const impact = riskImpact(latest?.wind_speed, latest?.precipitation);

    const chartData = weather.slice(-7).map((w) => ({
        date: formatChartDate(w.date),
        "Брзина на ветер (km/h)": w.wind_speed,
        "Врнежи (mm)": w.precipitation,
    }));

    return (
        <div className="min-h-screen bg-secondary px-6 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text">Временски услови</h1>
                <p className="text-gray-500 mt-1">Внесете ги тековните временски податоци за точна пресметка на ризик</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-5 mb-8">
                <div className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">Брзина на ветер</span>
                        <span className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-text">{latest?.wind_speed ?? "—"} <span className="text-lg font-normal text-gray-400">km/h</span></p>
                    <p className="text-xs text-gray-400 mt-1">Тековна брзина</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">Врнежи</span>
                        <span className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-4.9-6H7a4 4 0 00-4 4z" />
                            </svg>
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-text">{latest?.precipitation ?? "—"} <span className="text-lg font-normal text-gray-400">mm</span></p>
                    <p className="text-xs text-gray-400 mt-1">Количина</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">Влијание на ризик</span>
                        <span className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </span>
                    </div>
                    <p className={`text-3xl font-bold ${latest ? impact.color : "text-gray-300"}`}>
                        {latest ? impact.label : "—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{latest ? impact.sub : ""}</p>
                </div>
            </div>

            {/* Form + Chart */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-text mb-5">Внеси нови податоци</h2>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Датум <span className="text-danger">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </span>
                                <input
                                    required
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => set("date", e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Брзина на ветер (km/h) <span className="text-danger">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={form.wind_speed}
                                    onChange={(e) => set("wind_speed", e.target.value)}
                                    placeholder="45"
                                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Висока брзина на ветер зголемува ризик од паѓање</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Врнежи (mm) <span className="text-danger">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-4.9-6H7a4 4 0 00-4 4z" />
                                    </svg>
                                </span>
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={form.precipitation}
                                    onChange={(e) => set("precipitation", e.target.value)}
                                    placeholder="12"
                                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Врнежите го намалуваат стабилноста на почвата</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !form.wind_speed || !form.precipitation || !form.date}
                            className="w-full bg-primary text-white rounded-xl py-3 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2"
                        >
                            {loading ? "Зачувување..." : "Зачувај податоци"}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-text mb-5">Историски преглед</h2>
                    {chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                            Нема доволно податоци за приказ
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Line yAxisId="left" type="monotone" dataKey="Брзина на ветер (km/h)" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                <Line yAxisId="right" type="monotone" dataKey="Врнежи (mm)" stroke="#6366F1" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* History list */}
            {weather.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                    <h2 className="text-lg font-semibold text-text mb-4">Записи</h2>
                    <div className="divide-y">
                        {[...weather].reverse().slice(0, 10).map((w) => (
                            <div key={w.id} className="flex items-center justify-between py-3 text-sm">
                                <span className="text-gray-500">{w.date}</span>
                                <div className="flex gap-6">
                                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                        {w.wind_speed} km/h
                                    </span>
                                    <span className="flex items-center gap-1 text-indigo-600 font-medium">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-4.9-6H7a4 4 0 00-4 4z" />
                                        </svg>
                                        {w.precipitation} mm
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}