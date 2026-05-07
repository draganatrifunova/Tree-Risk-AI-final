import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const HEALTH_OPTIONS = [
    { value: "GOOD", label: "Добра" },
    { value: "FAIR", label: "Средна" },
    { value: "POOR", label: "Лоша" },
];

function calcRisk(form) {
    let score = 0;
    const h = parseFloat(form.height) || 0;
    const tilt = parseFloat(form.tilt) || 0;
    if (form.health_condition === "FAIR") score += 10;
    if (form.health_condition === "POOR") score += 25;
    score += Math.floor(h / 5) * 3;
    score += Math.floor(tilt / 5) * 5;
    return Math.min(score, 100);
}

function riskColor(score) {
    if (score < 30) return "text-primary";
    if (score < 60) return "text-warning";
    return "text-danger";
}

export default function AddTreePage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        species: "",
        latitude: "",
        longitude: "",
        height: "",
        tilt: "",
        health_condition: "GOOD",
        notes: "",
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const riskScore = calcRisk(form);

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImagePreview(URL.createObjectURL(file));
    };

    const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

    const submit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const payload = {
                species: form.species,
                latitude: parseFloat(form.latitude),
                longitude: parseFloat(form.longitude),
                height: parseFloat(form.height),
                tilt: parseFloat(form.tilt),
                health_condition: form.health_condition,
            };
            await api.post("/trees/", payload);
            navigate("/trees");
        } catch (err) {
            setError(err.response?.data?.detail || "Грешка при зачувување.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary">
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/trees" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3">
                        <span>←</span> Назад
                    </Link>
                    <h1 className="text-3xl font-bold text-text">Додади ново дрво</h1>
                    <p className="text-gray-500 mt-1">Внесете ги податоците за новото дрво во системот</p>
                </div>

                <form onSubmit={submit}>
                    <div className="flex gap-6 items-start">
                        {/* Left — main form */}
                        <div className="flex-1 space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-danger rounded-xl px-4 py-3 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Basic info */}
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-text mb-4">Основни информации</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Вид на дрво <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            required
                                            value={form.species}
                                            onChange={(e) => set("species", e.target.value)}
                                            placeholder="На пр. Даб, Бор, Јавор..."
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Здравствена состојба <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            value={form.health_condition}
                                            onChange={(e) => set("health_condition", e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                                        >
                                            {HEALTH_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-text mb-4">Локација</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Географска ширина (Latitude) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            step="any"
                                            value={form.latitude}
                                            onChange={(e) => set("latitude", e.target.value)}
                                            placeholder="На пр. 41.9973"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Географска должина (Longitude) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            step="any"
                                            value={form.longitude}
                                            onChange={(e) => set("longitude", e.target.value)}
                                            placeholder="На пр. 21.4280"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Physical */}
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-text mb-4">Физички карактеристики</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Висина (метри) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={form.height}
                                            onChange={(e) => set("height", e.target.value)}
                                            placeholder="На пр. 25"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">
                                            Наклон (степени) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            max="90"
                                            step="0.1"
                                            value={form.tilt}
                                            onChange={(e) => set("tilt", e.target.value)}
                                            placeholder="На пр. 15"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h2 className="text-lg font-semibold text-text mb-4">Дополнителни забелешки</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Забелешки</label>
                                    <textarea
                                        rows={4}
                                        value={form.notes}
                                        onChange={(e) => set("notes", e.target.value)}
                                        placeholder="Дополнителни информации за дрвото..."
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right — image + risk */}
                        <div className="w-72 shrink-0 space-y-5">
                            {/* Image upload */}
                            <div className="bg-white rounded-2xl shadow-sm p-5">
                                <h2 className="text-base font-semibold text-text mb-3">Слика на дрво</h2>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors min-h-[140px]"
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                                    ) : (
                                        <>
                                            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            <p className="text-sm font-medium text-gray-500">Кликни за да прикачиш слика</p>
                                            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG до 10MB</p>
                                        </>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                            </div>

                            {/* Risk preview */}
                            <div className="bg-white rounded-2xl shadow-sm p-5">
                                <h2 className="text-base font-semibold text-text mb-3">Претпоставен ризик</h2>
                                <div className={`text-5xl font-bold text-center my-4 ${riskColor(riskScore)}`}>
                                    {riskScore}
                                </div>
                                <p className="text-xs text-gray-400 text-center mb-4">Автоматски пресметан ризик-скор</p>
                                <div className="space-y-2 text-sm border-t pt-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Здравствена состојба:</span>
                                        <span className="font-medium">
                                            {HEALTH_OPTIONS.find((o) => o.value === form.health_condition)?.label}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Висина:</span>
                                        <span className="font-medium">{form.height || 0} м</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Наклон:</span>
                                        <span className="font-medium">{form.tilt || 0}°</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-text text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-60"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                {loading ? "Зачувување..." : "Зачувај дрво"}
                            </button>
                            <Link to="/trees" className="block text-center text-sm text-gray-500 hover:text-gray-700 py-2">
                                Откажи
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}