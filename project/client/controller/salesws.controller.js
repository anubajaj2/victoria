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
            // this.orderHeader();
  // Item Table as input table
                  this.orderItem(oEvent);
  // Return Item Table as input table
                  this.orderReturn();
                  BaseController.prototype.onInit.apply(this);
                  this.getOwnerComponent().getModel("local").setProperty("/orderHeader/Date", formatter.getFormattedDate(0));
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
            var orderData = this.getView().getModel('local').getProperty("/orderHeader");
            if (orderData.Customer === "") {
              this.getView().byId("customerId").setValueState("Error").setValueStateText("Mandatory Input");
              that.getView().setBusy(false);
            }
            else {
      //call the odata promise method to post the data
          orderData.Date = orderData.Date.replace(".","-").replace(".","-");
          this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/WSOrderHeaders",
                                      "POST", {}, orderData, this)
           .then(function(oData) {
                that.getView().setBusy(false);
                // sap.m.MessageToast.show("Order Created Successfully");
                //assign the no on ui
                that.getView().getModel("local").setProperty("/orderHeader/OrderNo", oData.OrderNo);
             }).catch(function(oError) {
               that.getView().setBusy(false);
               var oPopover = that.getErrorMessage(oError);

              });
            }
          },
          onSave: function(oEvent){
            debugger;
            var that = this;
                  for(var i=0; i < 20; i++){
                    this.getView().setBusy(true);
                     var myData = this.getView().getModel("orderItems").getProperty("/itemData")[i];
                    // myData.OrderNo = this.getView().getModel("local").getProperty("/orderItem").OrderNo
                     myData.OrderNo = this.getView().byId('idOrderNo').getValue();
                     myData.material = this.getView().getModel("local").getProperty("/orderItem")[i].material;
                    if( myData.OrderNo   !== "" &&
                        // myData.itemNo   !== "" &&
                        myData.material  !== "" &&
                        myData.qty       !== "" &&
                        myData.qtyD      !== "" &&
                        myData.weight    !== "" &&
                        myData.weightD   !== "" &&
                        myData.making    !== "" &&
                        myData.makingD   !== "" &&
                        myData.tunch     !== "" &&
                        myData.remarks   !== "" &&
                        myData.subTotal  !== ""
                        ){
                      this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/orderItems",
                                                    "POST", {}, myData, this)

                        .then(function(oData) {
                					that.getView().setBusy(false);
                					sap.m.MessageToast.show("Data Saved Successfully");
                          //read the data which is Saved
                          debugger;
                          var id = oData.id;
                          var material = oData.material;
                          var allItems = that.getView().getModel("orderItems").getProperty("/itemData");
                          for (var i = 0; i < allItems.length; i++) {
                            if( allItems[i].material == material){
                              allItems[i].itemNo = id;
                              break;
                            }
                          }
                          that.getView().getModel("orderItems").setProperty("/itemData",allItems);

                				}).catch(function(oError) {
                					that.getView().setBusy(false);
                					var oPopover = that.getErrorMessage(oError);
                				});
                      }

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
