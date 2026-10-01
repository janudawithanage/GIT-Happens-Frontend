"use client";

import Image from "next/image";
import { useState } from "react";
import { onboardingSteps } from "@/lib/onboarding";

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const current = onboardingSteps[step];
  const lastStep = step === onboardingSteps.length - 1;

  function next() {
    if (lastStep) onComplete();
    else setStep(value => Math.min(value + 1, onboardingSteps.length - 1));
  }

  return <main className="onboarding-screen" aria-labelledby="onboarding-heading" data-step={step + 1}>
    <div className="onboarding-images" aria-hidden="true">
      {onboardingSteps.map((item, index) => <Image key={item.role} src={item.image} alt="" fill sizes="100vw" loading="eager" unoptimized className={`onboarding-image${index === step ? " onboarding-image-active" : ""}`} />)}
    </div>
    <div className="onboarding-scrim" aria-hidden="true" />
    <div className="onboarding-content">
      <div key={step} className="onboarding-copy">
        <h1 id="onboarding-heading">{current.headline.map(line => <span key={line}>{line}</span>)}</h1>
        <p>{current.description}</p>
      </div>
      <div className="onboarding-controls">
        <div className="onboarding-navigation">
          <ol className="onboarding-dots" aria-label="Onboarding progress">
            {onboardingSteps.map((item, index) => <li key={item.role} aria-current={index === step ? "step" : undefined} className={index < step ? "onboarding-dot-complete" : ""}><span className="sr-only">Step {index + 1}: {item.role}</span></li>)}
          </ol>
          <button type="button" className="onboarding-skip" aria-label="Skip onboarding" onClick={onComplete}>Skip</button>
        </div>
        <div className="onboarding-next-action">
          {lastStep && <button type="button" onClick={onComplete} className="onboarding-get-started">Get started</button>}
          <button type="button" onClick={next} className="onboarding-next" aria-label={lastStep ? "Finish onboarding and sign in" : `Next onboarding screen: ${onboardingSteps[step + 1].role}`}>
            <span><Image src="/figma/onboarding/chevron-right.svg" alt="" width={20} height={20} unoptimized /></span>
          </button>
        </div>
      </div>
    </div>
    <p role="status" className="sr-only">Screen {step + 1} of {onboardingSteps.length}: {current.headline.join(" ")}</p>
  </main>;
}
