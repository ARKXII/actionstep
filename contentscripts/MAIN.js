"use strict";
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// TITLE:    QoL Admin MAIN - MAINLINE PROGRAM
/// PURPOSE:  runs on each page load, checks if extension and feature is enabled, then runs the relevant code for each feature.
/// AUTHOR:   Ian
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// CHANGES: 
///   Version      Date           Author            Comments            
///   1.0         Feb 2026        Ian               Created
///   1.1         Feb 2026        Ian               Updated formatting and style. Added Added environment and currentURL for all features for future use.
///   1.2         Feb 2026        Ian               Read stored config values into an array (so only need to get them once per cycle). 
///   
///---------------------------------------------------------------------------------------------------------------------------------------------------///

// Config values already exist in the sync storage already and are updated by background.js 
// we just need to read them here and use them to determine which features to run.

// load features into an array from storage - this to check which features are enabled and run the relevant code for each feature. 
chrome.storage.sync.get({ QoL_Features: [] }, function (result) {
    const features = result.QoL_Features;

    // isExtensionEnabled - no need to check the others if the extension itself is not enabled.
    const Extension = isFeatureEnabledSync(features, 'EXTENSIONENABLED');
    verboselogging = isFeatureEnabledSync(features, 'verboselogging');

    if (!Extension) { 
        log(`QoL Admin MAIN - Extension is disabled - no scripts will run`);
    }
    else {
        // Check each feature and run if enabled
        log(`QoL MAIN - Extension is enabled - running active features`);
     //   log(`QoL MAIN - Environment detected: ${environment}`);  // We can add better filtering back in the manifest later -


        for (const feature of featuresToCheck) {
            const isEnabled = isFeatureEnabledSync(features, feature);

            if (isEnabled) {
                log(`QoL MAIN - Feature ${feature} is enabled - running feature code`);

                // Run the feature-specific code here
                if (feature === "QoL_EnvironmentColour") {

                    result = environmentHeaderColor(currentURL, environment);
                    if (result) {
                        log(result);
                    }
                }

                if (feature === "QoL_GetJoke") {
                    result = getJoke(currentURL, environment);
                    if (result) {
                        msg = `${feature} - External API called successfully - check console for output`;
                        log(msg);
                    }
                    else {
                        msg = `${qolname} - External API failed - check console for reasons`;
                        log(msg);
                    }
                }

                if (feature === "QoL_ClientFees") {
                    result = clientfees(currentURL, environment);
                    if (result) {
                        log(`${feature} - completed successfully.`);
                    }
                }

                if (feature === "QoL_Listviews") {
                    result = qollistviews(currentURL, environment);
                    if (result) {
                        log(`${feature} - completed successfully.`);
                        ExtensionUtils.showToast(`${feature} - completed successfully.`);
                    }

                }
                if (feature === "QoL_WorkflowExtract") {
                    result = extractTreeToJSON(currentURL, environment);
                    if (result) {
                        log(`${feature} - completed successfully.`);
                        ExtensionUtils.showToast(`${feature} - completed successfully.`);
                    }
                }
            }
        }
    }
    // end of mainline code.
});

