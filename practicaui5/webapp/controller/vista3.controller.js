sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, ResourceModel, MessageToast, MessageBox) => {
    "use strict";
    return Controller.extend("practicaui5.practicaui5.controller.vista3", {

        onInit() {
            this.cargarTabla();
            this._sCurrentLanguage = "es";
        },

        async cargarTabla() {
            try {
                const res = await fetch("https://localhost:7184/apiUsuario/Usuario/TablaPermisos", {
                    method: "POST"
                });

                const data = await res.json();

                const oModel = new sap.ui.model.json.JSONModel(data);
                this.getView().setModel(oModel, "permisosModel");

            } catch (err) {
                MessageBox.error("Error al cargar datos: " + err.message);
            }
        },

        volverAPrincipal: function() {
            const oRouter = this.getOwnerComponent().getRouter();
            if (oRouter) {
                oRouter.navTo("RoutePracticaUI5");
            }
        },

        async GuardarDatos() {
            const oModel = this.getView().getModel("permisosModel");
            const aDatos = oModel.getData();
            sap.ui.core.BusyIndicator.show(0);

            try {
                const res = await fetch("https://localhost:7184/apiUsuario/Usuario/ActualizarTablaPermisos", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(aDatos)
                });

                if (res.ok) {
                    MessageToast.show("Datos actualizados correctamente en SAP");
                } else {
                    throw new Error("Error al guardar en el servidor");
                }

            } catch (err) {
                MessageBox.error("No se pudieron guardar los cambios: " + err.message);
            } finally {
                sap.ui.core.BusyIndicator.hide();
                this.getOwnerComponent().getRouter().navTo("Routevista2");
            }
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