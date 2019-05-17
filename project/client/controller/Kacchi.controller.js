sap.ui.define(
  ["victoria/controller/BaseController",
   "sap/ui/model/json/JSONModel"],
  function (
    BaseController,
    JSONModel
    ) {
    "use strict";
    return BaseController.extend("victoria.controller.Kacchi",{

      onInit:function(){
        var oRouter = this.getRouter();
        console.log;
        oRouter.getRoute("Kacchi").attachMatched(this._onKacchiRouteMatched , this);
      },

      getRouter:function(){
        return sap.ui.core.UIComponent.getRouterFor(this);
      },

      _onKacchiRouteMatched:function(){

      }

    });
  }
);
