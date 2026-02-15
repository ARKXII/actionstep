"use strict";
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// TITLE:    QoL Admin Scripts - toast and more
/// PURPOSE:  Toast popup with messages
/// AUTHOR:   Joshua
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// CHANGES: 
///   Version      Date           Author          Comments            
///   1.0         Feb 2026        Joshua          LS-AS Qol enhancements
///   
///---------------------------------------------------------------------------------------------------------------------------------------------------///


const ExtensionUtils = {
  showToast: function showToast(string) {
    // Get toast css
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("../css/toast.css");
    document.head.appendChild(link);

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
