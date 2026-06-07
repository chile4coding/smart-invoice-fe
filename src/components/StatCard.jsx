import { C } from "../constants/colors";
import { Icon } from "../constants/icons";

export default function StatCard({ label, value, bg, iconColor, iconPath }) {
  return (
    <div style={{ background: bg, borderRadius: 6, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flex: 1, minWidth: 140 }}>
      <div>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 700, marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>{value}</div>
      </div>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon d={iconPath} size={22} color={iconColor} />
      </div>
    </div>
  );
}
