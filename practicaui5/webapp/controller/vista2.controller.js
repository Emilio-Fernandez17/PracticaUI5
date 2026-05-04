sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, ResourceModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("practicaui5.practicaui5.controller.vista2", {

        onInit() {
            this._sCurrentLanguage = "es";
        },

        cambiarRuta: function () {
            this.getOwnerComponent().getRouter().navTo("RoutePracticaUI5");
        },

        login: async function () {
            var nombre   = this.getView().byId("inputNombre").getValue();
            var password = this.getView().byId("inputPassword").getValue();

            if (!nombre || !password) {
                MessageToast.show("Introduce usuario y contraseña");
                return;
            }

            try {
                const respuesta = await fetch(`https://localhost:7184/apiUsuario/Usuario/login/${nombre}/${password}`);

                if (!respuesta.ok) {
                    MessageBox.error("Usuario o contraseña incorrectos");
                    return;
                }

                const usuario = await respuesta.json();

                var oModel = new sap.ui.model.json.JSONModel({
                    nombre:   usuario.nombre,
                    permisos: usuario.permisos,
                    esAdmin:  usuario.permisos === "admin"
                });
                this.getOwnerComponent().setModel(oModel, "usuario");

                this.cambiarRuta();

            } catch (oError) {
                console.error(oError);
                MessageBox.error("Error de conexión con el servidor");
            }
        },

        onButtonPress: function () {
            var sNewLang = this._sCurrentLanguage === "es" ? "en" : "es";
            this._sCurrentLanguage = sNewLang;

            var oNewModel = new ResourceModel({
                bundleName:       "practicaui5.practicaui5.i18n.i18n",
                supportedLocales: ["", "en", "es"],
                fallbackLocale:   "",
                bundleLocale:     sNewLang
            });

            
            this.getView().setModel(oNewModel, "i18n");

            
            this.getOwnerComponent().setModel(oNewModel, "i18n");
        }
    });
});