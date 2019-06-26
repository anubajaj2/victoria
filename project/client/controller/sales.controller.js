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
this.getView().byId("Sales--custName").setText(selCustName);
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
this.getView().byId("Sales--customerId").setValueState("None");
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

onValidationItem:function(data,i)
{
//line item validations
  var that = this;
  var model = this.getView().getModel("orderItems").getProperty("/itemData");
  var oOrderDetail = that.getView().getModel('local').getProperty('/OrderItem');
  var oTableDetails = that.getView().byId("orderItemBases");
  var tableBinding = oTableDetails.getBinding("rows");
//---all errors are false
  var returnError = false;
  //Quantity
  if ((data.Type === 'GS') ||
  ((data.Type === 'Gold' && data.Category === "pcs") ||
  (data.Type === 'Silver' && data.Category ==="pcs")))
  {
  if(data.Qty === "" || data.Qty === 0) {
    this.getView().setBusy(false);
    oTableDetails.getRows()[i].getCells()[2].setValueState("Error");
    returnError = true;
    return;
    }else {
      oOrderDetail.Qty=data.Qty;
      oTableDetails.getRows()[i].getCells()[2].setValueState("None");
      this.getView().setBusy(false);
      returnError = false;
  }
}else
if ((data.Type === 'Gold' && data.Category === "gm")||
    (data.Type === 'Silver' && data.Category === "gm"))
    {
  //Weight check
  if(data.Weight === "" || data.Weight === 0) {
  this.getView().setBusy(false);
  oTableDetails.getRows()[i].getCells()[4].setValueState("Error");
  returnError = true;
  return;
  }else {
  oOrderDetail.Weight =data.Weight;
  oTableDetails.getRows()[i].getCells()[4].setValueState("None");
  this.getView().setBusy(false);
  returnError = false;
  }
}//Gold/Silver check
return returnError;
},
onReturnSave:function(oEvent) {
var returnTable = this.getView().getModel('local').getProperty('/OrderReturn');
var oReturnTable = this.getView().byId('OrderReturn');
var oBindingR = oReturnTable.getBinding("rows");
for (var i = 0; i < oBindingR.getLength(); i++) {
  var that = this;
  var data = oBindingR.oList[i];

//return data save
    that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/OrderReturns","POST", {}, oOrderDetailsClone, this)
    .then(function(oData) {
      debugger;

      })
    .catch(function(oError){
    that.getView().setBusy(false);
    var oPopover = that.getErrorMessage(oError);
                		});
}//forloop
},
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
debugger;
var oOrderDetail = this.getView().getModel('local').getProperty('/OrderItem')
var oTableDetails = this.getView().byId('orderItemBases');
var oBinding = oTableDetails.getBinding("rows");
var valueCheck = false;
debugger;
for (var i = 0; i < oBinding.getLength(); i++) {
  var that = this;
  var data = oBinding.oList[i];
// if (data.itemNo === "") {
//posting the data
if (data.Material !== "") {
  valueCheck = true;
  this.getView().setBusy(true);
  if (this.onValidationItem(data,i) === false) {
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
    that.getView().setBusy(true);
//Item data save
    that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/OrderItems","POST", {}, oOrderDetailsClone, this)
    .then(function(oData) {
      debugger;
      //loop the detaisl
      var allItems = that.getView().getModel("orderItems").getProperty("/itemData");
      for (var i = 0; i < allItems.length; i++) {
        if (allItems[i].Material === oData.Material) {
          allItems[i].itemNo = oData.id;
          break;
        }//material compare if condition
      }//for loop
      that.getView().getModel("orderItems").setProperty("/itemData",allItems);
      sap.m.MessageToast.show("Data Saved Successfully");
      that.getView().setBusy(false);
      })
    .catch(function(oError){
    that.getView().setBusy(false);
    var oPopover = that.getErrorMessage(oError);
                		});
}//validation endif
}//If condition end
// }//itemNo == "" check
}//for loop brace end
//error if no valid entry
if (valueCheck === false) {
  sap.m.MessageBox.error("Please Enter Valid entries before save",{
  title: "Error",                                    // default
  styleClass: "",                                      // default
  initialFocus: null,                                  // default
  textDirection: sap.ui.core.TextDirection.Inherit,     // default
  onClose : function(sButton){}
  });
}
}else {

}
},

