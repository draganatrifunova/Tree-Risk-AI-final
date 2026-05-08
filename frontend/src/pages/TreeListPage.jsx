import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const CAT_COLOR = { LOW: "#1E8E5A", MEDIUM: "#F2C94C", HIGH: "#EB5757" };
const WEIGHT_MAX = { ai_vision: 0.40, tilt: 0.20, health: 0.15, weather: 0.15, height: 0.10 };
const LABEL = { ai_vision: "AI Vision", tilt: "Tilt", health: "Health", weather: "Weather", height: "Height" };

function ScoreBreakdown({ breakdown }) {
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
              <div className="h-1.5 rounded bg-primary" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-right font-mono text-gray-600">{(val * 100).toFixed(1)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function TreeListPage() {
  const [trees, setTrees] = useState([]);
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [calculating, setCalculating] = useState(null);
  const [results, setResults] = useState({});

  useEffect(() => {
    api.get("/trees").then((res) => setTrees(res.data.results || res.data));
  }, []);

  const filtered = useMemo(
    () =>
      trees.filter(
        (t) =>
          t.species.toLowerCase().includes(query.toLowerCase()) &&
          (riskFilter === "ALL" || t.risk_category === riskFilter)
      ),
    [trees, query, riskFilter]
  );

  const recalculate = async (treeId) => {
    setCalculating(treeId);
    try {
      const res = await api.post("/risk/calculate/", { tree_id: treeId });
      setResults((prev) => ({ ...prev, [treeId]: res.data }));
      setTrees((prev) =>
        prev.map((t) =>
          t.id === treeId
            ? { ...t, risk_score: res.data.risk_score, risk_category: res.data.risk_category, is_dangerous: res.data.risk_score > 65 }
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
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold">Tree List</h2>
      <div className="card flex gap-2">
        <input
          className="border rounded p-2 flex-1"
          placeholder="Search species"
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="border rounded p-2" onChange={(e) => setRiskFilter(e.target.value)}>
          <option value="ALL">All</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>

      <div className="card">
        {filtered.map((tree) => {
          const result = results[tree.id];
          const catColor = CAT_COLOR[tree.risk_category];
          return (
            <div className="py-3 border-b last:border-0" key={tree.id}>
              <div className="flex justify-between items-start gap-3">
                {/* Left: tree info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{tree.species}</span>
                    {tree.is_dangerous && (
                      <span className="text-xs text-danger font-semibold">⚠ Dangerous</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    h={tree.height}m · tilt={tree.tilt}° · {tree.health_condition}
                  </div>
                  {tree.ai_vision_score != null && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      AI Vision: {Math.round(tree.ai_vision_score)}
                      {result && (
                        <span className="text-gray-500"> → Hybrid: {result.risk_score}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: score badge + button */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="text-sm font-semibold px-2 py-0.5 rounded whitespace-nowrap"
                    style={{ background: catColor + "22", color: catColor }}
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

              {/* Result details */}
              {result && (
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>
                      Weather:{" "}
                      <span
                        className="font-semibold px-1.5 py-0.5 rounded"
                        style={
                          result.weather_source === "openweather"
                            ? { background: "#1E8E5A22", color: "#1E8E5A" }
                            : { background: "#F2C94C22", color: "#b8960a" }
                        }
                      >
                        {result.weather_source === "openweather" ? "Live" : "Manual"}
                      </span>
                    </span>
                    {result.weather_source === "manual" && (
                      <span className="text-yellow-600">Add OPENWEATHER_API_KEY for live data</span>
                    )}
                  </div>
                  <ScoreBreakdown breakdown={result.score_breakdown} />
                </div>
              )}
            </div>
          );
        })}
        {!filtered.length && (
          <p className="text-sm text-gray-500 py-4 text-center">No trees found.</p>
        )}
      </div>
    </div>
  );
}
