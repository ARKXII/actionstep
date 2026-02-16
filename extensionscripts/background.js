"use strict";
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// TITLE:    QoL Admin Scripts - background
/// PURPOSE:  Set badge text and default config values, start listeners
/// AUTHOR:   Joshua
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// CHANGES: 
///   Version      Date           Author          Comments            
///   1.0         Jan 2026        Ian             Badge text on/off
///   1.1         Feb 2026        Ian             Added default config values
///   1.2         Feb 2026        Ian             General tidy up and comments
///   1.3         Feb 2026        Ian             Added environment colour selectors as config items (see popup)
///   
///---------------------------------------------------------------------------------------------------------------------------------------------------///

const qolnameBackground = "QoL_Background";
const EXTENSIONENABLED = true; // install and startup with extension set to this value.
let resultbackground = "";
let msgbackground = "";


setBadgeText(EXTENSIONENABLED);

// onStartup.
resultbackground = chrome.runtime.onStartup.addListener(startUp);
if (resultbackground) {
  msgbackground = `${qolnameBackground} - onStartup listener added successfully.`;
  //ExtensionUtils.showToast(msgbackground);
}
// onInstalled.
resultbackground = chrome.runtime.onInstalled.addListener(startUp);
if (resultbackground) {
  msgbackground = `${qolnameBackground} - onInstalled listener added successfully.`;
  //ExtensionUtils.showToast(msgbackground);
}

// on Change to storage.
chrome.storage.onChanged.addListener((changes, area) => {
  // 1. Features - Only act if our specific key changed in the 'sync' area
  if (area === 'sync' && changes.QoL_Features) {
    const oldList = changes.QoL_Features.oldValue || [];
    const newList = changes.QoL_Features.newValue || [];

    // 2. Identify which feature specifically changed
    newList.forEach(newFeat => {
      const oldFeat = oldList.find(f => f.qolname === newFeat.qolname);

      // React if it's a new feature or the 'enabled' state flipped
      if (!oldFeat || oldFeat.enabled !== newFeat.enabled) {
        handleFeatureChange(newFeat.qolname, newFeat.enabled);
      }
    });
  }

  // 2. Environment Colours - Listen for changes to environment colour settings and update header color if needed
  if (area === 'sync' && (changes.QoL_EnvironmentColour_Staging || changes.QoL_EnvironmentColour_Production)) {
    // Get current environment from storage (or default to PRODUCTION if not set)
    chrome.storage.sync.get(['QoL_Environment'], (result) => {
      const currentEnvironment = result.QoL_Environment || "PRODUCTION";
      const newStagingColor = changes.QoL_EnvironmentColour_Staging?.newValue || "#1c97d5";
      const newProductionColor = changes.QoL_EnvironmentColour_Production?.newValue || "#c90000";

    });
  }   
});



///---------------------------------------------------------------------------------------------------------------------------------------------------///

async function startUp() {

  // setup feature list.
  const qolFeaturesDefaults = [
    {
      qolname: "EXTENSIONENABLED",
      featureSet: "Set0",
      enabled: true,
      pagename: "Actionstep (All Pages)",
      comment: "Turn on/off this extension - when off, all features will be disabled and badge text will show OFF."
    },
  
    {
      qolname: "verboselogging",
      featureSet: "Set0",
      enabled: false,
      pagename: "Actionstep (All Pages)",
      comment: "Enable verbose logging in the console for debugging purposes"
    },
    {
      qolname: "QoL_EnvironmentColour",
      featureSet: "Set1",
      enabled: true,
      pagename: "Actionstep (All Pages)",
      comment: "Clearly show when using production system by making primary navigation RED and staging BLUE"
    },
    {
      qolname: "QoL_Listviews",
      featureSet: "Set1",
      enabled: true,
      pagename: "Actionstep Listviews",
      comment: "Improve Actionstep UI while editing listviews - opens lists of action types and steps to make them easier to read and copy"
    },
    {
      qolname: "QoL_ClientFees",
      featureSet: "Set1",
      enabled: true,
      pagename: "Actionstep Fee Override Tables",
      comment: "Extract fee data from a ratesheet override table in Actionstep, format it as pipe-delimited text, and provide easy way to copy to clipboard"
    },
    {
      qolname: "QoL_GetJoke",
      featureSet: "Set1",
      enabled: false,
      pagename: "Actionstep (All Pages)",
      comment: "Test script to get a joke from an API"
    },
    {
      qolname: "QoL_WorkflowExtract",
      featureSet: "Set1",
      enabled: false,
      pagename: "Actionstep (All Pages)",
      comment: "Extract workflow structure and provide copy button for JSON/CSV format"
    }
  ];

  // 1. Get existing data from sync storage
  const storageData = await chrome.storage.sync.get(['QoL_Features']);
  const existingFeatures = storageData.QoL_Features || [];

  // 2. Merge defaults, keeping existing 'enabled' state
  const updatedFeatures = qolFeaturesDefaults.map(defaultFeature => {
    const existing = existingFeatures.find(f => f.qolname === defaultFeature.qolname);
    if (existing) {
      // Use existing feature, but update metadata if necessary (keeping enabled state)
      return { ...defaultFeature, enabled: existing.enabled };
    }
    // New feature, use default
    return defaultFeature;
  });

  // 3. Save merged list back to storage
  await chrome.storage.sync.set({ QoL_Features: updatedFeatures });
   console.info("QoL Features initialized/updated.");

// now setup default colours for environment header colour feature - these will be used in the popup color pickers as well.
  const defaultColours = {
    QoL_EnvironmentColour_Production: "#c90000",
    QoL_EnvironmentColour_Staging: "#1c97d5"
  };
 
  // Save default colours to storage if not already set
  chrome.storage.sync.get(Object.keys(defaultColours), (result) => {
    const missingKeys = Object.keys(defaultColours).filter(key => !(key in result));
    if (missingKeys.length > 0) {
      const toSet = {};
      missingKeys.forEach(key => {
        toSet[key] = defaultColours[key];
      });
      chrome.storage.sync.set(toSet);
    }
  });
}


function setBadgeText(enabled) {
  const text = enabled ? "ON" : "OFF"
  void chrome.action.setBadgeText({ text: text })
   console.info("QoL badge changed to: " + text);
}

function handleFeatureChange(name, isEnabled) {
  console.info(`bgscript - Feature "${name}" is now ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
  
  if (name === 'EXTENSIONENABLED') {
    setBadgeText(isEnabled);
  }

    if (name === 'verboselogging') {
    const   verboselogging = isEnabled;
  }
}


