import { C } from "../constants/colors";

export default function Topbar({ title, subtitle, right, onMenu }) {
  // borderBottom: `1px solid ${C.border}`
  return (
    <div className="sidebar-mobile" style={{ background: C.white, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, position: "sticky", top: 0, zIndex: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onMenu} style={{ background: "none", border: "none", display: "flex", padding: 4, borderRadius: 6 }} className="hamburger">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
        </button>
        {/* <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: C.muted }}>{subtitle}</div>}
        </div> */}
      </div>
      {right && <div>{right}</div>}
      <div style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>Rivers State University Teaching Hospital</div>
    </div>
  );
}
