import { useEffect, useState } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">Total Trees: {trees.length}</div>
        <div className="card text-warning">Medium Risk: {categoryStats[1].value}</div>
        <div className="card text-danger">High Risk Alerts: {categoryStats[2].value}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={categoryStats} dataKey="value" nameKey="name" outerRadius={90}>
                {categoryStats.map((entry) => <Cell key={entry.name} fill={COLORS[entry.name]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card h-72">
          <ResponsiveContainer>
            <BarChart data={categoryStats}>
              <Bar dataKey="value" fill="#1E8E5A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <PriorityList trees={trees.filter((t) => t.risk_category === "HIGH")} />
    </div>
  );
}
