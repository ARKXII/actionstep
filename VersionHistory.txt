///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// TITLE:    QoL Admin Scripts
/// PURPOSE:  Help ActionStep Admin users by changing the UI in key areas
/// AUTHOR:   Ian Smith
///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// CHANGES: 
///   Version      Date           Author          Comments            
///   1.0         Jan 2026        Ian             Created prototype - changes UI and dmeonstratc calling simple extenral API
///   1.1         Feb 2026        Ian             Structure and style to make easy to add more UI enhancements
///   1.2         Feb 2026        Ian             Optimised, standardised & consolidated helper functions - prepare to submit for review
///                                               Added verboselogging option 
///   1.3         Feb 2026        Ian             Added user options for environment colors.
///---------------------------------------------------------------------------------------------------------------------------------------------------///

GENERAL & 'To Do' list

  DONE - Standardise logging? - create new function to do all the console logging and config for verboselogging
  DONE - Allow user to change colours for staging vs prod - with color pickert inthe popup (with defaults).
  
  Check the script is right for the page? before running (add to config array in storage).
  
  Capture matter type id, action id, step id etc form urls.... display in popup for easy copy\paste.



///---------------------------------------------------------------------------------------------------------------------------------------------------///
/// TECHNICAL NOTES
///---------------------------------------------------------------------------------------------------------------------------------------------------///
REFERENCES:
Manifest:  https://developer.chrome.com/docs/extensions/reference/manifest


"update_url" - for automated rollout of updates to users?
A string containing the URL of the extension's updates page. Use this key if you're hosting your extension outside the Chrome Web Store.

"file_browser_handlers" - for quick copy\downloads? (Admin)
Provides access to the fileBrowserHandler API, which lets extensions access the ChromeOS file browser.

"chrome_url_overrides" - change default New Tab in Chrome to be Legalstream All Company SharePoint site?
Defines overrides for default Chrome pages. For more information, see Override Chrome pages.


SECURITY:
"content_security_policy"
Defines restrictions on the scripts, styles, and other resources an extension can use. For more information, see Content security policy.

"cross_origin_embedder_policy"
Specifies a value for the Cross-Origin-Embedder-Policy HTTP header, which configures embedding of cross-origin resources in an extension page.

"cross_origin_opener_policy"
Specifies a value for the Cross-Origin-Opener-Policy HTTP header, which lets you ensure that a top-level extension page doesn't share a browsing context group with cross-origin documents.
