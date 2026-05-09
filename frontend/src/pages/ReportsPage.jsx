import api from "../services/api.js";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, } from "react-leaflet";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import PriorityList from "../components/PriorityList";

import calendar from "../assets/images/calendar.svg"
import filter from "../assets/images/filter.svg"
import report from "../assets/images/report-file.svg"
import downloadIcon from "../assets/images/download.svg"
import reportBlue from "../assets/images/report-blue.svg"
import checkcircle from "../assets/images/check-circle.svg"
import infoRed from "../assets/images/info-triangle-red.svg";
import treeBlue from "../assets/images/tree-blue.svg";
import risk from "../assets/images/risk.svg";
import wind from "../assets/images/wind.svg"

const COLORS = {
    LOW: "#22c55e",
    MEDIUM: "#facc15",
    HIGH: "#ef4444",
};

const LABELS = {
    LOW: "Низок ризик",
    MEDIUM: "Среден ризик",
    HIGH: "Висок ризик",
};

function getColor(risk) {
    return COLORS[risk] || "#22c55e";
}

export default function ReportsPage() {
    const [type, setType] = useState("all");
    const [period, setPeriod] = useState("today");
    const [trees, setTrees] = useState([]);
    const [appliedType, setAppliedType] = useState("all");
    const [appliedPeriod, setAppliedPeriod] = useState("today");

    const download = async () => {
        const res = await api.get("/reports/generate/", {
            responseType: "blob"
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "tree-risk-report.pdf");
        document.body.appendChild(link);
        link.click();
    };

    const fetchTrees = async () => {
        const res = await api.get("/trees", {
            params: { period: appliedPeriod, type: appliedType }
        });
        setTrees(res.data.results || res.data);
    };

    useEffect(() => {
        fetchTrees();
    }, []);

    const filteredTrees = useMemo(() => {
        const now = new Date();

        return trees.filter(t => {
            const created = new Date(t.created_at);
            if (period === "today") {
                return created.toDateString() === now.toDateString();
            }
            if (period === "week") {
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                return created >= weekAgo;
            }
            if (period === "month") {
                const monthAgo = new Date();
                monthAgo.setMonth(now.getMonth() - 1);
                return created >= monthAgo;
            }
            return true;
        });
    }, [trees, period]);

    const finalTrees = useMemo(() => {
        let data = filteredTrees;
        if (type === "risk") {
            data = data.filter(t => t.risk_category === "HIGH" || t.risk_category === "MEDIUM");
        }
        if (type === "healthy") {
            data = data.filter(t => t.risk_category === "LOW");
        }
        return data;
    }, [filteredTrees, type]);

    const stats = useMemo(() => {
        const total = finalTrees.length;
        const low = finalTrees.filter((t) => t.risk_category === "LOW").length;
        const medium = finalTrees.filter((t) => t.risk_category === "MEDIUM").length;
        const high = finalTrees.filter((t) => t.risk_category === "HIGH").length;
        const highPercent = total ? ((high / total) * 100).toFixed(0) : 0;
        const lowPercent = total ? ((low / total) * 100).toFixed(0) : 0;
        const avgRisk =
            finalTrees.length > 0
                ? Math.round(
                    finalTrees.reduce((sum, t) => sum + Number(t.risk_score || 0), 0) /
                    finalTrees.length
                )
                : 0;

        const dangerous = finalTrees.filter((t) => t.is_dangerous).length;

        const visionTrees = finalTrees.filter((t) => t.ai_vision_score != null);
        const avgVision =
            visionTrees.length > 0
                ? (
                    visionTrees.reduce((s, t) => s + t.ai_vision_score, 0) /
                    visionTrees.length
                ).toFixed(1)
                : null;

        return { low, medium, high, avgRisk, dangerous, avgVision, visionTrees, highPercent, lowPercent };
    }, [finalTrees]);

    const pieData = [
        { name: "HIGH", value: stats.high },
        { name: "MEDIUM", value: stats.medium },
        { name: "LOW", value: stats.low },
    ];

    const total = pieData.reduce((sum, item) => sum + item.value, 0);

    const labelMap = {
        HIGH: "Висок ризик",
        MEDIUM: "Среден ризик",
        LOW: "Низок ризик",
    };

    const barData = ["LOW", "MEDIUM", "HIGH"].map((name) => ({
        name,
        value: finalTrees.filter((t) => t.risk_category === name).length,
    }));

    const treeRiskBySpecies = useMemo(() => {
        const map = {};

        finalTrees.forEach((t) => {
            const name = t.species || "Непознато";

            if (!map[name]) {
                map[name] = {
                    name,
                    total: 0,
                    HIGH: 0,
                    MEDIUM: 0,
                    LOW: 0,
                };
            }

            map[name].total++;
            map[name][t.risk_category]++;
        });

        return Object.values(map);
    }, [finalTrees]);

    const speciesTable = useMemo(() => {
        const map = {};

        finalTrees.forEach((t) => {
            const key = t.species || "Непознато";

            if (!map[key]) {
                map[key] = {
                    species: key,
                    total: 0,
                    HIGH: 0,
                    MEDIUM: 0,
                    LOW: 0,
                    sumScore: 0,
                };
            }

            map[key].total += 1;
            map[key][t.risk_category] += 1;
            map[key].sumScore += Number(t.risk_score || 0);
        });

        return Object.values(map).map((s) => ({
            ...s,
            avgScore: s.total ? (s.sumScore / s.total).toFixed(1) : 0,
        }));
    }, [finalTrees]);

    const priorityTrees = [...finalTrees]
        .sort((a, b) => Number(b.risk_score || 0) - Number(a.risk_score || 0))
        .slice(0, 5);
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 rounded-lg shadow-md border text-sm">
                    <p className="font-semibold mb-1">{data.name}</p>
                    <p className="text-red-500">
                        Висок ризик: {data.HIGH}
                    </p>
                    <p className="text-yellow-500">
                        Среден ризик: {data.MEDIUM}
                    </p>
                    <p className="text-green-500">
                        Низок ризик: {data.LOW}
                    </p>
                </div>
            );
        }

        return null;
    };

    const recommendations = useMemo(() => {
        const highTrees = finalTrees.filter(t => t.risk_category === "HIGH");
        const mediumTrees = finalTrees.filter(t => t.risk_category === "MEDIUM");
        const lowTrees = finalTrees.filter(t => t.risk_category === "LOW");

        return {
            high: {
                count: highTrees.length,
                ids: highTrees.slice(0, 5).map(t => `#${t.id}`).join(", "),
            },
            medium: {
                count: mediumTrees.length,
            },
            low: {
                count: lowTrees.length,
            },
        };
    }, [finalTrees]);


    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Извештаи и Анализа</h2>
                    <p className="text-sm text-gray-500">
                        Детален преглед на состојбата на дрва и нивоа на ризик
                    </p>
                </div>

                <button className="bg-black text-white px-4 py-2 rounded-lg text-sm  flex items-center gap-2" onClick={download}>
                    <img src={downloadIcon} className="w-4 h-4" />
                    Генерирај извештај
                </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="flex items-center gap-2">
                        <img src={report} className="w-5 h-5 opacity-70" />
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-gray-100 rounded-xl px-3 py-2 text-md text-black font-semibold focus:outline-none focus:ring-2 focus:ring-black/10"
                        >
                            <option value="all">Општ преглед</option>
                            <option value="risk">Само ризични</option>
                            <option value="healthy">Здрави дрва</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <img src={calendar} className="w-5 h-5 opacity-70" />
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="w-full bg-gray-100 rounded-xl px-3 py-2 text-md text-black focus:outline-none focus:ring-2 focus:ring-black/10"
                        >
                            <option value="today">Денес</option>
                            <option value="week">Последна недела</option>
                            <option value="month">Месец</option>
                        </select>
                    </div>

                    <div>
                        <button
                            onClick={() => {
                                setAppliedType(type);
                                setAppliedPeriod(period);
                                fetchTrees();
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-white text-md border border-gray-200 text-gray-700 px-3 py-2  rounded-xl "
                        >
                            <img src={filter} className="w-4 h-4" />
                            Примени филтри
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card flex items-start justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500">Вкупно дрва</p>
                        </div>
                        <h3 className="text-3xl font-bold py-6">{finalTrees.length}</h3>

                        <p className="text-xs text-gray-400">Во база на податоци</p>
                    </div>
                    <div className="bg-[#dbeafe] p-2 rounded-md flex items-center justify-center">
                        <img src={reportBlue} alt="Total trees" className="w-5 h-5" />
                    </div>
                </div>

                <div className="card flex items-start justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500">Висок ризик</p>
                        </div>
                        <h3 className="text-3xl font-bold text-red-500 py-6">{stats.high}</h3>

                        <p className="text-xs text-gray-400">   {stats.highPercent}% од вкупно</p>
                    </div>
                    <div className="bg-[#ffe2e2] p-2 rounded-md flex items-center justify-center">
                        <img src={infoRed} alt="High Risk" className="w-5 h-5" />
                    </div>
                </div>

                <div className="card flex items-start justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500">Просечен ризик</p>
                        </div>
                        <h3 className="text-3xl font-bold text-yellow-500 py-6">
                            {stats.avgRisk}
                        </h3>

                        <p className="text-xs text-gray-400">Скор од 100</p>
                    </div>
                    <div className="bg-[#fef9c2] p-2 rounded-md flex items-center justify-center">
                        <img src={risk} alt="Average Risk" className="w-5 h-5" />
                    </div>
                </div>

                <div className="card flex items-start justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-500">Низок ризик</p>
                        </div>
                        <h3 className="text-3xl font-bold text-green-600 py-6">
                            {stats.low}
                        </h3>

                        <p className="text-xs text-gray-400">  {stats.lowPercent}% од вкупно</p>
                    </div>
                    <div className="bg-[#dbfce7] p-2 rounded-md flex items-center justify-center">
                        <img src={checkcircle} alt="Average Risk" className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <div className="card h-[350px] flex flex-col">
                <h3 className="font-semibold mb-3">Дистрибуција на ризик</h3>
                <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>

                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={90}
                                labelLine={true}
                                label={({ name, percent }) => {
                                    const labelMap = {
                                        HIGH: "Висок ризик",
                                        MEDIUM: "Среден ризик",
                                        LOW: "Низок ризик",
                                    };

                                    return `${labelMap[name]}: ${(percent * 100).toFixed(0)}%`;
                                }}
                            >
                                {pieData.map((e) => (
                                    <Cell key={e.name} fill={getColor(e.name)} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => {
                                    const labelMap = {
                                        HIGH: "Висок ризик",
                                        MEDIUM: "Среден ризик",
                                        LOW: "Низок ризик",
                                    };

                                    return [value, labelMap[name] || name];
                                }}
                            />

                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="card h-[350px] flex flex-col">
                <h3 className="font-semibold mb-3">Ризик по видови на дрва</h3>

                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={treeRiskBySpecies} barCategoryGap={20}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="total"
                            fill="#22c55e"
                            radius={[6, 6, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="card mt-6">
                <h3 className="font-semibold mb-10 ">Детална анализа по категории</h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-100 text-gray-500 bg-gray-100">
                            <tr>
                                <th className="text-start py-2 pl-4">Вид</th>
                                <th className="text-center py-2">Вкупно</th>
                                <th className="text-center py-2">Висок ризик</th>
                                <th className="text-center py-2">Среден ризик</th>
                                <th className="text-center py-2">Мал ризик</th>
                                <th className="text-center py-2">Просечен скор</th>
                            </tr>
                        </thead>

                        <tbody>
                            {speciesTable.map((row) => (
                                <tr key={row.species} className="border-b border-gray-100">
                                    <td className="text-start py-2 font-medium pl-4">{row.species}</td>
                                    <td className="text-center py-2">{row.total}</td>
                                    <td className="text-center py-2">
                                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
                                            {row.HIGH}
                                        </span>
                                    </td>

                                    <td className="text-center py-2">
                                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">
                                            {row.MEDIUM}
                                        </span>
                                    </td>

                                    <td className="text-center py-2">
                                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                            {row.LOW}
                                        </span>
                                    </td>
                                    <td className="text-center py-2 font-semibold">{row.avgScore}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="card mt-6">
                <h3 className="font-semibold mb-10">Препораки врз основа на анализа</h3>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-3">
                    <div className="flex items-start gap-3">
                        <div className="w-3 h-3 mt-1 rounded-full bg-red-500" />
                        <div>
                            <p className="font-semibold text-red-600">
                                Итни интервенции потребни
                            </p>
                            <p className="text-sm text-red-500 mt-1">
                                {recommendations.high.count} дрва со висок ризик бараат итна проверка.
                                Препорачуваме интервенција за: {recommendations.high.ids || "-"}.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-3">
                    <div className="flex items-start gap-3">
                        <div className="w-3 h-3 mt-1 rounded-full bg-yellow-500" />
                        <div>
                            <p className="font-semibold text-yellow-700">
                                Планирана проверка
                            </p>
                            <p className="text-sm text-yellow-600 mt-1">
                                {recommendations.medium.count} дрва со среден ризик треба редовна инспекција.
                                Планирај месечни проверки.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-3 h-3 mt-1 rounded-full bg-green-500" />
                        <div>
                            <p className="font-semibold text-green-700">
                                Рутинско одржување
                            </p>
                            <p className="text-sm text-green-600 mt-1">
                                {recommendations.low.count} дрва со низок ризик се во добра состојба.
                                Продолжи со рутински проверки.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
