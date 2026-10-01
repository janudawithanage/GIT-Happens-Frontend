"use client";

import { useEffect, useRef, useState } from "react";
import { OnboardingScreen } from "@/components/onboarding-screen";
import { SplashScreen } from "@/components/splash-screen";
import { onboardingSteps } from "@/lib/onboarding";
import { clearSignOutNavigation, isSignOutNavigation } from "@/lib/sign-in-navigation";
import { SignInScreen } from "./SignInScreen";

export function SignInExperience() {
  const [skipIntro] = useState(isSignOutNavigation);
  const [phase, setPhase] = useState<"loading" | "leaving" | "ready">(skipIntro ? "ready" : "loading");
  const [progress, setProgress] = useState(8);
  const [onboardingComplete, setOnboardingComplete] = useState(skipIntro);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onboardingComplete) contentRef.current?.focus({ preventScroll: true });
  }, [onboardingComplete]);

  useEffect(() => {
    if (skipIntro) {
      clearSignOutNavigation();
      return;
    }

    let cancelled = false;
    let finishing = false;
    let completed = 0;
    let minimumTimer: ReturnType<typeof setTimeout>;
    let fallbackTimer: ReturnType<typeof setTimeout>;
    let fadeTimer: ReturnType<typeof setTimeout>;

    // Warm all four onboarding backgrounds and the sign-in imagery during the splash.
    const assets = [...onboardingSteps.map(step => step.image), "/figma/onboarding/chevron-right.svg", "/figma/warehouse.png", "/figma/logo.png", "/figma/splash/logo.png", "/figma/splash/glow-blue.svg", "/figma/splash/glow-orange.svg", "/figma/splash/role-dot.svg", "/figma/splash/status-dot.svg"];
    const markReady = () => {
      completed += 1;
      if (!cancelled && !finishing) setProgress(8 + Math.round(87 * completed / (assets.length + 1)));
    };
    const resources = assets.map(src => new Promise<void>(resolve => {
      const asset = new window.Image();
      asset.onload = asset.onerror = () => { markReady(); resolve(); };
      asset.src = src;
    }));
    resources.push(document.fonts.ready.then(() => { markReady(); }));

    const minimumDisplay = new Promise<void>(resolve => { minimumTimer = setTimeout(resolve, 1600); });
    const fallback = new Promise<void>(resolve => { fallbackTimer = setTimeout(resolve, 5000); });

    void Promise.all([minimumDisplay, Promise.race([Promise.allSettled(resources), fallback])]).then(() => {
      if (cancelled) return;
      finishing = true;
      clearTimeout(fallbackTimer);
      setProgress(100);
      setPhase("leaving");
      fadeTimer = setTimeout(() => { if (!cancelled) setPhase("ready"); }, 350);
    });

    return () => {
      cancelled = true;
      clearTimeout(minimumTimer);
      clearTimeout(fallbackTimer);
      clearTimeout(fadeTimer);
    };
  }, [skipIntro]);

  const loading = phase !== "ready";
  return <div className="signin-experience" data-loading={loading} data-phase={phase}>
    <div ref={contentRef} tabIndex={-1} className="signin-content" inert={loading} aria-hidden={loading}>
      {onboardingComplete ? <SignInScreen /> : <OnboardingScreen onComplete={() => setOnboardingComplete(true)} />}
    </div>
    {loading && <SplashScreen progress={progress} leaving={phase === "leaving"} />}
  </div>;
}
