sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Configuration",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("practicaui5.practicaui5.controller.PracticaUI5", {
        onInit() {
            this._sCurrentLanguage = "es";
            this.datos = {}
 
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

        },
        async cargarDatos() {

            try {

                const loginRespuesta = await fetch('https://localhost:7184/api/values/login');

                if (!loginRespuesta.ok) throw new Error('Error en login');

                const loginDatos = await loginRespuesta.json();

                console.log('loginDatos:', loginDatos);
 
                const peticionGet = await fetch('https://localhost:7184/api/values/Peticion/BusinessPartners');

                if (!peticionGet.ok) throw new Error('Error en la peticion');

                const datosGet = await peticionGet.json();

                this.datos = datosGet

                console.log('datosGet:', this.datos);
 
                const oModel = new JSONModel(this.datos);

                this.getView().setModel(oModel, "modeloSelect");
 
            } catch (error) {

                console.error('Hubo un problema:', error);

            }

        }

 
    });
});