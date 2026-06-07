import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../constants/colors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Icon, Icons } from "../constants/icons";
import { apiClient } from "../lib/api";

export default function LoginPage() {
  const [id, setId] = useState("");
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const [stage, setStage] = useState(1)


   const mutation = useMutation({
    mutationFn: (data) => apiClient.post("/auth/login", data),
    onSuccess: (result) => {
      if (result.ok && result.data?.success) {
        localStorage.setItem("accessToken", result.data.data.accessToken);
    queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
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

    if (!id.trim() || !password) {
      setError("Username/ID and password are required.");
      return;
    }
    mutation.mutate({ email: id, password });
  };

  return (

    <div style={{display:"flex", minHeight:"100vh",   background: "#F8F9F4 ", flexDirection:"column", padding: 40,  }}>
      <div style={{ maxWidth:"1600px", width:"100%",  margin:"0 auto"}}>
 <div style={{  marginBottom:"50px"   }}>
                          <img src="/medixlogo_black.png" width={200}/>

          </div>
    <div style={{  background: "#F8F9F4 ", display: "flex",  alignItems: "center",  }}>
     
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",  background: "#F8F9F4 " ,  }} className="login-left">
        <div>
          
          <h1 style={{ fontSize: 60, fontWeight: 800, color: C.text, marginBottom: 16, lineHeight: 1.2 }}>Hi, welcome back</h1>
          <p style={{ fontSize: 20, color: "#824444", fontWeight: 600,  }}>
            "It is health that is the real wealth, and not pieces of gold and silver." – Mahatma Gandhi
          </p>
          <div style={{ marginTop: 40, display: "flex" }}>
           <img  src="/oginImage.png"/>
          </div>
        </div>
      </div>
{/* */}

{
  stage ===1?
      <div style={{ flex:1, display: "flex",   }} className="login-right">
        <div style={{ width: "100%" , background:C.white, padding:40, boxShadow: "-4px 0 24px rgba(0,0,0,0.06)",  display:"flex",flexDirection:"column" ,  gap:10}}>
          <div style={{ display: "flex", gap: 20, marginBottom: 28, borderBottom:`0.5px solid ${C.border}` }}>
            <button type="button" style={{ padding: "10px 0", fontWeight: 600, fontSize: 14, background: "none", color: C.muted, borderBottom: `0.5px solid ${C.primary}`, marginBottom: -2 }}>Sign In</button>
            <button type="button" style={{  padding: "10px 0", fontWeight: 600, fontSize: 14, background: "none", color: C.muted }}>Fund Wallet</button>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 24 }}>Sign in to Dashboard</h2>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 8 }}>Patient ID/User ID</label>
          <input
            value={id}
            onChange={e => setId(e.target.value)}
            placeholder="123456"
            style={{ width: "100%", padding: "13px 16px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, background: "#f8fafc", marginBottom: 20, transition: "border 0.2s" }}
            onFocus={e => e.target.style.borderColor = C.primary}
            onBlur={e => e.target.style.borderColor = C.border}
          />
          <button type="button" disabled={!id}
            onClick={() => {
              setError("")
              setStage(2)}}
            style={{ width: "100%", padding: "14px", background: C.primary, color: C.white, borderRadius: 10, fontWeight: 700, fontSize: 15, transition: "background 0.2s" }}
            onMouseEnter={e => e.target.style.background = C.primaryHover}
            onMouseLeave={e => e.target.style.background = C.primary}
          >Continue</button>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, fontSize: 13 }}>
            <a href="#" style={{ color: C.primary, fontWeight: 500 }}>Forgot Password?</a>
            <span style={{ color: C.muted }}>Don&apos;t have an account? <a href="#" style={{ color: C.primary, fontWeight: 600 }}>Register</a></span>
          </div>
        </div>
      </div>:   <div style={{ flex:1, display: "flex",   }} className="login-right">
              <div style={{ width: "100%" , background:C.white, padding:40, boxShadow: "-4px 0 24px rgba(0,0,0,0.06)",  display:"flex",flexDirection:"column" ,  gap:20}}>
                <div style={{display:"flex" , alignItems:"center" , gap:"10px"}}>
                <button type="button" onClick={() => setStage(1)} style={{ background: "none", display: "flex", alignItems: "center", gap: 6, color: C.muted, fontWeight: 500, fontSize: 13, marginBottom: 24 }}>
                  <Icon d={Icons.arrowLeft} size={24} color={C.dark} />
                </button>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 24 }}>Sign in to Dashboard</h2>
      

                </div>
      
                <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 8 }}>Password</label>
                <div style={{ position: "relative", marginBottom: 20 }}>
                  <input
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{ width: "100%", padding: "13px 44px 13px 16px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, color: C.text, background: "#f8fafc", transition: "border 0.2s" }}
                    onFocus={e => e.target.style.borderColor = C.primary}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                  <button type="button" onClick={() => setShow(!show)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", color: C.muted }}>
                    <Icon d={show ? Icons.eyeOff : Icons.eye} size={18} color={C.muted} />
                  </button>
                </div>
      
                {error && (
                  <div style={{ background: "#fff1f2", border: `1px solid ${C.red}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.red, fontWeight: 500, marginBottom: 16 }}>
                    {error}
                  </div>
                )}
      
                <button
                  type="button"
                  onClick={()=> handleSubmit()}
                  disabled={!password || mutation.isPending}
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
}
    </div>

      </div>

    </div>
  );
}



/*

undefined
*/