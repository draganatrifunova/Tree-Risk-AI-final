import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "USER" });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/auth/register", form);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-3">
        <h2 className="text-xl font-semibold">Register</h2>
        <input className="w-full border rounded p-2" placeholder="Username" onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input className="w-full border rounded p-2" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="w-full border rounded p-2" onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <button className="w-full bg-primary text-white rounded p-2">Register</button>
      </form>
    </div>
  );
}
