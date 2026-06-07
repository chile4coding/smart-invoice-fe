import { C } from "../constants/colors";
import { Icons } from "../constants/icons";
import StatCard from "../components/StatCard";
import { useAuth } from "../hooks/useAuth";
import { useInvoices } from "../lib/apiHooks";

const fmtAmount = (val, currency = "NGN") => {
  const symbol = currency === "USD" ? "$" : currency === "GBP" ? "£" : "₦";
  return `${symbol}${(val ).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
};

const statusColors = {
  DRAFT: { bg: "#fef9c3", color: "#854d0e" },
  SAVED: { bg: C.cardBlue, color: C.primary },
  SENT: { bg: C.cardGreen, color: C.success },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useInvoices({ limit: 5, sortBy: "createdAt", order: "desc" });

  const invoices = data?.invoices ?? [];
  const total = data?.total ?? 0;

  const draft = invoices.filter(i => i.status === "DRAFT").length;
  const sent = invoices.filter(i => i.status === "SENT").length;
  const totalValue = invoices.reduce((sum, i) => sum + (i.grandTotal ?? 0), 0);

  const getRoleLabel = (role) => {
    if (role === "SUPER_ADMIN") return "Super Admin";
    if (role === "ADMIN") return "Admin";
    return "User";
  };

  return (
    <div >
      <div style={{display:"flex",  justifyContent:"space-between",  alignItems:"flex-start"}}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text }}>
          Hi, {user ? `${user.firstName} ${user.lastName}` : "…"}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 ,  }}>
          <span style={{ fontSize: 13, color: C.muted }}>Welcome to MedixTrak</span>
          <span style={{ background: C.white, color: C.dark, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 99, boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)"  }}>
            Payment Officer
          </span>
        </div>

      </div>

          <p className="sidebar-desktop"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: C.muted,
              }}
            >
              Rivers State University Teaching Hospital
            </p>

      </div>



      <div className="dash-stats-wrap" style={{maxWidth:"1400px",  marginLeft: "auto",  marginRight:"auto", marginTop:"60px" }}>
      <div className="stat-row" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard
          label="Total Attendance"
          value={isLoading ? "…" : String(user?.dashboardStats?.totalAttendance??0)}
          bg={C.cardBlue}
          iconColor={C.primary}
          iconPath={Icons.users}
        />
        <StatCard
          label="New Registration"
          value={isLoading ? "…" : String(user?.dashboardStats?.newRegistration??0)}
          bg={C.cardOrange}
          iconColor={C.orange}
          iconPath={Icons.newReg}
        />
        <StatCard
          label="Follow Up"
          value={isLoading ? "…" : String(user?.dashboardStats?.followUp??0)}
          bg={C.cardGreen}
          iconColor={C.green}
          iconPath={Icons.followup}
        />
        <StatCard
          label="Total Patients"
          value={isLoading ? "…" : fmtAmount(Number(user?.dashboardStats?.totalPatients ?? 0))}
          bg={C.cardPink}
          iconColor={C.purple}
          iconPath={Icons.patients}
        />
      </div>
         

                    <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}> Cash Wallet Fundings</h2>

      <div className="stat-row" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard
          label="Today"
          value={isLoading ? "…" : fmtAmount(Number(user?.dashboardStats?.today??0))}
          bg={C.white}
          iconColor={C.primary}
          iconPath={Icons.wallet}
        />
        <StatCard
          label="This Week"
          value={isLoading ? "…" :fmtAmount(Number(user?.dashboardStats?.thisWeek??0))}
                 bg={C.white}

          iconColor={C.orange}
          iconPath={Icons.wallet}
        />
        <StatCard
          label="This Month"
          value={isLoading ? "…" : fmtAmount(Number(user?.dashboardStats?.thisMonth??0))}
                   bg={C.white}

          iconColor={C.green}
          iconPath={Icons.wallet}
        />
        <StatCard
          label="Total Payments"
          value={isLoading ? "…" : fmtAmount(Number(user?.dashboardStats?.totalPayments??0))}
                    bg={C.white}

          iconColor={C.purple}
          iconPath={Icons.wallet}
        />
      </div>

      <div  style={{display:"flex",  flexDirection:"column"}}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14, }}>Recent Consultation History</h2>
        <div style={{ background: C.white, borderRadius:6,  overflow: "hidden" }}>
          <div style={{ overflowX: "auto" , margin:20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.lightBlue }}>
                  {["PATIENT NAME", "PATIENT ID", "TCCODE", "FEE NAME", "AMOUNT", "DATE"].map(h => (
                    <th key={h} style={{ padding: "8px 16px", textAlign: "left", fontWeight: 600, color: C.white, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px 40px 32px 32px", color: C.muted }}>Loading…</td></tr>
                ) : [].length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: "20px 40px 60px 40px",  color: C.muted }}>No data available in table</td></tr>
                ) : invoices.map((inv, i) => {
                  const sc = statusColors[inv.status] ?? statusColors.DRAFT;
                  const dueDate = new Date(inv.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                  return (
                    <tr key={inv.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : "#fafafa" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: C.primary }}>{inv.invoiceNumber}</td>
                      <td style={{ padding: "12px 16px", color: C.text }}>{inv.clientName}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 700 }}>{fmtAmount(inv.grandTotal, inv.currency)}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: sc.bg, color: sc.color }}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: C.muted, whiteSpace: "nowrap" }}>{dueDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      </div>

    </div>
  );
}
