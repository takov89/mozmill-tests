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
 *   Aakash Desai <adesai@mozilla.com>
 *   Henrik Skupin <hskupin@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Vertributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Initial Developer of the Original Code is Mozihers to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * Testcase ID #9370 - Test the safebrowsing drop-down bar
 */

// Include necessary modules
var RELATIVE_ROOT = '../../shared-modules';
var MODULE_REQUIRES = ['UtilsAPI'];

const gDelay = 0;
const gTimeout = 5000;

var setupModule = function(module) {
  controller = mozmill.getBrowserController();

  UtilsAPI.closeAllTabs(controller);
}

var testNotificationBar = function() {
  var badSites = ['http://www.mozilla.com/firefox/its-a-trap.html',
                  'http://www.mozilla.com/firefox/its-an-attack.html'];

  for (var i = 0; i < badSites.length; i++ ) {
    // Go to one of mozilla's phishing protection test pages
    controller.open(badSites[i]);
    controller.waitForPageLoad(1000);

    // Wait for the ignoreWarning button to be loaded onto the page and then click on the button
    checkIgnoreWarningButton(badSites[i]);
    checkNoPhishingButton(badSites[i]);

    // Go back to the notification bar
    controller.goBack();
    controller.waitForPageLoad(1000);
    checkIgnoreWarningButton(badSites[i]);

    // Test the get me out of here button
    checkGetMeOutOfHereButton();

    // Go back to the notification bar
    controller.goBack();
    controller.waitForPageLoad(1000);
    checkIgnoreWarningButton(badSites[i]);

    // Test the x button on the drop down bar
    checkXButton();
  }
}

/**
 * Check the ignoreWarningButton goes to proper page associated to the url provided
 *
 * @param badUrl {string} URL of testing page
 */
var checkIgnoreWarningButton = function(badUrl) {
  // Verify the element is loaded onto the page and go to the phishing site
  var ignoreWarningButton = new elementslib.ID(controller.tabs.activeTab, "ignoreWarningButton");
  controller.waitThenClick(ignoreWarningButton, gTimeout);
  controller.waitForPageLoad();

  // Verify the warning button is not visible and the location bar displays the correct url
  var locationBar = new elementslib.ID(controller.window.document, "urlbar");

  controller.assertValue(locationBar, badUrl);
  controller.assertNodeNotExist(ignoreWarningButton);
  controller.assertNode(new elementslib.ID(controller.tabs.activeTab, "main-feature"));
}

/**
 * Check the not a forgery or attack button in the notification bar
 *
 * @param badUrl {string} URL of testing page
 */
var checkNoPhishingButton = function(badUrl) {
  if (badUrl == 'http://www.mozilla.com/firefox/its-a-trap.html' ) {
    // Click on the web forgery report button
    var label = UtilsAPI.getProperty("chrome://browser/locale/browser.properties", "safebrowsing.notAForgeryButton.label");
    var notWebForgeryButton = UtilsAPI.createNotificationBarElement(controller, '/{"value":"blocked-badware-page"}/{"label":"' + label + '"}');
    controller.waitThenClick(notWebForgeryButton, gTimeout);
    controller.waitForPageLoad(controller.tabs.getTab(1));

    // Verify the not-a-web-forgery report page is loaded
    var urlField = new elementslib.ID(controller.tabs.activeTab, "url");
    controller.waitForElement(urlField, gTimeout);
    controller.assertValue(urlField, 'http://www.mozilla.com/firefox/its-a-trap.html');

  } else if (badUrl == 'http://www.mozilla.com/firefox/its-an-attack.html' ) {
    // Click on the attack site report button
    var label = UtilsAPI.getProperty("chrome://browser/locale/browser.properties", "safebrowsing.notAnAttackButton.label");
    var notAttackSiteButton = UtilsAPI.createNotificationBarElement(controller, '/{"value":"blocked-badware-page"}/{"label":"' + label + '"}');

    controller.waitThenClick(notAttackSiteButton, gTimeout);
    controller.waitForPageLoad(controller.tabs.getTab(1));

    // Verify the not-an-attack-site report page is loaded
    var locationBar = new elementslib.ID(controller.window.document, "urlbar");
    if (locationBar.getNode().value.indexOf("http://www.stopbadware.org/") == -1)
      throw "Expected that www.stopbadware.org has been loaded but got " + locationBar.getNode().value;
  }

  UtilsAPI.closeAllTabs(controller);
}

/**
 * Check the "Get me out of here" button in the notification bar
 */
var checkGetMeOutOfHereButton = function() {
  // Click on the get me out of here button
  var label = UtilsAPI.getProperty("chrome://browser/locale/browser.properties", "safebrowsing.getMeOutOfHereButton.label");
  var getMeOutForgeryOfHereButton = UtilsAPI.createNotificationBarElement(controller, '/{"value":"blocked-badware-page"}/{"label":"' + label + '"}');
  controller.waitThenClick(getMeOutForgeryOfHereButton, gTimeout);

  // Verify that the default home page is displayed in the location bar
  controller.waitForPageLoad();

  // Safe URL of current web page
  var locationBar = new elementslib.ID(controller.window.document, "urlbar");
  var pageURL = locationBar.getNode().value;

  // Open the default home page
  var defaultHomePage = UtilsAPI.getProperty("resource:/browserconfig.properties", "browser.startup.homepage");
  controller.open(defaultHomePage);
  controller.waitForPageLoad();

  controller.assertValue(locationBar, pageURL);
}

/**
 * Check the X button in the notification bar
 */
var checkXButton = function() {
  // Click on the x button and verify the notification bar dissapears
  var xButton = UtilsAPI.createNotificationBarElement(controller, '/{"value":"blocked-badware-page"}/anon({"type":"critical"})/{"class":"messageCloseButton tabbable"}');
  controller.waitThenClick(xButton, gTimeout);
  controller.sleep(1000);
  controller.assertNodeNotExist(xButton);
}