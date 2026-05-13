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
            sap.ui.core.BusyIndicator.show(0);
            try {
                const res = await fetch("https://localhost:7184/apiUsuario/Usuario/TablaPermisos", {
                    method: "POST"
                });

                console.log("Response status:", res.status);

                const data = await res.json();
                console.log("Respuesta COMPLETA del backend:", JSON.stringify(data, null, 2));
                console.log("Tipo de data:", typeof data);
                console.log("¿Es array?", Array.isArray(data));

                let datosArray = [];
                if (Array.isArray(data)) {
                    datosArray = data;
                } else if (data && data.value && Array.isArray(data.value)) {
                    datosArray = data.value;
                    console.log("Caso 2: data.value es array, longitud:", datosArray.length);
                } else if (data && typeof data === 'object') {
                    console.log("Caso 3: data es objeto, propiedades:", Object.keys(data));
                    datosArray = [data];
                }

                console.log("datosArray final:", datosArray);
                console.log("Longitud final:", datosArray.length);

                if (datosArray.length === 0) {
                    MessageBox.warning("No se encontraron datos de permisos");
                }

                const oModel = new sap.ui.model.json.JSONModel(datosArray);
                this.getView().setModel(oModel, "permisosModel");

                console.log("Modelo creado, datos en modelo:", oModel.getData());

            } catch (err) {
                console.error("Error detallado:", err);
                MessageBox.error("Error al cargar datos: " + err.message);
            } finally {
                sap.ui.core.BusyIndicator.hide();
            }
        },

        async GuardarDatos() {
            const oModel = this.getView().getModel("permisosModel");
            const aDatos = oModel.getData();

            if (!aDatos || aDatos.length === 0) {
                MessageBox.warning("No hay datos para guardar");
                return;
            }

            const aDatosTransformados = aDatos.map(item => ({
                Code: item.code,
                Name: item.name,
                U_User: item.u_User,
                U_Permisos: item.u_Permisos 
            }));

            sap.ui.core.BusyIndicator.show(0);
            try {
                const res = await fetch("https://localhost:7184/apiUsuario/Usuario/ActualizarTablaPermisos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(aDatosTransformados)
                });

                if (res.ok) {
                    MessageToast.show("Datos actualizados correctamente");
                    this.cargarTabla();
                } else {
                    const error = await res.text();
                    throw new Error(error);
                }
            } catch (err) {
                MessageBox.error("No se pudieron guardar los cambios: " + err.message);
            } finally {
                sap.ui.core.BusyIndicator.hide();
            }
        },

        volverAPrincipal: function () {
            const oRouter = this.getOwnerComponent().getRouter();
            if (oRouter) {
                oRouter.navTo("RoutePracticaUI5");
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