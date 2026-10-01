# Store Manager screens

The dashboard and Orders page share heading spacing, typography, buttons and column gaps. Their navigation and workflow buttons now open the remaining Figma screens.

| Route under `/store-manager` | Figma node | Screen |
| --- | --- | --- |
| `create-order` | `719:6112` | Create restock order |
| `order-review` | `719:6576` | Review restock order |
| `order-confirmed` | `719:7068` | Confirmation dialog |
| `delivery-tracking` | `719:7660` | Delivery tracking |
| `receive-delivery` | `719:8270` | Count incoming goods and report discrepancies |
| `receive-review` | `719:8981` | Completed receipt |
| `issues` | `719:9642` | Incident overview and selected manifest |
| `issue-detail` | `719:10321` | Resolved incidents and completed handover |
| `issue-resolution` | `719:10861` | Critical quarantine and escalation |

Design source: [Store Manager · desktop](https://www.figma.com/design/X3PKFFRkYReiZSNAn504oE/GIT-Happens?node-id=719-5042).

## Shared components

`StoreShell` reuses `DashboardHeader`, `DashboardFooter`, the 1280px frame, responsive gutters, logo, avatar and warehouse backdrop. `FlowPanel` reuses `GlassPanel`. Buttons reuse `DashboardButton`. The remaining reusable components provide metrics, badges, timelines, image zoom controls, dialogs, telemetry cards and incident tables. Mobile workspace navigation reuses `Sidebar`.

Original exported images and SVGs are stored in `public/figma/store-manager`. SVG dimensions are taken directly from their root elements and recorded in `dimensions.json`. Plus Jakarta Sans and JetBrains Mono reuse existing local fonts; Space Grotesk is bundled locally for the numeric typography.

## Sample functionality

- Draft quantities, items, receiving date, slot and bay persist in browser storage.
- Review and confirmation use the current draft; empty manifests cannot be confirmed.
- Incoming counts start at 88 of 89 units. A discrepancy opens the issue overview. Correcting the scarf count to 15 allows receipt completion.
- The resolution update simulates a successful recount and opens the resolved screen.
- Critical escalation, review requests, broadcast pings and team notifications are simulated. They do not send messages or contact a real carrier.
- Evidence attachment accepts image files up to 2 MB. Evidence can be opened and image scenes can be zoomed.
- Search, status/type/date filters and CSV exports work locally.
- PDF actions open browser printing; select Save as PDF to export.
- Reset sample data clears the local workflow state.

There is no backend, live GPS, authentication, real dispatch messaging, QR verification or stock ledger integration. The QR and telemetry are original design examples. Mobile layouts adapt the desktop design; Figma does not provide mobile Store Manager screens in this section.
