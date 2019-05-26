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
              var myData = this.getView().getModel("local").getProperty("/demoData");
              myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
              this.getView().getModel("local").setProperty("/demoData", myData);
              // added by sweta to populate the selected cust to the input field
              var selVal = oEvent.getParameter("selectedItem").getValue();
              this.getView().byId("idCustNo").setValue(selVal);
              // End of addition by Sweta
          },
          onUpdateFinished: function(oEvent){
            debugger;
            var oTable = oEvent.getSource();
      			var itemList = oTable.getItems();
      			var noOfItems = itemList.length;
      			var value1;
      			var id;
      			var cell;
      			debugger;
      			for (var i = 0; i < noOfItems; i++) {
      				debugger;
              //Read the GUID from the Screen
              var customerId = oTable.getItems()[i].getCells()[1].getText();
              var customerData = this.allMasterData.customers[customerId];
              oTable.getItems()[i].getCells()[1].setText(customerData.CustomerCode + ' - ' + customerData.Name );

              var materialId = oTable.getItems()[i].getCells()[2].getText();
              var materialData = this.allMasterData.materials[materialId];
              oTable.getItems()[i].getCells()[2].setText(materialData.ProductCode + ' - ' + materialData.ProductName );

              //Find the customer data for that Guid in customer collection
              //Change the data on UI table with semantic information
      			}
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
