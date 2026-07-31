import React, { useState } from "react";
import { Bug, Check, Lightbulb, MessageCircle } from "lucide-react";
import { T } from "../../theme";
import { Btn, Card, ScreenHeader } from "../common/Primitives";
import { Pill } from "../common/Visuals";
import { submitFeedback } from "../../services/feedback";

const TYPES = [
  { id: "bug", label: "Something broke", icon: Bug },
  { id: "idea", label: "An idea", icon: Lightbulb },
  { id: "other", label: "Something else", icon: MessageCircle },
];

const textAreaStyle = {
  width: "100%", borderRadius: T.rSm, border: `1px solid ${T.hairline}`, padding: 12,
  fontFamily: T.font, fontSize: 14, boxSizing: "border-box", resize: "none", outline: "none",
};

export function FeedbackScreen({ uid, onBack }) {
  const [type, setType] = useState("bug");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const submit = async () => {
    setStatus("sending");
    try {
      await submitFeedback(uid, { type, text });
      setStatus("sent");
      setText("");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div style={{ padding: "0 20px", height: "100%" }}>
        <ScreenHeader title="Feedback" onBack={onBack} />
        <Card padding={24} style={{ marginTop: 20, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: T.rFull, backgroundColor: T.goldSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={20} color={T.gold} />
            </div>
          </div>
          <div style={{ fontFamily: T.font, fontSize: 15, fontWeight: 600, color: T.ink }}>Got it — thank you</div>
          <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginTop: 4 }}>This genuinely helps during the beta.</div>
          <div style={{ marginTop: 16 }}><Btn variant="secondary" onClick={() => setStatus("idle")}>Send another</Btn></div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 20px 40px", height: "100%", overflowY: "auto" }}>
      <ScreenHeader title="Feedback" subtitle="This is a beta — tell me what breaks or what's confusing." onBack={onBack} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {TYPES.map((t) => (
            <Pill key={t.id} label={t.label} icon={t.icon} selected={type === t.id} onClick={() => setType(t.id)} />
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={type === "bug" ? "What happened, and what were you doing right before?" : "What's on your mind?"}
          style={textAreaStyle}
        />
        {status === "error" && <div style={{ fontFamily: T.font, fontSize: 12, color: "#b0463a" }}>Couldn't send that — check your connection and try again.</div>}
        <Btn full disabled={!text.trim() || status === "sending"} onClick={submit}>{status === "sending" ? "Sending…" : "Send feedback"}</Btn>
      </div>
    </div>
  );
}
