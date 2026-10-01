// This flag lasts only for the current document. Reloading starts the intro again.
let signOutNavigation = false;

export function markSignOutNavigation() { signOutNavigation = true; }
export function isSignOutNavigation() { return signOutNavigation; }
export function clearSignOutNavigation() { signOutNavigation = false; }