onClear:function(oEvent){
var that = this;
var ovisibleSet = new sap.ui.model.json.JSONModel({
  set:true
  });
  this.setModel(ovisibleSet, "VisibleSet");
//Clear Header Details
var oHeader = this.getView().getModel('local').getProperty('/orderHeader');
var oHeaderT = this.getView().getModel('local').getProperty('/orderHeaderTemp');
// oHeaderT.CustomerName ="";
this.getView().byId("Sales--custName").setText("");
oHeaderT.CustomerId="";
oHeader.OrderNo="";
oHeader.Customer="";
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
    "/CustomCalculations", "GET", {}, {}, this)
  .then(function(oData) {
    debugger;
    that.getView().getModel("local").setProperty("/CustomCalculations",oData);
    that.getView().getModel("local").setProperty("/orderHeader/Goldbhav22", oData.results[0].First);
    that.getView().getModel("local").setProperty("/orderHeader/Goldbhav20", oData.results[0].Second);
    that.getView().getModel("local").setProperty("/orderHeader/Goldbhav", oData.results[0].Gold);
    that.getView().getModel("local").setProperty("/orderHeader/SilverBhav", oData.results[0].Silver);
  }).catch(function(oError) {
    that.getView().getModel("local").setProperty("/orderHeader/Goldbhav22", 0);
    that.getView().getModel("local").setProperty("/orderHeader/Goldbhav20", 0);
    that.getView().getModel("local").setProperty("/orderHeader/Goldbhav", 0);
    that.getView().getModel("local").setProperty("/orderHeader/SilverBhav", 0);
  });
//Clear Item table
this.orderItem(oEvent);
//return table
this.orderReturn(oEvent);
},

