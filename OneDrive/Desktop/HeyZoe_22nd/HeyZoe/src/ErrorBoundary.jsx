import React from "react";
import { trackEvent } from "./services/analytics";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Something went wrong." };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled app error:", error, info);
    // Without this, a crash is only ever visible in the specific tester's
    // own browser console — which the developer will never see. GA4's
    // conventional "exception" event name/shape, so it shows up in the
    // standard Firebase/GA4 crash reporting views instead of a made-up one.
    trackEvent("exception", {
      description: `${error?.message || "Unknown error"} | ${info?.componentStack || ""}`.slice(0, 150),
      fatal: true,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#efe6da", padding: 20 }}>
          <div style={{ maxWidth: 520, width: "100%", backgroundColor: "#fff", border: "1px solid #dddddd", borderRadius: 16, padding: 20, boxSizing: "border-box" }}>
            <h1 style={{ margin: 0, fontSize: 22, color: "#222", fontFamily: "Inter, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif" }}>Hey Zoe hit a snag</h1>
            <p style={{ margin: "10px 0 0", color: "#3f3f3f", fontSize: 14, lineHeight: 1.5, fontFamily: "Inter, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif" }}>
              Refresh the page to continue. Your saved data remains intact.
            </p>
            <p style={{ margin: "8px 0 0", color: "#6a6a6a", fontSize: 12, fontFamily: "Inter, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif" }}>
              Error: {this.state.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: 14, border: "none", borderRadius: 9999, backgroundColor: "#1a1a1a", color: "#fff", height: 40, padding: "0 16px", cursor: "pointer", fontFamily: "Inter, -apple-system, system-ui, Roboto, Helvetica Neue, sans-serif" }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
