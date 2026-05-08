import { Link, useLocation } from "react-router-dom";

const items = [
    ["Login", "/login"],
    ["Dashboard", "/"],
    ["Tree List", "/trees"],
    ["Add Tree", "/trees/new"],
    ["Map View", "/map"],
    ["Weather", "/weather"],
    ["Risk History", "/risk-history"],
    ["Reports", "/reports"],
];

export default function SidebarLayout({ children }) {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-secondary flex">
            <aside className="w-64 bg-primary text-white p-5">
                <h1 className="text-2xl font-bold mb-6">
                    Tree Risk AI
                </h1>

                <nav className="space-y-2">
                    {items.map(([label, href]) => {
                        const active = location.pathname === href;

                        return (
                            <Link
                                key={href}
                                to={href}
                                className={`block rounded-xl px-3 py-2.5 transition-all duration-200 font-medium ${
                                    active
                                        ? "bg-white text-primary shadow-sm"
                                        : "text-white hover:bg-white/20"
                                }`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <main className="flex-1 p-6">
                {children}
            </main>
        </div>
    );
}