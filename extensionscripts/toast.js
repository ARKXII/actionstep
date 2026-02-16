"use strict";
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// TITLE:    QoL Admin Scripts - toast and more
/// PURPOSE:  Toast popup with messages
/// AUTHOR:   Joshua
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// CHANGES:
///   Version      Date           Author          Comments
///   1.1         Feb 2026        Joshua          LS-AS Qol enhancements
///
///---------------------------------------------------------------------------------------------------------------------------------------------------///

const ExtensionUtils = {
  showToast: function showToast(string) {
    let stagingColor = ""; // default staging color
    let productionColor = ""; // default production color
    chrome.storage.sync
      .get({
        QoL_EnvironmentColour_Staging: stagingColor,
        QoL_EnvironmentColour_Production: productionColor,
      })
      .then((colors) => {
        stagingColor = colors.QoL_EnvironmentColour_Staging || stagingColor;
        productionColor =
          colors.QoL_EnvironmentColour_Production || productionColor;
      });
    // Get toast css
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("../css/toast.css");
    document.head.appendChild(link);
    document.documentElement.style.setProperty(
      "--toast-bg-color",
      stagingColor,
    ); // default color, can be overridden by CSS variable

    // Check if snackbar already exists
    let toast = document.getElementById("snackbar");

    if (toast) {
      // Update existing snackbar content
      toast.innerHTML = `${string}`;

      // Make sure it's visible (re-add show class if needed)
      toast.className = "show";

      // Clear any existing timeout to reset the hide timer
      if (toast._hideTimeout) {
        clearTimeout(toast._hideTimeout);
      }

      // Set new timeout to hide after 3 seconds
      toast._hideTimeout = setTimeout(function () {
        toast.className = toast.className.replace("show", "");
      }, 5000);
    } else {
      // Create new snackbar
      toast = document.createElement("div");
      toast.id = "snackbar";
      toast.innerHTML = `${string}`;
      document.body.appendChild(toast);

      // Add the "show" class
      toast.className = "show";

      // After 3 seconds, remove the show class
      toast._hideTimeout = setTimeout(function () {
        toast.className = toast.className.replace("show", "");
      }, 3000);
    }
  },
};

window.ExtensionUtils = ExtensionUtils;
