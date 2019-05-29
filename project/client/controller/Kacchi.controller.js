/*global location*/
sap.ui.define(
    ["victoria/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History", "victoria/models/formatter",
    "sap/m/MessageToast", "sap/ui/model/Filter"],
    function (BaseController,JSONModel,History,formatter,MessageToast,Filter) {
        "use strict";

        return BaseController.extend("victoria.controller.Kacchi", {
            formatter: formatter,
            oKacchiItem: {
                PaggaNo: "",
                Weight: "",
                Tunch: "",
                Fine: 0

            },
          oKacchiItemModel: new JSONModel([this.oKacchiItem]),

            onInit:function(){
              var kachhi = [
                {"Customer" :"", "PaggaNo" : "", "Weight" : "", "Tunch" : "", "Fine" : ""},
                {"Customer" :"", "PaggaNo" : "", "Weight" : "", "Tunch" : "", "Fine" : ""},
                {"Customer" :"", "PaggaNo" : "", "Weight" : "", "Tunch" : "", "Fine" : ""},
                {"Customer" :"", "PaggaNo" : "", "Weight" : "", "Tunch" : "", "Fine" : ""},
                {"Customer" :"", "PaggaNo" : "", "Weight" : "", "Tunch" : "", "Fine" : ""}
              ];
              var oModel = new sap.ui.model.json.JSONModel();
              oModel.setData({"superman": kachhi});
              this.setModel(oModel,"kacciLocalModel");
          },


          onCustValueHelp: function(){
            this.getCustomerPopup();
          },

          onConfirm: function(oEvent){
            debugger;
            //whatever customer id selected push that in local model
              // var myData = this.getView().getModel("local").getProperty("/demoData");
              // myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
              // this.getView().getModel("local").setProperty("/demoData", myData);
              // added by sweta to populate the selected cust and text to the input field
              var selCust = oEvent.getParameter("selectedItem").getLabel();
              var selCustName = oEvent.getParameter("selectedItem").getValue();
              if(selCust){
                this.getView().byId("idCustNo").setValue(selCust);
                this.getView().byId("idCustName").setText(selCustName);
              }
              // End of addition by Sweta
          }

        });

    });
