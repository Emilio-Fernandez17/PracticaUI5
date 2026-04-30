

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    const USUARIOS = {
        "manager":   "1234",
        "empleado1": "1234",
        "consulta1": "1234"
    };

    return Controller.extend("practicaui5.practicaui5.controller.vista2", {

        onInit() {},

        cambiarRuta: function () {
            this.getOwnerComponent().getRouter().navTo("RoutePracticaUI5");
        },

        onLogin: async function () {
            const sUsuario  = this.getView().byId("inputUsuario").getValue().trim();
            const sPassword = this.getView().byId("inputPassword").getValue().trim();
            const oTxtError = this.getView().byId("txtError");

            if (!sUsuario || !sPassword) {
                oTxtError.setText("Introduce usuario y contraseña");
                oTxtError.setVisible(true);
                return;
            }

            if (!USUARIOS[sUsuario] || USUARIOS[sUsuario] !== sPassword) {
                oTxtError.setText("Usuario o contraseña incorrectos");
                oTxtError.setVisible(true);
                return;
            }

            try {
                const respuesta = await fetch(`https://localhost:7184/api/values/permisos/${sUsuario}`);

                if (!respuesta.ok) throw new Error("Error en la respuesta");

                const datos = await respuesta.json();

                const oPermisos = {
                    verGrafica:        datos.permisos.includes("verGrafica"),
                    verTablaArticulos: datos.permisos.includes("verTablaArticulos"),
                    verFormulario:     datos.permisos.includes("verFormulario"),
                    verGestionFotos:   datos.permisos.includes("verGestionFotos"),
                    verInterlocutores: datos.permisos.includes("verInterlocutores"),
                    editarArticulos:   datos.permisos.includes("editarArticulos"),
                    borrarArticulos:   datos.permisos.includes("borrarArticulos"),
                    esManager:         datos.rol === "manager",
                    usuario:           sUsuario,
                    rol:               datos.rol
                };

                this.getOwnerComponent().setModel(new JSONModel(oPermisos), "permisos");

                // Reutilizamos cambiarRuta para navegar
                this.cambiarRuta();

            } catch (error) {
                oTxtError.setText("Error al conectar con el servidor: " + error.message);
                oTxtError.setVisible(true);
                console.error(error);
            }
        }
    });
});