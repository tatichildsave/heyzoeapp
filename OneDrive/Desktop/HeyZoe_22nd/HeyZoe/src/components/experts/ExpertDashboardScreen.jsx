import React from "react";
import { Edit3 } from "lucide-react";
import { T } from "../../theme";
import { catById } from "../../constants";
import { Card, ScreenHeader } from "../common/Primitives";
import { CategoryIcon } from "../common/Visuals";

/**
 * The original monolith's dashboard showed two hardcoded fake bookings —
 * this version shows a real count from the bookings subcollection (see
 * services/experts.js) instead, and is honest when there's nothing yet
 * rather than inventing sample clients.
 */
export function ExpertDashboardScreen({ profile, bookingCount, onBack, onEdit }) {
  return (
    <div style={{ padding: "0 20px 40px", height: "100%", overflowY: "auto" }}>
      <ScreenHeader title="Expert dashboard" onBack={onBack} />
      <Card padding={18} style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: T.rFull, flexShrink: 0,
          background: `linear-gradient(135deg, ${T.ink}, ${T.gold})`,
          display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: T.font, fontWeight: 700,
        }}>{profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 700, color: T.ink }}>{profile.name}</div>
          <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted }}>${profile.rate}/30min · {profile.location}</div>
        </div>
        <button onClick={onEdit} style={{ background: "none", border: "none", cursor: "pointer" }}><Edit3 size={17} color={T.ink} /></button>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
        <Card padding={16}><div style={{ fontFamily: T.font, fontSize: 22, fontWeight: 700, color: T.ink }}>{bookingCount}</div><div style={{ fontFamily: T.font, fontSize: 12, color: T.muted }}>Booking clicks</div></Card>
        <Card padding={16}><div style={{ fontFamily: T.font, fontSize: 22, fontWeight: 700, color: T.ink }}>{profile.rating}★</div><div style={{ fontFamily: T.font, fontSize: 12, color: T.muted }}>Rating shown</div></Card>
      </div>

      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 10 }}>Your categories</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {profile.categories.map((cid) => (
            <span key={cid} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.font, fontSize: 12, color: T.ink, backgroundColor: T.surfaceSoft, borderRadius: T.rFull, padding: "6px 12px" }}>
              <CategoryIcon id={cid} size={13} /> {catById(cid)?.label}
            </span>
          ))}
        </div>
      </div>

      {bookingCount === 0 && (
        <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted, marginTop: 18 }}>
          No one's clicked "Book" yet — once your profile is live in the directory, bookings will show up here.
        </div>
      )}
    </div>
  );
}
