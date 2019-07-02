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
  //global Variables
  returnError : false,

onInit: function (oEvent) {
  BaseController.prototype.onInit.apply(this);
  this.byId("idTransferButton").setEnabled(false);
  var oRouter = this.getRouter();
  oRouter.getRoute("sales").attachMatched(this._onRouteMatched, this);
    },
_onRouteMatched:function(oEvent){
  var that = this;
  this.onClear(oEvent);
},
getIndianCurr:function(value){
debugger;
if(value){
  var x=value;
  x=x.toString();
  var lastThree = x.substring(x.length-3);
  var otherNumbers = x.substring(0,x.length-3);
  if(otherNumbers != '')
      lastThree = ',' + lastThree;
  var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return res;
}
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
this.byId("Sales--idSaveIcon").setColor('red');
//order popup
if (oEvent.getParameter('id') === 'orderNo'){
var orderDetail = this.getView().getModel('local').getProperty('/orderHeader');
var orderNo = oEvent.getParameter("selectedItem").getLabel();
var orderId = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
// this.OrderDetails(orderId);
this.getView().getModel("local").setProperty("/orderHeader/OrderNo",
                                                orderNo);
}else{
var oCustDetail = this.getView().getModel('local').getProperty('/orderHeaderTemp');
//customer popup
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
}},
//on order valuehelp,get the exsisting order from //DB
valueHelpOrder:function(oEvent){
this.orderPopup(oEvent);
},
//on order create Button
orderCreate:function(oEvent){
  debugger;
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
// //---all errors are false
  var returnError = false;
  //Quantity
  if ((data.Type === 'GS') ||
  ((data.Type === 'Gold' && data.Category === "pcs") ||
  (data.Type === 'Silver' && data.Category ==="pcs")))
  {
  if(data.Qty === "" || data.Qty === 0) {
    this.getView().setBusy(false);
    oTableDetails.getRows()[i].getCells()[2].setValueState("Error");
    oTableDetails.getRows()[i].getCells()[4].setValueState("None");
    returnError = true;
    return;
    }else {
      oOrderDetail.Qty=data.Qty;
      oTableDetails.getRows()[i].getCells()[2].setValueState("None");
      this.getView().setBusy(false);
      // returnError = false;
  }
}else
if ((data.Type === 'Gold' && data.Category === "gm")||
    (data.Type === 'Silver' && data.Category === "gm"))
    {
  //Weight check
  if(data.Weight === "" || data.Weight === 0) {
  this.getView().setBusy(false);
  oTableDetails.getRows()[i].getCells()[4].setValueState("Error");
  oTableDetails.getRows()[i].getCells()[2].setValueState("None");
  returnError = true;
  return;
  }else {
  oOrderDetail.Weight =data.Weight;
  oTableDetails.getRows()[i].getCells()[4].setValueState("None");
  this.getView().setBusy(false);
  // returnError = false;
  }
}//Gold/Silver check
return returnError;
},
onReturnSave:function(oEvent,oId,oCommit) {
var returnTable = this.getView().getModel('local').getProperty('/OrderReturn');
var oReturnTable = this.getView().byId('OrderReturn');
var oBindingR = oReturnTable.getBinding("rows");
for (var i = 0; i < oBindingR.getLength(); i++) {
  var that = this;
  var data = oBindingR.oList[i];
  //Type
  if (data.Type === "" || data.Type === 0) {
    returnTable.Type= 0;
  }else {
    returnTable.Type=data.Type;
    //OrderId
    if (oId) {
      returnTable.OrderNo=oId;
    }
  //Weight
  if (data.Weight === "" || data.Weight === 0) {
    returnTable.Weight= 0;
  }else {
    returnTable.Weight=data.Weight;
  }
//kWeight
if (data.KWeight === "" || data.KWeight === 0) {
  returnTable.KWeight= 0;
}else {
  returnTable.KWeight=data.KWeight;
}
//tunch
if (data.Tunch === "" || data.Tunch === 0) {
  returnTable.Tunch= 0;
}else {
  returnTable.Tunch=data.Tunch;
}
//Quantity
if (data.Qty === "" || data.Qty === 0) {
  returnTable.Qty= 0;
}else {
  returnTable.Qty=data.Qty;
}
//Bhav
if (data.Bhav === "" || data.Bhav === 0) {
  returnTable.Bhav= 0;
}else {
  returnTable.Bhav=data.Bhav;
}
//Remarks
if (data.Remarks === "") {
  returnTable.Remarks= "";
}else {
  returnTable.Remarks=data.Remarks;
}
//SubTotal
if (data.SubTotal === "" || data.SubTotal === 0) {
  returnTable.SubTotal= 0;
}else {
  returnTable.SubTotal=data.SubTotal;
}
debugger;
var oReturnOrderClone = JSON.parse(JSON.stringify(returnTable));
if (data.ReturnId) {
  that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                        "/OrderReturns('"+ oId +"')", "PUT",
                         {},oReturnOrderClone, that)
    .then(function(oData) {
       debugger;
    that.getView().setBusy(false);
             })
    .catch(function(oError){
     that.getView().setBusy(false);
     var oPopover = that.getErrorMessage(oError);
     		});
}else {
  //return data save
that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
            "/OrderReturns","POST", {}, oReturnOrderClone, that)
    .then(function(oData) {
        debugger;
      that.getView().setBusy(false);
        //loop the detaisl
  var allItems = that.getView().getModel("returnModel").getProperty("/TransData");
    for (var i = 0; i < allItems.length; i++) {
    if (allItems[i].Type === oData.Type) {
        allItems[i].ReturnId = oData.id;
        allItems[i].orderNo = oId;
        oCommit = true;
            break;
          }//material compare if condition
        }//for loop
        that.getView().getModel("returnModel").setProperty("/TransData",allItems);
        that.getView().setBusy(false);
        sap.m.MessageToast.show("Data Saved Successfully");
        })
    .catch(function(oError){
      that.getView().setBusy(false);
      var oPopover = that.getErrorMessage(oError);
                  		});
}//data.ReturnId else part

}//type check
}//forloop
return oCommit;
},
ValueChangeHeader:function(oEvent){
  var that = this;
  var oHeader = that.getView().getModel('local').getProperty('/orderHeader');
  var oTable = this.getView().byId("orderItemBases").getBinding('rows');
  var oPath = oTable.getPath();
  var oTableLength = oTable.getLength();
  var field = oEvent.getSource().getId().split('---')[1].split('--')[2];
  var newvalue = oEvent.getParameter('newValue');
  var oLocale = new sap.ui.core.Locale("en-US");
  var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
  if (field === 'Gbhav2Id') {
  if ( newvalue === "" ){
//Gold bhav 22/22
    oHeader.GoldBhav22 = 0;
  }else
  if (newvalue === 0) {
    oHeader.GoldBhav22 = 0;
  }else{
    oHeader.GoldBhav22  = oFloatFormat.parse(newvalue);
    }
  }else if (field === 'Gbhav1Id') {
//Gold bhav 22/20
    if ( newvalue === "" ){
      oHeader.GoldBhav20 = 0;
    }else
    if (newvalue === 0) {
      oHeader.GoldBhav20 = 0;
    }else{
      oHeader.GoldBhav20  = oFloatFormat.parse(newvalue);
    }
  }else if (field === 'GoldbhavId') {
  //Gold bhav
  if ( newvalue === "" ){
    oHeader.GoldBhav = 0;
  }else
  if (newvalue === 0) {
    oHeader.GoldBhav = 0;
  }else{
    oHeader.GoldBhav  = oFloatFormat.parse(newvalue);
  }
  }else if (field === 'sbhavid') {
//Silver Bhav
if ( newvalue === "" ){
  oHeader.SilverBhav = 0;
}else
if (newvalue === 0) {
  oHeader.SilverBhav = 0;
}else{
  oHeader.SilverBhav  = oFloatFormat.parse(newvalue);
}}
that.getView().getModel('local').setProperty('/orderHeader',oHeader);
  for (var i = 0; i < oTableLength; i++) {
    var oTablePath = oPath + '/' + i;
    this.Calculation(oEvent,oTablePath);
  }
},
onSave:function(oEvent){
var that = this;
//if header check pass
if(this.onValidation() === true){
//Item and value check
var oOrderDetail = this.getView().getModel('local').getProperty('/OrderItem')
var oTableDetails = this.getView().byId('orderItemBases');
var oBinding = oTableDetails.getBinding("rows");
var itemError = false;
var valueCheck = false;
var returnCheck = false;
for (var i = 0; i < oBinding.getLength(); i++) {
  var that = this;
  var data = oBinding.oList[i];
//posting the data
if (data.Material !== "") {
valueCheck = true;
//check to 1st check return table
debugger;
if (i=== 0 && returnCheck === false) {
//Return table values check
  if (this.onRetItemValidation() === false) {
    returnCheck = true;
  }
}
// valueCheck = true;
this.getView().setBusy(true);
//---all errors are false
var returnError = false;
if (this.onValidationItem(data,i,returnError) === false) {
  itemError = false;
}//validation endif
else {
  itemError = true;
}
}//If condition end
}//for loop brace end
if (returnCheck === true && itemError === false) {
this.commitRecords(oEvent);
}

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
commitRecords:function(oEvent){
  if (this.byId('Sales--idSaveIcon').getColor() === 'red') {
  var that = this;
  debugger;
  var oHeader = that.getView().getModel('local').getProperty('/orderHeader');
//order header put
  var oId = that.getView().getModel('local').getProperty('/OrderId').OrderId;
  that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                        "/OrderHeaders('"+ oId +"')", "PUT",
                         {},oHeader, this)
  .then(function(oData) {
    debugger;
    message.show("testing");
        that.getView().setBusy(false);

       })
  .catch(function(oError) {
      that.getView().setBusy(false);
      var oPopover = that.getErrorMessage(oError);
                });

  var oOrderDetail = this.getView().getModel('local').getProperty('/OrderItem')
  var oTableDetails = this.getView().byId('orderItemBases');
  var oBinding = oTableDetails.getBinding("rows");
  var itemError = false;
  var oCommit = false;
for (var i = 0; i < oBinding.getLength(); i++) {
  var that = this;
  var data = oBinding.oList[i];
  if (data.Material !== "") {
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
  debugger;
//Item data save
if (data.itemNo) {
  that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/OrderItems('"+ data.itemNo +"')","PUT", {},
          oOrderDetailsClone, this)
  .then(function(oData) {
        debugger;
        that.getView().setBusy(false);
        // if (oCommit === false) {
        // that.onReturnSave(oEvent,oId,oCommit);
        //     }
        // break;
  // that.getView().getModel("orderItems").setProperty("/itemData",allItems);
})
  .catch(function(oError){
  that.getView().setBusy(false);
  var oPopover = that.getErrorMessage(oError);
      });
}else {
  that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
              "/OrderItems","POST", {}, oOrderDetailsClone, this)
  .then(function(oData) {
    debugger;
    //loop the detaisl
    var allItems = that.getView().getModel("orderItems").getProperty("/itemData");
    that.getView().setBusy(false);
    for (var i = 0; i < allItems.length; i++) {
      if (allItems[i].Material === oData.Material) {
        allItems[i].itemNo = oData.id;
        allItems[i].OrderNo = oId;
        if (oCommit === false) {
        that.onReturnSave(oEvent,oId,oCommit);
        }
        break;
      }//material compare if condition
    }//for loop
    that.getView().getModel("orderItems").setProperty("/itemData",allItems);
    // sap.m.MessageToast.show("Data Saved Successfully");
    // that.getView().setBusy(false);
    })
  .catch(function(oError){
  that.getView().setBusy(false);
  var oPopover = that.getErrorMessage(oError);
                  });
}//data.item no else part
}
}
//Return values save
if (oCommit === false) {
that.onReturnSave(oEvent,oId,oCommit);
}
that.byId("Sales--idSaveIcon").setColor('green');
}//if status is red only than commit
else {
  sap.m.MessageBox.error("No Change in data records",{
  title: "Error",                                    // default
  styleClass: "",                                      // default
  initialFocus: null,                                  // default
  textDirection: sap.ui.core.TextDirection.Inherit,     // default
  onClose : function(sButton){}
  });
}
},
onClear:function(oEvent){
var that = this;
debugger;
that.byId("Sales--idSaveIcon").setColor('green');
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
oHeader.GoldBhav22=0;
oHeader.GoldBhav20=0;
oHeader.GoldBhav=0;
oHeader.SilverBhav=0;
this.getView().getModel('local').setProperty('/orderHeaderTemp',oHeaderT);
// oHeader.Date=new Date();
this.getView().getModel('local').setProperty('/orderHeader',oHeader);
this.getView().getModel("local").setProperty("/orderHeader/Date", formatter.getFormattedDate(0));
this.getView().byId("Sales--DateId").setDateValue(new Date());
//set the bhav details on Header
this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
    "/CustomCalculations", "GET", {}, {}, this)
  .then(function(oData) {
    that.getView().getModel("local").setProperty("/CustomCalculations",oData);
    that.getView().getModel("local").setProperty("/orderHeader/GoldBhav22", oData.results[0].First);
    that.getView().getModel("local").setProperty("/orderHeader/GoldBhav20", oData.results[0].Second);
    that.getView().getModel("local").setProperty("/orderHeader/GoldBhav", oData.results[0].Gold);
    that.getView().getModel("local").setProperty("/orderHeader/SilverBhav", oData.results[0].Silver);
  }).catch(function(oError) {
    that.getView().getModel("local").setProperty("/orderHeader/GoldBhav22", 0);
    that.getView().getModel("local").setProperty("/orderHeader/GoldBhav20", 0);
    that.getView().getModel("local").setProperty("/orderHeader/GoldBhav", 0);
    that.getView().getModel("local").setProperty("/orderHeader/SilverBhav", 0);
  });
