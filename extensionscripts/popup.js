"use strict";
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// TITLE:    QoL Admin Scripts - popup
/// PURPOSE:  Monitor the popup for changes to settings 
/// AUTHOR:   Ian
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// CHANGES: 
///     Version      Date           Author          Comments            
///     1.0         Jan 2026        Ian             Badge text on/off
///     1.1         Feb 2026        Ian             Added dynamic qol features
///     1.2         Feb 2026        Ian             Cleaned up code
///     1.3         Feb 2026        Ian             Added environment colour selectors with default values as config items (see popup)
///     
///---------------------------------------------------------------------------------------------------------------------------------------------------///

let qolFeatures = [];

setBadgeText(isExtensionEnabled('EXTENSIONENABLED')); // Call setBadgeText with the result of isExtensionEnabled

// qol features and switches.
getConfig().then(() => {
    return;
})


///---------------------------------------------------------------------------------------------------------------------------------------------------///

async function getConfig() {
    chrome.storage.sync.get({ QoL_Features: [] }).then((result) => {
        console.log("Retrieved from sync:", result.QoL_Features);
        qolFeatures.length = 0; // Clear existing array
        qolFeatures.push(...result.QoL_Features); // Populate with retrieved features

        // Now that we have the features, we can generate the toggles in the popup.
        generateFeatureToggles();

        // set the color pickers in the popup to the current values in storage (or defaults if not set)
        const STAGINGcolor = document.getElementById("STAGINGcolor");
        const PRODcolor = document.getElementById("PRODcolor");

        // Get current colors from storage or use defaults      
        chrome.storage.sync.get({ QoL_EnvironmentColour_Staging: "#1c97d5", QoL_EnvironmentColour_Production: "#c90000" }).then((colors) => {
            STAGINGcolor.value = colors.QoL_EnvironmentColour_Staging;
            PRODcolor.value = colors.QoL_EnvironmentColour_Production;
        });
        // Add listeners to color pickers after setting their initial values
        addColorPickerListeners();

        return qolFeatures;
    });
}

// functions
function setBadgeText(enabled) {
    const text = enabled ? "ON" : "OFF"
    void chrome.action.setBadgeText({ text: text })
}


/// Function to check if a single feature is enabled
async function isExtensionEnabled(featureName) {
    const result = await chrome.storage.sync.get([featureName]);
    console.log('Value currently is ' + result[featureName]);
    // Returns true unless explicitly set to false
    return result[featureName] !== false;
}

// Generate feature toggles switches from qolFeatures array in storage - this is called on load of the popup to generate the list of features and their current enabled/disabled status. 
// It also adds listeners to each toggle to update the storage when changed. 
// The actual reaction to changes in feature flags is handled in background.js which listens for changes to the QoL_Features array and reacts accordingly. 
// This separation allows the popup to focus on UI and user interaction, while the background script handles the logic of enabling/disabling features across content scripts.
function generateFeatureToggles() {
    const container = document.getElementById("features-container");
    if (!container) return;

    qolFeatures.forEach(feature => {
        const toggleDiv = document.createElement("div");
        toggleDiv.className = "toggle-container";

        // check if we need a <hr> before the current feature(set).
        // we want to separate out the features into sections based on the featureSet property, so we check if the previous feature had a different featureSet and if so we add a separator.
        if (qolFeatures.indexOf(feature) > 0 && qolFeatures[qolFeatures.indexOf(feature) - 1].featureSet !== feature.featureSet) {
            const hr = document.createElement("hr");
            container.appendChild(hr);
        }
        toggleDiv.innerHTML = `
            <span title="${feature.comment}">${feature.qolname}</span>
            <label class="switch">
                <input id="${feature.qolname}" type="checkbox" ${feature.enabled ? 'checked' : ''}>
                <span class="slider round"></span>
            </label>
        `;
        container.appendChild(toggleDiv);

        // --- NEW CODE: Add the listener ---
        const checkbox = toggleDiv.querySelector('input');
        checkbox.addEventListener('change', async (event) => {
            const isEnabled = event.target.checked;
            await toggleFeature(feature.qolname, isEnabled);
        });
    });
}


// add listeners to color pickers in popup and save changes to storage when changed. These are used by the content script to set the header colors for staging and production environments.
function addColorPickerListeners() {
    const STAGINGcolor = document.getElementById("STAGINGcolor");
    const PRODcolor = document.getElementById("PRODcolor");

    STAGINGcolor.addEventListener("change", (event) => {
        chrome.storage.sync.set({ QoL_EnvironmentColour_Staging: event.target.value });
    });

    PRODcolor.addEventListener("change", (event) => {
        chrome.storage.sync.set({ QoL_EnvironmentColour_Production: event.target.value });
    });
}

// add listener to save checkbox status when changed - NOT USED
function addListeners() {
    // Add all checkbox IDs to this list (enabled + all feature qolnames)
    const checkboxIds = [...qolFeatures.map(ff => ff.qolname)];
    console.table(checkboxIds);

    checkboxIds.forEach(id => {
        const checkbox = document.getElementById(id);
        if (!checkbox) return;

        // 1. Initial Load: Get saved state and set checkbox in popup HTML
        chrome.storage.sync.get(id, (data) => {
            checkbox.checked = !!data[id];

            // ONLY update icon for the primary "enabled" toggle  -featureSet=Set0
            if (id === "enabled") {
                void setBadgeText(data[id]);
            }
        });

        // 2. Auto-Save: Update storage when checkbox changes
        checkbox.addEventListener("change", (event) => {
            if (event.target instanceof HTMLInputElement) {
                const isChecked = event.target.checked;

                // Save value to chrome.storage.sync using dynamic key [id]
                void chrome.storage.sync.set({ [id]: isChecked });

                // ONLY update icon for the primary "enabled" toggle
                if (id === "enabled") {
                    void setBadgeText(isChecked);
                }
            }
        });
    });
}

async function toggleFeature(featureName, forcedValue = null) {
    // 1. Get the current list (default to empty array)
    const result = await chrome.storage.sync.get({ QoL_Features: [] });
    let list = result.QoL_Features;

    // 2. Find the feature index
    const index = list.findIndex(ff => ff.qolname === featureName);

    if (index !== -1) {
        // 3a. Update existing feature
        const newValue = (forcedValue !== null) ? forcedValue : !list[index].enabled;
        list[index].enabled = newValue;
        console.log(`Toggled ${featureName} to: ${newValue}`);
    } else {
        // 3b. Add new feature if it doesn't exist
        const newValue = (forcedValue !== null) ? forcedValue : true;
        list.push({ qolname: featureName, enabled: newValue });
        console.log(`Added new feature ${featureName} as: ${newValue}`);
    }

    // 4. Save the modified array back to sync storage
    await chrome.storage.sync.set({ QoL_Features: list });
}
