import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import SidebarLayout from "./layout/SidebarLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import TreeListPage from "./pages/TreeListPage";
import AddTreePage from "./pages/AddTreePage";
import MapViewPage from "./pages/MapViewPage";
import WeatherPage from "./pages/WeatherPage";
import ReportsPage from "./pages/ReportsPage";

function Protected({ children }) {
  if (!localStorage.getItem("access")) return <Navigate to="/login" replace />;
  return children;
}

function Shell({ children }) {
  const location = useLocation();
  if (["/login", "/register"].includes(location.pathname)) return children;
  return <SidebarLayout>{children}</SidebarLayout>;
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Protected><DashboardPage /></Protected>} />
        <Route path="/trees" element={<Protected><TreeListPage /></Protected>} />
        <Route path="/trees/new" element={<Protected><AddTreePage /></Protected>} />
        <Route path="/map" element={<Protected><MapViewPage /></Protected>} />
        <Route path="/weather" element={<Protected><WeatherPage /></Protected>} />
        <Route path="/reports" element={<Protected><ReportsPage /></Protected>} />
      </Routes>
    </Shell>
  );
}
