# Shared dashboard layout

Driver, Loader, Dispatcher and Store Manager use `components/workspace-header.tsx` for desktop and tablet headers. Role components provide the original logo, navigation, search behavior, notifications and profile actions; shared CSS in `app/globals.css` controls their geometry and glass styling.

- Desktop frame: maximum width 1,280px, 38px corners, 42px vertical outer padding, 40px horizontal content padding.
- Header: 54px capsules, 16px gap, 379px search/action capsule, 32px logo and action buttons, 34px navigation items and search field. Header typography uses the local Plus Jakarta Sans font.
- Driver and Loader navigation capsules fit their contents, with 12px spacing before the sync badge. The search/action capsule stays aligned to the right on desktop.
- Tablet (768–1199px): 24px horizontal content padding; the two header capsules stack with a 12px gap. Driver and Loader hide their sidebars and use one content column.
- Mobile (below 768px): Driver and Loader retain their original Figma headers, typography, glass effects and bottom navigation. Store Manager and Dispatcher use the shared responsive header with a separate scrollable navigation row.
- Driver and Loader use matching 168px desktop sidebar columns, 24px content gaps, sidebar panel spacing, heading styles and the shared dashboard footer.

Desktop detail screens keep a stable Waypoint Flow brand and profile location, with their contextual title and back/options controls below the header. Driver completion and locally saved confirmation screens intentionally retain their standalone Figma layouts.

Role-specific content, card styles, accents and images remain part of each role's design. Dashboard height grows with its content; short desktop dashboards keep the footer at the bottom of the viewport-sized frame. Functionality continues to use the existing simulated data providers.

## Verification

- Production build and ESLint pass.
- Browser inspection covers 41 pages at 320, 390, 640, 768, 1024, 1200 and 1440px: no document overflow or browser errors. Header positions, capsule heights, action visibility and active navigation match the shared layout at desktop and tablet widths.
- Profile, notification and navigation controls pass at 768 and 1440px across all four roles.
- Before/after Driver and Loader mobile dashboard screenshots at 390px have no pixel differences.
- Images within the viewport load correctly; images outside it retain Next.js lazy loading.
- Driver and Loader workflow regressions pass, including delivery proof, offline sync, shortfall approval, departure release, demo reset and sign-in/sign-out.
- Header search passes for all roles: Driver/Loader route navigation, Dispatcher result selection by keyboard, and Store Manager order filtering and clearing.
