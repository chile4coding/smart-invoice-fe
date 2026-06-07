import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { C } from "../constants/colors";
import { Icon, Icons } from "../constants/icons";
import { useAuth } from "../hooks/useAuth";
import {
  useUsers,
  useCreateUser,
  useUpdateUserPassword,
  useUpdateUserRole,
  useDeleteUser,
  useUpdateUserProfile,
} from "../lib/apiHooks";
import ConfirmDialog from "../components/Confirmable";

const getInitials = (firstName, lastName) =>
  `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

const avatarColors = [C.primary, C.purple, C.orange, C.blue, C.success, C.accent];
const getAvatarColor = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
};

const roleColors = {
  SUPER_ADMIN: { bg: "#fdf4ff", color: C.purple, border: "#e9d5ff" },
  ADMIN: { bg: C.cardBlue, color: C.primary, border: "#c7d2fe" },
  USER: { bg: C.cardGreen, color: C.success, border: "#bbf7d0" },
};

const inputStyle = (focused) => ({
  width: "100%", padding: "10px 12px",
  border: `1.5px solid ${focused ? C.primary : C.border}`,
  borderRadius: 8, fontSize: 13, color: C.text, background: C.white,
  transition: "border 0.2s", outline: "none", fontFamily: "inherit",
});

const labelStyle = {
  fontSize: 12, fontWeight: 600, color: C.primaryTableColor,
  display: "block", marginBottom: 5,
};

// ─── SUBCOMPONENTS ─────────────────────────────────────────────────────────────

function Field({ label, required, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: C.red }}> *</span>}
      </label>
      {children}
      {error && <span style={{ fontSize: 11, color: C.red, fontWeight: 500 }}>{error}</span>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      disabled={disabled}
      style={{ ...inputStyle(focused), opacity: disabled ? 0.6 : 1 }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    />
  );
}

function SelectInput({ value, onChange, options, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      value={value} onChange={onChange} disabled={disabled}
      style={{ ...inputStyle(focused), appearance: "none", cursor: "pointer", opacity: disabled ? 0.6 : 1 }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Badge({ role }) {
  const style = roleColors[role] ?? roleColors.USER;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
      background: style.bg, color: style.color, border: `1px solid ${style.border}`,
      letterSpacing: "0.3px",
    }}>
      {role}
    </span>
  );
}

function StatusDot({ active }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: active ? C.success : C.muted, flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: active ? C.success : C.muted, fontWeight: 500 }}>
        {active ? "Active" : "Inactive"}
      </span>
    </span>
  );
}

function Skeleton({ width = "100%", height = 16, radius = 6 }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: "linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

function EmptyState({ search }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 24px" }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, background: C.cardBlue,
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px",
      }}>
        <Icon d={Icons.profile} size={26} color={C.primary} />
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>
        {search ? "No users found" : "No users yet"}
      </div>
      <div style={{ fontSize: 13, color: C.muted }}>
        {search ? `No results for "${search}"` : "Create the first user to get started."}
      </div>
    </div>
  );
}

// ─── CREATE USER MODAL ─────────────────────────────────────────────────────────

function CreateUserModal({ onClose }) {
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "USER" });

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setFieldErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    if (!form.email.trim()) errs.email = "Email is required.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    return errs;
  };

  const mutation = useCreateUser();

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) return setFieldErrors(errs);

    mutation.mutate(
      { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), password: form.password, role: form.role },
      {
        onSuccess: (result) => {
          if (result.ok && result.data?.success) {
            onClose();
          } else {
            const details = result.data?.error?.details;
            if (details?.length) {
              const errs = {};
              details.forEach(({ field, message }) => { errs[field] = message; });
              setFieldErrors(errs);
            }
          }
        },
      }
    );
  };

  const loading = mutation.isPending;
  const apiError = !mutation.isPending && mutation.isError
    ? mutation.error?.message
    : null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 16,
    }}>
      <div style={{
        background: C.bg, borderRadius: 12, width: "100%", maxWidth: 520,
        maxHeight: "95vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", background: C.white,
          borderBottom: `1px solid ${C.border}`, borderRadius: "12px 12px 0 0",
          position: "sticky", top: 0, zIndex: 10,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Create User</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Add a new user to the system</div>
          </div>
          <button onClick={onClose} style={{ background: C.bg, borderRadius: 8, padding: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={Icons.x} size={18} color={C.muted} />
          </button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="First Name" required error={fieldErrors.firstName}>
              <TextInput value={form.firstName} onChange={set("firstName")} placeholder="John" disabled={loading} />
            </Field>
            <Field label="Last Name" required error={fieldErrors.lastName}>
              <TextInput value={form.lastName} onChange={set("lastName")} placeholder="Doe" disabled={loading} />
            </Field>
          </div>

          <Field label="Username/Email Address" required error={fieldErrors.email}>
            <TextInput type="text" value={form.email} onChange={set("email")} placeholder="john" disabled={loading} />
          </Field>

          <Field label="Password" required error={fieldErrors.password}>
            <div style={{ position: "relative" }}>
              <TextInput
                type={showPassword ? "text" : "password"}
                value={form.password} onChange={set("password")}
                placeholder="Min. 8 characters" disabled={loading}
              />
              <button
                onClick={() => setShowPassword((p) => !p)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", display: "flex", padding: 2 }}
              >
                <Icon d={showPassword ? Icons.eyeOff : Icons.eye} size={16} color={C.muted} />
              </button>
            </div>
          </Field>

          <Field label="Role" required error={fieldErrors.role}>
            <SelectInput
              value={form.role} onChange={set("role")} disabled={loading}
              options={[{ value: "USER", label: "User" }, { value: "ADMIN", label: "Admin" }]}
            />
          </Field>

          {apiError && (
            <div style={{ background: "#fff1f2", border: `1px solid ${C.red}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.red, fontWeight: 500 }}>
              {apiError}
            </div>
          )}
        </div>

        <div style={{
          display: "flex", justifyContent: "flex-end", gap: 10,
          padding: "16px 24px", background: C.white,
          borderTop: `1px solid ${C.border}`, borderRadius: "0 0 12px 12px",
          position: "sticky", bottom: 0,
        }}>
          <button onClick={onClose} style={{ padding: "10px 22px", background: C.bg, color: C.muted, borderRadius: 8, fontWeight: 600, fontSize: 13, border: `1.5px solid ${C.border}` }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit} disabled={loading}
            style={{ padding: "10px 28px", background: loading ? C.muted : C.primary, color: C.white, borderRadius: 8, fontWeight: 700, fontSize: 13, opacity: loading ? 0.7 : 1, transition: "background 0.2s" }}
          >
            {loading ? "Creating…" : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CHANGE ROLE MODAL ─────────────────────────────────────────────────────────

function ChangeRoleModal({ user, onClose }) {
  const [role, setRole] = useState(user.role);
  const mutation = useUpdateUserRole();

  const handleSubmit = () => {
    mutation.mutate({ id: user.id, role }, {
      onSuccess: (result) => {
        if (result.ok) onClose();
      },
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div style={{ background: C.white, borderRadius: 12, width: "100%", maxWidth: 400, boxShadow: "0 24px 80px rgba(0,0,0,0.25)", padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>Change Role</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>
          {user.firstName} {user.lastName}
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ ...inputStyle(false), appearance: "none" }}
          >
            {["USER", "ADMIN", "SUPER_ADMIN"].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", background: C.bg, color: C.muted, borderRadius: 8, fontWeight: 600, fontSize: 13, border: `1.5px solid ${C.border}` }}>Cancel</button>
          <button
            onClick={handleSubmit} disabled={mutation.isPending}
            style={{ padding: "9px 20px", background: mutation.isPending ? C.muted : C.primary, color: C.white, borderRadius: 8, fontWeight: 700, fontSize: 13 }}
          >
            {mutation.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CHANGE PASSWORD MODAL ─────────────────────────────────────────────────────

export function ChangePasswordModal({ user, onClose }) {
  const [newPassword, setNewPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const mutation = useUpdateUserPassword();

  const handleSubmit = () => {
    if (newPassword.length < 8) return setErr("Password must be at least 8 characters.");
    mutation.mutate({ id: user.id, newPassword }, {
      onSuccess: (result) => {
        if (result.ok) onClose();
        else setErr(result.data?.error?.message || "Failed to update password.");
      },
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div style={{ background: C.white, borderRadius: 12, width: "100%", maxWidth: 400, boxShadow: "0 24px 80px rgba(0,0,0,0.25)", padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>Change Password</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>{user.firstName} {user.lastName}</div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>New Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={show ? "text" : "password"}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setErr(""); }}
              placeholder="Min. 8 characters"
              style={{ ...inputStyle(false), paddingRight: 40 }}
            />
            <button onClick={() => setShow(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", display: "flex" }}>
              <Icon d={show ? Icons.eyeOff : Icons.eye} size={16} color={C.muted} />
            </button>
          </div>
        </div>
        {err && <div style={{ fontSize: 12, color: C.red, fontWeight: 500, marginBottom: 12 }}>{err}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", background: C.bg, color: C.muted, borderRadius: 8, fontWeight: 600, fontSize: 13, border: `1.5px solid ${C.border}` }}>Cancel</button>
          <button
            onClick={handleSubmit} disabled={mutation.isPending}
            style={{ padding: "9px 20px", background: mutation.isPending ? C.muted : C.primary, color: C.white, borderRadius: 8, fontWeight: 700, fontSize: 13 }}
          >
            {mutation.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EDIT PROFILE MODAL ────────────────────────────────────────────────────────

function EditProfileModal({ user, onClose }) {
  const [form, setForm] = useState({ firstName: user.firstName, lastName: user.lastName });
  const [fieldErrors, setFieldErrors] = useState({});
  const mutation = useUpdateUserProfile();

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setFieldErrors((p) => ({ ...p, [field]: "" }));
  };

  const handleSubmit = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required.";
    if (!form.lastName.trim()) errs.lastName = "Last name is required.";
    if (Object.keys(errs).length) return setFieldErrors(errs);

    mutation.mutate(
      { id: user.id, firstName: form.firstName.trim(), lastName: form.lastName.trim() },
      {
        onSuccess: (result) => {
          if (result.ok && result.data?.success) {
            onClose();
          } else {
            const details = result.data?.error?.details;
            if (details?.length) {
              const errs = {};
              details.forEach(({ field, message }) => { errs[field] = message; });
              setFieldErrors(errs);
            }
          }
        },
      }
    );
  };

  const loading = mutation.isPending;
  const apiError = !mutation.isPending && mutation.isError ? mutation.error?.message : null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}>
      <div style={{ background: C.white, borderRadius: 12, width: "100%", maxWidth: 440, boxShadow: "0 24px 80px rgba(0,0,0,0.25)", padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 4 }}>Edit Profile</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>{user.firstName} {user.lastName}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection:"column" , gap: 14 }}>
            <Field label="First Name" required error={fieldErrors.firstName}>
              <TextInput value={form.firstName} onChange={set("firstName")} placeholder="John" disabled={loading} />
            </Field>
            <Field label="Last Name" required error={fieldErrors.lastName}>
              <TextInput value={form.lastName} onChange={set("lastName")} placeholder="Doe" disabled={loading} />
            </Field>
          </div>
          {apiError && (
            <div style={{ background: "#fff1f2", border: `1px solid ${C.red}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.red, fontWeight: 500 }}>
              {apiError}
            </div>
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", background: C.bg, color: C.muted, borderRadius: 8, fontWeight: 600, fontSize: 13, border: `1.5px solid ${C.border}` }}>Cancel</button>
          <button
            onClick={handleSubmit} disabled={loading}
            style={{ padding: "9px 20px", background: loading ? C.muted : C.primary, color: C.white, borderRadius: 8, fontWeight: 700, fontSize: 13 }}
          >
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── USERS PAGE ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { hasRole } = useAuth();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [roleModal, setRoleModal] = useState(null);
  const [passwordModal, setPasswordModal] = useState(null);
  const [editProfileModal, setEditProfileModal] = useState(null);
  const [confirm,  setConfirm] =  useState({
    description :"",
    title:"",
    open:false
  })

  const LIMIT = 10;

  const { data, isLoading, error } = useUsers(page, LIMIT, search);
  const deleteMutation = useDeleteUser();

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); setSearch(searchInput); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  if (!hasRole("SUPER_ADMIN")) return <Navigate to="/dashboard" replace />;

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const start = (page - 1) * LIMIT + 1;
  const end = Math.min(page * LIMIT, total);

  const handleDelete = (id,  status) => {
    if(status){
      setConfirm({
        title: "Deactivate",
        description:"Are you sure you want to de-active this user?",
        open:true,
        id
      })
    }else{
      setConfirm({
        title: "Activate",
        description:"Are you sure you want to activate this user?",
        open:true,
        id
      })
    }
    
  };

  return (
    <>
      <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
      {roleModal && <ChangeRoleModal user={roleModal} onClose={() => setRoleModal(null)} />}
      {passwordModal && <ChangePasswordModal user={passwordModal} onClose={() => setPasswordModal(null)} />}
      {editProfileModal && <EditProfileModal user={editProfileModal} onClose={() => setEditProfileModal(null)} />}

      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Users</h1>
            <p style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>Manage all system users and their roles</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 20px", background: C.primary, color: C.white, borderRadius: 9, fontWeight: 700, fontSize: 13, boxShadow: "0 2px 8px rgba(99,102,241,0.25)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.primaryHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.primary)}
          >
            <Icon d={Icons.newReg} size={16} color={C.white} />
            Create User
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "Total Users", value: total, bg: C.cardBlue, color: C.primary },
            { label: "Active", value: users.filter(u => u.isActive).length, bg: C.cardGreen, color: C.success },
            { label: "Admins", value: users.filter(u => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length, bg: "#fdf4ff", color: C.purple },
          ].map(({ label, value, bg, color }) => (
            <div key={label} style={{ background: bg, borderRadius: 10, padding: "12px 20px", display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 120 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.4px" }}>{label}</span>
              <span style={{ fontSize: 22, fontWeight: 800, color }}>
                {isLoading ? <Skeleton width={40} height={22} /> : value}
              </span>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          {/* Toolbar */}
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}>
                <Icon d={Icons.search} size={15} color={C.muted} />
              </span>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name or email…"
                style={{ width: "100%", padding: "9px 12px 9px 34px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 13, color: C.text, background: C.bg, outline: "none", fontFamily: "inherit" }}
                onFocus={(e) => (e.target.style.borderColor = C.primary)}
                onBlur={(e) => (e.target.style.borderColor = C.border)}
              />
            </div>
            {!isLoading && (
              <span style={{ fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>
                {total > 0 ? `${start}–${end} of ${total}` : "0 users"}
              </span>
            )}
          </div>

          {error && (
            <div style={{ margin: 20, background: "#fff1f2", border: `1px solid ${C.red}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.red, fontWeight: 500 }}>
              {error.message ?? "Failed to load users."}
            </div>
          )}

          {/* Table */}
          <div style={{ overflowX: "auto" }} className="users-table-wrap">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: `1px solid ${C.border}` }}>
                  {[
                    { label: "User", cls: "" },
                    { label: "Email/Username", cls: "hide-mobile" },
                    { label: "Role", cls: "" },
                    { label: "Status", cls: "hide-mobile" },
                    { label: "Created", cls: "hide-mobile" },
                    { label: "Actions", cls: "" },
                  ].map(({ label, cls }) => (
                    <th key={label} className={cls} style={{ padding: "11px 16px", textAlign: "left", fontWeight: 700, color: C.primaryTableColor, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.4px", whiteSpace: "nowrap" }}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                      {[1, 2, 3, 4, 5, 6].map((c) => (
                        <td key={c} style={{ padding: "14px 16px" }}>
                          <Skeleton width={c === 1 ? 140 : c === 3 ? 70 : 100} height={14} />
                        </td>
                      ))}
                    </tr>
                  ))
                  : users.length === 0
                  ? (
                    <tr><td colSpan={6}><EmptyState search={search} /></td></tr>
                  )
                  : users.map((user, i) => {
                    const initials = getInitials(user.firstName, user.lastName);
                    const avatarBg = getAvatarColor(user.id);
                    const createdAt = new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

                    return (
                      <tr
                        key={user.id}
                        style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : "#fafbfc", transition: "background 0.15s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = C.cardBlue)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? C.white : "#fafbfc")}
                      >
                        <td style={{ padding: "13px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: C.text }}>{user.firstName} {user.lastName}</div>
                              <div style={{ fontSize: 11, color: C.muted }}>ID: {user.id.slice(0, 8)}…</div>
                            </div>
                          </div>
                        </td>
                        <td className="hide-mobile" style={{ padding: "13px 16px", color: C.muted }}>{user.email}</td>
                        <td style={{ padding: "13px 16px" }}><Badge role={user.role} /></td>
                        <td className="hide-mobile" style={{ padding: "13px 16px" }}><StatusDot active={user.isActive} /></td>
                        <td className="hide-mobile" style={{ padding: "13px 16px", color: C.muted, whiteSpace: "nowrap" }}>{createdAt}</td>
                        <td style={{ padding: "13px 16px" }}>
                          <div className="table-action-btns" style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => setEditProfileModal(user)}
                              title="Edit profile"
                              style={{ padding: "5px 10px", background: C.cardGreen, color: C.success, borderRadius: 6, fontSize: 11, fontWeight: 600, border: `1px solid #bbf7d0` }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setRoleModal(user)}
                              title="Change role"
                              style={{ padding: "5px 10px", background: C.cardBlue, color: C.primary, borderRadius: 6, fontSize: 11, fontWeight: 600, border: `1px solid #c7d2fe` }}
                            >
                              Role
                            </button>
                            <button
                              onClick={() => setPasswordModal(user)}
                              title="Change password"
                              style={{ padding: "5px 10px", background: C.cardOrange, color: C.orange, borderRadius: 6, fontSize: 11, fontWeight: 600, border: `1px solid #fed7aa` }}
                            >
                              PW
                            </button>
                            <button
                              onClick={() => handleDelete(user.id, user.isActive)}
                              title="Deactivate user"
                              style={{ padding: "5px 10px", background: user?.isActive ? "#fff1f2" :"#0ec97b", color: user?.isActive ? C.red:"white", borderRadius: 6, fontSize: 11, fontWeight: 600, border: user?.isActive ? `1px solid #fecaca` :"1px solid #0ec97b" }}
                            >
                              {
                                user?.isActive ? "Del":"Act"
                              }
                            
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: `1px solid ${C.border}`, flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: 12, color: C.muted }}>Page {page} of {totalPages}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: "7px 14px", borderRadius: 7, fontSize: 13, fontWeight: 600, background: page === 1 ? C.bg : C.white, color: page === 1 ? C.muted : C.text, border: `1.5px solid ${C.border}`, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)} style={{ width: 34, height: 34, borderRadius: 7, fontSize: 13, fontWeight: 600, background: p === page ? C.primary : C.white, color: p === page ? C.white : C.text, border: `1.5px solid ${p === page ? C.primary : C.border}` }}>
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: "7px 14px", borderRadius: 7, fontSize: 13, fontWeight: 600, background: page === totalPages ? C.bg : C.white, color: page === totalPages ? C.muted : C.text, border: `1.5px solid ${C.border}`, cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1 }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.description}
        confirmLabel={confirm.title}
        danger={confirm.title === "Activate"?false:true}
        onCancel={() => setConfirm({ open: false, title:"", description:"" })}
        onConfirm={() => {
          deleteMutation.mutate(confirm.id);
          setConfirm({ open: false, title:"", description:"" });
        }}
      />
    </>
  );
}
