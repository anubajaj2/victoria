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
    },

_onRouteMatched:function(oEvent){
  var that = this;
  this.onClear(oEvent);
  // this.fetchValuesFromCustomizing();
},

//customer value help
valueHelpCustomer:function(oEvent){

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
// if (oSource[0] === 'idCoCustPopup'){

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
//               }
// else {
              //   if (osource.split("--")[2]==="orderHeader") {
              //       var myData = this.getView().getModel("local").getProperty("/orderHeader");
              //   }

              // }
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

onValidation: function() {
  var that = this;
  //---all validation true
  var retVal = true;
  //header validations
  var oHeader = this.getView().getModel('local').getProperty('/orderHeader');
  if(oHeader.OrderNo === 0 ||
     oHeader.OrderNo === ""){
    retVal = false;
      MessageBox.show(
        "Please create Order Number first", {
          icon: MessageBox.Icon.ERROR,
          title: "Error",
          actions: [MessageBox.Action.OK],
          onClose: function(oAction) { }
        }
      );
    }
    that.getView().setBusy(false);
  return retVal;
},
// onValidationItem:function[data ,oOrderDetail ,retVal]{
// //line item validations
//   var that = this;
//   //---all validation true initially
//   var retVal = true;
//
//
// that.getView().setBusy(false);
// //line item validations
// return retVal;
// },
onSave:function(oEvent){
  var that = this;
  if(this.onValidation() === true){
    //POST code will be here

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

var oOrderDetail = this.getView().getModel('local').getProperty('/OrderItem')
var oTableDetails = this.getView().byId('orderItemBases');
var oBinding = oTableDetails.getBinding("rows");
debugger;
for (var i = 0; i < oBinding.getLength(); i++) {
  var returnval = false;
  var that = this;
  this.getView().setBusy(true);
  var data = oBinding.oList[i];
debugger;

//posting the data
if (data.Material !== "") {
  // this.onValidationItem(data ,oOrderDetail ,return);
  // if (return === true) {
  //   debugger;
  // }
  //Quantity
  if(data.Qty === "" || data.Qty === 0) {
    this.getView().setBusy(false);
    oTableDetails.getRows()[i].getCells()[2].setValueState("Error");
    returnval = true;
    return;
    }else {
      oOrderDetail.Qty=data.Qty;
      oTableDetails.getRows()[i].getCells()[2].setValueState("None");
      returnval = false;
  }

  //Weight check
  if(data.Weight === "" || data.Weight === 0) {
  this.getView().setBusy(false);
  oTableDetails.getRows()[i].getCells()[4].setValueState("Error");
  returnval = true;
  return;
  }else {
  oOrderDetail.Weight =data.Weight;
  oTableDetails.getRows()[i].getCells()[4].setValueState("None");
  returnval = false;
  }
  //WeightD
  if (data.WeightD === "" || data.WeightD === 0) {
    oOrderDetail.WeightD= 0;
  }else {
    oOrderDetail.WeightD=data.WeightD;
    returnval = false;
  }
  oOrderDetail.OrderNo=oId;//orderno // ID
  oOrderDetail.Material=data.Material;
  // QuantityD
  if (data.QtyD === "" || data.QtyD === 0) {
    oOrderDetail.QtyD= 0;
  }else {
    oOrderDetail.QtyD=data.QtyD;
  }
  //making
    if (data.Making === "" || data.Making === 0) {
      oOrderDetail.Making= 0;
    }else {
      oOrderDetail.Making=data.Making;
    }
  //makingD
    if (data.MakingD === "" || data.MakingD === 0) {
      oOrderDetail.MakingD= 0;
    }else {
      oOrderDetail.MakingD=data.MakingD;
    }
  oOrderDetail.Remarks=data.Remarks;
  oOrderDetail.SubTotal=data.SubTot;
  var oOrderDetailsClone = JSON.parse(JSON.stringify(oOrderDetail));
  if (returnval === false) {
    that.getView().setBusy(true);
//Item data save
    this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/OrderItems","POST", {}, oOrderDetailsClone, this)
    .then(function(oData) {
      debugger;
          sap.m.MessageToast.show("Data Saved Successfully");
          that.getView().setBusy(false);
//get the id generated at after saving of data
var orderItemBase = that.getView().getModel('local').getProperty('/orderItemBase');
    orderItemBase.itemNo = oData.id;
    orderItemBase.Material= oData.Material;
    orderItemBase.OrderNo= oData.OrderNo;
    orderItemBase.Making= oData.Making;
    orderItemBase.Weight= oData.Weight;
    that.getView().getModel('local').setProperty('/orderItemBase',orderItemBase);
                   })
    .catch(function(oError) {
    that.getView().setBusy(false);
    var oPopover = that.getErrorMessage(oError);
                		});
  }//return if check
  else {
    this.getView().setBusy(false);
  }
}//If condition end
}//for loop brace end
}else{  //validation order if else condition
  //please correct the data...
}
},

onClear:function(oEvent){
debugger;
var that = this;
//Clear Header Details
var oHeader = this.getView().getModel('local').getProperty('/orderHeader');
var oHeaderT = this.getView().getModel('local').getProperty('/orderHeaderTemp');
oHeaderT.CustomerName ="";
oHeaderT.CustomerId="";
oHeader.OrderNo="";
oHeader.Goldbhav22=0;
oHeader.Goldbhav20=0;
oHeader.Goldbhav=0;
oHeader.SilverBhav=0;
this.getView().getModel('local').setProperty('/orderHeaderTemp',oHeaderT);
// oHeader.Date=new Date();
this.getView().getModel('local').setProperty('/orderHeader',oHeader);
this.getView().getModel("local").setProperty("/orderHeader/Date", formatter.getFormattedDate(0));
this.getView().byId("Sales--DateId").setDateValue(new Date());
debugger;
//set the bhav details on Header
this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                  "/CustomCalculation", "GET", {}, {}, this)
  .then(function(oData) {
    debugger;
    that.getView().getModel("local").setProperty("/orderHeader/Goldbhav22", oData.results[0].First);
    that.getView().getModel("local").setProperty("/orderHeader/Goldbhav20", oData.results[0].Second);
    that.getView().getModel("local").setProperty("/orderHeader/GoldBhav", oData.results[0].Gold);
    that.getView().getModel("local").setProperty("/orderHeader/SilverBhav", oData.results[0].Silver);
  }).catch(function(oError) {
    that.getView().getModel("local").setProperty("/orderHeader/Goldbhav22", 0);
    that.getView().getModel("local").setProperty("/orderHeader/Goldbhav20", 0);
    that.getView().getModel("local").setProperty("/orderHeader/GoldBhav", 0);
    that.getView().getModel("local").setProperty("/orderHeader/SilverBhav", 0);
  });
//Clear Item table
this.orderItem(oEvent);
this.orderReturn();
},

