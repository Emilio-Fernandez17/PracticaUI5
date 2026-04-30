sap.ui.define([
    "sap/ui/core/mvc/Controller",
], (Controller) => {
    "use strict";

    return Controller.extend("seiprueba1.controller.vista2", {

        onInit() {
        },
        cambiarRuta: function (oEvent) {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RoutePracticaUI5");
        },
    });
});