import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import api from "../services/api";
import logo from "../assets/images/logo.svg";
import logo1 from "../assets/images/logo-green.svg";
import {data} from "../data/features";

export default function LoginPage() {
    const [form, setForm] = useState({username: "", password: ""});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isFormValid =
        form.username.trim() !== "" &&
        form.password.trim() !== "";

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            setLoading(true);
            const {data} = await api.post("/auth/login", form);
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);
            navigate("/");
        } catch (err) {
            setError("Погрешно корисничко ime или лозинка.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">

            {/* LEFT SIDE */}
            <div
                className="hidden md:flex w-1/2 relative"
                style={{background: "linear-gradient(to bottom right, #06a843, #067f59)"}}
            >
                <div className="absolute top-6 left-6 right-6 flex flex-col space-y-4">
                    <div className="flex items-center gap-4 mb-12">
                        <img src={logo} alt="Logo" className="w-14 h-auto"/>
                        <div className="text-white">
                            <h1 className="text-2xl font-bold leading-tight">Tree Risk AI</h1>
                            <p className="text-sm opacity-90">Интелигентно управување со ризик на дрвја</p>
                        </div>
                    </div>
                    <div className="flex flex-col space-y-4">
                        {data.map((item, index) => (
                            <div key={index}
                                 className="flex items-start gap-3 bg-[#199960]/80 p-4 rounded-lg text-white shadow-sm">
                                <img src={item.img} alt="icon" className="w-8 h-8 mt-1"/>
                                <div>
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-sm opacity-90">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute bottom-4 left-6 text-white text-xs opacity-80">
                    © Tree Risk AI. Сите права се задржани.
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
                <div className="w-full max-w-sm">

                    {/* MOBILE LOGO */}
                    <div className="flex items-center gap-3 mb-6 md:hidden">
                        <img src={logo1} alt="Logo" className="w-12 h-auto"/>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-bold">Tree Risk AI</h1>
                            <p className="text-xs text-gray-500">Интелигентно управување со ризик на дрвја</p>
                        </div>
                    </div>

                    {/* TAB */}
                    <div className="flex justify-center mb-4">
                        <div className="w-full bg-[#ececf1] p-1 rounded-xl flex shadow-md">
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className={`w-1/2 h-10 flex items-center justify-center text-sm font-semibold transition rounded-xl ${
                                    location.pathname === "/login" ? "bg-white text-black shadow-sm" : "text-gray-500"
                                }`}
                            >
                                Најава
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/register")}
                                className={`w-1/2 h-10 flex items-center justify-center text-sm font-semibold transition rounded-xl ${
                                    location.pathname === "/register" ? "bg-white text-black shadow-sm" : "text-gray-500"
                                }`}
                            >
                                Регистрација
                            </button>
                        </div>
                    </div>

                    {/* FORM */}
                    <form onSubmit={submit}
                          className="bg-white border border-gray-200 shadow-md rounded-xl p-6 space-y-4">
                        <div>
                            <h2 className="text-xl font-semibold text-start">Најава</h2>
                            <p className="text-sm text-gray-500 mt-2">Најавете се за пристап до системот</p>
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700">Корисничко ime</label>
                            <input
                                className="w-full bg-gray-100 rounded-md p-2 outline-none mt-1"
                                onChange={(e) => setForm({...form, username: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-bold text-gray-700">Лозинка</label>
                            <input
                                type="password"
                                className="w-full bg-gray-100 rounded-md p-2 outline-none mt-1"
                                onChange={(e) => setForm({...form, password: e.target.value})}
                            />
                        </div>

                        {/* ERROR */}
                        {error && (
                            <p className="text-red-500 text-sm font-medium">{error}</p>
                        )}

                        {/* BUTTON */}
                        <button
                            type="submit"
                            disabled={!isFormValid || loading}
                            className={`w-full text-white rounded-md p-2 transition-all duration-150 flex items-center justify-center gap-2
                                ${isFormValid && !loading
                                ? "hover:bg-gray-700 active:scale-95 active:opacity-80 cursor-pointer"
                                : "opacity-50 cursor-not-allowed"
                            }`}
                            style={{backgroundColor: "#000011"}}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg"
                                         fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Најавување...
                                </>
                            ) : (
                                "Најави се"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}