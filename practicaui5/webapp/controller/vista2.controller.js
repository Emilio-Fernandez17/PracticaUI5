sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], (Controller, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("seiprueba1.controller.vista2", {

        onInit() {
        },
        cambiarRuta: function (oEvent) {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RoutePracticaUI5");
        },
        login: async function () {
            var nombre = this.getView().byId("inputNombre").getValue();
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
                    nombre: usuario.nombre,
                    permisos: usuario.permisos,
                    esAdmin: usuario.permisos === "admin"
                });
                this.getOwnerComponent().setModel(oModel, "usuario");

                // Navegar a la vista principal
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RoutePracticaUI5");

            } catch (oError) {
                console.error(oError);
                MessageBox.error("Error de conexión con el servidor");
            }
        }
    });
});
