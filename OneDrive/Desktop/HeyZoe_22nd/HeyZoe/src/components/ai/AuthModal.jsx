import React from "react";
import { X, Eye, EyeOff, Copy } from "lucide-react";
import { T } from "../../theme";
import { Btn, Card } from "../common/Primitives";

export function AuthModal({ show, mode, onClose, onSignup, onLogin, onGuest, onLinkPartner, email, setEmail, password, setPassword, showPassword, setShowPassword, error, partnerCode, setPartnerCode, shareCode, onGenerateCode, onSwitchToSignup, onSwitchToLogin }) {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <Card padding={24} style={{ width: "90%", maxWidth: 400, maxHeight: "80vh", overflowY: "auto" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, border: "none", background: "none", cursor: "pointer" }}>
          <X size={20} color={T.muted} />
        </button>

        {mode === "login" && (
          <div style={{ marginTop: 10 }}>
            <h2 style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 6px" }}>Welcome back</h2>
            <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted, margin: "0 0 18px" }}>Sign in to continue your journey</p>
            {error && <div style={{ fontFamily: T.font, fontSize: 12, color: T.error, marginBottom: 12, padding: 10, backgroundColor: "rgba(193, 53, 21, 0.1)", borderRadius: T.rSm }}>{error}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ height: 44, borderRadius: T.rSm, border: `1px solid ${T.hairline}`, padding: "0 12px", fontFamily: T.font, fontSize: 13, outline: "none" }} />
              <div style={{ position: "relative" }}>
                <input placeholder="Password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} style={{ height: 44, borderRadius: T.rSm, border: `1px solid ${T.hairline}`, padding: "0 12px 0 12px", fontFamily: T.font, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" }} />
                <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: 12, border: "none", background: "none", cursor: "pointer", color: T.muted }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Btn full onClick={onLogin}>Sign in</Btn>
              <button onClick={onSwitchToSignup} style={{ fontFamily: T.font, fontSize: 13, color: T.primary, border: "none", background: "none", cursor: "pointer", padding: "8px 0" }}>Don't have an account? Sign up</button>
              <div style={{ height: 1, backgroundColor: T.hairline, margin: "8px 0" }} />
              <Btn full variant="secondary" onClick={onGuest}>Continue as guest</Btn>
            </div>
          </div>
        )}

        {mode === "signup" && (
          <div style={{ marginTop: 10 }}>
            <h2 style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 6px" }}>Create account</h2>
            <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted, margin: "0 0 18px" }}>Start your planning journey</p>
            {error && <div style={{ fontFamily: T.font, fontSize: 12, color: T.error, marginBottom: 12, padding: 10, backgroundColor: "rgba(193, 53, 21, 0.1)", borderRadius: T.rSm }}>{error}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ height: 44, borderRadius: T.rSm, border: `1px solid ${T.hairline}`, padding: "0 12px", fontFamily: T.font, fontSize: 13, outline: "none" }} />
              <div style={{ position: "relative" }}>
                <input placeholder="Password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} style={{ height: 44, borderRadius: T.rSm, border: `1px solid ${T.hairline}`, padding: "0 12px", fontFamily: T.font, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" }} />
                <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: 12, border: "none", background: "none", cursor: "pointer", color: T.muted }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Btn full onClick={onSignup}>Create account</Btn>
              <button onClick={onSwitchToLogin} style={{ fontFamily: T.font, fontSize: 13, color: T.primary, border: "none", background: "none", cursor: "pointer", padding: "8px 0" }}>Already have an account? Sign in</button>
            </div>
          </div>
        )}

        {mode === "share-partner" && (
          <div style={{ marginTop: 10 }}>
            <h2 style={{ fontFamily: T.font, fontSize: 20, fontWeight: 700, color: T.ink, margin: "0 0 6px" }}>Link your partner</h2>
            <p style={{ fontFamily: T.font, fontSize: 13, color: T.muted, margin: "0 0 18px" }}>Create a shared couple dashboard</p>
            {error && <div style={{ fontFamily: T.font, fontSize: 12, color: T.error, marginBottom: 12, padding: 10, backgroundColor: "rgba(193, 53, 21, 0.1)", borderRadius: T.rSm }}>{error}</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ backgroundColor: T.surfaceStrong, padding: 12, borderRadius: T.rSm }}>
                <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginBottom: 8 }}>Your share code</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ flex: 1, fontFamily: T.font, fontSize: 18, fontWeight: 700, color: T.ink, letterSpacing: 4 }}>{shareCode || "----"}</div>
                  <button onClick={onGenerateCode} style={{ border: `1px solid ${T.hairline}`, background: "none", cursor: "pointer", padding: "8px", borderRadius: T.rSm, display: "flex", alignItems: "center", gap: 6 }}>
                    <Copy size={14} color={T.ink} /> Generate
                  </button>
                </div>
              </div>
              <div style={{ height: 1, backgroundColor: T.hairline }} />
              <div>
                <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginBottom: 8 }}>Enter partner's code</div>
                <input placeholder="E.g. ABC123" value={partnerCode} onChange={(e) => setPartnerCode(e.target.value.toUpperCase())} style={{ height: 44, borderRadius: T.rSm, border: `1px solid ${T.hairline}`, padding: "0 12px", fontFamily: T.font, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box", textTransform: "uppercase", letterSpacing: 2 }} />
              </div>
              <Btn full onClick={onLinkPartner}>Link partner</Btn>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
