import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { C } from "../constants/colors";
import { Icon, Icons } from "../constants/icons";
import { useAuth } from "../hooks/useAuth";

const BASE_LINKS = [
  { id: "dashboard", label: "Dashboard", icon: Icons.dashboard },
  { id: "payments", label: "Payments", icon: Icons.payments, children: ["Central Payment", "Make Payment", "Post Bill"] },
  { id: "reports", label: "Reports", icon: Icons.reports },
  { id: "receipt", label: "Receipt History", icon: Icons.receipt },
  { id: "profile", label: "Profile", icon: Icons.profile },
];

const SUPER_ADMIN_LINKS = [
  { id: "users", label: "Users", icon: Icons.profile },
];

const getInitials = (user) =>
  `${user?.firstName?.[0] ?? ""}.${user?.lastName?.[0] ?? ""}`.toLowerCase() || "?";

const getRoleLabel = (role) => {
  if (role === "SUPER_ADMIN") return "Super Admin";
  if (role === "ADMIN") return "Admin";
  return "User";
};

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname.replace("/", "");
  const [expanded, setExpanded] = useState({ payments: true });
  const { user, hasRole, logout } = useAuth();

  const links = [
    ...BASE_LINKS,
    ...(hasRole("SUPER_ADMIN") ? SUPER_ADMIN_LINKS : []),
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const s = {
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, display: mobileOpen ? "block" : "none" },
    sidebar: { position: "fixed", top: 0, left: 0, width: 220, height: "100vh", background: C.sidebar, display: "flex", flexDirection: "column", zIndex: 50, overflowY: "auto",                 borderTopRightRadius:"30px"
 },
    logo: { padding: "20px 16px", borderBottom: `1px solid rgba(255,255,255,0.08)`, display: "flex", alignItems: "center", gap: 10 },
    logoIcon: { width: 32, height: 32, background: C.primary, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" },
    logoText: { color: C.white, fontWeight: 800, fontSize: 18, letterSpacing: "-0.5px" },
    nav: { flex: 1, padding: "12px 0" },
    link: (active) => ({
      display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer",
      color: active ? C.primary : "rgba(255,255,255,0.6)", background: active ? C.white : "transparent",
      borderRadius: 8, margin: "2px 8px", fontSize: 14, fontWeight: active ? 600 : 500,
      transition: "all 0.15s", userSelect: "none",
    }),
    subLink: (active) => ({
      display: "flex", alignItems: "center", gap: 8, padding: "8px 16px 8px 42px", cursor: "pointer",
      color: active ? C.white : "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: active ? 600 : 400,
      borderRadius: 8, margin: "1px 8px", transition: "all 0.15s",
      background: active ? "rgba(99,102,241,0.3)" : "transparent",
    }),
    dot: { width: 6, height: 6, borderRadius: "50%", background: "currentColor", flexShrink: 0 },
    userBox: { padding: "12px 16px", borderTop: `1px solid rgba(255,255,255,0.08)`, display: "flex", alignItems: "center", gap: 10,  background:"#9BABFF" },
    avatar: { width: 40, height: 40, borderRadius: 8, background: C.white, display: "flex", alignItems: "end", paddingBottom:"4px", justifyContent: "center", color: C.primary, fontSize: 18, fontWeight: 700, flexShrink: 0 },
    userName: { color: C.white, fontSize: 14, fontWeight: 600, lineHeight: 1.3 },
    userRole: { color: C.text,fontSize: 10, background:C.white,  padding:"3px", borderRadius:"3px",  fontWeight:500,  textAlign:"center" },
  };

  const handleNav = (id) => {
    if(!["dashboard", "receipt", "profile","users"].includes(id)){
      return
    }
    navigate(`/${id}`);
    setMobileOpen(false);
  };

  const NavContent = () => (
    <>
      <div style={s.logo}>
        <div ><img width={150} src="/medixlogo_white.png"/></div>
      </div>
      <nav style={s.nav}>
        {links.map(link => (
          <div key={link.id}>
            <div
              style={s.link(currentPage === link.id)}
              onClick={() => {
                if (link.children) setExpanded(p => ({ ...p, [link.id]: !p[link.id] }));
                else handleNav(link.id);
              }}
            >
              <Icon d={link.icon} size={18} color="currentColor" />
              <span style={{ flex: 1 }}>{link.label}</span>
              {link.children && <Icon d={expanded[link.id] ? Icons.chevronDown : Icons.chevronRight} size={14} color="currentColor" />}
            </div>
            {link.children && !expanded[link.id] && link.children.map(child => (
              <div key={child} style={s.subLink(false)} onClick={() => handleNav(link.id)}>
                <span style={s.dot} />
                {child}
              </div>
            ))}
          </div>
        ))}
        <div style={{ ...s.link(false), marginTop: 4 }} onClick={handleLogout}>
          <Icon d={Icons.logout} size={18} color="currentColor" />
          <span>Logout</span>
        </div>
      </nav>
      <div style={s.userBox}>
        <div style={s.avatar}>{getInitials(user)}</div>
        <div>
          <div style={s.userName}>
            {user ? `${user.firstName} ${user.lastName}` : "…"}
          </div>
          <div ><span style={s.userRole}>Payment Officer</span></div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div style={s.overlay} onClick={() => setMobileOpen(false)} />
      <div style={{ ...s.sidebar, left: mobileOpen ? 0 : -220 }} className="sidebar-mobile">
        <NavContent />
      </div>
      <div style={s.sidebar } className="sidebar-desktop">
        <NavContent />
      </div>
    </>
  );
}
