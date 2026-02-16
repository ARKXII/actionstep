# Extension Features

1. Actionstep UI fixes in editing custom list views
2. Header Color for stage and prod environment
3. CSV extraction for global and client fee overrides
4. JSON/CSV extraction for matter workflow

# How to Install

1. Make sure that your chromium browser is in Developer Mode
2. Download the latest release
3. Extract the downloaded .zip file
4. Click 'Load unpacked' in your browser
5. Navigate to the extracted folder
6. Click open folder

### DONE! 

# GENERAL & 'To Do' list

- Check the script is right for the page? before running (add to config array in storage).
- Capture matter type id, action id, step id etc form urls.... display in popup for easy copy\paste.
- ~~DONE - Standardise logging? - create new function to do all the console logging and config for verboselogging~~
- ~~DONE - Allow user to change colours for staging vs prod - with color pickert in the popup (with defaults).~~

*"update_url"* - for automated rollout of updates to users?<br>
	A string containing the URL of the extension's updates page. Use this key if you're hosting your extension outside the Chrome Web Store.

*"file_browser_handlers"* - for quick copy\downloads? (Admin)<br>
	Provides access to the fileBrowserHandler API, which lets extensions access the ChromeOS file browser.

*"chrome_url_overrides"* - change default New Tab in Chrome to be Legalstream All Company SharePoint site?<br>
	Defines overrides for default Chrome pages. For more information, see Override Chrome pages.

# SECURITY:

*"content_security_policy"*<br>
- Defines restrictions on the scripts, styles, and other resources an extension can use. For more information, see Content security policy.

*"cross_origin_embedder_policy"*<br>
- Specifies a value for the Cross-Origin-Embedder-Policy HTTP header, which configures embedding of cross-origin resources in an extension page.

*"cross_origin_opener_policy"*<br>
- Specifies a value for the Cross-Origin-Opener-Policy HTTP header, which lets you ensure that a top-level extension page doesn't share a browsing context group with cross-origin documents.
