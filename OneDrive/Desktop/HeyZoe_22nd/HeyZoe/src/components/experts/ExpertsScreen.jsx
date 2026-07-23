import React, { useState } from "react";
import { Star } from "lucide-react";
import { T } from "../../theme";
import { CATEGORIES, catById } from "../../constants";
import { Card, ScreenHeader } from "../common/Primitives";
import { Pill } from "../common/Visuals";

function Initials({ name }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: T.rFull, flexShrink: 0,
      background: `linear-gradient(135deg, ${T.ink}, ${T.gold})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: T.font, fontSize: 16, fontWeight: 700, color: "#fff",
    }}>
      {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
    </div>
  );
}

/**
 * Reached from You > More > Expert marketplace, or from "Talk to an
 * expert" inside the goal builder (pre-filtered to that goal's category).
 * Listings are a live merge of the public Firestore directory and a seed
 * set — see services/experts — so it's never empty on a fresh install.
 */
export function ExpertsScreen({ experts, categoryFilter, onBack, onOpenExpert }) {
  const [filter, setFilter] = useState(categoryFilter || "all");
  const shown = filter === "all" ? experts : experts.filter((e) => e.categories.includes(filter));

  return (
    <div style={{ padding: "0 20px 100px", height: "100%", overflowY: "auto" }}>
      <ScreenHeader title="Find an expert" subtitle="Book a session with a signed-up consultant" onBack={onBack} />
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 12, paddingBottom: 4 }}>
        <Pill label="All" selected={filter === "all"} onClick={() => setFilter("all")} />
        {CATEGORIES.map((c) => (
          <Pill key={c.id} label={c.label} icon={c.icon} selected={filter === c.id} onClick={() => setFilter(c.id)} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {shown.length === 0 && <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted }}>No experts in this category yet.</div>}
        {shown.map((ex) => (
          <Card key={ex.id} onClick={() => onOpenExpert(ex)} padding={16}>
            <div style={{ display: "flex", gap: 12 }}>
              <Initials name={ex.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontFamily: T.font, fontSize: 15, fontWeight: 600, color: T.ink }}>{ex.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                    <Star size={12} color={T.gold} fill={T.gold} />
                    <span style={{ fontFamily: T.font, fontSize: 12, color: T.ink }}>{ex.rating}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "4px 0" }}>
                  {ex.categories.map((cid) => (
                    <span key={cid} style={{ fontFamily: T.font, fontSize: 10, color: T.muted, backgroundColor: T.surfaceSoft, borderRadius: T.rFull, padding: "3px 8px" }}>{catById(cid)?.label}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, fontFamily: T.font, fontSize: 12, color: T.mutedSoft, marginTop: 4 }}>
                  <span>${ex.rate}/30min</span>
                  <span>·</span>
                  <span>{ex.virtual && ex.inPerson ? "Virtual & in-person" : ex.virtual ? "Virtual only" : "In-person only"}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
