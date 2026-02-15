"use strict";
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// TITLE:    QoL Admin Scripts - global fees and client fee overrides
/// PURPOSE:  Find table and extract data as pipe delimited (copy to clipboard)
/// AUTHOR:   Joshua
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// CHANGES: 
///   Version      Date           Author          Comments            
///   1.0         Feb 2026        Joshua          LS-AS Qol enhancements
///   1.1         Feb 2026        Ian             Updated formatting and added toast notification
///   1.2         Feb 2026        Ian             Function only - see MAIN. Also removed toast notification.
///   
///---------------------------------------------------------------------------------------------------------------------------------------------------///
///   This script is designed to extract fee data from a ratesheet override table in Actionstep, format it as pipe-delimited text, and provide an easy way to copy this data to the clipboard.
///   This is particularly useful for auditing, troubleshooting, or collaborating with team members on fee structures, as it provides a clear and organized way to view and share the relevant data.
///---------------------------------------------------------------------------------------------------------------------------------------------------/// 


function clientfees(currentURL, environment) {
  const table = document.querySelector("table.as-subform");
  if (!table) {
    return false;
  }
  const data = [];
  const rows = table.querySelectorAll("tbody tr.js-subform-row");

  rows.forEach((row) => {
    const rowData = {};
    const rateNameInput = row.querySelector('input[name*="rate_name"]');
    const defaultRateInput = row.querySelector('input[name*="default_rate"]');
    const overrideRateInput = row.querySelector('input[name*="override_rate"]');
    const participantIdInput = row.querySelector(
      'input[name*="participant_id"]',
    );
    const rateIdInput = row.querySelector('input[name*="rate_id"]');

    if (rateNameInput) {
      rowData["Rate Name"] = rateNameInput.value;
      rowData["Default Rate"] = defaultRateInput ? defaultRateInput.value : "";
      rowData["Override Rate"] = overrideRateInput
        ? overrideRateInput.value
        : "";
      rowData["Participant ID"] = participantIdInput
        ? participantIdInput.value
        : "";
      rowData["Rate ID"] = rateIdInput ? rateIdInput.value : "";
      data.push(rowData);
    }
  });

  console.info(`${qolname} - Client Fee Data:`, data);
  console.table(data);

  // construct CSV Content
  const csvFields = [
    "Rate Name",
    "Default Rate",
    "Override Rate",
    "Participant ID",
    "Client Name",
  ];

  const csvContent = [
    csvFields.join("|"),
    ...data.map((row) => {
      const contactHeader = document.querySelector(".contact-header__items h1");
      const customText = contactHeader
        ? contactHeader.textContent.trim()
        : "NO_H1_FOUND";
      const values = csvFields.map((field, index) => {
        if (index === 4) {
          return '"' + customText.replace(/"/g, '""') + '"';
        }
        let value = row[field] || "";
        if (value == null || value == "") value = "<NULL>";
        if (
          value.includes(",") ||
          value.includes('"') ||
          value.includes("\n")
        ) {
          value = '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      });
      const chunks = [];
      for (let i = 0; i < values.length; i += 5) {
        chunks.push(values.slice(i, i + 5).join("|"));
      }
      return chunks.join("\n");
    }),
  ].join("\n");

  //create textbox and insert into DOM
  const textbox = document.createElement("DIV");
  textbox.id = "ratesheet-data";
  textbox.innerHTML = `<div style="border: 1px solid #ccc; padding: 10px; margin-top: 10px;">    <textarea id="ratesheet-textarea" style="width:100%;height:200px;font-family:monospace;">${csvContent}</textarea>  </div>`;

  const targetDiv = document.querySelector(".js-rate-sheet-override-elements");

  if (targetDiv) {
    targetDiv.appendChild(textbox);
  } else {
    const newDiv = document.createElement("div");
    newDiv.className = "js-rate-sheet-override-elements";
    newDiv.style.cssText = "margin:20px 0";
    newDiv.appendChild(textbox);
    stepSelect.parentNode
      ? stepSelect.parentNode.insertBefore(newDiv, stepSelect.nextSibling)
      : document.body.appendChild(newDiv);
  }
  const copyDiv = document.createElement("DIV");
  copyDiv.innerHTML = `<button type="button" onclick="document.getElementById('ratesheet-textarea').select();document.execCommand('copy');this.textContent='Copied';setTimeout(()=>this.textContent='Copy',1500);return false"   style="margin-top:8px;padding:6px 12px;background:#4CAF50;color:white;border:none;border-radius:3px;cursor:pointer">  Copy Rate Sheet Data</button>`;
  const appendCopyTarget = document.querySelector(".as-subheader");
  if (appendCopyTarget) {
    appendCopyTarget.appendChild(copyDiv);
  }
}
