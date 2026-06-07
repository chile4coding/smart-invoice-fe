import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { C } from "../constants/colors";
import { Icon, Icons } from "../constants/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api";

export default function LoginPage2() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const state  =  useLocation()
  

  const mutation = useMutation({
    mutationFn: (data) => apiClient.post("/auth/login", data),
    onSuccess: (result) => {
      if (result.ok && result.data?.success) {
        localStorage.setItem("accessToken", result.data.data.accessToken);
        queryClient.setQueryData(["auth", "me"], result.data.data.user);
        navigate("/dashboard");
      } else {
        setError(result?.data?.error?.message ?? "Login failed");
      }
    },
    onError: () => {
      setError("Network error. Please try again.");
    },
  });

  const handleSubmit = () => {
    if (!state?.state?.id.trim() || !password) {
      setError("Username/ID and password are required.");
      return;
    }
    mutation.mutate({ email: state.state.id, password });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "stretch" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40 }} className="login-left">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, background: C.primary, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>M</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 22, color: C.text }}>MedixTrak</span>
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 800, color: C.text, marginBottom: 16, lineHeight: 1.2 }}>Hi, welcome back</h1>
          <p style={{ fontSize: 14, color: C.primary, fontWeight: 500, fontStyle: "italic", maxWidth: 320 }}>
            "It is health that is the real wealth, and not pieces of gold and silver." – Mahatma Gandhi
          </p>
          <div style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
            <svg width="200" height="180" viewBox="0 0 200 180" fill="none">
              <ellipse cx="100" cy="155" rx="70" ry="20" fill="#e2e8f0" />
              <rect x="70" y="95" width="60" height="70" rx="12" fill="#fbbf24" />
              <circle cx="100" cy="55" r="22" fill="#fed7aa" />
              <rect x="86" y="50" width="6" height="12" rx="3" fill="#92400e" />
              <rect x="108" y="50" width="6" height="12" rx="3" fill="#92400e" />
              <path d="M90 72 Q100 80 110 72" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />
              <rect x="65" y="110" width="18" height="40" rx="8" fill="#a5f3fc" transform="rotate(-15 65 110)" />
              <rect x="120" y="105" width="18" height="45" rx="8" fill="#a5f3fc" transform="rotate(10 120 105)" />
              <circle cx="55" cy="95" r="8" fill="#6ee7b7" opacity="0.8" />
              <circle cx="148" cy="88" r="6" fill="#6ee7b7" opacity="0.7" />
            </svg>
          </div>
        </div>
      </div>

      <div style={{ width: 460, display: "flex", alignItems: "center", justifyContent: "center", padding: 40, background: C.white, boxShadow: "-4px 0 24px rgba(0,0,0,0.06)" }} className="login-right">
        <div style={{ width: "100%", maxWidth: 360 }}>
          <button onClick={() => navigate("/login")} style={{ background: "none", display: "flex", alignItems: "center", gap: 6, color: C.muted, fontWeight: 500, fontSize: 13, marginBottom: 24 }}>
            <Icon d={Icons.arrowLeft} size={16} color={C.muted} /> Back
          </button>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 24 }}>Sign in to Dashboard</h2>


          <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 8 }}>Password</label>
          <div style={{ position: "relative", marginBottom: 20 }}>
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ width: "100%", padding: "13px 44px 13px 16px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, background: "#f8fafc", transition: "border 0.2s" }}
              onFocus={e => e.target.style.borderColor = C.primary}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", color: C.muted }}>
              <Icon d={show ? Icons.eyeOff : Icons.eye} size={18} color={C.muted} />
            </button>
          </div>

          {error && (
            <div style={{ background: "#fff1f2", border: `1px solid ${C.red}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.red, fontWeight: 500, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            style={{ width: "100%", padding: "14px", background: mutation.isPending ? C.muted : C.primary, color: C.white, borderRadius: 10, fontWeight: 700, fontSize: 15, transition: "background 0.2s", cursor: mutation.isPending ? "not-allowed" : "pointer" }}
            onMouseEnter={e => !mutation.isPending && (e.target.style.background = C.primaryHover)}
            onMouseLeave={e => !mutation.isPending && (e.target.style.background = C.primary)}
          >
            {mutation.isPending ? "Signing In..." : "Sign In"}
          </button>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, fontSize: 13 }}>
            <a href="#" style={{ color: C.primary, fontWeight: 500 }}>Forgot your password?</a>
            <span style={{ color: C.muted }}>Don&apos;t have an account? <a href="#" style={{ color: C.primary, fontWeight: 600 }}>Register</a></span>
          </div>
        </div>
      </div>
    </div>
  );
}