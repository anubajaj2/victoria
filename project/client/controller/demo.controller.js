/*global location*/
sap.ui.define(
    ["victoria/controller/BaseController"],
    function (BaseController) {
        "use strict";

        return BaseController.extend("victoria.controller.demo", {

          onValueHelp: function(){
            this.getCustomerPopup();
          },
          onConfirm: function(oEvent){
            //whatever customer id selected push that in local model
            debugger;
              var myData = this.getView().getModel("local").getProperty("/demoData");
              myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
              this.getView().getModel("local").setProperty("/demoData", myData);
          },
          onMaterialSelect: function(oEvent){
            //whatever material id selected push that in local model
            debugger;
              var myData = this.getView().getModel("local").getProperty("/demoData");
              myData.Material = oEvent.getParameter("selectedItem").getKey();
               this.getView().getModel("local").setProperty("/demoData", myData);
          },
          onSave: function(){
            var that = this;
            that.getView().setBusy(true);
            var myData = this.getView().getModel("local").getProperty("/demoData");
            myData.CrDate =  this.getView().byId("someDate").getDateValue();
            this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Demos",
                                      "POST", {}, myData, this)
            .then(function(oData) {
    					that.getView().setBusy(false);
    					sap.m.MessageToast.show("Data Saved Successfully");

    				}).catch(function(oError) {
    					that.getView().setBusy(false);
    					var oPopover = that.getErrorMessage(oError);
    				});
            ;
          }

        });

    });
