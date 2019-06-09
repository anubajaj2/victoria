/*global location*/
sap.ui.define([
  "victoria/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "victoria/models/formatter",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/Dialog"
],function (BaseController, JSONModel, formatter, MessageToast, MessageBox, Dialog) {
  "use strict";
  return BaseController.extend("victoria.controller.sales", {
  formatter: formatter,
  onInit: function (oEvent) {
  BaseController.prototype.onInit.apply(this);
  debugger;
  var oRouter = this.getRouter();
  oRouter.getRoute("sales").attachMatched(this._onRouteMatched, this);
  this.orderItem(oEvent);
// Return Item Table as input table
  this.orderReturn();
    },

_onRouteMatched:function(oEvent){
var that = this;
debugger;
that.getView().getModel("local").setProperty("/orderHeader/Date", formatter.getFormattedDate(0));
},

//customer value help
valueHelpCustomer:function(oEvent){
debugger;
this.getCustomerPopup(oEvent);
},
getRouter: function() {
  return this.getOwnerComponent().getRouter();
},
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
orderData.Date = orderData.Date.replace(".","-").replace(".","-");
this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/OrderHeaders",
                          "POST", {}, orderData, this)
             .then(function(oData) {
                  that.getView().setBusy(false);
                  //assign the no on ui
that.getView().getModel("local").setProperty("/orderHeader/OrderNo", oData.OrderNo);
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
// for (var i = 0; i < noOfItems; i++) {
debugger;
// var materialId = oTable.getItems()[i].getCells()[2].getText();
// var materialData = this.allMasterData.materials[materialId];
// oTable.getItems()[i].getCells()[2].setText(materialData.ProductCode + ' - ' + materialData.ProductName );

//Find the customer data for that Guid in customer collection
//Change the data on UI table with semantic information
// }
},

onSave:function(){
  var that = this;
  debugger;
var oHeader = this.getView().getModel('local').getProperty('/orderHeader');
// if(oHeader.OrderNo === 0){
//     MessageBox.show(
// 			"Please create Order Number first", {
// 				icon: MessageBox.Icon.ERROR,
// 				title: "Error",
// 				actions: [MessageBox.Action.OK],
// 				onClose: function(oAction) { }
// 			}
// 		);
//   that.getView().setBusy(false);
// }
if (oHeader.Customer === "" &&
    oHeader.OrderNo === 0) {
this.getView().byId("customerId").setValueState("Error").setValueStateText("Mandatory Input");
that.getView().setBusy(false);
    }
// else {
  debugger;
//make a put call from order header table
// this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
//                           "/OrderHeaders(" + oHeader.OrderNo + "')",
//                           "PUT", {}, oHeader, this)
//              .then(function(oData) {
//                Debugger;
//                   that.getView().setBusy(false);
//                   //assign the no on ui
// // that.getView().getModel("local").setProperty("/orderHeader/OrderNo", oData.OrderNo);
//                })
//             .catch(function(oError) {
//         that.getView().setBusy(false);
//         var oPopover = that.getErrorMessage(oError);
//             		});

//to post the data to order item Table
var items = this.getView().byId("orderItemBases");
// }
// var oItem   = this.getView().getModel('local').getProperty('/orderItem');
// var oReturn = this.getView().getModel('local').getProperty('/orderReturn');
},

onClear:function(){
  debugger;
//Clear Header Details
var oHeader = this.getView().getModel('local').getProperty('/orderHeader');
oHeader.Goldbhav1 = 0;
oHeader.Goldbhav2 = 0;
oHeader.SilverBhav = 0;
oHeader.OrderNo="";
// oHeader.Date=new Date();
this.getView().getModel('local').setProperty('/orderHeader',oHeader);
this.getView().getModel("local").setProperty("/orderHeader/Date", formatter.getFormattedDate(0));
this.getView().byId("customerId").setValue("");
this.getView().byId("custName").setText("");
//Clear Item table
var oData = oTable.getModel().getData();
var oItem = this.getView().getModel('local').getProperty('/orderItems');
debugger;
var oReturn = this.getView().getModel('local').getProperty('/orderReturn');
},

OnCustChange:function(){
debugger;
},

ValueChange:function(oEvent){
debugger;
var index = oEvent.getSource().getParent().getIndex();
var oCurrentRow = oEvent.getSource().getParent();
var cells = oCurrentRow.getCells();
var path = oEvent.getSource().getBindingContext().getPath();
// cells[3].setValue(cells[1].getValue() * cells[2].getValue() / 100);
// this.byId("idTunch")
}
});
});
