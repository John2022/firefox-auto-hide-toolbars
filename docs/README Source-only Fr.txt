Firefox Auto-hide Toolbars v1.0

CONTENU

- userChrome.css
- autohide_toolbox_toggle.uc.js
- autohide-bars.svg

Cette archive ne contient pas les fichiers complets de fx-autoconfig.


INSTALLATION

1. Télécharger et installer le projet officiel fx-autoconfig :
   https://github.com/MrOtherGuy/fx-autoconfig

2. Installer fx-autoconfig conformément à sa documentation officielle.

3. Copier config.js et defaults depuis le dépôt officiel.

4. Copier le dossier chrome fourni par fx-autoconfig dans le profil Firefox concerné.

5. Copier les fichiers de cette archive :
   - userChrome.css
   - autohide_toolbox_toggle.uc.js
   - autohide-bars.svg

6. Remplacer les fichiers existants si demandé.

7. Relancer Firefox.


UTILISATION

- Bouton OFF :
  les barres Firefox restent affichées.
- Bouton ON :
  les barres Firefox se masquent automatiquement et réapparaissent au survol du haut de la fenêtre.
- Raccourci :
  CTRL + F11
- Menu :
  Outils > Masquages des barres d'outils
  La coche indique que le masquage automatique est actif.


DIAGNOSTIC

En cas de problème, ouvrir la console navigateur :
CTRL + MAJ + J
Puis exécuter :
FirefoxAutoHideToolboxStatus()
La commande renvoie un état de diagnostic minimal :
- version du script ;
- état ON/OFF ;
- présence du bouton ;
- emplacement du bouton ;
- état du plein écran ;
- hauteur automatique calculée ;
- état de la préférence SVG nécessaire à l’icône.


DÉSINSTALLATION

1. Ouvrir Firefox avant suppression complète.
2. Ouvrir la console navigateur :
   CTRL + MAJ + J
3. Coller puis exécuter cette commande :
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

  return "Firefox Auto-hide Toolbox : préférences et placements nettoyés";
})()
4. Fermer Firefox.
5. Supprimer du dossier d’installation de Firefox :
   - config.js
   - defaults
6. Supprimer du profil Firefox :
   - chrome
7. Relancer Firefox.


NOTES

Ce pack utilise userChromeJS / userChrome.css.
Il ne s’agit pas d’une extension Firefox XPI standard.

Le plein écran natif Firefox est laissé à Firefox lui-même afin de conserver son comportement normal.

Version : 1.0

CRÉDITS ET COMPOSANTS TIERS

Ce projet repose sur le projet fx-autoconfig de MrOtherGuy.

Projet officiel :
https://github.com/MrOtherGuy/fx-autoconfig

Cette archive contient uniquement les fichiers spécifiques à Firefox Auto-hide Toolbars :
* userChrome.css
* autohide_toolbox_toggle.uc.js
* autohide-bars.svg

Les fichiers suivants doivent être récupérés depuis le dépôt officiel fx-autoconfig :
* config.js
* defaults
* chrome

Pour bénéficier des dernières corrections et améliorations de fx-autoconfig, il est recommandé d'utiliser les fichiers les plus récents disponibles sur le dépôt officiel.

Licence :
Mozilla Public License Version 2.0 (MPL-2.0)