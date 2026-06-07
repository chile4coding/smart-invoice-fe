import { useState, useEffect } from "react";
import { C } from "../constants/colors";
import { useAuth } from "../hooks/useAuth";
import { useStats, useCreateStats, useUpdateProfile } from "../lib/apiHooks";
import { useQueryClient } from "@tanstack/react-query";
import { ChangePasswordModal } from "./Users";

const roleColors = {
  SUPER_ADMIN: { bg: "#fdf4ff", color: "#a855f7", border: "#e9d5ff" },
  ADMIN: { bg: C.cardBlue, color: C.primary, border: "#c7d2fe" },
  USER: { bg: C.cardGreen, color: C.success, border: "#bbf7d0" },
};

const getInitials = (user) =>
  `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

const INITIAL_STATS = {
  totalAttendance: "0",
  newRegistration: "0",
  followUp: "0",
  totalPatients: "0",
  today: "0",
  thisWeek: "0",
  thisMonth: "0",
  totalPayments: "0",
};

const STAT_FIELDS = [
  { key: "totalAttendance", label: "Total Attendance" },
  { key: "newRegistration", label: "New Registration" },
  { key: "followUp", label: "Follow Up" },
  { key: "totalPatients", label: "Total Patients" },
  { key: "today", label: "Today" },
  { key: "thisWeek", label: "This Week" },
  { key: "thisMonth", label: "This Month" },
  { key: "totalPayments", label: "Total Payments" },
];

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ email: "", firstName: "", lastName: "" });

  const updateProfile = useUpdateProfile();

  const { data: existingStats, isLoading: statsLoading } = useStats(modalOpen);
  const createStats = useCreateStats();
    const queryClient = useQueryClient();
  

  useEffect(() => {
    if (editMode && user) {
      setProfileForm({ email: user.email ?? "", firstName: user.firstName ?? "", lastName: user.lastName ?? "" });
    }
  }, [editMode, user]);

  useEffect(() => {
    if (existingStats) {
      setStats({
        totalAttendance: existingStats.totalAttendance ?? "0",
        newRegistration: existingStats.newRegistration ?? "0",
        followUp: existingStats.followUp ?? "0",
        totalPatients: existingStats.totalPatients ?? "0",
        today: existingStats.today ?? "0",
        thisWeek: existingStats.thisWeek ?? "0",
        thisMonth: existingStats.thisMonth ?? "0",
        totalPayments: existingStats.totalPayments ?? "0",
      });
    }
  }, [existingStats]);

  const roleStyle = roleColors[user?.role] ?? roleColors.USER;
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  const handleChange = (e) => {
    setStats((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataT = { totalAttendance: stats.totalAttendance ?? "0",
        newRegistration: stats.newRegistration ?? "0",
        followUp: stats.followUp ?? "0",
        totalPatients: stats.totalPatients ?? "0",
        today: stats.today ?? "0",
        thisWeek: stats.thisWeek ?? "0",
        thisMonth: stats.thisMonth ?? "0",
        totalPayments: stats.totalPayments ?? "0",}

    createStats.mutate(dataT, {
      onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

        setModalOpen(false);
        setStats(INITIAL_STATS);
      },
    });
  };

  const handleClose = () => {
    setModalOpen(false);
    setStats(INITIAL_STATS);
  };

  const handleProfileSave = () => {
    updateProfile.mutate(
      { id: user.id,  firstName: profileForm.firstName, lastName: profileForm.lastName },
      { onSuccess: () => setEditMode(false) }
    );
  };

  const handleProfileCancel = () => {
    setEditMode(false);
    updateProfile.reset();
  };

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Profile</h1>
       <div style={{
        display:"flex",
        gap:"1rem"
       }}>
       

       </div>
      </div>
      <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Your account information</p>

      {isLoading ? (
        <div style={{ color: C.muted, fontSize: 13 }}>Loading…</div>
      ) : user ? (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          {/* Header strip */}
          <div style={{ background: C.primary, padding: "28px 24px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 14, background: "rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.white, fontWeight: 800, fontSize: 22, flexShrink: 0,
            }}>
              {getInitials(user)}
            </div>
            <div>
              <div style={{ color: C.white, fontWeight: 800, fontSize: 20 }}>
                {user.firstName} {user.lastName}
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                background: "rgba(255,255,255,0.2)", color: C.white, marginTop: 4, display: "inline-block",
              }}>
                {user.role?.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
            {updateProfile.isError && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.red }}>
                {updateProfile.error?.message || "Failed to update profile. Please try again."}
              </div>
            )}
            {[
              ["Email/Username", "email", editMode ? profileForm.email : user.email, true],
              ["First Name", "firstName", editMode ? profileForm.firstName : user.firstName, true],
              ["Last Name", "lastName", editMode ? profileForm.lastName : user.lastName, true],
              ["Role", null, (
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                  background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}`,
                }}>
                  {user.role}
                </span>
              ), false],
              ["Account Status", null, (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: user.isActive ? C.success : C.muted }} />
                  <span style={{ fontSize: 13, color: user.isActive ? C.success : C.muted, fontWeight: 600 }}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </span>
              ), false],
              ["Member Since", null, joinDate, false],
            ].map(([label, key, value, editable], i) => (
              <div key={label} style={{ display: "flex", gap: 12, alignItems: "center", borderBottom: `1px solid ${C.border}`, paddingBottom: 14 }}>
                <div style={{ minWidth: 120, fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px" }}>
                  {label}
                </div>
                <div style={{ flex: 1, fontSize: 14, color: C.text, fontWeight: 500 }}>
                  {editMode && editable && i !== 0? ( 
                    <input
                      type={key === "email" ? "email" : "text"}
                      value={value}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, [key]: e.target.value }))}
                      style={{
                        width: "100%", padding: "7px 10px", borderRadius: 8,
                        border: `1px solid ${C.border}`, fontSize: 14, color: C.text,
                        background: C.bg, fontFamily: "inherit", boxSizing: "border-box",
                      }}
                    />
                  ) : value}
                </div>
              </div>
            ))}

            {editMode && (
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={handleProfileCancel}
                  style={{
                    background: C.bg, color: C.muted, fontWeight: 600, fontSize: 13,
                    padding: "9px 18px", borderRadius: 10, border: `1px solid ${C.border}`, cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={updateProfile.isPending}
                  style={{
                    background: updateProfile.isPending ? C.muted : C.primary, color: C.white, fontWeight: 700,
                    fontSize: 13, padding: "9px 22px", borderRadius: 10, border: "none",
                    cursor: updateProfile.isPending ? "not-allowed" : "pointer", opacity: updateProfile.isPending ? 0.7 : 1,
                  }}
                >
                  {updateProfile.isPending ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}
          </div>


        </div>
      ) : (
        <div style={{ color: C.muted, fontSize: 13 }}>Could not load profile.</div>
      )}


      
          <div style={{display:"flex",  marginTop:"20px",  gap:20}}>

             <button
          onClick={() => setEditMode(true)}
          style={{
            background: C.primary, color: C.white, fontWeight: 700, fontSize: 13,
            padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer",
          }}
        >
          Edit Profile
        </button>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            background: C.primary, color: C.white, fontWeight: 700, fontSize: 13,
            padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer",
          }}
        >
          Log Stats
        </button>
        <button
          onClick={() => setShowPasswordModal(true)}
          style={{
            background: C.primary, color: C.white, fontWeight: 700, fontSize: 13,
            padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer",
          }}
        >
          Change Password
        </button>

          </div>

      {/* Stats Modal */}
      {modalOpen && (
        <div
          onClick={handleClose}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: C.white, borderRadius: 16, padding: "28px 28px 24px",
              width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Log Stats</h2>
                <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>Enter the stats you want to save</p>
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: C.bg, color: C.muted, fontWeight: 700, fontSize: 18,
                  width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {statsLoading ? (
              <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>Loading…</div>
            ) : (
              <form onSubmit={handleSubmit}>
                {createStats.isError && (
                  <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: C.red }}>
                    {createStats.error?.message || "Failed to save stats. Please try again."}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {STAT_FIELDS.map(({ key, label }) => (
                    <div key={key}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px", display: "block", marginBottom: 6 }}>
                        {label}
                      </label>
                      <input
                        type="number"
                        name={key}
                        value={stats[key]}
                        onChange={handleChange}
                        min="0"
                        placeholder="0"
                        style={{
                          width: "100%", padding: "9px 12px", borderRadius: 8,
                          border: `1px solid ${C.border}`, fontSize: 14, color: C.text,
                          background: C.bg, fontFamily: "inherit",
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={handleClose}
                    style={{
                      background: C.bg, color: C.muted, fontWeight: 600, fontSize: 13,
                      padding: "9px 18px", borderRadius: 10, border: `1px solid ${C.border}`, cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createStats.isPending}
                    style={{
                      background: createStats.isPending ? C.muted : C.primary, color: C.white, fontWeight: 700,
                      fontSize: 13, padding: "9px 22px", borderRadius: 10, border: "none",
                      cursor: createStats.isPending ? "not-allowed" : "pointer", opacity: createStats.isPending ? 0.7 : 1,
                    }}
                  >
                    {createStats.isPending ? "Saving…" : "Save Stats"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

{
  showPasswordModal &&
      <ChangePasswordModal user={user} onClose={()=>setShowPasswordModal(false)}/>
}
    </div>
  );
}
