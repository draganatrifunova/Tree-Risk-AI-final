import { useState } from "react";
import api from "../services/api";

export default function AddTreePage() {
  const [form, setForm] = useState({
    species: "",
    latitude: "",
    longitude: "",
    height: "",
    tilt: "",
    health_condition: "GOOD",
  });

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/trees", form);
    alert("Tree created.");
  };

  return (
    <form onSubmit={submit} className="card max-w-xl space-y-3">
      <h2 className="text-xl font-semibold">Add Tree</h2>
      {Object.keys(form).map((k) =>
        k === "health_condition" ? (
          <select key={k} className="w-full border rounded p-2" onChange={(e) => setForm({ ...form, [k]: e.target.value })}>
            <option value="GOOD">GOOD</option>
            <option value="FAIR">FAIR</option>
            <option value="POOR">POOR</option>
          </select>
        ) : (
          <input key={k} className="w-full border rounded p-2" placeholder={k} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
        )
      )}
      <button className="bg-primary text-white rounded px-4 py-2">Save</button>
    </form>
  );
}
