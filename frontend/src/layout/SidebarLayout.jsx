import {Link} from "react-router-dom";

const items = [
    ["Login", "/login"],
    ["Dashboard", "/"],
    ["Tree List", "/trees"],
    ["Add Tree", "/trees/new"],
    ["Map View", "/map"],
    ["Weather", "/weather"],
    ["Reports", "/reports"],
];

export default function SidebarLayout({children}) {
    return (
        <div className="min-h-screen bg-secondary flex">
            <aside className="w-64 bg-primary text-white p-5">
                <h1 className="text-2xl font-bold mb-6">Tree Risk AI</h1>
                <nav className="space-y-2">
                    {items.map(([label, href]) => (
                        <Link className="block rounded px-3 py-2 hover:bg-white/20" to={href} key={href}>
                            {label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 p-6">{children}</main>
        </div>
    );
}
