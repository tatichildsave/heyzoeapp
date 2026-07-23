import React, { useState } from "react";
import { T } from "../../theme";
import { CATEGORIES } from "../../constants";
import { Btn, Card, Input, ScreenHeader } from "../common/Primitives";
import { Pill } from "../common/Visuals";
import { isFirebaseConfigured } from "../../services/firebase";

const textAreaStyle = {
  width: "100%", borderRadius: T.rSm, border: `1px solid ${T.hairline}`, padding: 12,
  fontFamily: T.font, fontSize: 14, boxSizing: "border-box", resize: "none", outline: "none",
};

export function BecomeExpertScreen({ onBack, onSaved, existingProfile }) {
  const [form, setForm] = useState(existingProfile || {
    name: "", bio: "", categories: [], rate: 40, location: "", virtual: true, inPerson: false, calendlyUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleCat = (id) => set("categories", form.categories.includes(id) ? form.categories.filter((c) => c !== id) : [...form.categories, id]);
  const valid = form.name.trim() && form.bio.trim() && form.categories.length > 0 && (form.virtual || form.inPerson);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const profile = { ...form, rating: existingProfile?.rating || 5.0 };
      await onSaved(profile);
    } catch (e) {
      setError("Couldn't publish your profile right now — try again in a moment.");
    }
    setSaving(false);
  };

  if (!isFirebaseConfigured) {
    return (
      <div style={{ padding: "0 20px 40px", height: "100%" }}>
        <ScreenHeader title="Become an expert" onBack={onBack} />
        <Card padding={18} style={{ marginTop: 12 }}>
          <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted }}>
            Listing yourself publicly needs a Firebase project connected (see FIREBASE_SETUP.md) so other users can actually see your profile.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 20px 40px", height: "100%", overflowY: "auto" }}>
      <ScreenHeader title={existingProfile ? "Edit your profile" : "Become an expert"} subtitle="Listed publicly in Hey Zoe's expert directory" onBack={onBack} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
        <Input label="Your name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" />
        <div>
          <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 6 }}>Short bio</div>
          <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3} placeholder="What you help people with, and your background" style={textAreaStyle} />
        </div>
        <div>
          <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.ink, marginBottom: 8 }}>Goal categories you have expertise in</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map((c) => (
              <Pill key={c.id} label={c.label} icon={c.icon} selected={form.categories.includes(c.id)} onClick={() => toggleCat(c.id)} />
            ))}
          </div>
        </div>
        <Input label="Rate per 30 minutes (USD)" type="number" min={0} value={form.rate} onChange={(e) => set("rate", Number(e.target.value))} />
        <Input label="Location" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, Country or Remote" />
        <div style={{ display: "flex", gap: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: T.font, fontSize: 14, color: T.ink, cursor: "pointer" }}>
            <input type="checkbox" checked={form.virtual} onChange={(e) => set("virtual", e.target.checked)} style={{ width: 16, height: 16 }} /> Open to virtual
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: T.font, fontSize: 14, color: T.ink, cursor: "pointer" }}>
            <input type="checkbox" checked={form.inPerson} onChange={(e) => set("inPerson", e.target.checked)} style={{ width: 16, height: 16 }} /> Open to in-person
          </label>
        </div>
        <Input label="Your Calendly link" value={form.calendlyUrl} onChange={(e) => set("calendlyUrl", e.target.value)} placeholder="https://calendly.com/your-name" />
        {error && <div style={{ fontFamily: T.font, fontSize: 12, color: "#b0463a" }}>{error}</div>}
        <Btn full disabled={!valid || saving} onClick={save}>{saving ? "Publishing…" : existingProfile ? "Save changes" : "Publish my profile"}</Btn>
      </div>
    </div>
  );
}
