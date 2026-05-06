import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";
import api from "../services/api";

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

export default function MapViewPage() {
  const [trees, setTrees] = useState([]);

  useEffect(() => {
    api.get("/trees/").then((res) => {
      setTrees(res.data.results || res.data);
    });
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Мапа на дрва</h2>
        <p className="text-sm text-gray-500">
          Приказ на дрва со боја според нивото на ризик
        </p>
      </div>

      <div className="card h-[650px]">
        <MapContainer
          center={[41.9981, 21.4254]}
          zoom={12}
          className="h-full w-full rounded-xl"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {trees.map((tree) => (
            <CircleMarker
              key={tree.id}
              center={[tree.latitude, tree.longitude]}
              radius={10}
              pathOptions={{
                color: getColor(tree.risk_category),
                fillColor: getColor(tree.risk_category),
                fillOpacity: 0.9,
              }}
            >
              <Popup>
                <div className="text-sm space-y-1">
                  <p className="font-bold">{tree.species}</p>
                  <p>Координати: {tree.latitude}, {tree.longitude}</p>
                  <p>Висина: {tree.height} m</p>
                  <p>Наклон: {tree.tilt}°</p>
                  <p>Здравје: {tree.health_condition}</p>
                  <p>
                    RiskScore:{" "}
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
  );
}