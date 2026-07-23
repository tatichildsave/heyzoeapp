import React from "react";
import { CheckCircle2, User, Users } from "lucide-react";
import { T } from "../../theme";
import { CATEGORIES, catColor } from "../../constants";
import { Btn, Card, ScreenHeader } from "../common/Primitives";

export function WelcomeScreen({ onNext, name, setName }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 24 }}>
      <div />
      <div style={{ textAlign: "center" }}>
        <div style={{ position: "relative", margin: "0 auto 18px", width: 150, height: 210 }}>
          <div style={{ position: "absolute", inset: -10, borderRadius: T.rFull, background: `radial-gradient(circle, ${T.goldSoft} 0%, rgba(242,223,192,0) 70%)` }} />
          <img src="/mascot/hero.png" alt="" style={{ position: "relative", width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <h1 style={{ fontFamily: T.font, fontSize: 28, fontWeight: 700, color: T.ink, margin: "0 0 10px" }}>Hey Zoe</h1>
        <p style={{ fontFamily: T.font, fontSize: 16, color: T.muted, margin: 0, lineHeight: 1.5, padding: "0 12px" }}>
          Plan, execute, and grow intentionally. Zoe helps you turn your biggest aspirations into a life you actually live.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What should I call you?"
          style={{ marginTop: 20, width: "100%", maxWidth: 260, borderRadius: T.rFull, border: `1px solid ${T.hairline}`, padding: "12px 18px", fontFamily: T.font, fontSize: 14, textAlign: "center", outline: "none", boxSizing: "border-box" }}
        />
      </div>
      <div>
        <Btn full onClick={onNext}>Get started</Btn>
        <p style={{ textAlign: "center", fontFamily: T.font, fontSize: 13, color: T.mutedSoft, marginTop: 14 }}>6 or 12 months. One sprint at a time.</p>
      </div>
    </div>
  );
}

export function ModeScreen({ onNext, onBack, mode, setMode }) {
  return (
    <div style={{ padding: "0 20px", height: "100%", display: "flex", flexDirection: "column" }}>
      <ScreenHeader title="Who's planning?" subtitle="You can change this later." onBack={onBack} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
        {[
          { id: "individual", icon: User, title: "Just me", desc: "Individual goals, sprints, and reviews." },
          { id: "couple", icon: Users, title: "Me & my partner", desc: "Shared dashboard, joint goals, relationship reviews." },
        ].map((opt) => (
          <Card
            key={opt.id}
            onClick={() => setMode(opt.id)}
            padding={18}
            style={{ borderColor: mode === opt.id ? T.ink : T.hairline, borderWidth: mode === opt.id ? 2 : 1, display: "flex", alignItems: "center", gap: 14 }}
          >
            <div style={{ width: 44, height: 44, borderRadius: T.rFull, backgroundColor: T.surfaceStrong, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <opt.icon size={20} color={T.ink} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink }}>{opt.title}</div>
              <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginTop: 2 }}>{opt.desc}</div>
            </div>
            {mode === opt.id && <CheckCircle2 size={20} color={T.primary} />}
          </Card>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ paddingBottom: 24 }}><Btn full disabled={!mode} onClick={onNext}>Continue</Btn></div>
    </div>
  );
}

export function PartnerNameScreen({ onNext, onBack, partnerName, setPartnerName }) {
  return (
    <div style={{ padding: "0 20px", height: "100%", display: "flex", flexDirection: "column" }}>
      <ScreenHeader title="Your partner's name" subtitle="So Zoe can personalize your shared dashboard." onBack={onBack} />
      <div style={{ marginTop: 16 }}>
        <input
          value={partnerName}
          onChange={(e) => setPartnerName(e.target.value)}
          placeholder="e.g. Jordan"
          style={{ width: "100%", height: 56, borderRadius: T.rSm, border: `1px solid ${T.hairline}`, padding: "0 14px", fontFamily: T.font, fontSize: 16, color: T.ink, boxSizing: "border-box", outline: "none" }}
          onFocus={(e) => (e.target.style.border = `2px solid ${T.ink}`)}
          onBlur={(e) => (e.target.style.border = `1px solid ${T.hairline}`)}
        />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ paddingBottom: 24 }}><Btn full disabled={!partnerName.trim()} onClick={onNext}>Continue</Btn></div>
    </div>
  );
}

export function HorizonScreen({ onNext, onBack, horizon, setHorizon }) {
  return (
    <div style={{ padding: "0 20px", height: "100%", display: "flex", flexDirection: "column" }}>
      <ScreenHeader title="Choose your horizon" subtitle="How far out do you want to plan?" onBack={onBack} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
        {[
          { v: 6, title: "6 months", desc: "Focused, faster feedback loop." },
          { v: 12, title: "12 months", desc: "A full year of intentional growth." },
        ].map((opt) => (
          <Card
            key={opt.v}
            onClick={() => setHorizon(opt.v)}
            padding={18}
            style={{ borderColor: horizon === opt.v ? T.ink : T.hairline, borderWidth: horizon === opt.v ? 2 : 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <div>
              <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink }}>{opt.title}</div>
              <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginTop: 2 }}>{opt.desc}</div>
            </div>
            {horizon === opt.v && <CheckCircle2 size={20} color={T.primary} />}
          </Card>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ paddingBottom: 24 }}><Btn full disabled={!horizon} onClick={onNext}>Continue</Btn></div>
    </div>
  );
}

export function CategoryScreen({ onNext, onBack, selected, toggle }) {
  return (
    <div style={{ padding: "0 20px", height: "100%", display: "flex", flexDirection: "column" }}>
      <ScreenHeader title="What matters to you?" subtitle="Pick the areas of life you want to plan for." onBack={onBack} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14, overflowY: "auto" }}>
        {CATEGORIES.map((c) => {
          const isSel = selected.includes(c.id);
          const Icon = c.icon;
          return (
            <Card key={c.id} onClick={() => toggle(c.id)} padding={14} style={{ borderColor: isSel ? T.ink : T.hairline, borderWidth: isSel ? 2 : 1, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ width: 36, height: 36, borderRadius: T.rFull, backgroundColor: catColor(c.id) || T.surfaceStrong, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={17} color={T.ink} />
                </div>
                {isSel && <CheckCircle2 size={17} color={T.primary} />}
              </div>
              <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink }}>{c.label}</div>
            </Card>
          );
        })}
      </div>
      <div style={{ paddingTop: 12, paddingBottom: 24 }}>
        <Btn full disabled={selected.length === 0} onClick={onNext}>Continue{selected.length ? ` (${selected.length})` : ""}</Btn>
      </div>
    </div>
  );
}
