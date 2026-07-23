import React, { useState } from "react";
import { Check, ExternalLink, MapPin, Star, Video, Wallet } from "lucide-react";
import { T } from "../../theme";
import { catById } from "../../constants";
import { Btn, Card, ScreenHeader } from "../common/Primitives";
import { CategoryIcon } from "../common/Visuals";

export function ExpertProfileScreen({ expert, onBack, onBooked }) {
  const [booked, setBooked] = useState(false);

  const book = () => {
    window.open(expert.calendlyUrl || "https://calendly.com/", "_blank", "noopener,noreferrer");
    onBooked(expert);
    setBooked(true);
  };

  return (
    <div style={{ padding: "0 20px 40px", height: "100%", overflowY: "auto" }}>
      <ScreenHeader title="Expert profile" onBack={onBack} />
      <Card padding={20} style={{ marginTop: 8 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: T.rFull, flexShrink: 0,
            background: `linear-gradient(135deg, ${T.ink}, ${T.gold})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: T.font, fontSize: 20, fontWeight: 700, color: "#fff",
          }}>
            {expert.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <div style={{ fontFamily: T.font, fontSize: 18, fontWeight: 700, color: T.ink }}>{expert.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Star size={13} color={T.gold} fill={T.gold} />
              <span style={{ fontFamily: T.font, fontSize: 13, color: T.ink }}>{expert.rating}</span>
              <span style={{ fontFamily: T.font, fontSize: 12, color: T.mutedSoft }}>· {expert.sessions} sessions</span>
            </div>
          </div>
        </div>

        <p style={{ fontFamily: T.font, fontSize: 14, color: T.body, lineHeight: 1.5, marginTop: 16 }}>{expert.bio}</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          {expert.categories.map((cid) => (
            <span key={cid} style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: T.font, fontSize: 12, color: T.ink, backgroundColor: T.surfaceSoft, borderRadius: T.rFull, padding: "6px 12px" }}>
              <CategoryIcon id={cid} size={12} /> {catById(cid)?.label}
            </span>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${T.hairlineSoft}`, marginTop: 16, paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Wallet size={16} color={T.muted} />
            <span style={{ fontFamily: T.font, fontSize: 14, color: T.ink }}>${expert.rate} per 30 minutes</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MapPin size={16} color={T.muted} />
            <span style={{ fontFamily: T.font, fontSize: 14, color: T.ink }}>{expert.location}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Video size={16} color={T.muted} />
            <span style={{ fontFamily: T.font, fontSize: 14, color: T.ink }}>
              {expert.virtual && expert.inPerson ? "Open to virtual & in-person" : expert.virtual ? "Virtual sessions only" : "In-person sessions only"}
            </span>
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 16 }}>
        <Btn full icon={booked ? Check : ExternalLink} onClick={book} disabled={booked}>
          {booked ? "Opened Calendly — pick your time" : "Book via Calendly"}
        </Btn>
        <p style={{ fontFamily: T.font, fontSize: 12, color: T.mutedSoft, textAlign: "center", marginTop: 10 }}>
          Opens {expert.name.split(" ")[0]}'s Calendly in a new tab to pick a time slot.
        </p>
      </div>
    </div>
  );
}
