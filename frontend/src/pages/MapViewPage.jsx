import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import api from "../services/api";

const CAT_COLOR = { HIGH: "#EB5757", MEDIUM: "#F2C94C", LOW: "#1E8E5A" };

export default function MapViewPage() {
  const [trees, setTrees] = useState([]);

  useEffect(() => {
    api.get("/trees").then((res) => setTrees(res.data.results || res.data));
  }, []);

  return (
    <div className="card h-[600px]">
      <MapContainer center={[41.9981, 21.4254]} zoom={12} className="h-full w-full rounded">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {trees.map((tree) => {
          const color = CAT_COLOR[tree.risk_category] || "#1E8E5A";
          return (
            <CircleMarker
              key={tree.id}
              center={[tree.latitude, tree.longitude]}
              radius={8}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.9 }}
            >
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <div className="flex justify-between items-center mb-1">
                    <strong style={{ fontSize: 14 }}>{tree.species}</strong>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: color + "22",
                        color,
                        marginLeft: 8,
                      }}
                    >
                      {tree.risk_category}
                    </span>
                  </div>
                  <table style={{ fontSize: 12, width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td style={{ color: "#6b7280", paddingRight: 8 }}>Risk score</td>
                        <td style={{ fontWeight: 600 }}>{Math.round(tree.risk_score * 10) / 10}</td>
                      </tr>
                      {tree.ai_vision_score != null && (
                        <tr>
                          <td style={{ color: "#6b7280", paddingRight: 8 }}>AI Vision</td>
                          <td style={{ fontWeight: 600 }}>{Math.round(tree.ai_vision_score)}</td>
                        </tr>
                      )}
                      <tr>
                        <td style={{ color: "#6b7280", paddingRight: 8 }}>Height</td>
                        <td>{tree.height} m</td>
                      </tr>
                      <tr>
                        <td style={{ color: "#6b7280", paddingRight: 8 }}>Tilt</td>
                        <td>{tree.tilt}°</td>
                      </tr>
                      <tr>
                        <td style={{ color: "#6b7280", paddingRight: 8 }}>Health</td>
                        <td>{tree.health_condition}</td>
                      </tr>
                    </tbody>
                  </table>
                  {tree.is_dangerous && (
                    <div style={{ marginTop: 6, fontSize: 11, color: "#EB5757", fontWeight: 700 }}>
                      ⚠ Marked Dangerous
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
