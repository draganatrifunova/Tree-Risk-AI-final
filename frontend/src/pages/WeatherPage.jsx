import { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import api from "../services/api";

/* ===================== HELPERS ===================== */

function SourceBadge({ source }) {
    const isLive = source === "openweather";

    return (
        <span
            className="text-xs font-semibold px-2 py-1 rounded-md"
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

function riskImpact(windSpeed, precipitation) {
    const w = parseFloat(windSpeed) || 0;
    const p = parseFloat(precipitation) || 0;

    const score = w * 0.4 + p * 0.6;

    if (score < 20)
        return { label: "Низок", color: "text-primary", sub: "+0-5%" };

    if (score < 40)
        return { label: "Среден", color: "text-warning", sub: "+5-15%" };

    return { label: "Висок", color: "text-danger", sub: "+15-30%" };
}

function formatChartDate(dateStr) {
    if (!dateStr) return "";

    const d = new Date(dateStr);

    return `${d.getDate()} ${d.toLocaleString("mk", {
        month: "short",
    })}`;
}

/* ===================== OVERVIEW TAB ===================== */

function OverviewTab() {
    const [weather, setWeather] = useState([]);

    const [form, setForm] = useState({
        wind_speed: "",
        precipitation: "",
        date: "",
    });

    const [loading, setLoading] = useState(false);

    const load = async () => {
        try {
            const res = await api.get("/weather/");
            const data = res.data.results || res.data;

            setWeather(Array.isArray(data) ? data : []);
        } catch {
            setWeather([]);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const set = (key, value) =>
        setForm((f) => ({
            ...f,
            [key]: value,
        }));

    const submit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            await api.post("/weather/", {
                wind_speed: parseFloat(form.wind_speed),
                precipitation: parseFloat(form.precipitation),
                date: form.date,
            });

            setForm({
                wind_speed: "",
                precipitation: "",
                date: "",
            });

            await load();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const latest = weather[weather.length - 1];

    const impact = riskImpact(
        latest?.wind_speed,
        latest?.precipitation
    );

    const chartData = weather.slice(-7).map((w) => ({
        date: formatChartDate(w.date),
        "Брзина на ветер (km/h)": w.wind_speed,
        "Врнежи (mm)": w.precipitation,
    }));

    return (
        <div className="space-y-6">

            {/* STAT CARDS */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* WIND */}

                <div className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">
                            Брзина на ветер
                        </span>

                        <span className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                            </svg>
                        </span>
                    </div>

                    <p className="text-3xl font-bold text-text">
                        {latest?.wind_speed ?? "—"}

                        <span className="text-lg font-normal text-gray-400 ml-1">
                            km/h
                        </span>
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                        Тековна брзина
                    </p>
                </div>

                {/* RAIN */}

                <div className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">
                            Врнежи
                        </span>

                        <span className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-indigo-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 15a4 4 0 004 4h9a5 5 0 10-4.9-6H7a4 4 0 00-4 4z"
                                />
                            </svg>
                        </span>
                    </div>

                    <p className="text-3xl font-bold text-text">
                        {latest?.precipitation ?? "—"}

                        <span className="text-lg font-normal text-gray-400 ml-1">
                            mm
                        </span>
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                        Количина
                    </p>
                </div>

                {/* RISK */}

                <div className="bg-white rounded-2xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">
                            Влијание на ризик
                        </span>

                        <span className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                            <svg
                                className="w-5 h-5 text-orange-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                />
                            </svg>
                        </span>
                    </div>

                    <p
                        className={`text-3xl font-bold ${
                            latest ? impact.color : "text-gray-300"
                        }`}
                    >
                        {latest ? impact.label : "—"}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                        {latest ? impact.sub : ""}
                    </p>
                </div>
            </div>

            {/* FORM + CHART */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* FORM */}

                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-text mb-5">
                        Внеси нови податоци
                    </h2>

                    <form onSubmit={submit} className="space-y-4">

                        {/* DATE */}

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Датум <span className="text-danger">*</span>
                            </label>

                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </span>

                                <input
                                    required
                                    type="date"
                                    value={form.date}
                                    onChange={(e) =>
                                        set("date", e.target.value)
                                    }
                                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                            </div>
                        </div>

                        {/* WIND */}

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Брзина на ветер (km/h)
                            </label>

                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                                        />
                                    </svg>
                                </span>

                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={form.wind_speed}
                                    onChange={(e) =>
                                        set("wind_speed", e.target.value)
                                    }
                                    placeholder="45"
                                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                            </div>

                            <p className="text-xs text-gray-400 mt-1">
                                Висока брзина на ветер зголемува ризик
                            </p>
                        </div>

                        {/* PRECIPITATION */}

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Врнежи (mm)
                            </label>

                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 15a4 4 0 004 4h9a5 5 0 10-4.9-6H7a4 4 0 00-4 4z"
                                        />
                                    </svg>
                                </span>

                                <input
                                    required
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={form.precipitation}
                                    onChange={(e) =>
                                        set(
                                            "precipitation",
                                            e.target.value
                                        )
                                    }
                                    placeholder="12"
                                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                            </div>

                            <p className="text-xs text-gray-400 mt-1">
                                Врнежите влијаат на стабилноста
                            </p>
                        </div>

                        {/* BUTTON */}

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                !form.wind_speed ||
                                !form.precipitation ||
                                !form.date
                            }
                            className="w-full bg-primary text-white rounded-xl py-3 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2"
                        >
                            {loading
                                ? "Зачувување..."
                                : "Зачувај податоци"}
                        </button>
                    </form>
                </div>

                {/* CHART */}

                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-text mb-5">
                        Историски преглед
                    </h2>

                    {chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                            Нема доволно податоци за приказ
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={chartData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#f0f0f0"
                                />

                                <XAxis dataKey="date" />

                                <YAxis />

                                <Tooltip />

                                <Legend />

                                <Line
                                    type="monotone"
                                    dataKey="Брзина на ветер (km/h)"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="Врнежи (mm)"
                                    stroke="#6366F1"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* HISTORY SECTION */}

            {weather.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-text">
                            Историја на записи
                        </h2>

                        <span className="text-sm text-gray-400">
                            Последни {Math.min(weather.length, 10)} записи
                        </span>
                    </div>

                    <div className="divide-y">
                        {[...weather]
                            .reverse()
                            .slice(0, 10)
                            .map((w) => (
                                <div
                                    key={w.id}
                                    className="flex items-center justify-between py-4"
                                >
                                    {/* LEFT */}

                                    <div>
                                        <p className="text-sm font-medium text-text">
                                            {w.date}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Weather record
                                        </p>
                                    </div>

                                    {/* RIGHT */}

                                    <div className="flex items-center gap-6">

                                        {/* WIND */}

                                        <div className="flex items-center gap-2 text-blue-600">
                                            <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                                    />
                                                </svg>
                                            </span>

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Wind
                                                </p>

                                                <p className="text-sm font-semibold">
                                                    {w.wind_speed} km/h
                                                </p>
                                            </div>
                                        </div>

                                        {/* RAIN */}

                                        <div className="flex items-center gap-2 text-indigo-600">
                                            <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M3 15a4 4 0 004 4h9a5 5 0 10-4.9-6H7a4 4 0 00-4 4z"
                                                    />
                                                </svg>
                                            </span>

                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Rain
                                                </p>

                                                <p className="text-sm font-semibold">
                                                    {w.precipitation} mm
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ===================== MANUAL TAB ===================== */

function ManualRecordsTab() {
    const [weather, setWeather] = useState([]);

    useEffect(() => {
        api.get("/weather/")
            .then((res) =>
                setWeather(res.data.results || res.data)
            )
            .catch(() => setWeather([]));
    }, []);

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">
                Manual Records
            </h2>

            <div className="divide-y">
                {[...weather].reverse().map((w) => (
                    <div
                        key={w.id}
                        className="flex justify-between py-3 text-sm"
                    >
                        <span className="text-gray-500">
                            {w.date}
                        </span>

                        <div className="flex gap-6">
                            <span className="font-medium text-blue-600">
                                {w.wind_speed} km/h
                            </span>

                            <span className="font-medium text-indigo-600">
                                {w.precipitation} mm
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ===================== SNAPSHOTS TAB ===================== */

function SnapshotsTab() {
    const [snapshots, setSnapshots] = useState([]);

    useEffect(() => {
        api.get("/weather/snapshots/")
            .then((res) =>
                setSnapshots(res.data.results || res.data)
            )
            .catch(() => setSnapshots([]));
    }, []);

    if (snapshots.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-sm p-6 text-sm text-gray-500">
                No weather snapshots yet.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="space-y-1">
                {snapshots.map((s) => (
                    <div
                        key={s.id}
                        className="py-3 border-b last:border-0"
                    >
                        <div className="flex justify-between items-start">

                            <div>
                                <span className="font-medium text-sm">
                                    {s.tree_species || "Unknown tree"}
                                </span>

                                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-3">
                                    <span>
                                        Wind: <strong>{s.wind_speed}</strong> m/s
                                    </span>

                                    <span>
                                        Precip: <strong>{s.precipitation}</strong> mm/h
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <SourceBadge source={s.source} />

                                {s.storm_indicator && (
                                    <span
                                        className="text-xs font-semibold px-2 py-1 rounded-md"
                                        style={{
                                            background: "#EB575722",
                                            color: "#EB5757",
                                        }}
                                    >
                                        ⚡ Storm
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="text-xs text-gray-400 mt-2">
                            {new Date(s.timestamp).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ===================== MAIN PAGE ===================== */

export default function WeatherPage() {
    const [tab, setTab] = useState("overview");

    return (
        <div className="min-h-screen bg-secondary px-6 py-8 space-y-6">

            <div>
                <h1 className="text-3xl font-bold text-text">
                    Weather
                </h1>

                <p className="text-gray-500 mt-1">
                    Weather monitoring and automatic snapshots
                </p>
            </div>

            {/* TABS */}

            <div className="flex gap-2 flex-wrap">
                {[
                    ["overview", "Overview"],
                    ["manual", "Manual Records"],
                    ["snapshots", "Auto Snapshots"],
                ].map(([key, label]) => (
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

            {/* CONTENT */}

            {tab === "overview" && <OverviewTab />}

            {tab === "manual" && <ManualRecordsTab />}

            {tab === "snapshots" && <SnapshotsTab />}
        </div>
    );
}