onDelete: function(oEvent) {
  debugger;
  var that = this;
var oSourceCall = oEvent.getSource().getParent().getParent().getId().split('---')[1].split('--')[1];
// var selIdxs = that.getView().byId("orderItemBases").getSelectedIndices();
var selIdxs = that.getView().byId(oSourceCall).getSelectedIndices();
if (selIdxs.length && selIdxs.length !== 0) {
  sap.m.MessageBox.confirm("Are you sure to delete the selected entries",{
  title: "Confirm",                                    // default
  styleClass: "",                                      // default
  initialFocus: null,                                  // default
  textDirection: sap.ui.core.TextDirection.Inherit,     // default
  onClose : function(sButton){
    debugger;
  if (sButton === MessageBox.Action.OK) {
    // var selIdxs = that.getView().byId("orderItemBases").getSelectedIndices();
      for(var i=0; i <= selIdxs.length; i++){
        var index = selIdxs[i];
        for (var j = index; j <= index; j++) {
      if (oSourceCall === 'orderItemBases') {
        var id  = that.getView().getModel("orderItems").getProperty("/itemData")[j].itemNo;
        if (id){
        that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/OrderItems('" + id + "')",
                                  "DELETE", {}, {}, that)
        sap.m.MessageToast.show("Data Deleted Successfully");
        }
        var oTableData = that.getView().getModel("orderItems").getProperty("/itemData");
        oTableData.splice(j, 1);
        that.getView().getModel("orderItems").setProperty("/itemData",oTableData);
        that.getView().byId("orderItemBases").clearSelection();

      for(var j=0; j <= selIdxs.length; j++){
          var oTableData = that.getView().getModel("orderItems").getProperty("/itemData");
          oTableData.push(
            {
    					"OrderNo": "",
    					"itemNo": "",
    					"Material":"",
    					"MaterialCode":"",
    					"Description": "",
    					"Qty": 0,
    					"QtyD": 0,
    					"Weight":0,
    					"WeightD":0,
    					"Making":0,
    					"MakingD":0,
    					"Tunch":0,
    					"Remarks": "",
    					"SubTotal":0,
    					"SubTotalS":0,
    					"SubTotalG":0,
    					"Category": "",
    					"CreatedBy": "",
    					"CreatedOn": "",
    					"ChangedBy": "",
    					"ChangedOn": ""
    				}
          );
          that.getView().getModel("orderItems").setProperty("/itemData",oTableData);
      }
    }//sourcecallCheck
    else if (oSourceCall === 'OrderReturn') {
      debugger;
      var id  = that.getView().getModel("OrderReturns").getProperty("/itemData")[j].itemNo;
      if (id){
      that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/OrderItems('" + id + "')",
                                "DELETE", {}, {}, that)
      sap.m.MessageToast.show("Data Deleted Successfully");
      }
      var oTableData = that.getView().getModel("returnModel").getProperty("/TransData");
      oTableData.splice(j, 1);
      that.getView().getModel("returnModel").setProperty("/TransData",oTableData);
      that.getView().byId("returnModel").clearSelection();
    }
    }//for j loop
    }//for i loop
}//
}
});

}else { // if selindx length check
  MessageBox.show(
    "Please Select the entry to be deleted", {
      icon: MessageBox.Icon.ERROR,
      title: "Error",
      actions: [MessageBox.Action.OK],
      onClose: function(oAction) { }
      });
}
},
onSetting:function(oEvent){
  this.hideDColumns(oEvent);
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
  var path = this.getView().byId('orderItemBases').getBinding().getPath() + '/' + oEvent.getSource().getParent().getIndex();
  var data = this.getView().getModel('orderItems').getProperty(path);
  var priceF = 0.00;
  var tempWeight  = 0.00;
  var fieldId = oEvent.getSource().getId().split('---')[1].split('--')[1].split('-')[0];
  var newValue = oEvent.getParameters().newValue;
//per gm
  var gold22pergm = orderHeader.Goldbhav22 / 10;
  var gold20pergm = orderHeader.Goldbhav20 / 10;
  var silverpergm = orderHeader.SilverBhav / 1000;
  var oLocale = new sap.ui.core.Locale("en-US");
  var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);

