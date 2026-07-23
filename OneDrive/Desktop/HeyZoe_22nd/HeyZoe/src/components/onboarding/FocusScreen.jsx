import React from "react";
import { CheckCircle2 } from "lucide-react";
import { T } from "../../theme";
import { CATEGORIES, catColor } from "../../constants";
import { Card, ScreenHeader } from "../common/Primitives";
import { Btn } from "../common/Primitives";

/**
 * Simplified, single-select version of the original CategoryScreen.
 * On first run we only ask for ONE focus area so the user reaches a
 * finished goal fast — more areas can be added anytime from Goals.
 */
export function FocusScreen({ selected, onSelect, onNext }) {
  return (
    <div style={{ padding: "0 20px", height: "100%", display: "flex", flexDirection: "column" }}>
      <ScreenHeader title="What do you want to work on?" subtitle="Pick one area to start. You can add more anytime." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14, overflowY: "auto" }}>
        {CATEGORIES.map((c) => {
          const isSel = selected === c.id;
          const Icon = c.icon;
          return (
            <Card
              key={c.id}
              onClick={() => onSelect(c.id)}
              padding={14}
              style={{ borderColor: isSel ? T.ink : T.hairline, borderWidth: isSel ? 2 : 1, display: "flex", flexDirection: "column", gap: 10 }}
            >
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
        <Btn full disabled={!selected} onClick={onNext}>Continue</Btn>
      </div>
    </div>
  );
}
