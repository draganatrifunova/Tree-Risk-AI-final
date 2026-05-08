import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
} from "recharts";
import api from "../services/api";
import PriorityList from "../components/PriorityList";

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

export default function DashboardPage() {
  const [trees, setTrees] = useState([]);

  useEffect(() => {
    api.get("/trees").then((res) => {
      setTrees(res.data.results || res.data);
    });
  }, []);

  // ===== STATS (combined logic from both files) =====
  const stats = useMemo(() => {
    const low = trees.filter((t) => t.risk_category === "LOW").length;
    const medium = trees.filter((t) => t.risk_category === "MEDIUM").length;
    const high = trees.filter((t) => t.risk_category === "HIGH").length;

    const avgRisk =
      trees.length > 0
        ? Math.round(
            trees.reduce((sum, t) => sum + Number(t.risk_score || 0), 0) /
              trees.length
          )
        : 0;

    const dangerous = trees.filter((t) => t.is_dangerous).length;

    const visionTrees = trees.filter((t) => t.ai_vision_score != null);
    const avgVision =
      visionTrees.length > 0
        ? (
            visionTrees.reduce((s, t) => s + t.ai_vision_score, 0) /
            visionTrees.length
          ).toFixed(1)
        : null;

    return { low, medium, high, avgRisk, dangerous, avgVision, visionTrees };
  }, [trees]);

  // ===== PIE DATA =====
  const pieData = [
    { name: "HIGH", value: stats.high },
    { name: "MEDIUM", value: stats.medium },
    { name: "LOW", value: stats.low },
  ];

  // ===== BAR DATA (from 2nd code) =====
  const barData = ["LOW", "MEDIUM", "HIGH"].map((name) => ({
    name,
    value: trees.filter((t) => t.risk_category === name).length,
  }));

  const priorityTrees = [...trees]
    .sort((a, b) => Number(b.risk_score || 0) - Number(a.risk_score || 0))
    .slice(0, 5);

  return (
    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Контролна табла</h2>
          <p className="text-sm text-gray-500">
            Преглед на ризични дрва и AI анализа
          </p>
        </div>

        <a
          href="/trees/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm"
        >
          + Додади ново дрво
        </a>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Вкупно дрва</p>
          <h3 className="text-2xl font-bold">{trees.length}</h3>
        </div>

        <div className="card">
          <p className="text-sm text-gray-500">Висок ризик</p>
          <h3 className="text-2xl font-bold text-red-500">{stats.high}</h3>
        </div>

        <div className="card">
          <p className="text-sm text-gray-500">Опасни дрва</p>
          <h3 className="text-2xl font-bold text-red-600">
            {stats.dangerous}
          </h3>
        </div>

        <div className="card">
          <p className="text-sm text-gray-500">Просечен ризик</p>
          <h3 className="text-2xl font-bold text-yellow-500">
            {stats.avgRisk}
          </h3>
        </div>
      </div>

      {/* MAP + PIE */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card xl:col-span-2">
          <h3 className="font-semibold mb-3">Мапа на дрва</h3>

          <div className="h-[420px] rounded-xl overflow-hidden">
            <MapContainer
              center={[41.9981, 21.4254]}
              zoom={12}
              className="h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              {trees.map((tree) => (
                <CircleMarker
                  key={tree.id}
                  center={[tree.latitude, tree.longitude]}
                  radius={9}
                  pathOptions={{
                    color: getColor(tree.risk_category),
                    fillColor: getColor(tree.risk_category),
                    fillOpacity: 0.9,
                  }}
                >
                  <Popup>
                    <div className="text-sm space-y-1">
                      <p className="font-bold">{tree.species}</p>
                      <p>
                        Координати: {tree.latitude}, {tree.longitude}
                      </p>
                      <p>Висина: {tree.height} m</p>
                      <p>Наклон: {tree.tilt}°</p>
                      <p>
                        Ризик:{" "}
                        <b style={{ color: getColor(tree.risk_category) }}>
                          {Math.round(tree.risk_score)} -{" "}
                          {LABELS[tree.risk_category]}
                        </b>
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Дистрибуција</h3>

          <div className="h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                  {pieData.map((e) => (
                    <Cell key={e.name} fill={getColor(e.name)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BAR + AI VISION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card h-72">
          <h3 className="text-sm font-medium mb-2">Trees by Category</h3>

          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <Bar dataKey="value">
                {barData.map((e) => (
                  <Cell key={e.name} fill={getColor(e.name)} />
                ))}
              </Bar>
              <Tooltip />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {stats.avgVision && (
          <div className="card">
            <h3 className="text-sm text-gray-500">Avg AI Vision Score</h3>
            <div className="text-2xl font-bold">{stats.avgVision}</div>
            <p className="text-xs text-gray-400 mt-1">
              from {stats.visionTrees.length} trees
            </p>
          </div>
        )}
      </div>

      {/* PRIORITY LIST */}
      <PriorityList trees={priorityTrees} />
    </div>
  );
}