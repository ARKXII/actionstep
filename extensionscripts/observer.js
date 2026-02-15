///--------------------------------------------------------------///
/// TITLE:    Rate Sheet page enhancements override
/// PURPOSE:  Reusable function to watch for elements
/// AUTHOR:   Joshua
/// CHANGES: 
///   Version      Date           Author          Comments            
///   1.0         Feb 2026        Joshua          LS-AS Qol enhancements
///   
///   
///--------------------------------------------------------------///
///   
///   
///--------------------------------------------------------------///

function createElementObserver(
  elementId,
  callback,
  alreadyExistsCallback = null,
) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        // Check if the added node itself is the target element
        if (node.id === elementId) {
          console.info(`${elementId} detected!`);
          callback(node);
          return;
        }

        // Check if target element is within the added node
        const element = node.querySelector(`#${elementId}`);
        if (element) {
          console.info(`QoL: ${elementId} found inside added node!`);
          callback(element);
          return;
        }
      }
    }
  });

  // Check if element already exists on page load
  const existingElement = document.getElementById(elementId);
  if (existingElement) {
    console.info(`QoL: ${elementId} already exists on page load`);
    if (alreadyExistsCallback) alreadyExistsCallback(existingElement);
    else callback(existingElement);
  }

  return observer;
}

// Function to handle iframe processing
function processIFrame() {
  // Check for iframes
  const iframe = document.getElementById("mainFrame");
  const iframe2 = document.querySelector("#DrilldownDialog iframe");

  if (iframe) {
    processMainFrame(iframe);
  }

  if (iframe2) {
    processDrilldownIframe(iframe2);
  }
}

// Process mainFrame iframe
function processMainFrame(iframe) {
  console.info("QoL: Found mainFrame iframe, processing...");

  // Function to attempt processing iframe content
  const attemptProcessIframe = () => {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      // Check if we can access the iframe document
      if (!iframeDoc) {
        console.info("QoL: Cannot access iframe document, retrying...");
        setTimeout(attemptProcessIframe, 500);
        return;
      }

      // Look for technical element
      const technicalMessage = iframeDoc.getElementById("technical");

      if (technicalMessage) {
        console.info("QoL: Found technical element in iframe!");
        adjustTextareaHeight(technicalMessage);

        // Also set up observer inside iframe for dynamic changes
        setupIframeObserver(iframeDoc, technicalMessage);

        if (typeof ExtensionUtils !== "undefined") {
          ExtensionUtils.showToast(
            "QoL: Technical Message height adjusted in iframe.",
          );
        }
      } else {
        console.info("QoL: Technical element not found yet in iframe, retrying...");
        // Technical element might not be loaded yet, try again
        setTimeout(attemptProcessIframe, 500);
      }
    } catch (error) {
      console.error("QoL: Error accessing iframe:", error.message);
      // Retry on error
      setTimeout(attemptProcessIframe, 1000);
    }
  };

  if (iframe.contentDocument?.readyState === "complete") {
    attemptProcessIframe();
  } else {
    iframe.addEventListener("load", attemptProcessIframe, { once: true });
  }
}

// Process DrilldownDialog iframe
function processDrilldownIframe(iframe2) {
  console.info("QoL: Found DrilldownDialog iframe, processing...");

  const attemptProcessIframe2 = () => {
    try {
      const iframeDoc =
        iframe2.contentDocument || iframe2.contentWindow.document;

      // Check if we can access the iframe document
      if (!iframeDoc) {
        console.info("QoL: Cannot access iframe2 document, retrying...");
        setTimeout(attemptProcessIframe2, 500);
        return;
      }

      // Look for custom elements
      const customSelect = iframeDoc.getElementById(
        "DataCollectionSingleRowPluginData_MultiSelectContainer",
      );
      const customInput = iframeDoc.getElementById(
        "DataCollectionSingleRowPluginData_Input",
      );

      let foundElements = false;

      if (customSelect) {
        console.info("QoL: Found custom select in iframe!");
        customSelect.style.height = "500px";
        foundElements = true;
      }

      if (customInput) {
        console.info("QoL: Found custom input in iframe!");
        customInput.focus();
        foundElements = true;
      }

      if (foundElements) {
        // Also set up observer inside iframe for dynamic changes
        setupDrilldownIframeObserver(iframeDoc, customSelect, customInput);

        if (typeof ExtensionUtils !== "undefined") {
          ExtensionUtils.showToast(
            "QoL: Custom select and input adjusted in iframe.",
          );
        }
      } else {
        console.info("QoL: Custom elements not found yet in iframe, retrying...");
        setTimeout(attemptProcessIframe2, 500);
      }
    } catch (error) {
      console.error("QoL: Error accessing iframe2:", error.message);
      setTimeout(attemptProcessIframe2, 1000);
    }
  };

  if (iframe2.contentDocument?.readyState === "complete") {
    attemptProcessIframe2();
  } else {
    iframe2.addEventListener("load", attemptProcessIframe2, { once: true });
  }
}

