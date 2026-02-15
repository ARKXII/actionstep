"use strict";
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// TITLE:    QoL Admin Scripts - get a joke
/// PURPOSE:  Test script to get a joke from an API and display it in a toast notification  
/// AUTHOR:   Ian
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// CHANGES: 
///   Version      Date           Author          Comments            
///   1.0         Feb 2026        Ian             LS-AS Qol enhancements
///   1.1         Feb 2026        Ian             Updated formatting and style.
///   1.2         Feb 2026        Ian             Function only - see MAIN. Also removed toast notification. 
///   
///---------------------------------------------------------------------------------------------------------------------------------------------------///
///   POC for calling external API in content script, with error handling and using the feature flag in storage to turn it on and off.
///   
///---------------------------------------------------------------------------------------------------------------------------------------------------/// 


async function getJoke(currentURL, environment) {
  const apiURL = "https://official-joke-api.appspot.com/random_joke";
  try {
    const response = await fetch(apiURL);
    const data = await response.json();

    // Log the setup and punchline - for now
    let joke = `${data.setup} ... ${data.punchline}`;
    log(`QoL_GetJoke - ${joke}`);     // hard coded qolname to ensure it stays set to qol_joke for slow responses (asynch)
    const divElement = document.getElementById("global-message");
    if (divElement) divElement.innerHTML = `<h3>${joke}</h3>`;
    return joke;

  } catch (error) {
    msg = `${qolname} - ${error.message}`;
    return false;
  }
}