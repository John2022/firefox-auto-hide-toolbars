Firefox Auto-hide Toolbars v1.0

CONTENTS

- Firefox Auto-hide Toolbars - Program v1.0.zip
  Files to install in the Firefox installation folder.

- Firefox Auto-hide Toolbars - Profile v1.0.zip
  chrome folder to install in the target Firefox profile.


INSTALLATION

1. Completely close Firefox.
2. Copy these items into the Firefox installation folder:
   - config.js
   - defaults
3. Copy the chrome folder into the target Firefox profile folder.
4. Restart Firefox.
5. The "Auto-hide Toolbars" button can be moved through:
   right-click the toolbar > Customize Toolbar.


USAGE

- Button OFF:
  Firefox toolbars remain visible.
- Button ON:
  Firefox toolbars hide automatically and reappear when hovering the top of the window.
- Keyboard shortcut:
  CTRL + F11
- Menu:
  Tools > Auto-hide Toolbars
  The menu item is checked only when auto-hide is active.


DIAGNOSTIC

If something goes wrong, open the Browser Console:
CTRL + SHIFT + J
Then run:
FirefoxAutoHideToolboxStatus()
The command returns a minimal diagnostic state:
- script version;
- ON/OFF state;
- button presence;
- button placement;
- fullscreen state;
- automatically calculated toolbar height;
- state of the SVG preference required by the icon.


UNINSTALLATION

1. Open Firefox before fully removing the package.
2. Open the Browser Console:
   CTRL + SHIFT + J
3. Paste and run this command:
(() => {
  const widgetId = "uc-autohide-toolbox-toggle-button";
  const autoPlacedPref = "userchrome.autohideToolbox.autoPlacedOnce";
  const uiPref = "browser.uiCustomization.state";

  try {
    Services.prefs.clearUserPref(autoPlacedPref);
  } catch (_) {}

  try {
    const state = JSON.parse(Services.prefs.getStringPref(uiPref, "{}"));

    for (const area of Object.keys(state.placements || {})) {
      state.placements[area] = state.placements[area].filter(id => id !== widgetId);
    }

    if (Array.isArray(state.seen)) {
      state.seen = state.seen.filter(id => id !== widgetId);
    }

    Services.prefs.setStringPref(uiPref, JSON.stringify(state));
  } catch (_) {}

  return "Firefox Auto-hide Toolbox: preferences and placements cleaned";
})()
4. Close Firefox.
5. Delete these items from the Firefox installation folder:
   - config.js
   - defaults
6. Delete this item from the Firefox profile folder:
   - chrome
7. Restart Firefox.


NOTES

This package uses userChromeJS / userChrome.css.
It is not a standard Firefox XPI extension.

Firefox native fullscreen is left to Firefox itself in order to preserve its normal behavior.

Version: 1.0


CREDITS AND THIRD-PARTY COMPONENTS

This project is based on MrOtherGuy's fx-autoconfig project.

Official project:
https://github.com/MrOtherGuy/fx-autoconfig

The contents of:

- Firefox Auto-hide Toolbars - Program v1.0.zip

are taken directly from the fx-autoconfig project and have not been modified.

The archive:

- Firefox Auto-hide Toolbars - Profile v1.0.zip

contains the fx-autoconfig files required for operation together with the files specific to Firefox Auto-hide Toolbars.

To benefit from the latest fixes and improvements, users are encouraged to check the official fx-autoconfig repository periodically.

License:
Mozilla Public License Version 2.0 (MPL-2.0)
