import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

import logo from "../assets/images/logo-green.svg";
import dashboard from "../assets/images/dashboard.svg";
import list from "../assets/images/list-ul.svg";
import plus from "../assets/images/plus-large.svg";
import weather from "../assets/images/weather-rain.svg";
import report from "../assets/images/report.svg";

const items = [
  { label: "Контролна табела", href: "/", icon: dashboard },
  { label: "Листа на дрва", href: "/trees", icon: list },
  { label: "Додади дрво", href: "/trees/new", icon: plus },
  { label: "Временски услови", href: "/weather", icon: weather },
  { label: "Извештаи", href: "/reports", icon: report },
];

export default function SidebarLayout({ children }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="md:hidden fixed top-0 left-0 right-0 z-[10000] bg-white  border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} className="w-10 h-10" />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-gray-900 leading-tight">
              Tree Risk AI
            </h1>
            <p className="text-[10px] text-gray-500">
              Систем за процена на ризик
            </p>
          </div>
        </div>
    <button onClick={() => setOpen(!open)} className="text-2xl">
        {open ? "✕" : "☰"}
    </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-[9998] md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-[9999] h-dvh w-full md:w-64
          bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}>

        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} className="w-10 h-10" />
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  Tree Risk AI
                </h1>
                <p className="text-xs text-gray-500">
                  Систем за процена на ризик
                </p>
              </div>
            </div>
          </div>
        </div>
     
        <nav className="flex-1 px-5 py-4 space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className={`
                flex items-center gap-3 rounded px-3 py-3 text-sm transition
                ${
                  location.pathname === item.href
                    ? "bg-gray-100 font-semibold text-black"
                    : "text-gray-600 hover:bg-gray-50"
                }
              `}
            >
              <img src={item.icon} className="w-7 h-7" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    
      <main className="flex-1 p-6 pt-24 md:pt-6">
        {children}
      </main>

    </div>
  );
}