//Clear Item table
this.orderItem(oEvent);
//return table
this.orderReturn(oEvent);
//adjust width of order tablePath
this.setWidths(false);

},
setWidths: function(settings){
  var oTable = this.getView().byId("orderItemBases");
  if(settings === false){
      //when setting button is reset
      oTable.getColumns()[0].setWidth("10%");
      oTable.getColumns()[1].setWidth("15%");
      oTable.getColumns()[2].setWidth("5%");
      oTable.getColumns()[3].setWidth("5%");
      oTable.getColumns()[4].setWidth("10%");
      oTable.getColumns()[5].setWidth("10%");
      oTable.getColumns()[6].setWidth("10%");
      oTable.getColumns()[7].setWidth("10%");
      oTable.getColumns()[8].setWidth("10%");
      oTable.getColumns()[9].setWidth("15%");
  }else{
    //when setting button is set - hidden some columns
  }
},
onDelete: function(oEvent) {
  var that = this;
debugger;
var viewId = oEvent.getSource().getParent().getParent().getId().split('---')[1].split('--')[0];
var oSourceCall = oEvent.getSource().getParent().getParent().getId().split('---')[1].split('--')[1];
var selIdxs = that.getView().byId(oSourceCall).getSelectedIndices();
if (selIdxs.length && selIdxs.length !== 0) {
  sap.m.MessageBox.confirm("Are you sure to delete the selected entries",{
  title: "Confirm",                                    // default
  styleClass: "",                                      // default
  initialFocus: null,                                  // default
  textDirection: sap.ui.core.TextDirection.Inherit,     // default
  onClose : function(sButton){
  if (sButton === MessageBox.Action.OK) {
    debugger;
    that.byId("Sales--idSaveIcon").setColor('red');
      for(var i = selIdxs.length - 1; i >= 0; --i){
      if (oSourceCall === 'orderItemBases') {
        var id  = that.getView().getModel("orderItems").getProperty("/itemData")[i].itemNo;
        if (id){
        that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/OrderItems('" + id + "')",
                                  "DELETE", {}, {}, that)
        sap.m.MessageToast.show("Data Deleted Successfully");
        }
        var oTableData = that.getView().getModel("orderItems").getProperty("/itemData");
        oTableData.splice(selIdxs[i], 1);
        that.getView().getModel("orderItems").setProperty("/itemData",oTableData);
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
    }//sourcecallCheck
    else if (oSourceCall === 'OrderReturn') {
      debugger;
      that.deleteReturnValues(oEvent,i,selIdxs[i],viewId,oTableData);
    }//order return else part
    }//for i loop
    if (oSourceCall === 'orderItemBases') {
      that.getView().byId('orderItemBases').clearSelection();
    }else {
      that.getView().byId('OrderReturn').clearSelection();
    }
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
  var tablePath = "";
  this.Calculation(oEvent ,tablePath);
  this.byId("Sales--idSaveIcon").setColor('red');
},//ValueChange function end

Calculation:function(oEvent,tablePath){
  debugger;
  var orderHeader = this.getView().getModel('local').getProperty('/orderHeader');
  if (oEvent.getSource().getBindingInfo('value').binding.getPath().split('/')[1] === 'orderHeader') {
  if (tablePath) {
  var category = this.getView().byId("orderItemBases").getModel("orderItems").getProperty(tablePath);
  var path = tablePath;
  var cells = this.getView().byId("orderItemBases")._getVisibleColumns();
  }}else {
  var oPath = oEvent.getSource().getParent().getBindingContext("orderItems").getPath();
  var category = this.getView().byId("orderItemBases").getModel("orderItems").getProperty(oPath);
  var path = this.getView().byId('orderItemBases').getBinding().getPath() + '/' + oEvent.getSource().getParent().getIndex();
  var oCurrentRow = oEvent.getSource().getParent();
  var cells = oCurrentRow.getCells();
}
  var data = this.getView().getModel('orderItems').getProperty(path);
  var priceF = 0.00;
  var tempWeight  = 0.00;
  var fieldId = oEvent.getSource().getId().split('---')[1].split('--')[1].split('-')[0];
  var newValue = oEvent.getParameters().newValue;
//per gm
  var gold22pergm = orderHeader.GoldBhav22 / 10;
  var gold20pergm = orderHeader.GoldBhav20 / 10;
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
var subTot = (priceF + makingCharges + stonevalue) ;
  var subTotF =  this.getIndianCurr(subTot);
  // gold price per gram
  if (tablePath) {
   debugger;
  category.SubTot = subTotF;
  this.byId("Sales--idSaveIcon").setColor('red');
  this.getView().byId("orderItemBases").getModel("orderItems").setProperty(tablePath , category);
  }else {
  cells[cells.length - 1].setText(subTotF);
  }
}else {
  cells[cells.length - 1].setText(0)
}
}else
if (category.Type === 'GS') {
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
  var subTot = charges + chargesD;
  var subTotF =  this.getIndianCurr(subTot);
if (tablePath) {
 debugger;
category.SubTot = subTotF;
this.byId("Sales--idSaveIcon").setColor('red');
this.getView().byId("orderItemBases").getModel("orderItems").setProperty(tablePath , category);
}else {
cells[cells.length - 1].setText(subTotF);
}
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

if (priceF || makingOfProduct || stonevalue) {
// gold price per gram
var subTot = priceF + makingOfProduct + stonevalue;
var subTotF =  this.getIndianCurr(subTot);
if (tablePath) {
category.SubTot = subTotF;
this.byId("Sales--idSaveIcon").setColor('red');
this.getView().byId("orderItemBases").getModel("orderItems").setProperty(tablePath , category);
}else {
cells[cells.length - 1].setText(subTotF);
}
}else {
  cells[cells.length - 1].setText(0)
}
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
  var btnId = "idFullScreenBtn";
  var headerId = "Sales--orderHeader";
  this.toggleUiTable(btnId,headerId)
}

});
});
