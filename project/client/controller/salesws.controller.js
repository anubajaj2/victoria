/*global location*/
sap.ui.define(
  ["victoria/controller/BaseController",
      "sap/ui/model/json/JSONModel",
      "sap/ui/core/routing/History",
      "victoria/models/formatter",
      "sap/m/MessageToast", "sap/ui/model/Filter"],
  function (BaseController, JSONModel, History, formatter,
            MessageToast, Filter) {
        "use strict";

        return BaseController.extend("victoria.controller.salesws", {
          onInit: function (){
          }
        });

    });
