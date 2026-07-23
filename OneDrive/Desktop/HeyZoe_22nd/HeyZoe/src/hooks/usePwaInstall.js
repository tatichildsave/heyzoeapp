import { useEffect, useState } from "react";
import {
  registerServiceWorker,
  onInstallAvailabilityChange,
  hasDeferredInstallPrompt,
  promptInstall,
  isRunningStandalone,
  isIos,
} from "../services/pwa";
import { trackEvent } from "../services/analytics";

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(isRunningStandalone());

  useEffect(() => {
    registerServiceWorker();
    setCanInstall(hasDeferredInstallPrompt());
    return onInstallAvailabilityChange((available) => {
      setCanInstall(available);
      if (!available) setInstalled(isRunningStandalone());
    });
  }, []);

  const install = async () => {
    const outcome = await promptInstall();
    trackEvent("pwa_install_prompt_result", { outcome });
    if (outcome === "accepted") setInstalled(true);
    return outcome;
  };

  return {
    canInstall, // Chrome/Edge/Android only — a real native prompt is available
    installed, // already running as an installed/standalone app
    isIos: isIos(), // no native prompt exists here; show manual instructions instead
    install,
  };
}
