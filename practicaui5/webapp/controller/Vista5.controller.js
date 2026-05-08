sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, ResourceModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("practicaui5.practicaui5.controller.vista5", {

        onInit() {
            this._sCurrentLanguage = "es";
            this.crearSqlQuery()
        },
        crearSqlQuery:async function(){

        },

        cambiarRuta: function () {
            this.getOwnerComponent().getRouter().navTo("RoutePracticaUI5");
        },
        onButtonPress: function () {
            var sNewLang = this._sCurrentLanguage === "es" ? "en" : "es";
            this._sCurrentLanguage = sNewLang;

            var oNewModel = new ResourceModel({
                bundleName: "practicaui5.practicaui5.i18n.i18n",
                supportedLocales: ["", "en", "es"],
                fallbackLocale: "",
                bundleLocale: sNewLang
            });


            this.getView().setModel(oNewModel, "i18n");


            this.getOwnerComponent().setModel(oNewModel, "i18n");
        }
    });
});