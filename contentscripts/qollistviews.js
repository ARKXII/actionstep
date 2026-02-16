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
    const textbox = document.createElement("div");
    chrome.storage.sync
      .get({
        QoL_EnvironmentColour_Staging: stagingColor,
        QoL_EnvironmentColour_Production: productionColor,
      })
      .then((colors) => {
        stagingColor = colors.QoL_EnvironmentColour_Staging || stagingColor;
        textbox.innerHTML = `<div style="margin:15px 0;padding:5px;"><textarea style="width:100%;height:500px;padding:8px;border:1px solid #ddd;font-family:Arial;font-size:14px" readonly>${content}</textarea><button type="button" onclick="this.previousElementSibling.select();document.execCommand('copy');this.textContent='Copied';setTimeout(()=>this.textContent='Copy',1500);return false" style="margin-top:8px;padding:6px 12px;background:${stagingColor};color:white;border:none;border-radius:3px;cursor:pointer">Copy</button></div>`;
      });

    const targetDiv = document.querySelector(".ActionTypeStepNumber");
    try {
      if (targetDiv) {
        targetDiv.appendChild(textbox);
      } else {
        const newDiv = document.createElement("div");
        newDiv.className = "ActionTypeStepNumber";
        newDiv.style.cssText = "margin:20px 0";
        newDiv.appendChild(textbox);

        if (stepSelect.parentNode) {
          stepSelect.parentNode.insertBefore(newDiv, stepSelect.nextSibling);
        } else {
          return false;
        }
      }

      log("Selected:", texts);
    } catch (error) {
      msg = `error inserting textbox: ${error.message}`;
      log(msg);
    }
  }
  return true;
}