OnCustChange:function(){

},
ValueChangeMaterial: function(oEvent){
  var oSource = oEvent.getSource();
  var oFilter = new sap.ui.model.Filter("ProductCode",
  sap.ui.model.FilterOperator.Contains, oEvent.getParameter("suggestValue"));
  oSource.getBinding("suggestionItems").filter(oFilter);
},
ValueChange:function(oEvent){
debugger;
  this.Calculation(oEvent);
},//ValueChange function end

Calculation:function(oEvent){
debugger;
  var orderHeader = this.getView().getModel('local').getProperty('/orderHeader');
  var category = this.getView().byId("orderItemBases").getModel("orderItems").getProperty(oEvent.getSource().getParent().getBindingContext("orderItems").getPath());
  var oCurrentRow = oEvent.getSource().getParent();
  var cells = oCurrentRow.getCells();

if (category.Type === 'Gold' || category.Type === 'Silver')
{

//Quantity Check
if (cells[3].getValue() !== "" ||
    cells[3].getValue() !== 0) {
// X = Quantity - QuantityD
var x = cells[2].getValue() - cells[3].getValue();
}else {
var x = cells[2].getValue();
cells[3].setValue(0);
}//cell[2] / quantity check

// check D value i.e Diamond values
  if (cells[3].getValue() !== 0 || cells[3].getValue() !=="" &&
     cells[7].getValue() !== 0 || cells[7].getValue() !=="") {
  var z = cells[3].getValue() * cells[7].getValue();
  }

//get if its type is silver or gold
if (category.Type === 'Gold') {
 // get the bhav details
 if (category.Karat === "22/22") {
   var innerSubTotal = orderHeader.Goldbhav1 * x;
  }else
 if (category.Karat === '22/20') {
 var innerSubTotal = orderHeader.Goldbhav2 * x;
   }
 }else
if (category.Type === 'Silver') {
  var innerSubTotal = orderHeader.SilverBhav * x;
}//type Silver check end

//calculation on pcs
if (category.Category === 'pcs') {
  //Making charges
  if (cells[6].getValue() !== 0 || cells[6].getValue() !=="" &&
      cells[2].getValue() !== 0 || cells[2].getValue() !=="" )
    {
  var y = cells[2].getValue() * cells[6].getValue();
  }else {
    cells[6].setValue(0);
    cells[2].setValue(0);
  }
  }else //calculation on pcs
if (category.Category === 'gm') {
//Making charges
if (cells[6].getValue() !== 0 || cells[6].getValue() !=="")
  {
var y = x * cells[6].getValue();
}else {
  cells[6].setValue(0);
}
}//category.category endif
if (!innerSubTotal) {
  innerSubTotal = 0;
}
if (!y) {
  y=0;
}
if (!z) {
  z=0;
}
cells[9].setValue(innerSubTotal + y + z);
}else
if (category.Type === 'GS') {
//german silver//ignore Weight//Quantity Check
if (cells[3].getValue() !== "" ||
    cells[3].getValue() !== 0) {
// X = Quantity - QuantityD
  var x = cells[2].getValue() - cells[3].getValue();
}else {
  var x = cells[2].getValue();
  cells[3].setValue(0);
}//cell[2] / quantity check
// making charges
if (cells[7].getValue() !== 0 || cells[7].getValue() !=="")
{
var y =  cells[6].getValue() - cells[7].getValue();
}else {
var y =  cells[6].getValue();
cells[7].setValue(0);
}
cells[9].setValue(x * y);
}

  this.byId("IdMaking");
  this.byId("IdMakingD");
  this.byId("IdWeightD");
  this.byId("Idweight");
  this.byId("IdQty");
  this.byId("IdQtyD");
}//calculation function end

});
});
