import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, CircleMarker } from "react-leaflet";
import api from "../services/api";

const colorByRisk = (risk) => (risk === "HIGH" ? "#EB5757" : risk === "MEDIUM" ? "#F2C94C" : "#1E8E5A");

export default function MapViewPage() {
  const [trees, setTrees] = useState([]);
  useEffect(() => {
    api.get("/trees").then((res) => setTrees(res.data.results || res.data));
  }, []);

  return (
    <div className="card h-[600px]">
      <MapContainer center={[41.9981, 21.4254]} zoom={12} className="h-full w-full rounded">
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {trees.map((tree) => (
          <CircleMarker
            key={tree.id}
            center={[tree.latitude, tree.longitude]}
            radius={8}
            pathOptions={{ color: colorByRisk(tree.risk_category), fillColor: colorByRisk(tree.risk_category), fillOpacity: 0.9 }}
          >
            <Popup>{tree.species} - {tree.risk_category}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
