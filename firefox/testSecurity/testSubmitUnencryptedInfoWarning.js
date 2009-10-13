/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is MozMill Test code.
 *
 * The Initial Developer of the Original Code is Mozilla Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Anthony Hughes <ahughes@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * **** END LICENSE BLOCK ***** */

/**
 * Litmus test #9295: Submit unencrypted info warning
 */

var RELATIVE_ROOT = '../../shared-modules';
var MODULE_REQUIRES = ['ModalDialogAPI', 'PrefsAPI', 'UtilsAPI'];

const gDelay = 0;
const gTimeout = 5000;

// Used to indicate the modal warning dialog has been shown
var modalWarningShown = false;

var setupModule = function(module)
{
  controller = mozmill.getBrowserController();
}

var teardownModule = function(module)
{
  // Reset the warning prefs
  var prefs = new Array("security.warn_entering_secure",
                        "security.warn_entering_weak",
                        "security.warn_leaving_secure",
                        "security.warn_submit_insecure",
                        "security.warn_viewing_mixed");
  for each (p in prefs) {
    try {
      PrefsAPI.preferences.branch.clearUserPref(p);
    } catch(e) {}
  }
}

/**
 * Test warning about submitting unencrypted information
 */
var testSubmitUnencryptedInfoWarning = function()
{
  // Close the page because the warnings don't appear if you are on the page
  // where the warning was triggered
  UtilsAPI.closeAllTabs(controller);

  // Make sure the prefs are set
  PrefsAPI.preferencesDialog.open(prefDialogCallback);

  // Create a listener for the warning dialog
  var md = new ModalDialogAPI.modalDialog(handleSecurityWarningDialog);
  md.start();

  // Load an unencrypted page
  controller.open("http://www.verisign.com");
  controller.waitForPageLoad();

  // Get the web page's search box
  var searchbox = new elementslib.ID(controller.tabs.activeTab, "searchtext");
  controller.waitForElement(searchbox, gTimeout);

  // Use the web page search box to submit information
  controller.type(searchbox, "mozilla");

  // Click the search button
  var searchButton = new elementslib.ID(controller.tabs.activeTab, "searchbutton");
  controller.waitThenClick(searchButton, gTimeout);

  // Prevent the test from ending before the warning can appear
  controller.waitForPageLoad();

  // Wait for the search button on the bottom of the results page to load
  // This will be our indicator of "results"
  var searchButton3 = new elementslib.ID(controller.tabs.activeTab, "searchbutton3");
  controller.waitForElement(searchButton3, gTimeout);

  // Test if the modal dialog has been shown
  controller.assertJS(modalWarningShown == true);
}

/**
 * Call-back handler for preferences dialog
 *
 * @param {MozmMillController} controller
 *        MozMillController of the window to operate on
 */
var prefDialogCallback = function(controller)
{
  // Get the Security Pane
  PrefsAPI.preferencesDialog.setPane(controller, "paneSecurity");

  // Click the Warning Messages Settings button
  var warningSettingsButton = new elementslib.ID(controller.window.document,
                                                 "warningSettings");
  controller.waitForElement(warningSettingsButton, gTimeout);

  // Create a listener for the Warning Messages Settings dialog
  var md = new ModalDialogAPI.modalDialog(handleSecurityWarningSettingsDialog);
  md.start(500);

  // Click the Warning Messages Settings button
  controller.click(warningSettingsButton);

  // Close the preferences dialog
  PrefsAPI.preferencesDialog.close(controller, true);
}

/**
 * Helper function to handle interaction with the
 * Security Warning Settings modal dialog
 *
 * @param {MozMillController} controller
 *        MozMillController of the window to operate on
 */
var handleSecurityWarningSettingsDialog = function(controller)
{
  // All the prefs in the dialog
  var prefs = new Array("warn_entering_secure",
                        "warn_entering_weak",
                        "warn_leaving_secure",
                        "warn_submit_insecure",
                        "warn_viewing_mixed");

  // Make sure the "encrypted page" pref is checked
  for each (p in prefs) {
    var element = new elementslib.ID(controller.window.document, p);
    controller.waitForElement(element, gTimeout);

    // Check the "submit unencrypted info" pref if it isn't already
    if (p == "warn_submit_insecure") {
      if (!element.getNode().checked) {
        controller.click(element);
      }
    // Uncheck all other prefs
    } else {
      if (element.getNode().checked) {
        controller.click(element);
      }
    }
  }

  // Click OK on the Security window
  var okButton = new elementslib.Lookup(controller.window.document,
                                        '/id("SecurityWarnings")' +
                                        '/anon({"anonid":"dlg-buttons"})' +
                                        '/{"dlgtype":"accept"}');
  controller.click(okButton);
}

/**
 * Helper function to handle interaction with the Security Warning modal dialog
 *
 * @param {MozMillController} controller
 *        MozMillController of the window to operate on
 */
var handleSecurityWarningDialog = function(controller)
{
  modalWarningShown = true;

  // Get the message text
  var message = UtilsAPI.getProperty("chrome://pipnss/locale/security.properties",
                                     "PostToInsecureFromInsecureMessage");

  // Wait for the content to load
  var infoBody = new elementslib.ID(controller.window.document, "info.body");
  controller.waitForElement(infoBody, gTimeout);

  // The message string contains "##" instead of \n for newlines.
  // There are two instances in the string. Replace them both.
  message = message.replace(/##/g, "\n\n");

  // Verify the message text
  controller.assertProperty(infoBody, "textContent", message);

  // Verify the "Alert me whenever" checkbox is checked by default
  var checkbox = new elementslib.ID(controller.window.document, "checkbox");
  controller.assertChecked(checkbox);

  // Click the OK button
  var okButton = new elementslib.Lookup(controller.window.document,
                                        '/id("commonDialog")' +
                                        '/anon({"anonid":"buttons"})' +
                                        '/{"dlgtype":"accept"}');
  controller.click(okButton);
}