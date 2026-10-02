# Driver workspace

Implemented from **Driver · Mobile Flow**, section `719:3181`, in [the Waypoint Flow Figma file](https://www.figma.com/design/X3PKFFRkYReiZSNAn504oE/GIT-Happens?node-id=719-3181).

The mobile screens retain the original blue palette, glass cards, Jakarta/JetBrains typography, logo, signature and route artwork. Desktop adapts the flow to the existing store manager shell with a header, sidebar, footer, two-column panels and a reusable stop table.

| Route | Figma screen |
| --- | --- |
| `/driver` | Today’s Route · `719:3182` |
| `/driver/stop-details` | Stop Details · `719:3345` |
| `/driver/proof-of-delivery` | Proof of Delivery Online · `719:3467` |
| `/driver/delivery-completed` | Delivery Completed · `719:3728` |
| `/driver/next-stop-offline` | Next Stop Offline · `719:3873` |
| `/driver/proof-of-delivery-offline` | Proof of Delivery Offline · `719:3596` |
| `/driver/saved-locally` | Saved Locally · `719:3734` |
| `/driver/sync` | Sync Status Offline · `719:3740` |
| `/driver/route-change` | Reconnected Route Change · `719:3995` |
| `/driver/updated-route` | Updated Route · `719:4311` |
| `/driver/report-issue` | Outlet Closed Evidence · `719:4127` |
| `/driver/failed-stop-route` | Failed Stop Route · `719:4474` |

## Demo behavior

Sign in with the existing Driver demo account: `driver@waypointgroup.com` / `Waypoint2026!`, or choose **Driver → Use demo account**. Start at `/driver` and continue to Stop 2.

Quantity controls, receiver name/role, notes, signature clearing/drawing, photo uploads, completion validation, external Maps links, issue submission/cancellation, stop details, navigation, desktop search, notifications, reset and sign-out work. The prefilled signature and outlet photo placeholder are simulated design examples. Clear the signature to draw with a mouse/touch pointer, or select a photo field to upload real evidence. Uploaded photos are resized to at most 800 pixels before local storage.

Completed proofs and issue evidence persist in `localStorage` under `waypoint-driver-demo-v1`. Offline proofs remain pending across reloads. **Try sync now → Simulate reconnection** marks saved proofs synced and displays the dispatch change. Acknowledging the change updates the route. The avatar’s **Reset demo** restores the initial run; sign-out also resets the Driver data.

Each directly addressable screen initially presents its Figma scenario with realistic sample data; actual records replace the example sync queue after recording a delivery or issue. Simulated functionality is labeled on every screen and explained in the profile/sync dialog. Existing dashboard buttons, glass panels, footer and generic table are reused by the Driver components.

## Assets and verification

Original image fills and SVG exports are stored in `public/figma/driver`; `provenance.json` records their source nodes, and `dimensions.json` preserves intrinsic SVG sizes. The blurred result backgrounds are the original small bitmap fills from Figma, not screenshots generated from the implementation. Existing local fonts are reused.

The rendered mobile and desktop screens were compared with Figma screenshots. Browser verification covers all twelve screens, loaded assets, console errors, quantity adjustment, required proof validation, drawing signatures, photo uploads, persisted records, offline sync, acknowledgement, failed delivery, reset, sign-out and Driver sign-in. Responsive checks cover 320, 390, 640, 768, 1024 and 1440 pixels. Run `npm run build` for production compilation and `npm run lint` for repository linting.

## Remaining limitations

Dispatch, GPS, timestamps, connectivity changes and authentication are simulated; no backend is connected. Records live only in this browser and unsaved form edits are not persisted. There is no service worker: a fully disconnected browser cannot reliably reload uncached pages, although saved delivery records survive reloads once the app can load. Automatic server synchronization, live route maps and real photo/GPS timestamps require integration. Browser glass rendering and the reused font weights can differ slightly from Figma’s renderer.
