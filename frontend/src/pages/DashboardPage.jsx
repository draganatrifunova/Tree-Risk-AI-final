import { useEffect, useMemo, useState } from "react";
import infoRed from "../assets/images/info-triangle-red.svg";
import treeBlue from "../assets/images/tree-blue.svg";
import risk from "../assets/images/risk.svg";
import wind from "../assets/images/wind.svg";


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
    api.get("/trees/").then((res) => {
      setTrees(res.data.results || res.data);
    });
  }, []);

  const stats = useMemo(() => {
    const low = trees.filter((t) => t.risk_category === "LOW").length;
    const medium = trees.filter((t) => t.risk_category === "MEDIUM").length;
    const high = trees.filter((t) => t.risk_category === "HIGH").length;
    const average =
      trees.length > 0
        ? Math.round(
          trees.reduce((sum, t) => sum + Number(t.risk_score || 0), 0) /
          trees.length
        )
        : 0;

    return { low, medium, high, average };
  }, [trees]);

  const pieData = [
    { name: "HIGH", value: stats.high },
    { name: "MEDIUM", value: stats.medium },
    { name: "LOW", value: stats.low },
  ];

  const priorityTrees = [...trees]
    .sort((a, b) => Number(b.risk_score || 0) - Number(a.risk_score || 0))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Контролна табла</h2>
          <p className="text-sm text-gray-500">
            Преглед на ризични дрва и состојба на системот
          </p>
        </div>

        <a
          href="/trees/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm"
        >
          + Додади ново дрво
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="card flex items-center justify-between">
           <div>
             <p className="text-sm text-gray-500">Вкупно дрва</p>
          <h3 className="text-2xl font-bold">{trees.length}</h3>
           </div>
           <div className="bg-[#dbeafe] p-2 rounded-md flex items-center justify-center">
            <img src={treeBlue} alt="Total trees" className="w-5 h-5" />
          </div>
        </div>

       <div className="card flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Висок ризик</p>
            <h3 className="text-2xl font-bold text-red-500">{stats.high}</h3>
          </div>
          <div className="bg-[#ffe2e2] p-2 rounded-md flex items-center justify-center">
            <img src={infoRed} alt="High Risk" className="w-5 h-5" />
          </div>
      </div>

        <div className="card flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Просечен ризик</p>
          <h3 className="text-2xl font-bold text-yellow-500">
            {stats.average}
          </h3>
          </div>
            <div className="bg-[#fef9c2] p-2 rounded-md flex items-center justify-center">
            <img src={risk} alt="Average Risk" className="w-5 h-5" />
          </div>
        </div>

        <div className="card flex items-center justify-between">
          <div>
              <p className="text-sm text-gray-500">Активни известувања</p>
          <h3 className="text-2xl font-bold text-orange-500">{stats.high}</h3>
          </div>
            <div className="bg-[#ffedd4] p-2 rounded-md flex items-center justify-center">
            <img src={wind} alt="Active notifications" className="w-5 h-5" />
          </div>
        
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card xl:col-span-2">
          <h3 className="font-semibold mb-3">Мапа на дрва</h3>

          <div className="h-[420px] rounded-xl overflow-hidden">
            <MapContainer
              center={[41.9981, 21.4254]}
              zoom={12}
              className="h-full w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

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
                      <p>Здравје: {tree.health_condition}</p>
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

          <div className="flex gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Низок (0–33)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              Среден (34–66)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              Висок (67–100)
            </span>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Дистрибуција на ризик</h3>

          <div className="h-[300px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={95}
                  label
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={getColor(entry.name)} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-sm">
            {pieData.map((item) => (
              <div key={item.name} className="flex justify-between">
                <span>{LABELS[item.name]}</span>
                <b>{item.value}</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PriorityList trees={priorityTrees} />
    </div>
  );
}