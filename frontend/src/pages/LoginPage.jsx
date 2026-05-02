import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/auth/login", form);
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-3">
        <h2 className="text-xl font-semibold">Login</h2>
        <input className="w-full border rounded p-2" placeholder="Username" onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="w-full bg-primary text-white rounded p-2">Login</button>
      </form>
    </div>
  );
}
