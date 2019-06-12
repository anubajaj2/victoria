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
  var oHeaderDetail = that.getView().getModel('local').getProperty('/orderHeader');
  var oHeaderDetailT = that.getView().getModel('local').getProperty('/orderHeaderTemp');
  oHeaderDetail.OrderNo=0;
  oHeaderDetail.Goldbhav1=0;
  oHeaderDetail.Goldbhav2=0;
  oHeaderDetail.SilverBhav=0;
  this.getView().getModel('local').setProperty("/orderHeader",oHeaderDetail);
  that.getView().getModel("local").setProperty("/orderHeader/Date", formatter.getFormattedDate(0));
  oHeaderDetailT.CustomerId="";
  oHeaderDetailT.CustomerName="";
  this.getView().getModel('local').setProperty("/orderHeaderTemp",oHeaderDetailT);
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
var oCustDetail = this.getView().getModel('local').getProperty('/orderHeaderTemp');
var oSource = oId.split("-"[0])
if (oSource[0] === 'idCoCustPopup'){

var selCust = oEvent.getParameter("selectedItem").getLabel();
var selCustName = oEvent.getParameter("selectedItem").getValue();
oCustDetail.customerId = selCust;
oCustDetail.CustomerName = selCustName;
// this.getView().byId("customerId").setValue(selCust);
// this.getView().byId("custName").setText(selCustName);
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
debugger;
//create the new json model and get the order id no generated
var oOrderId = that.getView().getModel('local').getProperty('/OrderId');
oOrderId.OrderId=oData.id;
oOrderId.OrderNo=oData.OrderNo;
that.getView().getModel('local').setProperty('/OrderId',oOrderId);
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

onSave:function(oEvent){
  var that = this;
  debugger;
  var oHeader = this.getView().getModel('local').getProperty('/orderHeader');
  if(oHeader.OrderNo === 0){
      MessageBox.show(
  			"Please create Order Number first", {
  				icon: MessageBox.Icon.ERROR,
  				title: "Error",
  				actions: [MessageBox.Action.OK],
  				onClose: function(oAction) { }
  			}
        // return;
  		);
    that.getView().setBusy(false);
  }
  debugger;
if (oHeader.OrderNo !== "" &&
    oHeader.OrderNo !== 0) {
debugger;
var oId = that.getView().getModel('local').getProperty('/OrderId').OrderId;
// this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
//                       "/OrderHeaders('"+ oId +"')", "PUT",
//                        {},oHeader, this)
// .then(function(oData) {
//   message.show("testing");
//       that.getView().setBusy(false);
//             debugger;
//      })
// .catch(function(oError) {
//     that.getView().setBusy(false);
//     var oPopover = that.getErrorMessage(oError);
//               });
          }
var oOrderDetail = this.getView().getModel('local').getProperty('/OrderItem')
var oTableDetails = this.getView().byId('orderItemBases');
var oBinding = oTableDetails.getBinding("rows");

for (var i = 0; i < oBinding.getLength(); i++) {
  var that = this;
  this.getView().setBusy(true);
  var data = oBinding.oList[i];
if (data.Material !== "") {
  oOrderDetail.OrderNo=oId;//orderno // ID
  oOrderDetail.Material=data.Material;
  oOrderDetail.Qty=data.Qty;
  oOrderDetail.QtyD=data.QtyD;
  oOrderDetail.Making=data.Making;
  oOrderDetail.MakingD=data.MakingD;
  oOrderDetail.Weight=data.Weight;
  oOrderDetail.WeightD=data.WeightD;
  oOrderDetail.Remarks=data.Remarks;
  oOrderDetail.SubTotal=data.SubTotal;
  var oOrderDetailsClone = JSON.parse(JSON.stringify(oOrderDetail));
//Item data save
    this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/OrderItems","POST", {}, oOrderDetailsClone, this)
                 .then(function(oData) {
                      that.getView().setBusy(false);
                      sap.m.MessageToast.show("Data Saved Successfully");
                      var id = oData.id;
                  debugger;
                   })
                .catch(function(oError) {
    that.getView().setBusy(false);
    var oPopover = that.getErrorMessage(oError);
                		});
}//If condition end
}//for loop brace end

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
// var path = oEvent.getSource().getBindingContext().getPath();
// var oOrderDetail = this.getView().getModel('local').getProperty('/orderItems')
var x = cells[2].getValue()  - cells[2].getValue();
var selectedMatData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
// cells[9].setValue(cells[1].getValue() * cells[2].getValue() / 100);
// this.byId("idTunch")
}
});
});
