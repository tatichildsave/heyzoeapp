import React, { useMemo, useState } from "react";
import { Bell, ChevronRight, Compass, Download, MessageCircle, Share, Snowflake, Sparkles, User, Users } from "lucide-react";
import { EmailAuthProvider, linkWithCredential, signInWithEmailAndPassword } from "firebase/auth";
import { T } from "../../theme";
import { BADGES_CATALOG, ACHIEVEMENT_CATALOG } from "../../constants";
import { Btn, Card, ScreenHeader } from "../common/Primitives";
import { ProgressRing } from "../common/Visuals";
import { computeGameMetrics, achievementProgress } from "../../utils/gamification";
import { useAuth } from "../../hooks/useAuth";
import { usePwaInstall } from "../../hooks/usePwaInstall";
import { auth, isFirebaseConfigured } from "../../services/firebase";
import { AuthModal } from "../ai/AuthModal";
import { trackEvent } from "../../services/analytics";

/**
 * "You" — merges what used to be a separate Profile tab and a separate
 * Gamification tab into one screen: progress summary up top, badges,
 * then optional/advanced features (Couple mode, Expert marketplace,
 * Life Report) demoted to a single "More" list instead of top-level nav.
 *
 * Visual language matches Home/Goals: gold is reserved for progress and
 * achievement (the ring, earned badges, the "up next" bars), so it reads
 * as one consistent reward signal across the whole app instead of a
 * separate palette per screen.
 */
