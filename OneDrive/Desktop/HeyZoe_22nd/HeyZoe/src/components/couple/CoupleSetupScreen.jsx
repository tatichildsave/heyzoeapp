import React, { useState } from "react";
import { Check, Copy, Users } from "lucide-react";
import { T } from "../../theme";
import { Btn, Card, Input, ScreenHeader } from "../common/Primitives";
import { ZoeAvatar } from "../common/Visuals";
import { isFirebaseConfigured } from "../../services/firebase";
import { ensureShareCode, linkPartnerByCode } from "../../services/couple";
import { trackEvent } from "../../services/analytics";

/**
 * Reached from You > More > Couple mode. Two ways in, matching the flow
 * already documented in AUTH_FEATURES.md: generate a code and send it to
 * your partner, or enter the code they sent you. Linking is real —
 * verified and written server-side (functions/index.js: linkPartner) —
 * not just a local label.
 */
export function CoupleSetupScreen({ uid, profile, onBack }) {
  const [code, setCode] = useState(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [enteredCode, setEnteredCode] = useState("");
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState("");

  const linked = profile.mode === "couple" && profile.partnerId;

  const handleGetCode = async () => {
    setCodeLoading(true);
    setError("");
    try {
      const c = await ensureShareCode(uid);
      setCode(c);
      trackEvent("couple_share_code_generated");
    } catch (e) {
      setError("Couldn't generate a code right now — try again in a moment.");
    }
    setCodeLoading(false);
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleLink = async () => {
    if (!enteredCode.trim()) return;
    setLinking(true);
    setError("");
    try {
      await linkPartnerByCode(enteredCode, "You");
      trackEvent("couple_linked");
      setEnteredCode("");
    } catch (e) {
      setError(e?.message?.replace(/^.*: /, "") || "Couldn't link with that code.");
    }
    setLinking(false);
  };

  if (!isFirebaseConfigured) {
    return (
      <div style={{ padding: "20px 20px 100px", height: "100%" }}>
        <ScreenHeader title="Couple mode" onBack={onBack} />
        <Card padding={18} style={{ marginTop: 12 }}>
          <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted }}>
            Couple mode needs a Firebase project connected (see FIREBASE_SETUP.md) — linking accounts across two devices has to go through a real backend.
          </div>
        </Card>
      </div>
    );
  }

  if (linked) {
    return (
      <div style={{ padding: "20px 20px 100px", height: "100%" }}>
        <ScreenHeader title="Couple mode" onBack={onBack} />
        <Card padding={20} style={{ marginTop: 12, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center" }}><ZoeAvatar size={40} mood="celebrate" glow /></div>
          <div style={{ fontFamily: T.font, fontSize: 15, fontWeight: 600, color: T.ink, marginTop: 12 }}>Linked with {profile.partnerName || "your partner"}</div>
          <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginTop: 4 }}>Mark a goal "share with partner" when creating it to see it in Us.</div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 20px 100px", overflowY: "auto", height: "100%" }}>
      <ScreenHeader title="Couple mode" subtitle="Plan life together with a partner." onBack={onBack} />

      <Card padding={16} style={{ marginTop: 12 }}>
        <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 4 }}>Your code</div>
        <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginBottom: 12 }}>Share this with your partner so they can link to you.</div>
        {code ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              flex: 1, fontFamily: T.font, fontSize: 22, fontWeight: 700, letterSpacing: 3, color: T.ink,
              backgroundColor: T.goldSoft, borderRadius: T.rMd, padding: "10px 16px", textAlign: "center",
            }}>{code}</div>
            <button onClick={handleCopy} aria-label="Copy code" style={{ background: "none", border: `1px solid ${T.hairline}`, borderRadius: T.rMd, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              {copied ? <Check size={17} color={T.sage} /> : <Copy size={17} color={T.ink} />}
            </button>
          </div>
        ) : (
          <Btn onClick={handleGetCode} disabled={codeLoading}>{codeLoading ? "Generating…" : "Get my code"}</Btn>
        )}
      </Card>

      <Card padding={16} style={{ marginTop: 12 }}>
        <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 4 }}>Have a code?</div>
        <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginBottom: 12 }}>Enter what your partner sent you to link up.</div>
        <div style={{ display: "flex", gap: 10 }}>
          <Input value={enteredCode} onChange={(e) => setEnteredCode(e.target.value.toUpperCase())} placeholder="ABC123" style={{ flex: 1 }} inputStyle={{ letterSpacing: 2 }} />
          <Btn onClick={handleLink} disabled={linking || !enteredCode.trim()} icon={Users}>{linking ? "Linking…" : "Link"}</Btn>
        </div>
        {error && <div style={{ fontFamily: T.font, fontSize: 12, color: "#b0463a", marginTop: 10 }}>{error}</div>}
      </Card>
    </div>
  );
}
