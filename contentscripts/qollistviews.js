"use strict";
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// TITLE:    QoL Admin Scripts - Listviews
/// PURPOSE:  Improve Actionstep UI while editing listviews
/// AUTHOR:   Joshua
/// CHANGES:
///   Version      Date           Author          Comments
///   1.0         Feb 2026        Joshua          LS-AS Qol enhancements
///   1.1         Feb 2026        Ian             standrardised code & KISS
///   1.2         Feb 2026        Ian             Function only - see MAIN. Also removed toast notifications.
///   1.3         Feb 2026        Josh            Changed deprecated copy command to modern clipboard API. Changed step list text area to dynamic and also added a count of selected steps.
///
///
///--------------------------------------------------------------------------------------------------------------------------------------------------///
///   Opens up the lists of action types and steps and makes them easier to read and copy for reference or sharing.
///   Also adds a copy button to easily copy the selected options to clipboard as a backup or to share with others.
///   This is especially useful for complex listviews with many steps, where the default select boxes can be cumbersome to navigate and reference.
///--------------------------------------------------------------------------------------------------------------------------------------------------///

function qollistviews(currentURL, environment) {
  const actionType = document.getElementById("action_type_id");
  const stepSelect = document.getElementById("action_type_step_number");

  if (!actionType && !stepSelect) {
    return false;
  }

  //search for select elements
  //set select box height
  if (actionType) actionType.style.height = "700px";
  if (stepSelect) {
    stepSelect.style.height = "900px";
    const texts = Array.from(stepSelect.selectedOptions).map((o) => o.text);
    const content = texts.join("\n") || "No selections";

    //inject textbox with content
    chrome.storage.sync
      .get({
        QoL_EnvironmentColour_Staging: stagingColor,
        QoL_EnvironmentColour_Production: productionColor,
      })
      .then((colors) => {
        stagingColor = colors.QoL_EnvironmentColour_Staging || stagingColor;

        const container = document.createElement("DIV");
        container.id = "step-list-container";
        container.innerHTML = `
          <div style="border: 1px solid #ccc; padding: 10px; margin-top: 10px; background: #f9f9f9; border-radius: 4px;">
            <div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <strong style="font-size: 14px;">Selected Steps</strong>
              <div>
                <span style="font-size: 12px; color: #666; margin-right: 8px;">${texts.length} steps selected</span>
                <button id="copy-steps-btn" style="padding: 4px 10px; background: ${stagingColor}; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 13px;">
                  Copy Steps
                </button>
              </div>
            </div>
            <textarea id="steps-textarea" style="width:100%;padding:8px;border:1px solid #ddd;font-family:Arial;font-size:14px" readonly>${content}</textarea>
          </div>
        `;

        const textarea = container.querySelector("#steps-textarea");
        const lineCount = textarea.value.split("\n").length;
        const rowHeight = 25; // Reduced from 60 to match typical line height
        const minHeight = 60; // Height for 3 rows (20px per row)
        const maxHeight = 900; // Optional max height

        let calculatedHeight = Math.max(minHeight, lineCount * rowHeight);
        calculatedHeight = Math.min(calculatedHeight, maxHeight);

        textarea.style.height = `${calculatedHeight}px`;
        textarea.style.overflowY =
          calculatedHeight >= maxHeight ? "auto" : "hidden";

        console.info(
          `QoL: Adjusted steps text area height: ${calculatedHeight}px (${lineCount} lines)`,
        );

        // Also update the rows attribute for consistency
        const calculatedRows = Math.max(3, Math.min(lineCount, 20));
        textarea.setAttribute("rows", calculatedRows);

        // Add event listener for copy button
        setTimeout(() => {
          const copyBtn = document.getElementById("copy-steps-btn");
          const textarea = document.getElementById("steps-textarea");

          if (copyBtn && textarea) {
            copyBtn.addEventListener("click", function () {
              const copyText = textarea.value;
              navigator.clipboard
                .writeText(copyText)
                .then(() => {
                  // Visual feedback
                  const originalText = this.textContent;
                  this.textContent = "Copied!";
                  this.style.background = "#4CAF50";

                  setTimeout(() => {
                    this.textContent = originalText;
                    this.style.background = stagingColor;
                  }, 1500);

                  ExtensionUtils.showToast("Steps copied to clipboard!");
                })
                .catch((err) => {
                  console.error("Failed to copy text: ", err);
                  ExtensionUtils.showToast(
                    "Failed to copy steps to clipboard.",
                  );
                });
            });
          }
        }, 100);

        const targetDiv = document.querySelector(".ActionTypeStepNumber");
        try {
          if (targetDiv) {
            targetDiv.appendChild(container);
          } else {
            const newDiv = document.createElement("div");
            newDiv.className = "ActionTypeStepNumber";
            newDiv.style.cssText = "margin:20px 0";
            newDiv.appendChild(container);

            if (stepSelect.parentNode) {
              stepSelect.parentNode.insertBefore(
                newDiv,
                stepSelect.nextSibling,
              );
            } else {
              return false;
            }
          }

          log("Selected:", texts);
        } catch (error) {
          msg = `error inserting textbox: ${error.message}`;
          log(msg);
        }
      });
  }
  return true;
}
