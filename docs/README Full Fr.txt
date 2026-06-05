Firefox Auto-hide Toolbars v1.0

CONTENU

- Firefox Auto-hide Toolbars - Program v1.0.zip
  Fichiers à installer dans le dossier d’installation de Firefox.

- Firefox Auto-hide Toolbars - Profile v1.0.zip
  Dossier chrome à installer dans le profil Firefox concerné.


INSTALLATION

1. Fermer complètement Firefox.
2. Copier dans le dossier d’installation de Firefox :
   - config.js
   - defaults
3. Copier le dossier chrome dans le profil Firefox concerné.
4. Relancer Firefox.
5. Le bouton "Masquages des barres d'outils" peut être déplacé via :
   clic droit sur la barre d’outils > Personnaliser la barre d’outils.


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

Le contenu de l'archive :

- Firefox Auto-hide Toolbars - Program v1.0.zip

provient directement du projet fx-autoconfig et n'a pas été modifié.

L'archive :

- Firefox Auto-hide Toolbars - Profile v1.0.zip

contient les fichiers du projet fx-autoconfig nécessaires au fonctionnement du script ainsi que les fichiers spécifiques à Firefox Auto-hide Toolbars.

Pour bénéficier des dernières corrections et améliorations du projet fx-autoconfig, il est recommandé de consulter régulièrement le dépôt officiel.

Licence :
Mozilla Public License Version 2.0 (MPL-2.0)
