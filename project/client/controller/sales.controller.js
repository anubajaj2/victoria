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

  var oRouter = this.getRouter();
  oRouter.getRoute("sales").attachMatched(this._onRouteMatched, this);
  this.orderItem(oEvent);
// Return Item Table as input table
  this.orderReturn();
    },

_onRouteMatched:function(oEvent){
  var that = this;
  this.onClear(oEvent);
},

//customer value help
valueHelpCustomer:function(oEvent){

this.getCustomerPopup(oEvent);
},
getRouter: function() {
  return this.getOwnerComponent().getRouter();
},
onConfirm:function(oEvent){

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
//on order valuehelp,get the exsisting order from //DB
var that = this;
debugger;
this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                  "/OrderHeaders", "GET", {}, {}, this)
        .then(function(oData) {
         for (var i = 0; i < oData.results.length; i++) {
        that.allMasterData.orderHeader[oData.results[i].id] = oData.results[i];
                }
              })
        .catch(function(oError) {
        var oPopover = that.getErrorMessage(oError);
                })
        that.orderPopup(oEvent);
            },
//on order create Button
orderCreate:function(oEvent){
var that = this;
that.getView().setBusy(true);
// get the data from screen in local model

var orderData = this.getView().getModel('local').getProperty("/orderHeader");
if (orderData.Customer === "") {
      this.getView().byId("Sales--customerId").setValueState("Error").setValueStateText("Mandatory Input");
      that.getView().setBusy(false);
    }
else {

//call the odata promise method to post the data
orderData.Date = this.getView().byId("Sales--DateId").getValue();
this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/OrderHeaders",
                          "POST", {}, orderData, this)
             .then(function(oData) {
                  that.getView().setBusy(false);

                  //create the new json model and get the order id no generated
        var oOrderId = that.getView().getModel('local').getProperty('/OrderId');
        oOrderId.OrderId=oData.id;
        oOrderId.OrderNo=oData.OrderNo;
        that.getView().getModel('local').setProperty('/OrderId',oOrderId);
        //assign the no on ui
        that.getView().getModel("local").setProperty("/orderHeader/OrderNo", oData.OrderNo);
               })
        .catch(function(oError) {
          that.getView().setBusy(false);
          var oPopover = that.getErrorMessage(oError);
            		});
              }
            },

