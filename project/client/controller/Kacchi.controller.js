/*global location*/
sap.ui.define(
    ["victoria/controller/BaseController"],
    function (BaseController) {
        "use strict";

        return BaseController.extend("victoria.controller.Kacchi", {
          onInit:function(){
            var kachhi = [
              {"PaggaNo" : "", "Weight" : "", "Tunch" : "", "Fine" : ""},
              {"PaggaNo" : "", "Weight" : "", "Tunch" : "", "Fine" : ""},
              {"PaggaNo" : "", "Weight" : "", "Tunch" : "", "Fine" : ""},
              {"PaggaNo" : "", "Weight" : "", "Tunch" : "", "Fine" : ""},
              {"PaggaNo" : "", "Weight" : "", "Tunch" : "", "Fine" : ""}
            ];
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({"superman": kachhi});
            this.getView().setModel(oModel,"kacciLocalModel");
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
