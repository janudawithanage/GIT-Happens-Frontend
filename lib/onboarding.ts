export const onboardingSteps = [
  {
    role: "Dispatcher",
    image: "/figma/onboarding/dispatcher.png",
    headline: ["All Your Services", "in One App"],
    description: "Plan, load, and deliver from one shared workspace. Each role sees the latest trip status.",
  },
  {
    role: "Store Manager",
    image: "/figma/onboarding/store-manager.png",
    headline: ["Every Delivery,", "Under Control"],
    description: "Track inbound orders, prepare receiving bays, and confirm deliveries from your store workspace.",
  },
  {
    role: "Loader",
    image: "/figma/onboarding/loader.png",
    headline: ["Load Smarter,", "Stay Connected"],
    description: "Load in stop order, confirm counts, and flag missing cases before the vehicle leaves.",
  },
  {
    role: "Driver",
    image: "/figma/onboarding/driver.png",
    headline: ["Navigate Your", "Route Smartly"],
    description: "See today’s stops, open the next delivery, and capture proof even when you are offline.",
  },
] as const;
