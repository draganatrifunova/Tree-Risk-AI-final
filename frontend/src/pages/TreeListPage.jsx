import {useEffect, useMemo, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import api from "../services/api";

/* ── Constants ── */
const riskBadge = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-red-100 text-red-700",
};
const healthBadge = {
    GOOD: "bg-blue-100 text-blue-700",
    FAIR: "bg-yellow-100 text-yellow-700",
    POOR: "bg-orange-100 text-orange-700",
};
const healthLabel = {GOOD: "Добра", FAIR: "Средна", POOR: "Лоша"};
const HEALTH_OPTIONS = [
    {value: "GOOD", label: "Добра"},
    {value: "FAIR", label: "Средна"},
    {value: "POOR", label: "Лоша"},
];
const CAT_COLOR = {LOW: "#1E8E5A", MEDIUM: "#F2C94C", HIGH: "#EB5757"};
const WEIGHT_MAX = {ai_vision: 0.40, tilt: 0.20, health: 0.15, weather: 0.15, height: 0.10};
const LABEL = {ai_vision: "AI Vision", tilt: "Tilt", health: "Health", weather: "Weather", height: "Height"};

/* ── Icons ── */
function IconEye() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
    );
}

function IconEdit() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
    );
}

function IconTrash() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
    );
}

function IconX() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
        </svg>
    );
}

function IconFlag() {
    return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V4m0 0l6-1 6 1 6-1v13l-6 1-6-1-6 1V4z"/>
        </svg>
    );
}

