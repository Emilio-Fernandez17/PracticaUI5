sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Configuration",
    "sap/ui/model/resource/ResourceModel"
], (Controller) => {
    "use strict";

    return Controller.extend("practicaui5.practicaui5.controller.PracticaUI5", {
        onInit() {
            this._sCurrentLanguage = "es";
        },

         onButtonPress: function () {
            // Alternamos entre "es" y "en"

            var sNewLang = this._sCurrentLanguage === "es" ? "en" : "es";

            this._sCurrentLanguage = sNewLang;


            // Creamos un nuevo ResourceModel con el idioma elegido

            var oNewModel = new ResourceModel({

                bundleName: "practicaui5.practicaui5.i18n.i18n",

                supportedLocales: ["", "en", "es"],

                fallbackLocale: "",

                bundleLocale: sNewLang

            });


            // Reemplazamos el modelo i18n en la vista

            this.getView().setModel(oNewModel, "i18n");

        }
    });
});