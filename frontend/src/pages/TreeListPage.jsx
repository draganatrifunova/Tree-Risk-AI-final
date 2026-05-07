import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

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

const healthLabel = { GOOD: "Добра", FAIR: "Средна", POOR: "Лоша" };

const HEALTH_OPTIONS = [
  { value: "GOOD", label: "Добра" },
  { value: "FAIR", label: "Средна" },
  { value: "POOR", label: "Лоша" },
];

/* ── Icon components ── */
function IconEye() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
function IconX() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/* ── View Modal ── */
function ViewModal({ tree, onClose }) {
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><IconX /></button>
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
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${healthBadge[tree.health_condition] || "bg-gray-100 text-gray-700"}`}>
              {tree.health_condition}
            </span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-gray-500">Ризик:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${riskBadge[tree.risk_category] || "bg-gray-100 text-gray-700"}`}>
              {Math.round(tree.risk_score)} / {tree.risk_category}
            </span>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end">
          <button onClick={onClose} className="bg-text text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">
            Затвори
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Edit Modal ── */
function EditModal({ tree, onClose, onSaved }) {
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

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><IconX /></button>
        </div>
        <form onSubmit={submit}>
          <div className="px-6 py-4 space-y-3">
            {error && <p className="text-danger text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            {field("Вид на дрво", "species")}
            <div className="grid grid-cols-2 gap-3">
              {field("Географска ширина", "latitude", "number", { step: "any" })}
              {field("Географска должина", "longitude", "number", { step: "any" })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {field("Висина (м)", "height", "number", { min: 0, step: "0.1" })}
              {field("Наклон (°)", "tilt", "number", { min: 0, max: 90, step: "0.1" })}
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
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
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

/* ── Delete Confirm Modal ── */
function DeleteModal({ tree, onClose, onDeleted }) {
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
            <IconTrash />
          </div>
          <h2 className="text-lg font-semibold text-text mb-1">Избриши дрво #{tree.id}</h2>
          <p className="text-sm text-gray-500">Дали си сигурна? Оваа акција не може да се поништи.</p>
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
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

/* ── Main Page ── */
export default function TreeListPage() {
  const [trees, setTrees] = useState([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("RISK_DESC");

  const [viewTree, setViewTree] = useState(null);
  const [editTree, setEditTree] = useState(null);
  const [deleteTree, setDeleteTree] = useState(null);

  useEffect(() => { fetchTrees(); }, []);

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

  return (
    <div className="space-y-5">
      {/* Modals */}
      {viewTree && <ViewModal tree={viewTree} onClose={() => setViewTree(null)} />}
      {editTree && (
        <EditModal
          tree={editTree}
          onClose={() => setEditTree(null)}
          onSaved={() => { setEditTree(null); fetchTrees(); }}
        />
      )}
      {deleteTree && (
        <DeleteModal
          tree={deleteTree}
          onClose={() => setDeleteTree(null)}
          onDeleted={() => { setDeleteTree(null); fetchTrees(); }}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Листа на дрва</h2>
          <p className="text-sm text-gray-500">Преглед и управување со сите дрва во системот</p>
        </div>
        <Link to="/trees/new" className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">
          + Додади дрво
        </Link>
      </div>

      {/* Filters */}
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
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${healthBadge[tree.health_condition] || "bg-gray-100 text-gray-700"}`}>
                      {tree.health_condition}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${riskBadge[tree.risk_category] || "bg-gray-100 text-gray-700"}`}>
                      {Math.round(tree.risk_score)} / {tree.risk_category}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">
                    {tree.created_at ? new Date(tree.created_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {/* View */}
                      <button
                        onClick={() => setViewTree(tree)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Преглед"
                      >
                        <IconEye />
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => setEditTree(tree)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary hover:bg-green-50 transition-colors"
                        title="Уреди"
                      >
                        <IconEdit />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => setDeleteTree(tree)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-danger hover:bg-red-50 transition-colors"
                        title="Избриши"
                      >
                        <IconTrash />
                      </button>
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
      </div>
    </div>
  );
}