export function ProfileScreen({
  state, resetApp, coupleProfile, onOpenCouple, onOpenExperts, onOpenMyExpertProfile, hasExpertProfile, onOpenLifeReport,
  remindersEnabled, reminderStatus, onEnableReminders, onDisableReminders, onOpenFeedback,
}) {
  const { goals, xp, streak, streakFreezes, badges } = state;
  const metrics = useMemo(() => computeGameMetrics({ goals, streak, xp }), [goals, streak, xp]);
  const nextAchievements = ACHIEVEMENT_CATALOG.filter((a) => !a.rule(metrics)).slice(0, 3);
  const earnedCount = badges.length;

  const handleToggleReminders = async () => {
    if (remindersEnabled) {
      await onDisableReminders();
      trackEvent("reminders_disabled");
    } else {
      const result = await onEnableReminders();
      trackEvent("reminders_enable_attempted", { result });
    }
  };
  const reminderNote =
    reminderStatus === "denied" ? "Notifications are blocked for this site in your browser settings."
    : reminderStatus === "unsupported" ? "Push notifications aren't supported in this browser."
    : null;

  const { user } = useAuth();
  const hasRealAccount = !!user && !user.isAnonymous;
  const pwa = usePwaInstall();
  const [authModal, setAuthModal] = useState({ show: false, mode: "signup", email: "", password: "", showPassword: false, error: "" });
  const closeAuthModal = () => setAuthModal((s) => ({ ...s, show: false, error: "" }));

  // Upgrades the silent anonymous account created on first launch into a
  // real email/password account via linkWithCredential — this keeps the
  // same uid, so goals, couple links, and any expert listing carry over
  // instead of starting over on a fresh account.
  const handleSignup = async () => {
    try {
      const cred = EmailAuthProvider.credential(authModal.email, authModal.password);
      await linkWithCredential(auth.currentUser, cred);
      trackEvent("account_upgraded");
      closeAuthModal();
    } catch (e) {
      setAuthModal((s) => ({ ...s, error: e.message?.replace(/^Firebase: /, "") || "Couldn't create your account." }));
    }
  };

  // Switching to an existing email account is a different uid than the
  // current anonymous session, so this is framed as "sign in on this
  // device" rather than folded into the upgrade flow above.
  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, authModal.email, authModal.password);
      closeAuthModal();
    } catch (e) {
      setAuthModal((s) => ({ ...s, error: e.message?.replace(/^Firebase: /, "") || "Couldn't sign in." }));
    }
  };

  const handleReset = () => {
    if (window.confirm("This clears all your goals and progress on this device. Are you sure?")) {
      resetApp();
    }
  };

  return (
    <div style={{ padding: "20px 20px 100px", overflowY: "auto", height: "100%" }}>
      <ScreenHeader title="You" subtitle={`${metrics.goalsCount} active goal${metrics.goalsCount === 1 ? "" : "s"} · ${streak}-day streak`} />

      <Card
        padding={14}
        onClick={onOpenFeedback}
        style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, backgroundColor: T.ink, border: "none" }}
      >
        <div style={{ width: 34, height: 34, borderRadius: T.rFull, backgroundColor: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <MessageCircle size={16} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: "#fff" }}>This is a beta — send feedback</div>
          <div style={{ fontFamily: T.font, fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 1 }}>Something broke or confused you? Tell me directly.</div>
        </div>
        <ChevronRight size={16} color="rgba(255,255,255,0.6)" />
      </Card>

      <div
        style={{
          marginTop: 12,
          borderRadius: T.rLg,
          padding: 18,
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: `radial-gradient(120% 140% at 100% 0%, ${T.goldSoft} 0%, ${T.canvas} 62%)`,
          border: `1px solid ${T.hairlineSoft}`,
        }}
      >
        <ProgressRing value={metrics.levelProgressPct} size={64} label={`${metrics.level}`} sub="level" color={T.gold} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: T.font, fontSize: 14, fontWeight: 600, color: T.ink }}>{xp} total XP</div>
          <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginTop: 2 }}>{metrics.xpToNextLevel} XP to next level</div>
          <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginTop: 2 }}>{earnedCount}/{BADGES_CATALOG.length} badges earned</div>
          <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
            <Snowflake size={12} color="#3d7599" /> {streakFreezes} streak freeze{streakFreezes === 1 ? "" : "s"} available
          </div>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 10 }}>Badges</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {BADGES_CATALOG.map((b) => {
            const earned = badges.includes(b.id);
            const Icon = b.icon;
            return (
              <div key={b.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: earned ? 1 : 0.4 }}>
                <div
                  style={{
                    width: 48, height: 48, borderRadius: T.rFull, display: "flex", alignItems: "center", justifyContent: "center",
                    background: earned ? `linear-gradient(135deg, ${T.gold}, #b9791f)` : T.surfaceStrong,
                    boxShadow: earned ? `0 3px 10px ${T.goldSoft}` : "none",
                  }}
                >
                  <Icon size={20} color={earned ? "#fff" : T.mutedSoft} />
                </div>
                <span style={{ fontFamily: T.font, fontSize: 10, color: T.ink, textAlign: "center" }}>{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {nextAchievements.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 10 }}>Up next</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {nextAchievements.map((a) => {
              const prog = achievementProgress(a, metrics);
              return (
                <Card key={a.id} padding={14}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.ink }}>{a.label}</span>
                    <span style={{ fontFamily: T.font, fontSize: 11, color: T.mutedSoft }}>{prog.value}/{prog.target}</span>
                  </div>
                  <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginBottom: 8 }}>{a.hint}</div>
                  <div style={{ height: 5, backgroundColor: T.hairlineSoft, borderRadius: T.rFull, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${prog.pct}%`, backgroundColor: T.gold, borderRadius: T.rFull }} />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 10 }}>Notifications</div>
        <Card padding={14} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: T.rFull, backgroundColor: T.goldSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Bell size={16} color={T.gold} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.ink }}>Goal check-in reminders</div>
            <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginTop: 1 }}>
              A nudge every few hours, 6am–9pm, only if you haven't opened the app
            </div>
          </div>
          <button
            onClick={handleToggleReminders}
            aria-pressed={remindersEnabled}
            aria-label="Toggle goal check-in reminders"
            style={{
              width: 44, height: 26, borderRadius: T.rFull, border: "none", cursor: "pointer", flexShrink: 0,
              backgroundColor: remindersEnabled ? T.sage : T.hairline, position: "relative", transition: "background-color .2s ease",
            }}
          >
            <span style={{
              position: "absolute", top: 3, left: remindersEnabled ? 21 : 3, width: 20, height: 20, borderRadius: T.rFull,
              backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.25)", transition: "left .2s ease",
            }} />
          </button>
        </Card>
        {reminderNote && <div style={{ fontFamily: T.font, fontSize: 12, color: T.mutedSoft, marginTop: 8 }}>{reminderNote}</div>}
      </div>

      {!pwa.installed && (pwa.canInstall || pwa.isIos) && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 10 }}>Install</div>
          {pwa.canInstall ? (
            <Card padding={14} onClick={pwa.install} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: T.rFull, backgroundColor: T.goldSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Download size={16} color={T.gold} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.ink }}>Install Hey Zoe</div>
                <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginTop: 1 }}>Adds it to your home screen, opens like a real app</div>
              </div>
              <ChevronRight size={16} color={T.mutedSoft} />
            </Card>
          ) : (
            <Card padding={14} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: T.rFull, backgroundColor: T.goldSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Share size={16} color={T.gold} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.ink }}>Add to Home Screen</div>
                <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginTop: 1 }}>Tap the Share icon in Safari, then "Add to Home Screen"</div>
              </div>
            </Card>
          )}
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <div style={{ fontFamily: T.font, fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 10 }}>More</div>
        {isFirebaseConfigured && (
          <Card
            padding={14}
            onClick={() => !hasRealAccount && setAuthModal((s) => ({ ...s, show: true, mode: "signup", error: "" }))}
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}
          >
            <div style={{ width: 34, height: 34, borderRadius: T.rFull, backgroundColor: T.goldSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <User size={16} color={T.gold} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.ink }}>{hasRealAccount ? "Account" : "Save your account"}</div>
              <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginTop: 1 }}>
                {hasRealAccount ? user.email : "Add an email so your data survives clearing your browser"}
              </div>
            </div>
            {!hasRealAccount && <ChevronRight size={16} color={T.mutedSoft} />}
          </Card>
        )}
        <Card padding={14} onClick={onOpenCouple} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: T.rFull, backgroundColor: T.goldSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Users size={16} color={T.gold} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.ink }}>Couple mode</div>
            <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginTop: 1 }}>
              {coupleProfile?.mode === "couple" ? `Linked with ${coupleProfile.partnerName || "your partner"}` : "Plan life together with a partner"}
            </div>
          </div>
          <ChevronRight size={16} color={T.mutedSoft} />
        </Card>
        <Card padding={14} onClick={onOpenExperts} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: T.rFull, backgroundColor: T.goldSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Compass size={16} color={T.gold} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: T.ink }}>Find an expert</div>
            <div style={{ fontFamily: T.font, fontSize: 12, color: T.muted, marginTop: 1 }}>Book a session with a coach or consultant</div>
          </div>
          <ChevronRight size={16} color={T.mutedSoft} />
        </Card>
        <button
          onClick={onOpenMyExpertProfile}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 4px 14px", display: "block" }}
        >
          <span style={{ fontFamily: T.font, fontSize: 12, color: T.muted, textDecoration: "underline" }}>
            {hasExpertProfile ? "View your expert dashboard" : "List yourself as an expert"}
          </span>
        </button>
        <Card padding={14} onClick={onOpenLifeReport} style={{ display: "flex", alignItems: "center", gap: 10, backgroundColor: T.goldSoft, border: "none" }}>
          <Sparkles size={18} color={T.gold} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.font, fontSize: 13, fontWeight: 600, color: "#7a5424" }}>Life Report</div>
            <div style={{ fontFamily: T.font, fontSize: 12, color: "#7a5424", marginTop: 2 }}>A synthesis of your goals, growth, and lessons — written by Zoe.</div>
          </div>
          <ChevronRight size={16} color="#7a5424" />
        </Card>
      </div>

      <div style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
        <Btn variant="ghost" size="sm" onClick={handleReset} style={{ color: T.mutedSoft }}>Restart planning journey</Btn>
      </div>

      <AuthModal
        show={authModal.show}
        mode={authModal.mode}
        email={authModal.email}
        setEmail={(email) => setAuthModal((s) => ({ ...s, email }))}
        password={authModal.password}
        setPassword={(password) => setAuthModal((s) => ({ ...s, password }))}
        showPassword={authModal.showPassword}
        setShowPassword={(v) => setAuthModal((s) => ({ ...s, showPassword: v }))}
        error={authModal.error}
        onClose={closeAuthModal}
        onSignup={handleSignup}
        onLogin={handleLogin}
        onGuest={closeAuthModal}
        onSwitchToSignup={() => setAuthModal((s) => ({ ...s, mode: "signup", error: "" }))}
        onSwitchToLogin={() => setAuthModal((s) => ({ ...s, mode: "login", error: "" }))}
      />
    </div>
  );
}
