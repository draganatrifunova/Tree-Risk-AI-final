import { useEffect, useMemo, useState } from "react";
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

export default function TreeListPage() {
  const [trees, setTrees] = useState([]);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("RISK_DESC");

  useEffect(() => {
    fetchTrees();
  }, []);

  const fetchTrees = async () => {
    const res = await api.get("/trees/");
    setTrees(res.data.results || res.data);
  };

  const filteredTrees = useMemo(() => {
    let data = [...trees];

    if (search.trim()) {
      data = data.filter((tree) =>
        tree.species?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (riskFilter !== "ALL") {
      data = data.filter((tree) => tree.risk_category === riskFilter);
    }

    if (sortBy === "RISK_DESC") {
      data.sort((a, b) => Number(b.risk_score || 0) - Number(a.risk_score || 0));
    }

    if (sortBy === "RISK_ASC") {
      data.sort((a, b) => Number(a.risk_score || 0) - Number(b.risk_score || 0));
    }

    if (sortBy === "NEWEST") {
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return data;
  }, [trees, search, riskFilter, sortBy]);

  const deleteTree = async (id) => {
    if (!confirm("Дали си сигурна дека сакаш да го избришеш дрвото?")) return;

    await api.delete(`/trees/${id}/`);
    fetchTrees();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Листа на дрва</h2>
          <p className="text-sm text-gray-500">
            Преглед и управување со сите дрва во системот
          </p>
        </div>

        <a
          href="/trees/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm"
        >
          Додади дрво
        </a>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Пребарај по вид на дрво..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border rounded-lg px-3 py-2"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="ALL">Сите нивоа</option>
            <option value="LOW">Низок ризик</option>
            <option value="MEDIUM">Среден ризик</option>
            <option value="HIGH">Висок ризик</option>
          </select>

          <select
            className="border rounded-lg px-3 py-2"
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
                <th className="text-left py-2">ID</th>
                <th className="text-left py-2">Вид</th>
                <th className="text-left py-2">Координати</th>
                <th className="text-left py-2">Висина (m)</th>
                <th className="text-left py-2">Наклон (°)</th>
                <th className="text-left py-2">Здравје</th>
                <th className="text-left py-2">Ризик</th>
                <th className="text-left py-2">Последна проверка</th>
                <th className="text-left py-2">Акции</th>
              </tr>
            </thead>

            <tbody>
              {filteredTrees.map((tree) => (
                <tr key={tree.id} className="border-b last:border-0">
                  <td className="py-3 font-semibold">#{tree.id}</td>
                  <td>{tree.species}</td>
                  <td>
                    {Number(tree.latitude).toFixed(4)},{" "}
                    {Number(tree.longitude).toFixed(4)}
                  </td>
                  <td>{tree.height}</td>
                  <td>{tree.tilt}°</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        healthBadge[tree.health_condition] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {tree.health_condition}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        riskBadge[tree.risk_category] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {Math.round(tree.risk_score)} / {tree.risk_category}
                    </span>
                  </td>
                  <td>
                    {tree.created_at
                      ? new Date(tree.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <div className="flex gap-3">
                      <button title="Details">👁</button>
                      <button title="Edit">✏️</button>
                      <button
                        title="Delete"
                        className="text-red-500"
                        onClick={() => deleteTree(tree.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!filteredTrees.length && (
                <tr>
                  <td colSpan="9" className="py-5 text-gray-500 text-center">
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