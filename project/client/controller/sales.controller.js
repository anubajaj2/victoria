/*global location*/
sap.ui.define(
    ["victoria/controller/BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/ui/core/routing/History",
        "victoria/models/formatter",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "sap/ui/model/Filter"],
    function (BaseController, JSONModel, History, formatter,
              MessageToast, Filter) {
        "use strict";
        return BaseController.extend("victoria.controller.sales", {
            formatter: formatter,

            onInit: function (oEvent) {
              BaseController.prototype.onInit.apply(this);
              debugger;
            //   var oRouter = this.getRouter();
            // oRouter.getRoute("sales").attachMatched(this._onSalesRoute, this);

              // var oHeader = this.getOwnerComponent().getModel('local').getProperty('/orderHeader');
              //   oHeader.date = new Date();
              //   this.getOwnerComponent().setModel('local',oHeader);
                // this.byId("DateId").setDateValue(new Date());
// Item Table as input table
                this.orderItem(oEvent);
                var oMaterial = this.getOwnerComponent().getModel('local').getProperty('/orderItems');

// Return Item Table as input table
                this.orderReturn();
            },

            _onSalesRoute:function(oEvent){
              var that = this;
              debugger;
              var omodel = that.getView().getModel('local').getProperty('/orderHeader');
            },

            //customer value help
            valueHelpCustomer:function(oEvent){
              debugger;
              this.getCustomerPopup(oEvent);
            },
            getRouter:function(){

            },
            // onPayDateChange: function(oEvent) {
            //   debugger;
			      //   var dateString = oEvent.getSource().getValue();
			      //   var from = dateString.split(".");
			      //   var dateObject = new Date(from[2], from[1] - 1, from[0]);
			      //   var newDate = new Date(from[2], from[1] - 1, from[0]);
			      //   var PaymentDueDate = this.formatter.getIncrementDate(dateObject, 1);
			      //   this.getView().getModel("local").setProperty("/orderHeader_t/Date", PaymentDueDate);
            //   },

            onConfirm:function(oEvent){
              debugger;
              var oId = oEvent.getParameter('selectedItem').getId();
              var oSource = oId.split("-"[0])
              if (oSource[0] === 'idCoCustPopup'){

                var selCust = oEvent.getParameter("selectedItem").getLabel();
                var selCustName = oEvent.getParameter("selectedItem").getValue();
                this.getView().byId("customerId").setValue(selCust);
                this.getView().byId("custName").setText(selCustName);
                this.getView().getModel("local").setProperty("/orderHeader/Customer",
                                oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1]);
                this.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerId",
                                                selCust);

                //whatever customer id selected push that in local model
                // var ORData = this.getView().getModel("orderLocalModel")
                // ORData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
                // this.getView().getModel("orderLocalModel").setProperty("/orderHeader", myData);
              }
              else {
              //   if (osource.split("--")[2]==="orderHeader") {
              //       var myData = this.getView().getModel("local").getProperty("/orderHeader");
              //   }

              }
            },
            //on order valuehelp,get the exsisting order from //DB
            valueHelpOrder:function(oEvent){
              this.getOrderlist(oEvent);
            },

            //on order create Button
            orderCreate:function(oEvent){
              var that = this;
              that.getView().setBusy(true);
              // get the data from screen in local model
              debugger;
              var orderData = this.getView().getModel('local').getProperty("/orderHeader");
              if (orderData.Customer === "") {
                this.getView().byId("customerId").setValueState("Error").setValueStateText("Mandatory Input");
                that.getView().setBusy(false);
              }
              else {
        //call the odata promise method to post the data
            this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/OrderHeaders",
                                        "POST", {}, orderData, this)
             .then(function(oData) {
               if (!oError) {
              that.getView().setBusy(false);
              sap.m.MessageToast.show("Order Created Successfully");
              }
               }).catch(function(oError) {
                 that.getView().setBusy(false);
                var oPopover = that.getErrorMessage(oError);
            		});
              }
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
            var materialId = oTable.getItems()[i].getCells()[2].getText();
            var materialData = this.allMasterData.materials[materialId];
            oTable.getItems()[i].getCells()[2].setText(materialData.ProductCode + ' - ' + materialData.ProductName );

                //Find the customer data for that Guid in customer collection
                //Change the data on UI table with semantic information
              }
            },

        onSave:function(){
          var oHeader = this.getView().getModel('local').getProperty('/orderHeader');
          var oItem   = this.getView().getModel('local').getProperty('/orderItem');
          var oReturn = this.getView().getModel('local').getProperty('/orderReturn');

            },

        onClear:function(){
        var oHeader = this.getView().getModel('local').getProperty('/orderHeader');
        var oItem = this.getView().getModel('local').getProperty('/orderItem');
        var oReturn = this.getView().getModel('local').getProperty('/orderReturn');

        },

        OnCustChange:function(){
          debugger;
        },
        onMaterialSelect:function(oEvent){
          debugger;
          var oMaterial = this.getView().getModel('local').getProperty('/orderItem');
          oMaterial.Material = oEvent.getParameter("selectedItem").getKey()

//           if (oMaterial.Material !=== "") {
// // fetch the details from db table
// this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/", RetailOrderItem
//                           "POST", {}, oMaterial, this)
//           }

          this.getView().getModel("local").setProperty("/orderItems", oMaterial);
          oMaterialDetail.MaterialNo = oEvent.getParameter('selectedItem').getText();


           var oMaterialDetail = this.getView().getModel('local').getProperty('/orderItemTemp');
           this.getView().getModel('local').setProperty("/orderItemTemp", oMaterialDetail);
        }

        });

    });
