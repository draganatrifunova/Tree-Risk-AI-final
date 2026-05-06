import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import api from "../services/api";
import PriorityList from "../components/PriorityList";

const COLORS = { LOW: "#1E8E5A", MEDIUM: "#F2C94C", HIGH: "#EB5757" };

export default function DashboardPage() {
  const [trees, setTrees] = useState([]);

  useEffect(() => {
    api.get("/trees").then((res) => setTrees(res.data.results || res.data));
  }, []);

  const categoryStats = ["LOW", "MEDIUM", "HIGH"].map((name) => ({
    name,
    value: trees.filter((t) => t.risk_category === name).length,
  }));

  const dangerousCount = trees.filter((t) => t.is_dangerous).length;

  const treesWithVision = trees.filter((t) => t.ai_vision_score != null);
  const avgAiVision =
    treesWithVision.length > 0
      ? (treesWithVision.reduce((sum, t) => sum + t.ai_vision_score, 0) / treesWithVision.length).toFixed(1)
      : null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Dashboard</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-xs text-gray-500 mb-1">Total Trees</div>
          <div className="text-2xl font-bold">{trees.length}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500 mb-1">Medium Risk</div>
          <div className="text-2xl font-bold text-warning">{categoryStats[1].value}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500 mb-1">High Risk Alerts</div>
          <div className="text-2xl font-bold text-danger">{categoryStats[2].value}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500 mb-1">Dangerous Trees</div>
          <div className="text-2xl font-bold" style={{ color: dangerousCount > 0 ? "#EB5757" : "#1E8E5A" }}>
            {dangerousCount}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card h-72 flex flex-col">
          <p className="text-sm font-medium text-gray-600 mb-2">Risk Distribution</p>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryStats} dataKey="value" nameKey="name" outerRadius={90}>
                  {categoryStats.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card h-72 flex flex-col">
          <p className="text-sm font-medium text-gray-600 mb-2">Trees by Category</p>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {categoryStats.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name]} />
                  ))}
                </Bar>
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Vision avg + priority list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {avgAiVision != null && (
          <div className="card">
            <div className="text-xs text-gray-500 mb-1">Avg AI Vision Score</div>
            <div className="text-2xl font-bold">{avgAiVision}</div>
            <div className="text-xs text-gray-400 mt-1">from {treesWithVision.length} trees with image analysis</div>
          </div>
        )}
        <div className={avgAiVision != null ? "md:col-span-2" : "md:col-span-3"}>
          <PriorityList trees={trees.filter((t) => t.risk_category === "HIGH")} />
        </div>
      </div>
    </div>
  );
}