if ((category.Type === 'Gold' && category.Category === "gm") ||
    (category.Type === 'Silver' && category.Category === "gm"))
{
//get the weight
// if (cells[4].getValue() !== "") {

if (fieldId === "IdWeight") {
  if (data.Weight !== newValue) {
    data.Weight = newValue;
  }
}
if ( data.Weight === "" ){
  var weight = 0;
}else
  if (data.Weight === 0) {
    var weight = 0;
  }else{
    var weight  = oFloatFormat.parse(data.Weight);
  }

// if (cells[5].getValue() !== "") {
if (fieldId === "IdWeightD") {
  if (data.WeightD !== newValue) {
    data.WeightD = newValue;
  }
}
if ( data.WeightD === "") {
  var weightD = 0;
} else if(data.WeightD ===0){
  var weightD = 0;
}else {
   var weightD = oFloatFormat.parse(data.WeightD);
}

//get the final weight
if (weightD !== "" ||
    weightD !== 0) {
var weightF = weight - weightD;
}else {
var weightF = weight;
}

if (category.Type === 'Gold' ) {
//get the gold price
if (category.Karat === '22/22') {
priceF = weightF * gold22pergm;
}else
if (category.Karat === '22/20') {
priceF = weightF * gold20pergm;
}
}else if (category.Type === 'Silver') {
  priceF = weightF * silverpergm;
}

//get the making charges
// if (cells[6].getValue() !== "") {
if (fieldId === "IdMaking") {
  if (data.Making !== newValue) {
    data.Making = newValue;
  }
}
if (data.Making === "") {
  data.Making = 0;
  var making = 0;
}else if (data.Making ===0) {
data.Making = 0;
var making = 0;
}else {
  var making = oFloatFormat.parse(data.Making);
}

//making D
// if (cells[7].getValue() !== "") {
if (fieldId === "IdMakingD") {
  if (data.MakingD !== newValue) {
    data.MakingD = newValue;
  }
}
if (data.MakingD === "" ){
  data.MakingD=0;
  var makingD = 0;
}else if (data.MakingD === 0) {
  data.MakingD=0;
  var makingD = 0;
}else {
  var makingD = oFloatFormat.parse(data.MakingD);
}

//Making charges
var makingCharges  = making * weightF;

// quantity of stone / quantityD
// if (cells[3].getValue() !== "") {
if (fieldId === "IdQtyD") {
  if (data.QtyD !== newValue) {
    data.QtyD = newValue;
  }
}
if (data.QtyD === ""){
  data.QtyD = 0;
  var quantityD = 0;
  var quantityOfStone = 0;
}else if (data.QtyD === 0) {
  data.QtyD = 0;
  var quantityD = 0;
  var quantityOfStone = 0;
}else {
  var quantityD = oFloatFormat.parse(data.QtyD);
  var quantityOfStone = quantityD;
}

var stonevalue = quantityOfStone * makingD;
if (priceF || makingCharges || stonevalue) {
  // gold price per gram
  cells[cells.length - 1].setText(priceF + makingCharges + stonevalue);
}else {
  cells[cells.length - 1].setText(0)
}
}else
if (category.Type === 'GS') {
  debugger;
//german silver//ignore Weight//Quantity Check
//quantity
  if (fieldId === "IdQty") {
    if (data.Qty !== newValue) {
      data.Qty = newValue;
    }}
  if (data.Qty === ""){
    data.Qty = 0;
    var quantity = 0;
  }else if (data.Qty === 0 || data.Qty === "0") {
    data.Qty = 0;
    var quantity = 0;
  }else {
    var quantity = oFloatFormat.parse(data.Qty);
  }

//Making charges
if (fieldId === "IdMaking") {
  if (data.Making !== newValue) {
    data.Making = newValue;
  }
}
    if (data.Making === "") {
      data.Making = 0;
      var making = 0;
    }else if (data.Making ===0) {
    data.Making = 0;
    var making = 0;
    }else {
      var making = oFloatFormat.parse(data.Making);
    }
//charges of german silver
var charges = quantity * making ;

//QuantityD
if (fieldId === "IdQtyD") {
  if (data.QtyD !== newValue) {
    data.QtyD = newValue;
  }
}
  if (data.QtyD === ""){
    data.QtyD = 0;
    var quantityD = 0;
    var quantityOfStone = 0;
  }else if (data.QtyD === 0 || data.QtyD === "0") {
    var quantityD = 0;
    var quantityOfStone = 0;
  }else {
    var quantityD = oFloatFormat.parse(data.QtyD);
    var quantityOfStone = quantityD;
  }

// makingD charges
if (fieldId === "IdMakingD") {
  if (data.MakingD !== newValue) {
    data.MakingD = newValue;
  }
}
if (data.MakingD === "" ){
   data.MakingD=0;
  var makingD = 0;
  }else if (data.MakingD === 0) {
    data.MakingD=0;
    var makingD = 0;
  }else {
    var makingD = oFloatFormat.parse(data.MakingD);
  }
var chargesD = quantityD * makingD;
//final charges on GS
if (charges) {
cells[cells.length - 1].setText( charges + chargesD);
}else {
  cells[cells.length - 1].setText(0);
}
}
else if ((category.Type ==="Gold" && category.Category === "pcs")||
        (category.Type === 'Silver' && category.Category === "pcs"))
{

//quantity
  if (fieldId === "IdQty") {
    if (data.Qty !== newValue) {
      data.Qty = newValue;
    }}
  if (data.Qty === ""){
    data.Qty = 0;
    var quantity = 0;
  }else if (data.Qty === 0 || data.Qty === "0") {
    data.Qty = 0;
    var quantity = 0;
  }else {
    var quantity = oFloatFormat.parse(data.Qty);
  }

//QuantityD
if (fieldId === "IdQtyD") {
  if (data.QtyD !== newValue) {
    data.QtyD = newValue;
  }
}
  if (data.QtyD === ""){
    data.QtyD = 0;
    var quantityD = 0;
    var quantityOfStone = 0;
  }else if (data.QtyD === 0 || data.QtyD === "0") {
    var quantityD = 0;
    var quantityOfStone = 0;
  }else {
    var quantityD = oFloatFormat.parse(data.QtyD);
    var quantityOfStone = quantityD;
  }

  if (fieldId === "IdWeight") {
    if (data.Weight !== newValue) {
      data.Weight = newValue;
    }
  }
  if ( data.Weight === "" ){
    var weight = 0;
  }else
    if (data.Weight === 0 || data.Weight === "0") {
      var weight = 0;
    }else{
      var weight  = oFloatFormat.parse(data.Weight);
    }

    if (fieldId === "IdWeightD") {
      if (data.WeightD !== newValue) {
        data.WeightD = newValue;
      }
    }
    if ( data.WeightD === "" ) {
      var weightD = 0;
    } else if(data.WeightD ===0 || data.Weight === "0"){
      var weightD = 0;
    }else {
       var weightD = oFloatFormat.parse(data.WeightD);
    }

    //get the final weight
    if (weightD !== "" ||
        weightD !== 0) {
    var weightF = weight - weightD;
    }else {
    var weightF = weight;
    }

    if (category.Type === 'Gold' ) {
    //get the gold price
    if (category.Karat === '22/22') {
    priceF = weightF * gold22pergm;
    }else
    if (category.Karat === '22/20') {
    priceF = weightF * gold20pergm;
    }
    }else if (category.Type === 'Silver') {
      priceF = weightF * silverpergm;
    }
    if (!priceF) {
      var priceF = 0;
    }

//Making charges
if (fieldId === "IdMaking") {
  if (data.Making !== newValue) {
    data.Making = newValue;
  }
}
    if (data.Making === "") {
      data.Making = 0;
      var making = 0;
    }else if (data.Making ===0) {
    data.Making = 0;
    var making = 0;
    }else {
      var making = oFloatFormat.parse(data.Making);
    }

//making D
// if (cells[7].getValue() !== "") {
if (fieldId === "IdMakingD") {
  if (data.MakingD !== newValue) {
    data.MakingD = newValue;
  }
}
if (data.MakingD === "" ){
   data.MakingD=0;
  var makingD = 0;
  }else if (data.MakingD === 0) {
    data.MakingD=0;
    var makingD = 0;
  }else {
    var makingD = oFloatFormat.parse(data.MakingD);
  }

//Making of Product
var makingOfProduct = quantity * making;
if (!makingOfProduct) {
  var makingOfProduct = 0;
}
//Stone value
var stonevalue = quantityOfStone * makingD;
if (!stonevalue) {
  var stonevalue = 0;
}

// if (quantity === 0) {
//   // cells[9].setValue(0);
//   cells[cells.length - 1].setText(0)
// }else {
if (priceF || makingOfProduct || stonevalue) {
  // gold price per gram
  // cells[9].setValue(priceF + makingCharges + stonevalue);
  cells[cells.length - 1].setText(priceF + makingOfProduct + stonevalue);
}else {
  // cells[9].setValue(0);
  cells[cells.length - 1].setText(0)
}
// }

}//end of per PCs calculation

  this.byId("IdMaking");
  this.byId("IdMakingD");
  this.byId("IdWeightD");
  this.byId("IdWeight");
  this.byId("IdQty");
  this.byId("IdQtyD");
  this.byId("sbhavid");
},//calculation function end
toggleFullScreen:function(){
  debugger;
  var btnId = "idFullScreenBtn";
  var headerId = "Sales--orderHeader";
  this.toggleUiTable(btnId,headerId)
}

});
});
