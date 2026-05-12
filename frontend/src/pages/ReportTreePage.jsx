import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";

export default function ReportTreePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [trees, setTrees] = useState([]);
    const [form, setForm] = useState({
        tree: searchParams.get("treeId") || "",
        latitude: "",
        longitude: "",
        description: "",
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const fileRef = useRef();

    useEffect(() => {
        api.get("/trees/").then((res) => setTrees(res.data.results || res.data));
    }, []);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!form.description.trim()) {
            setError("Описот е задолжителен.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = new FormData();
            if (form.tree) data.append("tree", form.tree);
            if (form.latitude) data.append("latitude", form.latitude);
            if (form.longitude) data.append("longitude", form.longitude);
            data.append("description", form.description);
            if (image) data.append("image", image);

            await api.post("/trees/reports/", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || "Грешка при испраќање.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
                <h2 className="text-xl font-bold">Пријавата е испратена!</h2>
                <p className="text-gray-500 text-sm">Нашиот тим ќе ја прегледа вашата пријава наскоро.</p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => { setSuccess(false); setForm({ tree: "", latitude: "", longitude: "", description: "" }); setImage(null); setPreview(null); }}
                        className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                    >
                        Нова пријава
                    </button>
                    <button
                        onClick={() => navigate("/trees")}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm"
                    >
                        Назад кон листата
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            <div>
                <h2 className="text-2xl font-bold">Пријави сомнително дрво</h2>
                <p className="text-sm text-gray-500">Помогни ни да ги идентификуваме ризичните дрва во градот</p>
            </div>

            <div className="card">
                <form onSubmit={submit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
                    )}

                    {/* Tree reference */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Поврзи со постоечко дрво (незадолжително)
                        </label>
                        <select
                            value={form.tree}
                            onChange={(e) => set("tree", e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                        >
                            <option value="">— Не е познато / Ново дрво —</option>
                            {trees.map((t) => (
                                <option key={t.id} value={t.id}>
                                    #{t.id} · {t.species} ({Number(t.latitude).toFixed(4)}, {Number(t.longitude).toFixed(4)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Географска ширина</label>
                            <input
                                type="number"
                                step="any"
                                placeholder="пр. 41.9981"
                                value={form.latitude}
                                onChange={(e) => set("latitude", e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Географска должина</label>
                            <input
                                type="number"
                                step="any"
                                placeholder="пр. 21.4254"
                                value={form.longitude}
                                onChange={(e) => set("longitude", e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Опис <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows={4}
                            placeholder="Опишете зошто мислите дека ова дрво е ризично (наклон, скршени гранки, оштетување на стеблото...)"
                            value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        />
                    </div>

                    {/* Image upload */}
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Фотографија (незадолжително)</label>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFile}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileRef.current.click()}
                            className="border border-dashed border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-500 hover:border-primary hover:text-primary w-full text-left"
                        >
                            {image ? `📷 ${image.name}` : "📷 Прикачи фотографија"}
                        </button>
                        {preview && (
                            <img src={preview} alt="preview" className="mt-2 rounded-lg h-40 object-cover w-full" />
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                        >
                            Откажи
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-orange-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-60"
                        >
                            {loading ? "Испраќање..." : "Испрати пријава"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
