import {useEffect, useMemo, useState} from "react";
import infoRed from "../assets/images/info-triangle-red.svg";
import treeBlue from "../assets/images/tree-blue.svg";
import risk from "../assets/images/risk.svg";
import wind from "../assets/images/wind.svg";
import {ArcElement, BarElement, CategoryScale, Chart, Legend, LinearScale, Tooltip as CJTooltip} from "chart.js";
import {Bar as BarCJ, Doughnut} from "react-chartjs-2";
import {CircleMarker, MapContainer, Popup, TileLayer,} from "react-leaflet";
import api from "../services/api";
import PriorityList from "../components/PriorityList";

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, CJTooltip, Legend);

const COLORS = {
    LOW: "#1E8E5A",
    MEDIUM: "#F2C94C",
    HIGH: "#EB5757",
};

const LABELS = {
    LOW: "Низок ризик",
    MEDIUM: "Среден ризик",
    HIGH: "Висок ризик",
};

function getColor(risk) {
    return COLORS[risk] || "#1E8E5A";
}

export default function DashboardPage() {
    const [trees, setTrees] = useState([]);

    useEffect(() => {
        api.get("/trees").then((res) => {
            setTrees(res.data.results || res.data);
        });
    }, []);

    const stats = useMemo(() => {
        const low = trees.filter((t) => t.risk_category === "LOW").length;
        const medium = trees.filter((t) => t.risk_category === "MEDIUM").length;
        const high = trees.filter((t) => t.risk_category === "HIGH").length;

        const avgRisk =
            trees.length > 0
                ? Math.round(
                    trees.reduce((sum, t) => sum + Number(t.risk_score || 0), 0) /
                    trees.length
                )
                : 0;

        const dangerous = trees.filter((t) => t.is_dangerous).length;

        const visionTrees = trees.filter((t) => t.ai_vision_score != null);
        const avgVision =
            visionTrees.length > 0
                ? (
                    visionTrees.reduce((s, t) => s + t.ai_vision_score, 0) /
                    visionTrees.length
                ).toFixed(1)
                : null;

        return {low, medium, high, avgRisk, dangerous, avgVision, visionTrees};
    }, [trees]);

    const categoryStats = ["LOW", "MEDIUM", "HIGH"].map((name) => ({
        name,
        value: trees.filter((t) => t.risk_category === name).length,
    }));

    const total = trees.length || 1;
    const pct = (v) => Math.round((v / total) * 100) + "%";

    const pieData = {
        labels: ["Висок", "Среден", "Низок"],
        datasets: [{
            data: [stats.high, stats.medium, stats.low],
            backgroundColor: ["#EB5757", "#F2C94C", "#1E8E5A"],
            borderWidth: 2,
            borderColor: "#fff",
            hoverOffset: 6,
        }],
    };

    const barData = {
        labels: ["Низок", "Среден", "Висок"],
        datasets: [{
            data: [stats.low, stats.medium, stats.high],
            backgroundColor: ["#1E8E5A", "#F2C94C", "#EB5757"],
            borderRadius: 6,
            borderSkipped: false,
        }],
    };

    const chartOpts = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {legend: {display: false}},
    };

    const barOpts = {
        ...chartOpts,
        plugins: {...chartOpts.plugins, tooltip: {callbacks: {label: (ctx) => ` ${ctx.parsed.y} дрва`}}},
        scales: {
            x: {grid: {display: false}, border: {display: false}, ticks: {color: "#6b7280", font: {size: 12}}},
            y: {
                grid: {color: "rgba(0,0,0,0.06)"},
                border: {display: false},
                ticks: {color: "#6b7280", font: {size: 12}, stepSize: 1}
            },
        },
    };

    const priorityTrees = [...trees]
        .sort((a, b) => Number(b.risk_score || 0) - Number(a.risk_score || 0))
        .slice(0, 5);

    return (
        <div className="space-y-5">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Контролна табла</h2>
                    <p className="text-sm text-gray-500">
                        Преглед на ризични дрва и AI анализа
                    </p>
                </div>
                <a href="/trees/new" className="bg-black text-white px-4 py-2 rounded-lg text-sm">
                    + Додади ново дрво
                </a>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Вкупно дрва</p>
                        <h3 className="text-2xl font-bold">{trees.length}</h3>
                    </div>
                    <div className="bg-[#dbeafe] p-2 rounded-md flex items-center justify-center">
                        <img src={treeBlue} alt="Total trees" className="w-5 h-5"/>
                    </div>
                </div>

                <div className="card flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Висок ризик</p>
                        <h3 className="text-2xl font-bold text-red-500">{stats.high}</h3>
                    </div>
                    <div className="bg-[#ffe2e2] p-2 rounded-md flex items-center justify-center">
                        <img src={infoRed} alt="High Risk" className="w-5 h-5"/>
                    </div>
                </div>

                <div className="card flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Просечен ризик</p>
                        <h3 className="text-2xl font-bold text-yellow-500">{stats.avgRisk}</h3>
                    </div>
                    <div className="bg-[#fef9c2] p-2 rounded-md flex items-center justify-center">
                        <img src={risk} alt="Average Risk" className="w-5 h-5"/>
                    </div>
                </div>

                <div className="card flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Активни известувања</p>
                        <h3 className="text-2xl font-bold text-orange-500">{stats.high}</h3>
                    </div>
                    <div className="bg-[#ffedd4] p-2 rounded-md flex items-center justify-center">
                        <img src={wind} alt="Active notifications" className="w-5 h-5"/>
                    </div>
                </div>
            </div>

            {/* MAP + PIE */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="card xl:col-span-2">
                    <h3 className="font-semibold mb-3">Мапа на дрва</h3>
                    <div className="h-[420px] rounded-xl overflow-hidden">
                        <MapContainer center={[41.9981, 21.4254]} zoom={12} className="h-full w-full">
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                            {trees.map((tree) => (
                                <CircleMarker
                                    key={tree.id}
                                    center={[tree.latitude, tree.longitude]}
                                    radius={9}
                                    pathOptions={{
                                        color: getColor(tree.risk_category),
                                        fillColor: getColor(tree.risk_category),
                                        fillOpacity: 0.9,
                                    }}
                                >
                                    <Popup>
                                        <div className="text-sm space-y-1">
                                            <p className="font-bold">{tree.species}</p>
                                            <p>Координати: {tree.latitude}, {tree.longitude}</p>
                                            <p>Висина: {tree.height} m</p>
                                            <p>Наклон: {tree.tilt}°</p>
                                            <p>
                                                Ризик:{" "}
                                                <b style={{color: getColor(tree.risk_category)}}>
                                                    {Math.round(tree.risk_score)} - {LABELS[tree.risk_category]}
                                                </b>
                                            </p>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            ))}
                        </MapContainer>
                    </div>
                </div>

                {/* PIE */}
                <div className="card flex flex-col">
                    <p className="font-semibold mb-1">Дистрибуција на ризик</p>
                    <p className="text-xs text-gray-500 mb-3">По категорија на ризик</p>
                    <div className="flex gap-3 flex-wrap mb-3">
                        {[["#EB5757", "Висок", pct(stats.high)], ["#F2C94C", "Среден", pct(stats.medium)], ["#1E8E5A", "Низок", pct(stats.low)]].map(([c, l, p]) => (
                            <span key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span style={{width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block"}}/>
                                {l} <strong className="text-gray-800">{p}</strong>
              </span>
                        ))}
                    </div>
                    <div className="flex-1 flex items-center justify-center"
                         style={{position: "relative", minHeight: 220}}>
                        <div style={{position: "relative", width: "100%", maxWidth: 260, height: 220}}>
                            <Doughnut data={pieData} options={{
                                ...chartOpts,
                                cutout: "62%",
                                plugins: {
                                    legend: {display: false},
                                    tooltip: {callbacks: {label: (ctx) => ` ${ctx.label}: ${ctx.parsed} дрва (${pct(ctx.parsed)})`}}
                                }
                            }}/>
                        </div>
                    </div>
                </div>
            </div>

            {/* BAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card h-80 flex flex-col">
                    <p className="font-semibold mb-1">Дрва по категорија</p>
                    <p className="text-xs text-gray-500 mb-3">Број на дрва по ниво на ризик</p>
                    <div className="flex gap-3 flex-wrap mb-3">
                        {[["#1E8E5A", "Низок ризик"], ["#F2C94C", "Среден ризик"], ["#EB5757", "Висок ризик"]].map(([c, l]) => (
                            <span key={l} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span style={{width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block"}}/>
                                {l}
              </span>
                        ))}
                    </div>
                    <div className="flex-1" style={{position: "relative"}}>
                        <BarCJ data={barData} options={barOpts}/>
                    </div>
                </div>

                {stats.avgVision && (
                    <div className="card">
                        <h3 className="text-sm text-gray-500">Просечен AI Vision резултат</h3>
                        <div className="text-2xl font-bold">{stats.avgVision}</div>
                        <p className="text-xs text-gray-400 mt-1">
                            од {stats.visionTrees.length} дрва со анализа на слика
                        </p>
                    </div>
                )}
            </div>

            {/* PRIORITY LIST */}
            <PriorityList trees={priorityTrees}/>
        </div>
    );
}