/* ── View Modal (Nela) ── */
function ViewModal({tree, onClose}) {
    if (!tree) return null;
    const rows = [
        ["ID", `#${tree.id}`],
        ["Вид", tree.species],
        ["Географска ширина", tree.latitude],
        ["Географска должина", tree.longitude],
        ["Висина", `${tree.height} м`],
        ["Наклон", `${tree.tilt}°`],
        ["Здравствена состојба", healthLabel[tree.health_condition] || tree.health_condition],
        ["Ризик скор", Math.round(tree.risk_score)],
        ["Ризик категорија", tree.risk_category],
        ["Последна проверка", tree.created_at ? new Date(tree.created_at).toLocaleDateString() : "-"],
    ];
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-text">Детали за дрво #{tree.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><IconX/></button>
                </div>
                <div className="px-6 py-4 space-y-3">
                    {rows.map(([label, value]) => (
                        <div key={label} className="flex justify-between text-sm">
                            <span className="text-gray-500">{label}:</span>
                            <span className="font-medium text-text">{value}</span>
                        </div>
                    ))}
                    <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-500">Здравје:</span>
                        <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${healthBadge[tree.health_condition] || "bg-gray-100 text-gray-700"}`}>
              {tree.health_condition}
            </span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                        <span className="text-gray-500">Ризик:</span>
                        <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${riskBadge[tree.risk_category] || "bg-gray-100 text-gray-700"}`}>
              {Math.round(tree.risk_score)} / {tree.risk_category}
            </span>
                    </div>
                </div>
                <div className="px-6 py-4 border-t flex justify-end">
                    <button onClick={onClose}
                            className="bg-text text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">
                        Затвори
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Edit Modal (Nela) ── */
function EditModal({tree, onClose, onSaved}) {
    const [form, setForm] = useState({
        species: tree.species || "",
        latitude: tree.latitude || "",
        longitude: tree.longitude || "",
        height: tree.height || "",
        tilt: tree.tilt || "",
        health_condition: tree.health_condition || "GOOD",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const set = (k, v) => setForm((f) => ({...f, [k]: v}));

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await api.put(`/trees/${tree.id}/`, {
                species: form.species,
                latitude: parseFloat(form.latitude),
                longitude: parseFloat(form.longitude),
                height: parseFloat(form.height),
                tilt: parseFloat(form.tilt),
                health_condition: form.health_condition,
            });
            onSaved();
        } catch (err) {
            setError(err.response?.data?.detail || "Грешка при зачувување.");
        } finally {
            setLoading(false);
        }
    };

    const field = (label, key, type = "text", extra = {}) => (
        <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
            <input
                type={type}
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                {...extra}
            />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-text">Уреди дрво #{tree.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><IconX/></button>
                </div>
                <form onSubmit={submit}>
                    <div className="px-6 py-4 space-y-3">
                        {error && <p className="text-danger text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                        {field("Вид на дрво", "species")}
                        <div className="grid grid-cols-2 gap-3">
                            {field("Географска ширина", "latitude", "number", {step: "any"})}
                            {field("Географска должина", "longitude", "number", {step: "any"})}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {field("Висина (м)", "height", "number", {min: 0, step: "0.1"})}
                            {field("Наклон (°)", "tilt", "number", {min: 0, max: 90, step: "0.1"})}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Здравствена состојба</label>
                            <select
                                value={form.health_condition}
                                onChange={(e) => set("health_condition", e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                            >
                                {HEALTH_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t flex justify-end gap-3">
                        <button type="button" onClick={onClose}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                            Откажи
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
                        >
                            {loading ? "Зачувување..." : "Зачувај"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ── Delete Modal (Nela) ── */
function DeleteModal({tree, onClose, onDeleted}) {
    const [loading, setLoading] = useState(false);

    const confirm = async () => {
        setLoading(true);
        try {
            await api.delete(`/trees/${tree.id}/`);
            onDeleted();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
                <div className="px-6 py-5 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <IconTrash/>
                    </div>
                    <h2 className="text-lg font-semibold text-text mb-1">Избриши дрво #{tree.id}</h2>
                    <p className="text-sm text-gray-500">Дали си сигурна? Оваа акција не може да се поништи.</p>
                </div>
                <div className="px-6 pb-5 flex gap-3">
                    <button onClick={onClose}
                            className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
                        Откажи
                    </button>
                    <button
                        onClick={confirm}
                        disabled={loading}
                        className="flex-1 bg-danger text-white rounded-lg py-2 text-sm font-semibold hover:bg-red-600 disabled:opacity-60"
                    >
                        {loading ? "Бришење..." : "Избриши"}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Score Breakdown (Nikola) ── */
function ScoreBreakdown({breakdown}) {
    if (!breakdown) return null;
    const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
    return (
        <div className="mt-2 space-y-1 bg-gray-50 rounded p-2">
            {entries.map(([key, val]) => {
                const pct = Math.round((val / (WEIGHT_MAX[key] || 0.40)) * 100);
                return (
                    <div key={key} className="flex items-center gap-2 text-xs">
                        <span className="w-20 text-gray-500">{LABEL[key] || key}</span>
                        <div className="flex-1 bg-gray-200 rounded h-1.5">
                            <div className="h-1.5 rounded bg-primary" style={{width: `${pct}%`}}/>
                        </div>
                        <span className="w-8 text-right font-mono text-gray-600">{(val * 100).toFixed(1)}</span>
                    </div>
                );
            })}
        </div>
    );
}

/* ── Main Page ── */
export default function TreeListPage() {
    const [trees, setTrees] = useState([]);
    const [search, setSearch] = useState("");
    const [riskFilter, setRiskFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("RISK_DESC");
    const [activeTab, setActiveTab] = useState("first"); // "first" | "second"

    const isAuthenticated = !!localStorage.getItem("access");
    const navigate = useNavigate();

    // Nela modals
    const [viewTree, setViewTree] = useState(null);
    const [editTree, setEditTree] = useState(null);
    const [deleteTree, setDeleteTree] = useState(null);

    // Nikola recalculate state
    const [calculating, setCalculating] = useState(null);
    const [results, setResults] = useState({});

    useEffect(() => {
        fetchTrees();
    }, []);

    const fetchTrees = async () => {
        const res = await api.get("/trees/");
        setTrees(res.data.results || res.data);
    };

    const filteredTrees = useMemo(() => {
        let data = [...trees];
        if (search.trim()) data = data.filter((t) => t.species?.toLowerCase().includes(search.toLowerCase()));
        if (riskFilter !== "ALL") data = data.filter((t) => t.risk_category === riskFilter);
        if (sortBy === "RISK_DESC") data.sort((a, b) => Number(b.risk_score || 0) - Number(a.risk_score || 0));
        if (sortBy === "RISK_ASC") data.sort((a, b) => Number(a.risk_score || 0) - Number(b.risk_score || 0));
        if (sortBy === "NEWEST") data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return data;
    }, [trees, search, riskFilter, sortBy]);

    const recalculate = async (treeId) => {
        setCalculating(treeId);
        try {
            const res = await api.post("/risk/calculate/", {tree_id: treeId});
            setResults((prev) => ({...prev, [treeId]: res.data}));
            setTrees((prev) =>
                prev.map((t) =>
                    t.id === treeId
                        ? {
                            ...t,
                            risk_score: res.data.risk_score,
                            risk_category: res.data.risk_category,
                            is_dangerous: res.data.risk_score > 65
                        }
                        : t
                )
            );
        } catch (err) {
            alert("Risk calculation failed: " + (err.response?.data?.detail || err.message));
        } finally {
            setCalculating(null);
        }
    };

    return (
        <div className="space-y-5">
            {/* Modals */}
            {viewTree && <ViewModal tree={viewTree} onClose={() => setViewTree(null)}/>}
            {editTree && (
                <EditModal
                    tree={editTree}
                    onClose={() => setEditTree(null)}
                    onSaved={() => {
                        setEditTree(null);
                        fetchTrees();
                    }}
                />
            )}
            {deleteTree && (
                <DeleteModal
                    tree={deleteTree}
                    onClose={() => setDeleteTree(null)}
                    onDeleted={() => {
                        setDeleteTree(null);
                        fetchTrees();
                    }}
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Листа на дрва</h2>
                    <p className="text-sm text-gray-500">Преглед и управување со сите дрва во системот</p>
                </div>
                <div className="flex gap-2">
                    {isAuthenticated && (
                        <Link to="/report-tree" className="border border-orange-400 text-orange-600 px-4 py-2 rounded-lg text-sm hover:bg-orange-50">
                            ⚑ Пријави дрво
                        </Link>
                    )}
                    {isAuthenticated && (
                        <Link to="/trees/new" className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">
                            + Додади дрво
                        </Link>
                    )}
                </div>
            </div>

            {/* Filters (Nela) */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    <input
                        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        placeholder="Пребарај по вид на дрво..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                        value={riskFilter}
                        onChange={(e) => setRiskFilter(e.target.value)}
                    >
                        <option value="ALL">Сите нивоа</option>
                        <option value="LOW">Низок ризик</option>
                        <option value="MEDIUM">Среден ризик</option>
                        <option value="HIGH">Висок ризик</option>
                    </select>
                    <select
                        className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="RISK_DESC">Најризични први</option>
                        <option value="RISK_ASC">Најмал ризик први</option>
                        <option value="NEWEST">Најнови први</option>
                    </select>
                </div>

                <p className="text-sm text-gray-500 mb-3">
                    Прикажани {filteredTrees.length} од {trees.length} дрва
                </p>

                {/* Tabs */}
                <div className="flex border-b mb-4">
                    <button
                        onClick={() => setActiveTab("first")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "first"
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        First View
                    </button>
                    <button
                        onClick={() => setActiveTab("second")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === "second"
                                ? "border-primary text-primary"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Second View
                    </button>
                </div>

                {/* First View — Nela's table */}
                {activeTab === "first" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b text-gray-500">
                            <tr>
                                <th className="text-left py-2 font-medium">ID</th>
                                <th className="text-left py-2 font-medium">Вид</th>
                                <th className="text-left py-2 font-medium">Координати</th>
                                <th className="text-left py-2 font-medium">Висина (m)</th>
                                <th className="text-left py-2 font-medium">Наклон (°)</th>
                                <th className="text-left py-2 font-medium">Здравје</th>
                                <th className="text-left py-2 font-medium">Ризик</th>
                                <th className="text-left py-2 font-medium">Последна проверка</th>
                                <th className="text-left py-2 font-medium">Акции</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredTrees.map((tree) => (
                                <tr key={tree.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 font-semibold text-gray-700">#{tree.id}</td>
                                    <td className="py-3">{tree.species}</td>
                                    <td className="py-3 text-gray-500">
                                        {Number(tree.latitude).toFixed(4)}, {Number(tree.longitude).toFixed(4)}
                                    </td>
                                    <td className="py-3">{tree.height}</td>
                                    <td className="py-3">{tree.tilt}°</td>
                                    <td className="py-3">
                      <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${healthBadge[tree.health_condition] || "bg-gray-100 text-gray-700"}`}>
                        {tree.health_condition}
                      </span>
                                    </td>
                                    <td className="py-3">
                      <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${riskBadge[tree.risk_category] || "bg-gray-100 text-gray-700"}`}>
                        {Math.round(tree.risk_score)} / {tree.risk_category}
                      </span>
                                    </td>
                                    <td className="py-3 text-gray-500">
                                        {tree.created_at ? new Date(tree.created_at).toLocaleDateString() : "-"}
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setViewTree(tree)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                title="Преглед"
                                            >
                                                <IconEye/>
                                            </button>
                                            {isAuthenticated && (
                                                <button
                                                    onClick={() => navigate(`/report-tree?treeId=${tree.id}`)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                                                    title="Пријави дрво"
                                                >
                                                    <IconFlag/>
                                                </button>
                                            )}
                                            {isAuthenticated && (
                                                <button
                                                    onClick={() => setEditTree(tree)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary hover:bg-green-50 transition-colors"
                                                    title="Уреди"
                                                >
                                                    <IconEdit/>
                                                </button>
                                            )}
                                            {isAuthenticated && (
                                                <button
                                                    onClick={() => setDeleteTree(tree)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-danger hover:bg-red-50 transition-colors"
                                                    title="Избриши"
                                                >
                                                    <IconTrash/>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!filteredTrees.length && (
                                <tr>
                                    <td colSpan="9" className="py-8 text-gray-400 text-center">
                                        Нема пронајдени дрва.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Second View — Nikola's cards */}
                {activeTab === "second" && (
                    <div>
                        {filteredTrees.map((tree) => {
                            const result = results[tree.id];
                            const catColor = CAT_COLOR[tree.risk_category];
                            return (
                                <div className="py-3 border-b last:border-0" key={tree.id}>
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium">{tree.species}</span>
                                                {tree.is_dangerous && (
                                                    <span
                                                        className="text-xs text-danger font-semibold">⚠ Dangerous</span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                h={tree.height}m · tilt={tree.tilt}° · {tree.health_condition}
                                            </div>
                                            {tree.ai_vision_score != null && (
                                                <div className="text-xs text-gray-400 mt-0.5">
                                                    AI Vision: {Math.round(tree.ai_vision_score)}
                                                    {result && (
                                                        <span
                                                            className="text-gray-500"> → Hybrid: {result.risk_score}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                      <span
                          className="text-sm font-semibold px-2 py-0.5 rounded whitespace-nowrap"
                          style={{background: catColor + "22", color: catColor}}
                      >
                        {Math.round(tree.risk_score)} · {tree.risk_category}
                      </span>
                                            <button
                                                onClick={() => recalculate(tree.id)}
                                                disabled={calculating === tree.id}
                                                className="text-xs bg-primary text-white rounded px-3 py-1 disabled:opacity-50 whitespace-nowrap"
                                            >
                                                {calculating === tree.id ? "Calculating…" : "Recalculate"}
                                            </button>
                                        </div>
                                    </div>
                                    {result && (
                                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                        <span>
                          Weather:{" "}
                            <span
                                className="font-semibold px-1.5 py-0.5 rounded"
                                style={
                                    result.weather_source === "openweather"
                                        ? {background: "#1E8E5A22", color: "#1E8E5A"}
                                        : {background: "#F2C94C22", color: "#b8960a"}
                                }
                            >
                            {result.weather_source === "openweather" ? "Live" : "Manual"}
                          </span>
                        </span>
                                                {result.weather_source === "manual" && (
                                                    <span className="text-yellow-600">Add OPENWEATHER_API_KEY for live data</span>
                                                )}
                                            </div>
                                            <ScoreBreakdown breakdown={result.score_breakdown}/>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {!filteredTrees.length && (
                            <p className="text-sm text-gray-500 py-4 text-center">Нема пронајдени дрва.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}