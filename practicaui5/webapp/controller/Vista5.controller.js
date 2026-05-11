sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel"
], (Controller, ResourceModel, MessageToast, MessageBox, JSONModel) => {
    "use strict";

    return Controller.extend("practicaui5.practicaui5.controller.vista5", {

        onInit() {
            this._sCurrentLanguage = "es";
            this.cargarPedidos();

        },
        formatearFecha: function (sValue) {
            if (!sValue || sValue.length !== 8) {
                return sValue;
            }
            var year = sValue.substring(0, 4);
            var month = sValue.substring(4, 6);
            var day = sValue.substring(6, 8);

            return day + "/" + month + "/" + year;
        },
        volverAPrincipal: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            if (oRouter) {
                oRouter.navTo("RoutePracticaUI5");
            }
        },
        cargarPedidos: async function () {
            sap.ui.core.BusyIndicator.show(0);
            try {
                const peticionPedidos = await fetch('https://localhost:7184/apiUsuario/Usuario/pedidos');
                if (!peticionPedidos.ok) throw new Error('Error en la peticion de Pedidos');

                const datosPedidos = await peticionPedidos.json();
                console.log('Pedidos Cerrados:', datosPedidos);

                const oModel = new JSONModel(datosPedidos);
                this.getView().setModel(oModel, "pedidos");

            } catch (error) {
                console.error('Error al cargar pedidos:', error);
            }
            finally {
                sap.ui.core.BusyIndicator.hide();
            }
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