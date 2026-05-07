sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/resource/ResourceModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, ResourceModel, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("practicaui5.practicaui5.controller.vista4", {

        onInit() {
            this._sCurrentLanguage = "es";
            var errores = {
                error: false,
            };

            var oModel = new sap.ui.model.json.JSONModel(errores);
            this.getView().setModel(oModel, "errores");
        },

        async hacerBatch() {
            const empleados = [];
            const errorModelo = this.getView().getModel("errores");

            for (let i = 1; i <= 9; i++) {
                const nombre = this.getView().byId(`in${i}`).getValue();
                const apellido = this.getView().byId(`ia${i}`).getValue();
                const trabajo = this.getView().byId(`it${i}`).getValue();

                if (nombre && apellido) {
                    empleados.push({
                        FirstName: nombre,
                        LastName: apellido,
                        JobTitle: trabajo || ""
                    });
                }
            }

            if (empleados.length === 0) {
                errorModelo.setProperty("/error", true);
                return;
            }

            errorModelo.setProperty("/error", false);

            MessageToast.show(`Enviando ${empleados.length} empleado(s)...`);

            const rollback = "rollback";

            const cuerpo = empleados.map((emp, index) =>
                `--${rollback}
Content-Type: application/http
Content-Transfer-Encoding: binary
Content-ID: ${index + 1}

POST /b1s/v2/EmployeesInfo
Content-Type: application/json

${JSON.stringify(emp)}`
            ).join("\n");

            const textoFinal = `--batch_boundary
Content-Type: multipart/mixed; boundary=${rollback}

${cuerpo}
--${rollback}--
--batch_boundary--`;

            try {
                const res = await fetch("https://localhost:7184/apiUsuario/Usuario/PeticionBatch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(textoFinal)
                });

                if (res.ok) {
                    MessageToast.show(`${empleados.length} empleados añadidos correctamente`);
                    this._limpiarFormularios();
                } else {
                    MessageToast.show("Error al enviar los empleados");
                }
            } catch (error) {
                MessageToast.show("Error de conexión");
                console.error(error);
            }
        },
        _limpiarFormularios() {
            for (let i = 1; i <= 9; i++) {
                this.getView().byId(`in${i}`).setValue("");
                this.getView().byId(`ia${i}`).setValue("");
                this.getView().byId(`it${i}`).setValue("");
            }
        },
        navegarPrincipal() {
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