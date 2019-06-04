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
          formatter: formatter,
          onInit: function (oEvent){
            debugger;
          this.getView().byId("DateId").setDateValue( new Date());
            // this.orderHeader();
  // Item Table as input table
                  this.orderItem(oEvent);
  // Return Item Table as input table
                  this.orderReturn();
          },
          valueHelpCustomer: function (oEvent) {
            this.getCustomerPopup(oEvent);
          },
          onConfirm: function(oEvent){
            debugger;
            //whatever customer id selected push that in local model
              var myData = this.getView().getModel("local").getProperty("/orderHeader");
              myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
              this.getView().getModel("local").setProperty("/demoData", myData);
              var selCust = oEvent.getParameter("selectedItem").getLabel();
              var selCustName = oEvent.getParameter("selectedItem").getValue();
              this.getView().byId("customerId").setValue(selCust);
              this.getView().byId("custName").setText(selCustName);
              // if (this.searchPopup) {
              //   this.searchPopup.destroy();
              // }
          },
          onMaterialF4: function(oEvent) {
            this.getMaterialPopup(oEvent);
          },
          onClear:function(){
            debugger;
              this.byId("idOrderNo").setValue("");
              this.byId("customerId").setValue("");
              this.byId("Gbhav1Id").setValue("");
              this.byId("Gbhav2Id").setValue("");
              this.byId("sbhavid").setValue("");
              this.byId("custName").setText("");
              this.byId("DateId").setDateValue(new Date());
              debugger;
              var oOrderItem = new JSONModel();
        			//create array
        			var array=[];
        			//loop the array values
        			for (var i=1;i<=20;i++){
        				var oItem={
        					"material":"",
        					"description":"",
        					"qty":"0",
        					"qtyd":"0",
        					"weight":"0",
        					"weightd":"0",
        					"making":"0",
        					"makingd":"0",
        					"tunch":"0",
        					"remarks":"",
        					"subTot":"0",
        				};
        				array.push(oItem);
        			}
        			//set the Data
        			oOrderItem.setData({"itemData" : array});
        			//set the model
        			this.setModel(oOrderItem,"orderItems");

          },
          //on order create Button
          orderCreate:function(oEvent){
            var that = this;
            that.getView().setBusy(true);
            // get the data from screen in local model
            debugger;
            // var orderData = this.getOwnerComponent().getModel('local').getProperty('/orderHeaders');
            var orderData = this.getView().getModel('orderLocalModel').getProperty('/Header')
            // var orderData = this.getView().getModel('local').getProperty('/orderHeader')
            orderData.Date      = this.getView().byId('DateId').getValue();
            orderData.Goldbhav1 = this.getView().byId('Gbhav1Id').getValue();
            orderData.Goldbhav2 = this.getView().byId('Gbhav2Id').getValue();
            orderData.SilverBhav= this.getView().byId('sbhavid').getValue();

            // orderData.Customer = this.getView().getModel("local").getProperty("/orderHeader").Customer
            // orderData.Customer = this.getView().getModel("orderLocalModel").getProperty("/Header").Customer
            debugger;
            if (orderData.Customer === "") {
            this.getView().byId("customerId").setValueState("Error").setValueStateText("Mandatory Input");
            that.getView().setBusy(false);
            }
            else {
                this.getView().getModel("orderLocalModel").setProperty("/Headers", orderData);
                //call the odata promise method to post the data
                this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/orderHeaders",
                                          "POST", {}, orderData, this)
                .then(function(oData) {
                  that.getView().setBusy(false);
                  sap.m.MessageToast.show("Data Saved Successfully");
                   }).catch(function(oError) {
                  that.getView().setBusy(false);
                  var oPopover = that.getErrorMessage(oError);
                  });
              }
          },
          onExit : function () {
      			debugger;
      					if (this.searchPopup) {
      						this.searchPopup.destroy();
      					}
      				}
        });

    });
