// ==UserScript==
// @name           Auto-hide Toolbars
// @include        main
// ==/UserScript==

(() => {
  const ATTR = "uc-autohide-toolbox-enabled";
  const MENU_ID = "uc-autohide-toolbox-toggle-menuitem";
  const BUTTON_ID = "uc-autohide-toolbox-toggle-button";
  const PREF_AUTO_PLACED = "userchrome.autohideToolbox.autoPlacedOnce";
  const VERSION = "1.0";
  const LABEL_BASE = "Auto-hide Toolbars";

  let toolboxResizeObserver = null;
  let lastDelegatedToggleTime = 0;
  let lastStableToolboxHeight = 0;

  const { CustomizableUI } = ChromeUtils.importESModule(
    "moz-src:///browser/components/customizableui/CustomizableUI.sys.mjs"
  );

  function getPrefs() {
    try {
      return Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefBranch);
    } catch (_) {
      return null;
    }
  }

  function getBoolPref(name, fallback) {
    const prefs = getPrefs();

    if (!prefs) {
      return fallback;
    }

    try {
      return prefs.getBoolPref(name, fallback);
    } catch (_) {
      return fallback;
    }
  }

  function setBoolPref(name, value) {
    const prefs = getPrefs();

    if (!prefs) {
      return;
    }

    try {
      prefs.setBoolPref(name, value);
    } catch (_) {}
  }

  function isEnabled() {
    return document.documentElement.getAttribute(ATTR) === "true";
  }

  function updateButtonNode(button, enabled) {
    if (!button) {
      return;
    }

    const tooltip = enabled
      ? "Auto-hide enabled - click to keep toolbars visible"
      : "Toolbars visible - click to enable auto-hide";

    button.removeAttribute("open");
    button.removeAttribute("image");

    button.removeAttribute("type");
    button.setAttribute("label", LABEL_BASE);
    button.setAttribute("tooltiptext", tooltip);
    button.setAttribute("uc-autohide-state", enabled ? "on" : "off");
    button.setAttribute("aria-pressed", enabled ? "true" : "false");

    if (enabled) {
      button.setAttribute("checked", "");
    } else {
      button.removeAttribute("checked");
    }

    button.style.removeProperty("background-color");
    button.style.removeProperty("border");
    button.style.removeProperty("border-radius");
    button.style.removeProperty("color");
    button.style.removeProperty("fill");
    button.style.removeProperty("list-style-image");
    button.style.removeProperty("min-width");
    button.style.removeProperty("padding");
  }

  function updateAllButtonNodes(enabled) {
    const nodes = new Set();

    for (const node of document.querySelectorAll(`[id="${BUTTON_ID}"]`)) {
      nodes.add(node);
    }

    const widget = CustomizableUI.getWidget(BUTTON_ID);
    const widgetNode = widget?.forWindow(window)?.node;

    if (widgetNode) {
      nodes.add(widgetNode);
    }

    for (const node of nodes) {
      updateButtonNode(node, enabled);
    }
  }

  function apply(enabled) {
    if (enabled) {
      document.documentElement.setAttribute(ATTR, "true");
    } else {
      document.documentElement.removeAttribute(ATTR);
    }

    const menu = document.getElementById(MENU_ID);
    if (menu) {
      menu.setAttribute("label", LABEL_BASE);

      if (enabled) {
        menu.setAttribute("checked", "true");
      } else {
        menu.removeAttribute("checked");
      }
    }

    updateAllButtonNodes(enabled);
    queueToolboxSpaceUpdate();
  }

  function toggle() {
    apply(!isEnabled());
  }

  function isButtonEventTarget(target) {
    let node = target;

    while (node) {
      if (node.id === BUTTON_ID) {
        return true;
      }

      node = node.parentNode;
    }

    return false;
  }

  function handleDelegatedButtonEvent(event) {
    if (!isButtonEventTarget(event.target)) {
      return;
    }

    if (event.type === "click" && event.button !== 0) {
      return;
    }

    const now = Date.now();

    if (now - lastDelegatedToggleTime < 150) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    lastDelegatedToggleTime = now;

    event.preventDefault();
    event.stopPropagation();

    toggle();
  }

  function installDelegatedButtonEvents() {
    window.removeEventListener("command", handleDelegatedButtonEvent, true);
    window.removeEventListener("click", handleDelegatedButtonEvent, true);

    window.addEventListener("command", handleDelegatedButtonEvent, true);
    window.addEventListener("click", handleDelegatedButtonEvent, true);
  }

  function handleShortcut(event) {
    if (
      event.ctrlKey &&
      !event.altKey &&
      !event.shiftKey &&
      !event.metaKey &&
      (event.key === "F11" || event.code === "F11")
    ) {
      event.preventDefault();
      event.stopPropagation();
      toggle();
    }
  }

  function createMenuItem() {
    const toolsMenu = document.getElementById("menu_ToolsPopup");

    if (!toolsMenu || document.getElementById(MENU_ID)) {
      return;
    }

    const item = document.createXULElement("menuitem");
    item.id = MENU_ID;
    item.setAttribute("type", "checkbox");
    item.setAttribute("label", LABEL_BASE);
    item.addEventListener("command", toggle);

    toolsMenu.insertBefore(item, toolsMenu.firstChild);
  }

  function getInitialPositionAfterUrlbar() {
    const urlbarPlacement = CustomizableUI.getPlacementOfWidget("urlbar-container");

    if (urlbarPlacement && urlbarPlacement.area === CustomizableUI.AREA_NAVBAR) {
      return urlbarPlacement.position + 1;
    }

    return undefined;
  }

  function createToolbarButton() {
    const placementBefore = CustomizableUI.getPlacementOfWidget(BUTTON_ID);
    const alreadyAutoPlaced = getBoolPref(PREF_AUTO_PLACED, false);

    try {
      CustomizableUI.destroyWidget(BUTTON_ID);
    } catch (_) {}

    CustomizableUI.createWidget({
      id: BUTTON_ID,
      type: "custom",

      onBuild(doc) {
        const button = doc.createElementNS(
          "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
          "toolbarbutton"
        );

        button.id = BUTTON_ID;
        button.className = "toolbarbutton-1 chromeclass-toolbar-additional";
        button.setAttribute("label", LABEL_BASE);
        button.setAttribute("tooltiptext", "Toggle fixed toolbars / Automatic hiding");
        button.setAttribute("uc-autohide-state", "off");

        return button;
      }
    });

    const placementAfter = CustomizableUI.getPlacementOfWidget(BUTTON_ID);

    if (placementAfter) {
      setBoolPref(PREF_AUTO_PLACED, true);
      return;
    }

    if (placementBefore) {
      CustomizableUI.addWidgetToArea(
        BUTTON_ID,
        placementBefore.area,
        placementBefore.position
      );
      setBoolPref(PREF_AUTO_PLACED, true);
      return;
    }

    if (!alreadyAutoPlaced) {
      CustomizableUI.addWidgetToArea(
        BUTTON_ID,
        CustomizableUI.AREA_NAVBAR,
        getInitialPositionAfterUrlbar()
      );
      setBoolPref(PREF_AUTO_PLACED, true);
    }
  }

  function isVisibleToolboxChild(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }

    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();

    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.visibility === "collapse" ||
      node.hidden ||
      node.getAttribute("collapsed") === "true"
    ) {
      return false;
    }

    return Number.isFinite(rect.height) && rect.height > 0;
  }

  function measureVisibleToolboxChildrenHeight() {
    const toolbox = document.getElementById("navigator-toolbox");

    if (!toolbox) {
      return 0;
    }

    return Array.from(toolbox.children).reduce((sum, child) => {
      if (!isVisibleToolboxChild(child)) {
        return sum;
      }

      return sum + child.getBoundingClientRect().height;
    }, 0);
  }

  function setToolboxSpaceVars(height) {
    if (!Number.isFinite(height) || height <= 0) {
      return;
    }

    const rootStyle = document.documentElement.style;

    rootStyle.setProperty("--uc-toolbox-height-auto", `${height}px`);
    rootStyle.setProperty("--uc-toolbox-space-auto", `${height}px`);
    rootStyle.setProperty("--uc-fullscreen-toolbox-space-auto", `${height}px`);
  }

  function shouldUpdateStableToolboxHeight() {
    return (
      document.readyState === "complete" &&
      !window.fullScreen &&
      document.documentElement.getAttribute("sizemode") !== "fullscreen"
    );
  }

  function updateToolboxSpaceVars() {
    const measuredHeight = measureVisibleToolboxChildrenHeight();

    if (shouldUpdateStableToolboxHeight()) {
      if (Number.isFinite(measuredHeight) && measuredHeight > 0) {
        lastStableToolboxHeight = measuredHeight;
        setToolboxSpaceVars(lastStableToolboxHeight);
      }

      return;
    }

    if (lastStableToolboxHeight > 0) {
      setToolboxSpaceVars(lastStableToolboxHeight);
      return;
    }

    if (Number.isFinite(measuredHeight) && measuredHeight > 0) {
      setToolboxSpaceVars(measuredHeight);
    }
  }

  function queueToolboxSpaceUpdate() {
    requestAnimationFrame(() => {
      updateToolboxSpaceVars();

      setTimeout(updateToolboxSpaceVars, 150);
      setTimeout(updateToolboxSpaceVars, 500);
    });
  }

  function installToolboxSpaceObservers() {
    const toolbox = document.getElementById("navigator-toolbox");

    queueToolboxSpaceUpdate();

    window.removeEventListener("resize", queueToolboxSpaceUpdate, true);
    window.addEventListener("resize", queueToolboxSpaceUpdate, true);

    window.removeEventListener("fullscreen", queueToolboxSpaceUpdate, true);
    window.addEventListener("fullscreen", queueToolboxSpaceUpdate, true);

    window.removeEventListener("sizemodechange", queueToolboxSpaceUpdate, true);
    window.addEventListener("sizemodechange", queueToolboxSpaceUpdate, true);

    window.removeEventListener("aftercustomization", queueToolboxSpaceUpdate, true);
    window.addEventListener("aftercustomization", queueToolboxSpaceUpdate, true);

    if (toolbox && typeof ResizeObserver === "function") {
      if (toolboxResizeObserver) {
        toolboxResizeObserver.disconnect();
      }

      toolboxResizeObserver = new ResizeObserver(queueToolboxSpaceUpdate);
      toolboxResizeObserver.observe(toolbox);

      for (const child of toolbox.children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          toolboxResizeObserver.observe(child);
        }
      }
    }
  }

  function installDiagnosticCommand() {
    window.FirefoxAutoHideToolboxStatus = function() {
      const button = document.getElementById(BUTTON_ID);
      const placement = CustomizableUI.getPlacementOfWidget(BUTTON_ID);

      return {
        name: "Firefox Auto-hide Toolbox",
        version: VERSION,
        enabled: isEnabled(),
        buttonFound: !!button,
        buttonId: BUTTON_ID,
        buttonState: button?.getAttribute("uc-autohide-state") || null,
        buttonChecked: button?.getAttribute("checked") ?? null,
        placement,
        fullScreen: window.fullScreen,
        toolboxSpaceAuto: getComputedStyle(document.documentElement)
          .getPropertyValue("--uc-toolbox-space-auto")
          .trim(),
        svgContextFillEnabled: getBoolPref("svg.context-properties.content.enabled", false),
        autoPlacedPref: getBoolPref(PREF_AUTO_PLACED, false)
      };
    };
  }

  function init() {
    setBoolPref("svg.context-properties.content.enabled", true);

    createMenuItem();
    installDelegatedButtonEvents();
    installDiagnosticCommand();
    installToolboxSpaceObservers();

    try {
      createToolbarButton();
    } catch (error) {
      console.error("Error creating Auto-hide Toolbars button:", error);
    }

    window.removeEventListener("keydown", handleShortcut, true);
    window.addEventListener("keydown", handleShortcut, true);

    apply(false);
  }

  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init, { once: true });
  }
})();
