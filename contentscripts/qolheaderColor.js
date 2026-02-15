"use strict";
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// TITLE:    QoL Admin Scripts - headercolour
/// PURPOSE:  Clearly show when we are using production system by making primary navigation RED and staging BLUE
/// AUTHOR:   Joshua
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// CHANGES: 
///   Version      Date           Author          Comments            
///   1.0         Jan 2026        Joshua          Created
///   1.1         Feb 2026        Ian             updated colours & KISS
///   1.2         Feb 2026        Ian             Function only - see MAIN. Also removed toast notification.
///   1.3         Feb 2026        Ian             Added color pickers for environemtn colors.
///   
///---------------------------------------------------------------------------------------------------------------------------------------------------///

function environmentHeaderColor(currentURL, environment) {
  // change header color to environment
  const header = document.getElementById("global-navigation");

  // get the custom colours for staging and production from storage (or use defaults if not set)
  let msg = "";

  chrome.storage.sync.get({ QoL_EnvironmentColour_Staging: stagingColor, QoL_EnvironmentColour_Production: productionColor }).then((colors) => {
    stagingColor = colors.QoL_EnvironmentColour_Staging || stagingColor;
    productionColor = colors.QoL_EnvironmentColour_Production || productionColor;

    // Update header color based on current environment and new color values
    if (environment === "STAGING") {
      header.style.cssText += `background-color: ${stagingColor} !important;`;
      msg = `- STAGING environment - header color set`;
      return msg;
    } else if (environment === "PRODUCTION") {
      header.style.cssText += `background-color: ${productionColor} !important;`;
      msg = `- PRODUCTION environment - header color set`;
      return msg;
    }
  });

}