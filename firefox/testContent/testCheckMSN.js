/* * ***** BEGIN LICENSE BLOCK *****
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
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is Henrik Skupin
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Henrik Skupin <hskupin@gmail.com>
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

// Include necessary modules
var RELATIVE_ROOT = '../../shared-modules';
var MODULE_REQUIRES = ['UtilsAPI'];

// Global timeout value
const gTimeout = 10000;

var setupModule = function(module) {
  module.controller = mozmill.getBrowserController();
}

/**
 *  Testcase ID #5916 - Top Site - MSN.com
 */
var testCheckMSNCom = function () {
  let aURL = "http://www.msn.com";

  controller.open(aURL);
  controller.waitForPageLoad(controller.tabs.activeTab, gTimeout);

  // Check sign-in link
  let signIn = new elementslib.ID(controller.tabs.activeTab, "ppsgin");
  UtilsAPI.delayedAssertNode(controller, signIn, gTimeout);

  // check sign-up link for hotmail
  let signUp = new elementslib.XPath(controller.tabs.activeTab, "/html/body/div[@id='wrapper']/div[@id='page']/div[@id='content']/div[@id='arear']/div[@id='wlive']/div[@id='hmm']/div[1]/div/p[1]/span[3]/a/b");
  UtilsAPI.delayedAssertNode(controller, signUp, gTimeout);

  // Check images and link texts for Hotmail, Messenger, My MSN, and MSN Directory links
  for (let i = 1; i <= 4; i++) {
    let img = new elementslib.XPath(controller.tabs.activeTab, "/html/body/div[@id='wrapper']/div[@id='page']/div[@id='nav']/div/div/div[1]/ul/li[" + i + "]/a/img[1]");
    let link = new elementslib.XPath(controller.tabs.activeTab, "/html/body/div[@id='wrapper']/div[@id='page']/div[@id='nav']/div/div/div[1]/ul/li[" + i + "]/a");

    // Image has to be loaded first
    controller.waitForEval("subject.complete === true", gTimeout, 100, img.getNode());
    controller.assertImageLoaded(img);

    UtilsAPI.delayedAssertNode(controller, link, gTimeout);
  }

  // Check top search field
  let f1 = new elementslib.ID(controller.tabs.activeTab, "f1");
  let f1Submit = new elementslib.XPath(controller.tabs.activeTab, "/html/body/div[@id='wrapper']/div[@id='head']/div[@id='header']/div[@id='livesearch']/div[@id='srchfrmheader']/div[2]/form[@id='srchfrm']/div[1]/input[4]");
  UtilsAPI.checkSearchField(controller, f1, "MSN", f1Submit);
}