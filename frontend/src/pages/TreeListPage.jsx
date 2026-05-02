import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function TreeListPage() {
  const [trees, setTrees] = useState([]);
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState("ALL");

  useEffect(() => {
    api.get("/trees").then((res) => setTrees(res.data.results || res.data));
  }, []);

  const filtered = useMemo(
    () =>
      trees.filter(
        (t) =>
          t.species.toLowerCase().includes(query.toLowerCase()) &&
          (risk === "ALL" || t.risk_category === risk)
      ),
    [trees, query, risk]
  );

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-semibold">Tree List</h2>
      <div className="card flex gap-2">
        <input className="border rounded p-2 flex-1" placeholder="Search species" onChange={(e) => setQuery(e.target.value)} />
        <select className="border rounded p-2" onChange={(e) => setRisk(e.target.value)}>
          <option value="ALL">All</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>
      <div className="card">
        {filtered.map((tree) => (
          <div className="py-2 border-b last:border-0 flex justify-between" key={tree.id}>
            <span>{tree.species}</span>
            <span>{Math.round(tree.risk_score)} ({tree.risk_category})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
