"use strict";
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// TITLE:    QoL Admin Scripts - initialisation
/// PURPOSE:  Declare common functions - mostly for feature flags and config values, and any other functions that need to be shared across multiple content scripts.
/// AUTHOR:   Ian
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// CHANGES: 
///   Version      Date           Author          Comments            
///   1.0         Feb 2026        Ian             Created
///   1.1         Feb 2026        Ian             Moved Initialisation variables here and added helper functions for feature flags and config values.
///   1.2         Feb 2026        Ian             Removed sidebar page and unused permissions. Added environment and currentURL for all features for future use.
///   1.3         Feb 2026        Ian             General cleanup an dadded color pickers for environment headers.
///   
///---------------------------------------------------------------------------------------------------------------------------------------------------///

let qolname = "";
let result = "";
let msg = "";
let verboselogging = true; // lots of console.logging in the code for now to help with development and testing - can turn this off later when we want to reduce noise in the console. We can also use this for users if we want to add a debug mode in the future.

// default colrsa in case not set.
  let stagingColor = "#1c97d5";
  let productionColor = "#c90000";

const currentURL = window.location.href;
const environment = checkEnvironment(currentURL); // returns staging or production or false if not on actionstep - we can use this in future for better error handling and to stop scripts running on non-actionstep pages.

/// list supported features here - this is used to check which features to run on each page load, and can be used for error handling and logging. We can also use this to build the options page in the future if we want to get fancy and not hardcode the features there. 
        const featuresToCheck = [
            "QoL_EnvironmentColour",
            "QoL_GetJoke",
            "QoL_ClientFees",
            "QoL_Listviews",
            "QoL_WorkflowExtract",
        ];

/// To Do: url filtering is currently in manifest but might be better in code
        const urlpatterns = [
        "https://*.actionstepstaging.com/*",
        "https://*.actionstep.com/*"
      ]

/// To Do: add specific page url patterns into config? - this would allow us to only run certain features on certain pages, 
//  would be more efficient than running code on pages where it is not needed and just having the code check the url again. 
// We can add this in the future if we want to get fancy, but for now we will just have the features check the url themselves if needed.


///-------helper functions--------------------------------------------------------------------------------------------------------------------------------///

// for console logging - only create logs/info if verbose is true, and adds the qolname for easier debugging. We can expand this in the future to add different log levels (info, warning, error) and to include timestamps if we want to get fancy.
function log(message) {
    if (verboselogging) {
        console.info(`${message}`);
    } }



// always used
function checkEnvironment(currentURL) {
    const actionStepPattern =
        /^https:\/\/ap-southeast-2\.actionstep(staging)?\.com\//;
    const match = currentURL.match(actionStepPattern);
    let environment = match[1] === "staging" ? "STAGING" : "PRODUCTION";
    if (!match) return false;
    return environment;
}


// Synchronous helper function
function isFeatureEnabledSync(featuresArray, featureName) {
  const feature = featuresArray.find(ff => ff.qolname === featureName);
  return feature ? feature.enabled : false;
}

// not used
async function getStorageData() {
    const result = await chrome.storage.sync.get({ QoL_Features: [] });
    return result.QoL_Features;
}


// BOTH EXTENSION AND FEATURE MUST BE ENABLED FOR THE FEATURE TO WORK
// Optimized CheckEnabled

/// Function to check if EXTENSION AND feature are both enabled - NOT USED
async function CheckEnabled(featureName) {
  // Call sync storage once
  const result = await chrome.storage.sync.get({ QoL_Features: [] });
  const features = result.QoL_Features;

  // Pass retrieved data to helpers
  const Extension = isFeatureEnabledSync(features, 'EXTENSIONENABLED');
  const Feature = isFeatureEnabledSync(features, featureName);

  return Extension && Feature; // boolean - both must be true for the feature to be enabled
}

/// Function to check if a feature is enabled - NOT USED
async function isExtensionEnabled(featureName) {
  const result = await chrome.storage.sync.get([featureName]);
  log('Value currently is ' + result[featureName]);
    // Returns true unless explicitly set to false
  return result[featureName] !== false; 
}