onSave:function(oEvent){
  var that = this;

  var oHeader = this.getView().getModel('local').getProperty('/orderHeader');
  if(oHeader.OrderNo === 0){
      MessageBox.show(
  			"Please create Order Number first", {
  				icon: MessageBox.Icon.ERROR,
  				title: "Error",
  				actions: [MessageBox.Action.OK],
  				onClose: function(oAction) { }
  			}
  		);
    that.getView().setBusy(false);
  }
else {
if (oHeader.OrderNo !== "" &&
    oHeader.OrderNo !== 0) {

var oId = that.getView().getModel('local').getProperty('/OrderId').OrderId;
// this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
//                       "/OrderHeaders('"+ oId +"')", "PUT",
//                        {},oHeader, this)
// .then(function(oData) {
//   message.show("testing");
//       that.getView().setBusy(false);
//
//      })
// .catch(function(oError) {
//     that.getView().setBusy(false);
//     var oPopover = that.getErrorMessage(oError);
//               });
          }
var oOrderDetail = this.getView().getModel('local').getProperty('/OrderItem')
var oTableDetails = this.getView().byId('orderItemBases');
var oBinding = oTableDetails.getBinding("rows");
debugger;
var msg = "";
// var aItems = this.getView().getModel("Items").getProperty("/");

for (var i = 0; i < oBinding.getLength(); i++) {
  var that = this;
  this.getView().setBusy(true);
  var data = oBinding.oList[i];

//posting the data
if (data.Material !== "") {
  oOrderDetail.OrderNo=oId;//orderno // ID
  oOrderDetail.Material=data.Material;

if(data.Qty === "" || data.Qty === 0) {
msg += "Row #"+ (i+1)+"\n";
MessageBox.show(
  "Please Enter the quantity at" + msg, {
    icon: MessageBox.Icon.ERROR,
    title: "Error",
    actions: [MessageBox.Action.OK],
    onClose: function(oAction) {
      this.getView().setBusy(false);
      return;
    }
  })
  this.getView().setBusy(false);
  return;
}else {
    oOrderDetail.Qty=data.Qty;
}
//Making charges
if(data.Making === "" || data.Making === 0) {
msg += "Row #" + (i+1)+"\n";
MessageBox.show(
  "Please Enter the Making at" + msg, {
    icon: MessageBox.Icon.ERROR,
    title: "Error",
    actions: [MessageBox.Action.OK],
    onClose: function(oAction) {
      this.getView().setBusy(false);
      return;
    }
  })
  this.getView().setBusy(false);
  return;
}else {
    oOrderDetail.Making=data.Making;
}
//Weight check
if(data.Weight === "" || data.Weight === 0) {
msg += "Row #" + (i+1)+"\n";
MessageBox.show(
  "Please Enter the Weight at" + msg, {
    icon: MessageBox.Icon.ERROR,
    title: "Error",
    actions: [MessageBox.Action.OK],
    onClose: function(oAction) {
      this.getView().setBusy(false);
      return;
    }
  })
  this.getView().setBusy(false);
  return;
}else {
    oOrderDetail.Weight =data.Weight;
}
  // oOrderDetail.Making=data.Making quantityD
  oOrderDetail.QtyD=data.QtyD;
  oOrderDetail.MakingD=data.MakingD;
  oOrderDetail.WeightD=data.WeightD;
  oOrderDetail.Remarks=data.Remarks;
  oOrderDetail.SubTotal=data.SubTot;
  var oOrderDetailsClone = JSON.parse(JSON.stringify(oOrderDetail));
//Item data save
    this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/OrderItems","POST", {}, oOrderDetailsClone, this)
                 .then(function(oData) {
                      that.getView().setBusy(false);
                      sap.m.MessageToast.show("Data Saved Successfully");
                      var id = oData.id;

                   })
                .catch(function(oError) {
    that.getView().setBusy(false);
    var oPopover = that.getErrorMessage(oError);
                		});
}//If condition end
}//for loop brace end
}
},

onClear:function(oEvent){

//Clear Header Details
var oHeader = this.getView().getModel('local').getProperty('/orderHeader');
var oHeaderT = this.getView().getModel('local').getProperty('/orderHeaderTemp');
oHeaderT.CustomerName ="";
oHeaderT.CustomerId="";
oHeader.OrderNo="";
this.getView().getModel('local').setProperty('/orderHeaderTemp',oHeaderT);
// oHeader.Date=new Date();
this.getView().getModel('local').setProperty('/orderHeader',oHeader);
this.getView().getModel("local").setProperty("/orderHeader/Date", formatter.getFormattedDate(0));
this.getView().byId("Sales--DateId").setDateValue(new Date());

//Clear Item table
this.orderItem(oEvent);
this.orderReturn();
},

OnCustChange:function(){

},

ValueChange:function(oEvent){

  var orderHeader = this.getView().getModel('local').getProperty('/orderHeader');
  var category = this.getView().byId("orderItemBases").getModel("orderItems").getProperty(oEvent.getSource().getParent().getBindingContext("orderItems").getPath());
  var oCurrentRow = oEvent.getSource().getParent();
  var cells = oCurrentRow.getCells();
// X = Weight - WeightD
  var x = cells[4].getValue()  - cells[5].getValue();
  if (category.Category === 'gm') {
// Y = X * Making (if per gm)
    var y = x * cells[6].getValue();
  }
  else if (category.Category === 'pcs') {
//y = Qty * Making (if per pc)
    var y = cells[2].getValue() * cells[6].getValue();
  }
  if (cells[3].getValue() &&
      cells[7].getValue()) {
 var z =  cells[3].getValue() * cells[7].getValue();
  }
  if (category.Type === "Silver") {
 //InterSubTotal = X * Bhav ( Silver)
 var InterSubTotal = x * orderHeader.SilverBhav;
  }
  else if (category.Type === "Gold") {
var InterSubTotal = x * orderHeader.Goldbhav1;
  }
cells[9].setValue( InterSubTotal + y + z );
this.byId("IdMaking");
this.byId("IdMakingD");
this.byId("IdWeightD");
this.byId("Idweight");
this.byId("IdQty");
this.byId("IdQtyD");
}//ValueChange function end

});
});
