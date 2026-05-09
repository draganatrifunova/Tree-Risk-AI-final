import {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import api from "../services/api";
import logo from "../assets/images/logo.svg";
import {data} from "../data/features";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "USER",
    });

    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmError, setConfirmError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isFormValid =
        form.username.trim() &&
        form.email.trim() &&
        EMAIL_REGEX.test(form.email) &&
        form.password.trim() &&
        form.confirmPassword.trim() &&
        form.role &&
        form.password === form.confirmPassword &&
        form.password.length >= 8;

    const handleEmailChange = (e) => {
        const val = e.target.value;
        setForm({...form, email: val});
        if (val.length > 0 && !EMAIL_REGEX.test(val)) {
            setEmailError("Внесете валидна е-пошта (пр. ime@domen.com).");
        } else {
            setEmailError("");
        }
    };

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setForm({...form, password: val});
        if (val.length > 0 && val.length < 8) {
            setPasswordError("Лозинката мора да има најмалку 8 карактери.");
        } else {
            setPasswordError("");
        }
        // re-check confirm if already typed
        if (form.confirmPassword && val !== form.confirmPassword) {
            setConfirmError("Лозинките не се совпаѓаат.");
        } else {
            setConfirmError("");
        }
    };

    const handleConfirmChange = (e) => {
        const val = e.target.value;
        setForm({...form, confirmPassword: val});
        if (val && val !== form.password) {
            setConfirmError("Лозинките не се совпаѓаат.");
        } else {
            setConfirmError("");
        }
    };

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        if (!EMAIL_REGEX.test(form.email)) {
            setEmailError("Внесете валидна е-пошта (пр. ime@domen.com).");
            return;
        }
        if (form.password.length < 8) {
            setPasswordError("Лозинката мора да има најмалку 8 карактери.");
            return;
        }
        if (form.password !== form.confirmPassword) {
            setConfirmError("Лозинките не се совпаѓаат.");
            return;
        }

        try {
            setLoading(true);
            await api.post("/auth/register", form);
            navigate("/login");
        } catch (err) {
            setError("Грешка при регистрација. Обидете се повторно.");
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

                    {/* TAB SWITCH */}
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
                            <h2 className="text-xl font-semibold text-start">Регистрација</h2>
                            <p className="text-sm text-gray-500 mt-2">Креирајте нова сметка за пристап</p>
                        </div>

                        {/* USERNAME */}
                        <div>
                            <label className="text-sm font-bold text-gray-700">Корисничко ime</label>
                            <input
                                className="w-full bg-gray-100 rounded-md p-2 outline-none mt-1"
                                onChange={(e) => setForm({...form, username: e.target.value})}
                            />
                        </div>

                        {/* EMAIL */}
                        <div>
                            <label className="text-sm font-bold text-gray-700">Е-пошта</label>
                            <input
                                type="email"
                                className={`w-full bg-gray-100 rounded-md p-2 outline-none mt-1 border ${
                                    emailError ? "border-red-400" : "border-transparent"
                                }`}
                                onChange={handleEmailChange}
                            />
                            {emailError && (
                                <p className="text-red-500 text-xs mt-1">{emailError}</p>
                            )}
                        </div>

                        {/* PASSWORD */}
                        <div>
                            <label className="text-sm font-bold text-gray-700">Лозинка</label>
                            <input
                                type="password"
                                className={`w-full bg-gray-100 rounded-md p-2 outline-none mt-1 border ${
                                    passwordError ? "border-red-400" : "border-transparent"
                                }`}
                                onChange={handlePasswordChange}
                            />
                            {passwordError && (
                                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                            )}
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div>
                            <label className="text-sm font-bold text-gray-700">Потврди лозинка</label>
                            <input
                                type="password"
                                className={`w-full bg-gray-100 rounded-md p-2 outline-none mt-1 border ${
                                    confirmError ? "border-red-400" : "border-transparent"
                                }`}
                                onChange={handleConfirmChange}
                            />
                            {confirmError && (
                                <p className="text-red-500 text-xs mt-1">{confirmError}</p>
                            )}
                        </div>

                        {/* ROLE */}
                        <div>
                            <label className="text-sm font-bold text-gray-700 block mb-2">Улога</label>
                            <div className="flex flex-col gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="USER"
                                        checked={form.role === "USER"}
                                        onChange={(e) => setForm({...form, role: e.target.value})}
                                    />
                                    Корисник
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="ADMIN"
                                        checked={form.role === "ADMIN"}
                                        onChange={(e) => setForm({...form, role: e.target.value})}
                                    />
                                    Администратор
                                </label>
                            </div>
                        </div>

                        {/* GENERAL ERROR */}
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
                                    Регистрирање...
                                </>
                            ) : (
                                "Регистрирај се"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}