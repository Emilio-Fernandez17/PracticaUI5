/*global QUnit*/

sap.ui.define([
	"practicaui5/practicaui5/controller/PracticaUI5.controller"
], function (Controller) {
	"use strict";

	QUnit.module("PracticaUI5 Controller");

	QUnit.test("I should test the PracticaUI5 controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
