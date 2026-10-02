# Loader workspace

Implemented from the nine screens in [Loader · Mobile Flow](https://www.figma.com/design/X3PKFFRkYReiZSNAn504oE/GIT-Happens?node-id=719-1648). Mobile layouts follow the supplied design; desktop uses the existing store manager glass shell, pill navigation, and footer, with a reusable dock sidebar.

| Screen | Route | Figma node |
| --- | --- | --- |
| Loading queue | `/loader` | `719:1649` |
| Load plan | `/loader/load-plan` | `719:1836` |
| Report a shortfall | `/loader/report-shortfall` | `719:2023` |
| Review plan changes | `/loader/plan-changes` | `719:2176` |
| Departure review | `/loader/departure-review` | `719:2344` |
| Loading history | `/loader/history` | `719:2488` |
| Trip status | `/loader/trip-status` | `719:2714` |
| Partial load approved | `/loader/partial-load-approved` | `719:2854` |
| Plan v3 acknowledged | `/loader/plan-acknowledged` | `719:2994` |

Select Loader at `/sign-in` and use the displayed demo account. Direct routes provide the corresponding Figma sample state. Changes during the demo take precedence: a submitted shortage blocks departure, including through direct links, until the user explicitly simulates dispatch approval.

The full flow is Continue Loading → Report 2 short → Send shortfall → Check dispatch decision → Simulate dispatch approval → Review departure checks → Mark ready for departure → View loading history. VEH008 opens the plan change review; Acknowledge v3 updates the queue. Profile options provide Reset demo and Sign out.

All actions use mock data. Shortfall details, approvals, release status, and plan acknowledgement persist in session storage for the current browser tab. Search resolves sample vehicle and outlet identifiers; calls, notifications, and dispatch decisions are simulated. Production authentication, telemetry, messaging, dispatch, and inventory APIs are not connected.

Original Figma source images, SVG icons, and their intrinsic dimensions are stored in `public/figma/loader`. The warehouse source is used as the backdrop; full-screen Figma screenshots are used only for comparison. Inter is served locally with its accompanying license. Glass uses CSS blur, transparency, gradients, and inset shadows; native Figma refraction is approximated in browsers.

Validation: production build, targeted ESLint, all nine screens at 320, 390, 640, 768, 1024, and 1440 pixels, visible asset loading and dimensions, complete approval/release flow, blocked approval bypass, session persistence/reset, and Loader sign-in/sign-out. Rendered mobile and desktop screenshots were compared with the Figma references.
