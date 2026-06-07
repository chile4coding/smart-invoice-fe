import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const titles = {
  "/dashboard": "Dashboard",
  "/payments": "Payments",
  "/reports": "Reports",
  "/profile": "Profile",
  "/receipt": "Receipt History",
};

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const title = titles[location.pathname] || "Dashboard";

  return (
    <div style={{  minHeight: "100vh" }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div style={{ flex: 1, marginLeft: 220, display: "flex", flexDirection: "column", minHeight: "100vh" }} className="main-content">
       
        <Topbar title={title} onMenu={() => setMobileOpen(true)} />
        <div style={{ flex: 1, overflowY: "auto" , padding: "10px 24px"}}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
