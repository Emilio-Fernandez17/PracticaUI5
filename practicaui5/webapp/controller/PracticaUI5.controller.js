sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Configuration",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/model/json/JSONModel",
    "sap/viz/ui5/data/FlattenedDataset",
    "sap/viz/ui5/controls/common/feeds/FeedItem"
], (Controller, Configuration, ResourceModel, JSONModel, FlattenedDataset, FeedItem) => {
    "use strict";

    console.log("Controller:", Controller);
    console.log("JSONModel:", JSONModel);
    console.log("FlattenedDataset:", FlattenedDataset);
    console.log("FeedItem:", FeedItem);

    return Controller.extend("practicaui5.practicaui5.controller.PracticaUI5", {

            _constants: {
            vizFrame: {
                id: "chartContainerVizFrame",
                dataset: {
                    dimensions: [{ name: "Country", value: "{Country}" }],
                    measures: [
                        { group: 1, name: "Revenue",  value: "{Revenue}"  },
                        { group: 1, name: "Target",   value: "{Target}"   },
                        { group: 1, name: "Forcast",  value: "{Forcast}"  },
                        { group: 1, name: "Revenue2", value: "{Revenue2}" },
                        { group: 1, name: "Revenue3", value: "{Revenue3}" }
                    ],
                    data: { path: "/Products" }
                },
                modulePath: "/model/ChartContainerData.json",
                type: "line",
                properties: { plotArea: { showGap: true } },
                feedItems: [
                    { uid: "primaryValues", type: "Measure",   values: ["Revenue"] },
                    { uid: "axisLabels",    type: "Dimension", values: ["Country"] },
                    { uid: "targetValues",  type: "Measure",   values: ["Target"]  }
                ]
            }
        },
        onInit() {
            this._sCurrentLanguage = "es";
            this.datos = {}

            sap.ui.require([
                "sap/viz/ui5/data/FlattenedDataset",
                "sap/viz/ui5/controls/common/feeds/FeedItem"
            ], (FlattenedDataset, FeedItem) => {
                this._FlattenedDataset = FlattenedDataset;
                this._FeedItem = FeedItem;

                const oVizFrame = this.getView().byId(this._constants.vizFrame.id);
                if (oVizFrame) {
                    this._updateVizFrame(oVizFrame);
                }
            });
 
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
        },
        seleccionar(){

        },

        _updateVizFrame(vizFrame) {
            const oVizFrame = this._constants.vizFrame;
            const oModel    = new JSONModel(oVizFrame.modulePath);
            const oDataset  = new this._FlattenedDataset(oVizFrame.dataset);

            vizFrame.setVizProperties(oVizFrame.properties);
            vizFrame.setDataset(oDataset);
            vizFrame.setModel(oModel);
            this._addFeedItems(vizFrame, oVizFrame.feedItems);
            vizFrame.setVizType(oVizFrame.type);
        },

        _addFeedItems(vizFrame, feedItems) {
            feedItems.forEach(item => vizFrame.addFeed(new this._FeedItem(item)));
        }


 
    });
});