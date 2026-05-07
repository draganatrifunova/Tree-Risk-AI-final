import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import logo from "../assets/images/logo.svg";
import logo1 from "../assets/images/logo-green.svg";
import { data } from "../data/features"

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "", role: "USER" });
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/auth/register", form);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden md:flex w-1/2 relative"
        style={{
          background: "linear-gradient(to bottom right, #06a843, #067f59)"
        }}
      >
        <div className="absolute top-6 left-6 right-6 flex flex-col space-y-4">

          <div className="flex items-center gap-4 mb-12">
            <img src={logo} alt="Logo" className="w-14 h-auto" />
            <div className="text-white">
              <h1 className="text-2xl font-bold leading-tight">
                Tree Risk AI
              </h1>
              <p className="text-sm opacity-90">
                Интелигентно управување со ризик на дрвја
              </p>
            </div>
          </div>
          <div className="flex flex-col space-y-4">

            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-[#199960]/80 p-4 rounded-lg text-white shadow-sm"
              >
                <img src={item.img} alt="icon" className="w-8 h-8 mt-1" />

                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm opacity-90">{item.desc}</p>
                </div>
              </div>
            ))}

          </div>

        </div>

        {/* FOOTER */}
        <div className="absolute bottom-4 left-6 text-white text-xs opacity-80">
          © Tree Risk AI. Сите права се задржани.
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="w-full bg-[#ececf1] p-1 rounded-xl flex shadow-md">


              <button
                type="button"
                onClick={() => navigate("/login")}
                className={`w-1/2 h-10 flex items-center justify-center text-sm font-semibold  transition rounded-xl ${location.pathname === "/login"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500"
                  }`}
              >
                Најава
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className={`w-1/2 h-10 flex items-center justify-center text-sm font-semibold  transition rounded-xl ${location.pathname === "/register"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500"
                  }`}
              >
                Регистрација
              </button>

            </div>
          </div>
          <form onSubmit={submit} className="bg-white border border-gray-200 shadow-md rounded-xl p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-start">
                Регистрација
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Креирајте нова сметка за пристап
              </p>

            </div>
            <div>
              <label className="text-sm font-bold text-gray-700">
                Корисничко име
              </label>
              <input className="w-full bg-gray-100 rounded-md p-2 outline-none mt-1" onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700">
                Е-пошта
              </label>
              <input className="w-full bg-gray-100 rounded-md p-2 outline-none mt-1" onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700">
                Лозинка
              </label>
              <input className="w-full bg-gray-100 rounded-md p-2 outline-none mt-1" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />

            </div>
            <div>
              <label className="text-sm font-bold text-gray-700">
                Потврди лозинка
              </label>

              <input
                className="w-full bg-gray-100 rounded-md p-2 outline-none mt-1"
                type="password"
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
              />
            </div>
            {/* <div>
               <label className="text-sm font-bold text-gray-700">
              Улога
              </label>
              <select className="w-full bg-gray-100 rounded-md p-2 outline-none mt-1" onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="USER">Корисник</option>
                <option value="ADMIN">Администратор</option>
              </select>
            </div> */}
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">
                Улога
              </label>

              <div className="flex flex-col gap-3">

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="USER"
                    checked={form.role === "USER"}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                  />
                  Корисник
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="ADMIN"
                    checked={form.role === "ADMIN"}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                  />
                  Администратор
                </label>

              </div>
            </div>

            <button className="w-full text-white rounded-md p-2 transition"
              style={{ backgroundColor: "#000011" }}>Регистрирај се</button>
          </form>
        </div>
      </div>
    </div>
  );
}
