"use strict";
function extractTreeToJSON(currentURL, environment) {
  ///---------------------------------------------------------------------------------------------------------------------------------------------------///
  /// TITLE:    QoL Admin Scripts - Workflow Extractor
  /// PURPOSE:  Improve Actionstep UI while editing listviews
  /// AUTHOR:   Joshua
  /// CHANGES:
  ///   Version      Date           Author          Comments
  ///   1.0         Feb 2026        Joshua          LS-AS Qol enhancements (workflow extraction)
  ///   1.1         Feb 2026        Joshua          removed stage only flag
  ///
  ///
  ///--------------------------------------------------------------------------------------------------------------------------------------------------///
  ///   Extracts the workflow tree structure from the workflow editor and presents it in a readable JSON format, with an option to copy to clipboard.
  ///--------------------------------------------------------------------------------------------------------------------------------------------------///

  //check current environment
  console.log("qolScript: Current Environment:", environment);

  //console log matter name and id
  const matterName = document.querySelector(
    ".as-breadcrumbs li:last-child b",
  ).textContent;
  const matterId = currentURL.split("=")[1];

  // get the last part of the url after '='
  console.log("qolscript: Matter Id:", matterId); 
  console.log("qolscript: Matter Name:", matterName);

  // Find the tree container
  const treeContainer = document.querySelector(".js-tree-container");
  if (!treeContainer) {
    return false;
  }

  // Recursive function to extract tree data
  function extractNode(liElement) {
    const anchor = liElement.querySelector("a.jstree-anchor");
    const idSpan = anchor ? anchor.querySelector("span[title]") : null;
    const name = idSpan ? idSpan.textContent.trim() : "";
    const nodeId = liElement.id;

    const node = {
      id: nodeId,
      name: name,
      children: [],
    };

    // Find child UL and process its LI children
    const childUl = liElement.querySelector(":scope > ul");
    if (childUl) {
      const childLis = childUl.querySelectorAll(":scope > li");
      childLis.forEach((childLi) => {
        const childNode = extractNode(childLi);
        if (childNode) {
          node.children.push(childNode);
        }
      });
    }

    return node;
  }

  // Start extraction from top-level LIs
  const topLevelUls = treeContainer.querySelectorAll(
    ":scope > ul.jstree-container-ul",
  );
  const treeData = [];

  topLevelUls.forEach((ul) => {
    const topLevelLis = ul.querySelectorAll(":scope > li");
    topLevelLis.forEach((li) => {
      const node = extractNode(li);
      if (node) {
        treeData.push(node);
      }
    });
  });

  // Format JSON with nice indentation
  const jsonOutput = JSON.stringify(treeData, null, 2);

  console.log("qolScript: Tree Data:", treeData);
  console.log("qolScript: JSON Output:", jsonOutput);

  // Create container for the JSON display and copy button
  chrome.storage.sync
    .get({
      QoL_EnvironmentColour_Staging: stagingColor,
      QoL_EnvironmentColour_Production: productionColor,
    })
    .then((colors) => {
      let currentColor;
      if (environment === "PRODUCTION") {
        currentColor =
          colors.QoL_EnvironmentColour_Production || productionColor;
      } else {
        currentColor = colors.QoL_EnvironmentColour_Staging || stagingColor;
      }

      const container = document.createElement("DIV");
      container.id = "tree-json-container";
      container.innerHTML = `
    <div style="border: 1px solid #ccc; padding: 10px; margin-top: 10px; background: #f9f9f9; border-radius: 4px;">
      <div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
        <strong style="font-size: 14px;">Workflow Structure</strong>
        <div>
          <span id="json-format-indicator" style="font-size: 12px; color: #666; margin-right: 8px;">Format: JSON</span>
          <button id="copy-json-btn" style="padding: 4px 10px; background: ${currentColor}; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 13px;">
            Copy JSON
          </button>
        </div>
      </div><textarea id="tree-json-textarea" style="width:100%;height:500px;padding:8px;border:1px solid #ddd;font-family:Arial;font-size:14px" readonly>Matter ID: ${matterId} \nMatter Name: ${matterName}\n\n${jsonOutput}</textarea>
    </div>
  `;

      // Add event listener for copy button
      setTimeout(() => {
        const copyBtn = document.getElementById("copy-json-btn");
        const textarea = document.getElementById("tree-json-textarea");

        if (copyBtn && textarea) {
          copyBtn.addEventListener("click", function () {
            // document.execCommand("copy"); ---Deprecated copy command
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
                  this.style.background = currentColor;
                }, 1500);

                ExtensionUtils.showToast("JSON copied to clipboard!");
              })
              .catch((err) => {
                console.error("Failed to copy text: ", err);
                ExtensionUtils.showToast("Failed to copy JSON to clipboard.");
              });
          });
        }
      }, 100);

      // Find a good place to insert the container
      const insertTarget =
        document.querySelector(".as-subheader") ||
        document.querySelector(".js-tree-container") ||
        document.querySelector(".jstree");

      if (insertTarget) {
        // Check if we already added the container
        const existingContainer = document.getElementById(
          "tree-json-container",
        );
        if (existingContainer) {
          existingContainer.replaceWith(container);
        } else {
          insertTarget.parentNode.insertBefore(
            container,
            insertTarget.nextSibling,
          );
        }
      } else {
        document.body.appendChild(container);
      }

      // Offer CSV format if needed
      const csvOption = document.createElement("DIV");
      csvOption.style.marginTop = "5px";
      csvOption.innerHTML = `
    <div style="display: flex; gap: 8px; align-items: center;">
      <span id="csv-span" style="font-size: 12px; color: #666;">Need CSV instead?</span>
      <button id="show-tree-csv" style="padding: 2px 8px; background: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; cursor: pointer; font-size: 12px;">
        Show CSV Version
      </button>
    </div>
  `;

      container.querySelector("div > div:first-child").appendChild(csvOption);

      // Add CSV toggle functionality
      setTimeout(() => {
        const csvBtn = document.getElementById("show-tree-csv");
        const csvSpan = document.getElementById("csv-span");
        const indicator = document.getElementById("json-format-indicator");
        let showingJSON = true;

        if (csvBtn) {
          csvBtn.addEventListener("click", function () {
            const textarea = document.getElementById("tree-json-textarea");
            if (showingJSON) {
              // Generate CSV format (flat structure)
              const flatNodes = [];

              function flattenNode(node, parentPath = []) {
                const currentPath = [...parentPath, node.name];
                flatNodes.push({
                  id: node.id,
                  name: node.name,
                  level: currentPath.length,
                  path: currentPath.join(" > "),
                });

                node.children.forEach((child) =>
                  flattenNode(child, currentPath),
                );
              }

              treeData.forEach((root) => flattenNode(root));

              // Create CSV
              const csvFields = ["id", "name", "level", "path"];
              const csvContent = [
                csvFields.join("|"),
                ...flatNodes.map((node) =>
                  csvFields
                    .map((field) => {
                      let value = node[field] || "";
                      if (field === "path") {
                        value = '"' + value.replace(/"/g, '""') + '"';
                      }
                      return value;
                    })
                    .join("|"),
                ),
              ].join("\n");

              textarea.value = `Matter ID: ${matterId}\nMatter Name: ${matterName}\n\n${csvContent}`;
              document.getElementById("copy-json-btn").innerHTML = "Copy CSV";
              indicator.textContent = "Format: CSV";
              this.textContent = "Show JSON Version";
              csvSpan.innerHTML = "Need JSON instead?";
              showingJSON = false;
            } else {
              textarea.value = `Matter ID: ${matterId}\nMatter Name: ${matterName}\n\n${jsonOutput}`;
              document.getElementById("copy-json-btn").innerHTML = "Copy JSON";
              indicator.textContent = "Format: JSON";
              this.textContent = "Show CSV Version";
              csvSpan.innerHTML = "Need CSV instead?";
              showingJSON = true;
            }
          });
        }
      }, 150);
    });
  return treeData;
}