// Function to set up observer inside drilldown iframe
function setupDrilldownIframeObserver(iframeDoc, customSelect, customInput) {
  try {
    const iframeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          // Check for custom select
          const newSelect = iframeDoc.getElementById(
            "DataCollectionSingleRowPluginData_MultiSelectContainer",
          );
          if (newSelect && newSelect !== customSelect) {
            console.info("QoL: New custom select detected in iframe");
            newSelect.style.height = "500px";
          }

          // Check for custom input
          const newInput = iframeDoc.getElementById(
            "DataCollectionSingleRowPluginData_Input",
          );
          if (newInput && newInput !== customInput) {
            console.info("QoL: New custom input detected in iframe");
            newInput.focus();
          }
        }
      }
    });

    iframeObserver.observe(iframeDoc.body, {
      childList: true,
      subtree: true,
    });
  } catch (error) {
    console.error("QoL: Could not set up drilldown iframe observer:", error.message);
  }
}

// Function to adjust textarea height
function adjustTextareaHeight(textarea) {
  const lineCount = textarea.value.split("\n").length;
  const rowHeight = 25; // Reduced from 60 to match typical line height
  const minHeight = 60; // Height for 3 rows (20px per row)
  const maxHeight = 900; // Optional max height

  let calculatedHeight = Math.max(minHeight, lineCount * rowHeight);
  calculatedHeight = Math.min(calculatedHeight, maxHeight);

  textarea.style.height = `${calculatedHeight}px`;
  textarea.style.overflowY = calculatedHeight >= maxHeight ? "auto" : "hidden";

  console.info(
    `QoL: Adjusted technical message height: ${calculatedHeight}px (${lineCount} lines)`,
  );

  // Also update the rows attribute for consistency
  const calculatedRows = Math.max(3, Math.min(lineCount, 20));
  textarea.setAttribute("rows", calculatedRows);
}

// Function to set up observer inside iframe for dynamic content
function setupIframeObserver(iframeDoc, initialTextarea) {
  // Set up input listener for auto-grow
  initialTextarea.addEventListener("input", function () {
    adjustTextareaHeight(this);
  });

  // Also set up a mutation observer inside the iframe in case
  // the textarea is replaced dynamically
  try {
    const iframeObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          const newTechnical = iframeDoc.getElementById("technical");
          if (newTechnical && newTechnical !== initialTextarea) {
            console.info("QoL: New technical element detected in iframe");
            adjustTextareaHeight(newTechnical);
            newTechnical.addEventListener("input", function () {
              adjustTextareaHeight(this);
            });
          }
        }
      }
    });

    iframeObserver.observe(iframeDoc.body, {
      childList: true,
      subtree: true,
    });
  } catch (error) {
    console.error("QoL: Could not set up iframe observer:", error.message);
  }
}

// Function to attempt direct access first (fallback)
function tryDirectAccess() {
  const technicalMessage = document.getElementById("technical");
  if (technicalMessage) {
    console.info("QoL: Found technical element in main document (not in iframe)");
    adjustTextareaHeight(technicalMessage);
    technicalMessage.addEventListener("input", function () {
      adjustTextareaHeight(this);
    });
  }
}

// Main initialization
function initialize() {
  // Main observers setup
  const drilldownObserver = createElementObserver(
    "DrilldownDialog",
    processIFrame,
  );
  const cleanRoomObserver = createElementObserver(
    "cz-clean-room",
    processIFrame,
  );

  // Also try to find technical element directly in case it's not in iframe
  setTimeout(tryDirectAccess, 1000);

  // Start observing
  const observerConfig = { childList: true, subtree: true };
  drilldownObserver.observe(document.body, observerConfig);
  cleanRoomObserver.observe(document.body, observerConfig);

  console.info("QoL: Textarea height adjuster script loaded");
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
