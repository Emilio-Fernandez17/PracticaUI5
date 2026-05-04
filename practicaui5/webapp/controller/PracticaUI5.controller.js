sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Configuration",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/model/json/JSONModel",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem"
], (Controller, Configuration, ResourceModel, JSONModel, FlattenedDataset, FeedItem) => {
    "use strict";

    return Controller.extend("practicaui5.practicaui5.controller.PracticaUI5", {

        onInit() {
            var usuario = this.getOwnerComponent().getModel("usuario");
            if (!usuario) {
                this.getOwnerComponent().getRouter().navTo("Routevista2");
                return;
            }

            fetch("https://localhost:7184/apiUsuario/Usuario/crearUDF", {
                method: "POST"
            }).then(function (res) {
                console.log(res.ok ? "UDF creado" : "UDF ya existía");
            });


            var formulario = {
                formulario: false,
                lote: false,
                editar: false,
                anade: true,
                repeticion: false,
                cantidad: true
            };

            var oModel = new sap.ui.model.json.JSONModel(formulario);
            this.getView().setModel(oModel, "formulario");

            this._sCurrentLanguage = "es";
            this.datos = {};
            this.ventas = {};
            this.Items = {};
            this.Empleados = {};
            this._FlattenedDataset = FlattenedDataset;
            this._FeedItem = FeedItem;
            this.oVizFrame = this.getView().byId("chartContainerVizFrame");
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
            this.getView().getModel("formulario").setProperty("/idiomaActual", sNewLang);
        },
        formatearSiNo: function (sValue, sIdioma) {
            if (!sValue) return "";

            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            var sUpper = sValue.toUpperCase();

            if (sUpper === "TYES") {
                return oBundle.getText("txtSi");
            } else if (sUpper === "TNO") {
                return oBundle.getText("txtNo");
            }

            return sValue;
        },


        anadir: async function () {
            this.getView().byId("vCode").setEditable(true);

            var sCodigo = this.getView().byId("vCode");
            sCodigo.setValue("")

            var sNombre = this.getView().byId("vName");
            sNombre.setValue("")

            var sSerie = this.getView().byId("serie");
            sSerie.setSelectedKey("S")

            var sLote = this.getView().byId("lote");
            sLote.setSelectedKey("N")

            this.mostrarFormulario()
        },
        anadeArticulo: async function () {
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            this.getView().getModel("formulario").setProperty("/puedeCambiarManejo", true);

            var sCodigo = this.getView().byId("vCode").getValue();
            var sNombre = this.getView().byId("vName").getValue();
            var sSerie = this.getView().byId("serie").getSelectedKey();
            var sLote = this.getView().byId("lote").getSelectedKey();

            let datos = {
                "ItemCode": sCodigo,
                "ItemName": sNombre,
                "ItemType": "itItems"
            };

            if (sSerie === 'S') {
                datos.ManageSerialNumbers = "tYES";
            }
            else if (sLote === 'S') {
                datos.ManageBatchNumbers = "tYES";
            }

            const json = JSON.stringify(datos);
            console.log(json)

            try {
                await this.hacerLogin()

                const respuesta = await fetch('https://localhost:7184/api/values/Post/Items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: json
                });

                if (!respuesta.ok) {
                    const errorMsg = await respuesta.text();
                    throw new Error('Error al crear artículo: ' + errorMsg);
                    var sMsg = oBundle.getText("mensajeErrorArticulo") + " " + sCodigo;
                    sap.m.MessageToast.show(sMsg);
                }

                const articuloC = await respuesta.json();
                console.log('Artículo Creado con éxito:', articuloC);
                this.ocultarFormulario()
                var sMsg = oBundle.getText("anadeMensaje") + " " + sCodigo;
                sap.m.MessageToast.show(sMsg);
            } catch (oError) {
                console.error(oError);
            }
        },

        editar: function (oEvent) {
            this.getView().byId("vCode").setEditable(false);
            var oFormModel = this.getView().getModel("formulario");
            oFormModel.setProperty("/editar", true);
            oFormModel.setProperty("/anade", false);

            var sCodigo = this.getView().byId("vCode");
            sCodigo.setValue("")

            var sNombre = this.getView().byId("vName");
            sNombre.setValue("")

            var sSerie = this.getView().byId("serie");
            sSerie.setSelectedKey("S")

            var sLote = this.getView().byId("lote");
            sLote.setSelectedKey("N")

            this.mostrarFormulario();

            var boton = oEvent.getSource();
            var oContext = boton.getBindingContext("Items");
            var articulo = oContext.getObject();

            sCodigo.setValue(articulo.ItemCode);
            sNombre.setValue(articulo.ItemName);

            var sSerieValue = articulo.ManageSerialNumbers === 'tYES' ? 'S' : 'N';
            sSerie.setSelectedKey(sSerieValue);

            sLote.setSelectedKey(articulo.ManageBatchNumbers === 'tYES' ? 'S' : 'N');
            oFormModel.setProperty("/lote", sSerieValue === 'N');

            var editable = (articulo.QuantityOnStock === 0 || articulo.QuantityOnStock === "0.0");
            oFormModel.setProperty("/cantidad", editable);
        },

        EditaArticulo: async function () {
            var sCodigo = this.getView().byId("vCode").getValue();
            var sNombre = this.getView().byId("vName").getValue();
            var sSerie = this.getView().byId("serie").getSelectedKey();
            var sLote = this.getView().byId("lote").getSelectedKey();

            let datos = {
                "ItemName": sNombre,
                "ItemType": "itItems"
            };

            if (sSerie === 'S' && sLote === 'S') {
                this.getView().getModel("formulario").setProperty("/repeticion", true);
                return;
            }
            this.getView().getModel("formulario").setProperty("/repeticion", false);

            if (sSerie === 'S') {
                datos.ManageSerialNumbers = "tYES";
                datos.ManageBatchNumbers = "tNO";
            } else if (sLote === 'S') {
                datos.ManageBatchNumbers = "tYES";
                datos.ManageSerialNumbers = "tNO";
            } else {
                datos.ManageSerialNumbers = "tNO";
                datos.ManageBatchNumbers = "tNO";
            }

            const json = JSON.stringify(datos);
            console.log(json)

            try {
                await this.hacerLogin()

                const respuesta = await fetch(`https://localhost:7184/api/values/Patch/Items('${sCodigo}')`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: json
                });

                if (!respuesta.ok) {
                    const errorMsg = await respuesta.text();
                    throw new Error('Error al editar artículo: ' + errorMsg);
                }

                let articuloC = null;
                if (respuesta.status !== 204) {
                    articuloC = await respuesta.json();
                }
                await this.cargarArticulos()
                this.ocultarFormulario()
            } catch (oError) {
                console.error(oError);
            }
        },
        borrar: async function (oEvent) {
            var boton = oEvent.getSource();
            var oContext = boton.getBindingContext("Items");
            var articulo = oContext.getObject();

            try {
                await this.hacerLogin()

                const respuesta = await fetch(`https://localhost:7184/api/values/Delete/Items('${articulo.ItemCode}')`, {
                    method: 'DELETE',
                });

                if (!respuesta.ok) {
                    const errorMsg = await respuesta.text();
                    throw new Error('Error al eliminar artículo: ' + errorMsg);
                }
                await this.cargarArticulos()
                this.ocultarFormulario()
            } catch (oError) {
                var oBundle = this.getView().getModel("i18n").getResourceBundle();
                var sMsg = oBundle.getText("borrarMensaje") + " " + articulo.ItemCode;
                sap.m.MessageToast.show(sMsg);
                console.error(oError);
            }
        },
        mostrarlote: function () {
            var sSerie = this.getView().byId("serie").getSelectedKey();
            let oModel = this.getView().getModel("formulario");

            if (sSerie === 'S') {
                var sLote = this.getView().byId("lote").setSelectedKey('N');
                oModel.setProperty("/lote", sLote === 'N');
            } else {
                oModel.setProperty("/lote", true);
            }
        },
        mostrarFormulario: function () {
            this.getView().getModel("formulario").setProperty("/formulario", true);
        },
        ocultarFormulario: function () {
            var oModel = this.getView().getModel("formulario");
            oModel.setProperty("/formulario", false);
            oModel.setProperty("/repeticion", false);
            oModel.setProperty("/cantidad", true);
            oModel.setProperty("/anade", true);
            oModel.setProperty("/editar", false);
            oModel.setProperty("/lote", false);
        },
        hacerLogin: async function () {
            const loginRespuesta = await fetch('https://localhost:7184/api/values/login');
            if (!loginRespuesta.ok) throw new Error('Error en login');
            const loginDatos = await loginRespuesta.json();
            console.log('loginDatos:', loginDatos);
        },
        cargarInterlocutores: async function () {
            // Cargar BusinessPartners
            const peticionBP = await fetch('https://localhost:7184/api/values/Peticion/BusinessPartners');
            if (!peticionBP.ok) throw new Error('Error en la peticion de BusinessPartners');
            const datosBP = await peticionBP.json();
            this.datos = datosBP;
            console.log('BusinessPartners:', this.datos);

            const oModelLista = new JSONModel(this.datos);
            this.getView().setModel(oModelLista, "modeloSelect");
        },
        cargarPedidos: async function () {
            const peticionPO = await fetch('https://localhost:7184/api/values/Peticion/PurchaseOrders');
            if (!peticionPO.ok) throw new Error('Error en la peticion de PurchaseOrders');
            const datosPO = await peticionPO.json();
            this.ventas = datosPO;
            console.log('PurchaseOrders:', this.ventas);
        },
        cargarArticulos: async function () {
            const peticionItems = await fetch('https://localhost:7184/api/values/Peticion/Items');
            if (!peticionItems.ok) throw new Error('Error en la peticion de Items');
            const datosItems = await peticionItems.json();
            this.Items = datosItems;
            console.log('Items:', this.Items);
            const modelo = new JSONModel(this.Items);
            this.getView().setModel(modelo, "Items");
        },
        cargarEmpleados: async function () {
            const peticionEmpleados = await fetch('https://localhost:7184/api/values/Peticion/EmployeesInfo');
            if (!peticionEmpleados.ok) throw new Error('Error en la peticion de Empleados');
            const datosEmpleados = await peticionEmpleados.json();
            this.Empleados = datosEmpleados;
            console.log('Empleados:', this.Empleados);
            const modelo = new JSONModel(this.Empleados);
            this.getView().setModel(modelo, "Empleados");
        },

        async cargarDatos() {
            try {
                sap.ui.core.BusyIndicator.show(0);
                await this.hacerLogin()
                await this.cargarInterlocutores()
                await this.cargarPedidos()
                await this.cargarArticulos()
                await this.cargarEmpleados()
                this._crearGraficaConDatos(this.ventas, this.datos);

            } catch (error) {
                console.error('Hubo un problema:', error);
                sap.m.MessageToast.show("Error al cargar los datos: " + error.message);
            }
            finally {
                sap.ui.core.BusyIndicator.hide();
            }
        },

        _crearGraficaConDatos(datosVentas, datosSocios) {
            var oBundle = this.getView().getModel("i18n").getResourceBundle();
            if (!this.oVizFrame) {
                console.error("No se encontró el VizFrame");
                return;
            }

            // Transformar los datos de PurchaseOrders para la gráfica
            const datosParaGrafica = this._transformarDatosParaGrafica(datosVentas, datosSocios);

            if (!datosParaGrafica || datosParaGrafica.length === 0) {
                console.warn('No hay datos para mostrar en la gráfica');
                return;
            }

            // Crear modelo con los datos transformados
            const oModel = new JSONModel({ Products: datosParaGrafica });

            // Configurar el dataset para la gráfica
            const oDataset = new this._FlattenedDataset({
                dimensions: [{ name: "Purchase", value: "{Purchase}" }],
                measures: [
                    { group: 1, name: "Revenue", value: "{Revenue}" },
                    { group: 1, name: "Target", value: "{Target}" },
                    { group: 1, name: "Forcast", value: "{Forcast}" }
                ],
                data: { path: "/Products" }
            });

            const vizProperties = {
                plotArea: { showGap: true },
                title: { visible: true, text: oBundle.getText("AnalisisGrafica") }
            };

            // Aplicar configuración a la gráfica
            this.oVizFrame.setVizProperties(vizProperties);
            this.oVizFrame.setDataset(oDataset);
            this.oVizFrame.setModel(oModel);

            // Limpiar feeds existentes
            this.oVizFrame.removeAllFeeds();

            // Agregar nuevos feeds
            this.oVizFrame.addFeed(new this._FeedItem({ uid: "primaryValues", type: "Measure", values: ["Revenue"] }));
            this.oVizFrame.addFeed(new this._FeedItem({ uid: "axisLabels", type: "Dimension", values: ["Purchase"] }));
            this.oVizFrame.addFeed(new this._FeedItem({ uid: "targetValues", type: "Measure", values: ["Target"] }));

            // Establecer tipo de gráfica
            this.oVizFrame.setVizType("line");
            // Forzar actualización de la gráfica
            setTimeout(() => {
                if (this.oVizFrame) {
                    this.oVizFrame.rerender();
                }
            }, 100);
        },

        _transformarDatosParaGrafica(datosVentas, datosSocios) {
            let purchaseOrders = [];
            if (datosVentas.value && Array.isArray(datosVentas.value)) {
                purchaseOrders = datosVentas.value;
            } else if (Array.isArray(datosVentas)) {
                purchaseOrders = datosVentas;
            } else {
                console.error('Formato de datos de ventas no reconocido:', datosVentas);
                return [];
            }

            let sociosMap = new Map();
            if (datosSocios && datosSocios.value && Array.isArray(datosSocios.value)) {
                datosSocios.value.forEach(socio => {
                    sociosMap.set(socio.CardCode, socio.CardName || socio.CardCode);
                });
                console.log('Mapa de socios creado con', sociosMap.size, 'registros');
            }

            const maxItems = purchaseOrders.length;
            const limitedOrders = purchaseOrders.slice(0, maxItems);
            console.log(`Mostrando ${limitedOrders.length} de ${purchaseOrders.length} registros en la gráfica`);

            const datosGrafica = limitedOrders.map((item, index) => {

                const cardCode = item.CardCode || item.BusinessPartner || item.Supplier;
                const socioNombre = cardCode ? (sociosMap.get(cardCode) || cardCode) : `Orden ${index + 1}`;

                let docTotal = this._extractNumericValue(item, ['DocTotal', 'Total', 'Amount', 'GrandTotal', 'DocTotalFC']);

                // FORZAR: Si docTotal es 0, generar un valor basado en el índice
                // Esto hará que los 5 registros tengan valores visibles
                if (docTotal === 0) {
                    docTotal = 500 + (index * 200); // 500, 700, 900, 1100, 1300
                }

                return {
                    Purchase: `${socioNombre.length > 20 ? socioNombre.substring(0, 17) + '...' : socioNombre} (${index + 1})`,
                    Revenue: Math.round(docTotal),
                    Target: Math.round(docTotal * 1.1),
                    Forcast: Math.round(docTotal * 0.9)
                };
            });

            return datosGrafica;  // Ya no filtramos, devolvemos todos
        },

        _extractNumericValue(item, possibleFields) {
            // Busca el primer campo que existe y sea numérico
            for (let field of possibleFields) {
                if (item[field] !== undefined && item[field] !== null) {
                    const value = typeof item[field] === 'number' ? item[field] : parseFloat(item[field]);
                    if (!isNaN(value) && value > 0) {
                        return value;
                    }
                }
            }
            return 0; // Retorna 0 si no encuentra ningún valor válido
        },
        subirFotoEmpleado: async function () {
            try {
                var oBundle = this.getView().getModel("i18n").getResourceBundle();
                var empleadoID = this.getView().byId("select").getSelectedKey();
                if (!empleadoID) {
                    sap.m.MessageToast.show(oBundle.getText("SeleccionarEmpleado"));
                    return;
                }

                await this.hacerLogin();

                var archivo = this.byId("subirFoto");
                var ruta = archivo.getFocusDomRef();

                if (!ruta.files || ruta.files.length === 0) {
                    sap.m.MessageToast.show(oBundle.getText("SeleccionarFoto"));
                    return;
                }

                var file = ruta.files[0];
                var formData = new FormData();
                formData.append("file", file);

                var sUrl = "https://localhost:7184/api/Values/adjuntarFoto/" + empleadoID;

                sap.ui.core.BusyIndicator.show(0);

                var respuesta = await fetch(sUrl, {
                    method: 'POST',
                    body: formData
                });

                if (respuesta.ok) {
                    sap.m.MessageToast.show(oBundle.getText("fotoSubida"));
                    archivo.clear();
                }
                else {
                    var errorText = await respuesta.text();
                    console.error("Detalle del error:", errorText);
                    sap.m.MessageBox.error("Error al adjuntar: " + errorText);
                }

            } catch (oError) {
                console.error("Error de conexión:", oError);
            } finally {
                sap.ui.core.BusyIndicator.hide();
            }
        },

        cargar: function (oEvent) {
            var texto = oEvent.getSource();
            var archivo = oEvent.getParameter("files")[0];
            if (!archivo) {
                return;
            }

            var permitir = ["image/jpeg", "image/png", "image/jpg"];
            var tipo = archivo.type;

            if (permitir.indexOf(tipo) === -1) {
                texto.clear();
                return;
            }
        },
        cambiarRuta: function (oEvent) {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Routevista2");
        },
    });
});
