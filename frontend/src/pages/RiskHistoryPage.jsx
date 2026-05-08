import { useEffect, useState } from "react";
import api from "../services/api";

export default function RiskHistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get("/risk/history/")
      .then((res) => setHistory(res.data.results || res.data))
      .catch(() => setHistory([]));
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold">Risk History</h2>
      <p className="text-sm text-gray-500">All hybrid risk recalculations — newest first.</p>
      <div className="card">
        {history.length === 0 && (
          <p className="text-sm text-gray-500 py-4 text-center">
            No history yet. Use <strong>Recalculate</strong> on any tree to generate entries.
          </p>
        )}
        {history.map((entry) => {
          const delta = entry.new_score - entry.old_score;
          const up = delta > 0;
          const same = Math.abs(delta) < 0.1;
          return (
            <div key={entry.id} className="py-3 border-b last:border-0 flex justify-between items-center gap-4">
              <div>
                <span className="font-medium text-sm">
                  {entry.tree_species ?? `Tree #${entry.tree}`}
                </span>
                <div className="text-xs text-gray-400 mt-0.5">
                  {new Date(entry.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm text-gray-500">{Math.round(entry.old_score * 10) / 10}</span>
                <span className="text-gray-300">→</span>
                <span className="text-sm font-semibold" style={{ color: same ? "#6b7280" : up ? "#EB5757" : "#1E8E5A" }}>
                  {Math.round(entry.new_score * 10) / 10}
                </span>
                {!same && (
                  <span
                    className="text-xs font-semibold px-1.5 py-0.5 rounded"
                    style={
                      up
                        ? { background: "#EB575722", color: "#EB5757" }
                        : { background: "#1E8E5A22", color: "#1E8E5A" }
                    }
                  >
                    {up ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
