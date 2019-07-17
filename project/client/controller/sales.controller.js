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
  noChange :{
    index:0,
    flag:"true"},
  noChangeTable : [],
  headerNoChange:false,
//return no Change
noChangeReturn : false,

onInit: function (oEvent) {
  BaseController.prototype.onInit.apply(this);
  this.byId("idTransferButton").setEnabled(false);
  var oRouter = this.getRouter();
  oRouter.getRoute("sales").attachMatched(this._onRouteMatched, this);
    },
_onRouteMatched:function(oEvent){
  var that = this;
  var id = "";
  this.onClear(oEvent,id);
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
// getPrintCustData: function(){
//   this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
//       "/prints", "GET", {}, {}, this)
//     .then(function(oData) {
//       debugger;
//       // that.getView().setBusy(false);
//       // if(oData.results.length > 0){
//
//     }).catch(function(oError) {
//   });
// },
onPrint:function(){
debugger;
var printHeader = this.getView().getModel("local").getProperty("/printCustomizing");
var orderHeader = this.getView().getModel("local").getProperty("/orderHeaderTemp");
var orderDetails = this.getView().getModel('local').getProperty("/orderHeader");
// this.getPrintCustData();
var that = this;

// var allItems = this.getView().getModel("local").getProperty("/printCustomizingData");
// this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
//     "/prints", "GET", {}, {}, this)
//   .then(function(oData) {
//     debugger;
//     // that.getView().getModel("local").setProperty("/printCustomizingData",oData);
//
//   }).catch(function(oError) {
// });

var orderDate = this.getView().byId("DateId");
var header = '<p>--------------------------------------------------------------------------------------------------------------------------------<br />'+
'<span id="idCompName"><strong>Company Name:</strong></span>Moti &amp; Sons Jewellers'+
'&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;'+
'<strong>Customer Name:</strong>'+orderHeader.CustomerName+'<br />'+
'<strong>Address:</strong>Jaipur&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;'+
'<strong>City:</strong>Sikar<br />'+
'<strong>Contact:</strong>+91-XXXXXXXXXXX'+
'&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;'+
'<strong>Ph No:</strong>+91-88555111255<br />'+
'<strong>GSTIN:</strong> GSTIN558855S0&nbsp;'+
'&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;'+
'<strong>Print Date:</strong> dd.mm.yyyy<br />'+
'--------------------------------------------------------------------------------------------------------------------------------<br />'+
'<strong>Invoice No:</strong>&nbsp; &nbsp;'+orderDetails.OrderNo+
'&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;'+
'<strong>Date:</strong>'+orderDetails.Date+'<br />'+'--------------------------------------------------------------------------------------------------------------------------------</p>'+'<p>&nbsp;</p>';
             // for(var i=0 ; i <= header.length; i++){
             //   debugger;
             //   header.
             // }
             // $(header)[1].style.display = "none";
var myWindow = window.open("", "PrintWindow", "width=200,height=100");
    myWindow.document.write(header);
    myWindow.print();
    myWindow.stop();
},
onConfirm:function(oEvent){
  var that = this;
//order popup
if (oEvent.getParameter('id') === 'orderNo'){
this.byId("Sales--idSaveIcon").setColor('green');
debugger;
var id = oEvent.getSource().getParent().getId().split('---')[1];
var orderDate = this.getView().getModel('local').getProperty('/orderHeader/Date');
var orderDetail = this.getView().getModel('local').getProperty('/orderHeader');
// that.onClear(oEvent,id);
//Clear Item table
this.orderItem(oEvent,id);
//return table
this.orderReturn(oEvent,id);
//adjust width of order tablePath
this.setWidths(false);
var orderNo = oEvent.getParameter("selectedItem").getLabel();
var orderId = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
// this.OrderDetails(orderId);
this.getView().getModel("local").setProperty("/orderHeader/OrderNo",
                                                orderNo);
this.getView().getModel("local").setProperty("/orderHeader/Date",orderDate);
if (orderDetail.Customer) {
this.byId("Sales--idSaveIcon").setColor('red');
var oFilter = new sap.ui.model.Filter("Customer",sap.ui.model.FilterOperator.EQ,orderDetail.Customer);
}else {
var oFilter = new sap.ui.model.Filter("Customer",sap.ui.model.FilterOperator.EQ,"");
}
oEvent.sId = "orderReload";
this.getOrderDetails(oEvent,orderId,oFilter);
// this.orderSearchPopup.destroyItems();
}else{
var oCustDetail = this.getView().getModel('local').getProperty('/orderHeaderTemp');
//customer popup
var selCust = oEvent.getParameter("selectedItem").getLabel();
var selCustName = oEvent.getParameter("selectedItem").getValue();
oCustDetail.CustomerId = selCust;
oCustDetail.CustomerName = selCustName;
// this.getView().byId("customerId").setValue(selCust);
this.getView().byId("Sales--custName").setText(selCustName);
this.getView().getModel("local").setProperty("/orderHeader/Customer",
oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1]);
this.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerId",
                                                selCust);
}},

onPayDateChange:function(oEvent){
  debugger;
  if (oEvent.getParameter('newValue')) {
    this.getView().getModel('local').setProperty('/orderHeader/Date' ,oEvent.getParameter('newValue'));
  }
},

getOrderDetails:function(oEvent,orderId ,oFilter){
  var that = this;
  debugger;
  this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                   "/OrderHeaders('" + orderId + "')", "GET",
                   {filters: [oFilter]}, {}, this)
    .then(function(oData) {
    that.getView().setBusy(false);
    var custId = oData.Customer;
    var customerData = that.allMasterData.customers[custId];
    that.getView().getModel("local").setProperty("/orderHeader", oData);
    that.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerId", customerData.CustomerCode);
    that.getView().getModel("local").setProperty("/orderHeaderTemp/CustomerName", customerData.Name + " - " + customerData.City);
    that.getView().byId("Sales--custName").setText(customerData.Name + " - " + customerData.City);
     debugger;
     // assign the item Details
   that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
                   "/OrderHeaders('" + orderId + "')/ToOrderItems",
                   "GET", {},{}, that)
     .then(function(oData) {
         debugger;
      	if (oData.results.length > 0) {
          var allItems = that.getView().getModel("orderItems").getProperty("/itemData");
          for (var i = 0; i < oData.results.length; i++) {
            allItems[i].OrderNo = oData.results[i].OrderNo;
            allItems[i].itemNo = oData.results[i].id;
            allItems[i].Making = oData.results[i].Making;
            allItems[i].MakingD = oData.results[i].MakingD;
            allItems[i].Qty = oData.results[i].Qty;
            allItems[i].QtyD = oData.results[i].QtyD;
            allItems[i].Weight = oData.results[i].Weight;
            allItems[i].WeightD = oData.results[i].WeightD;
            allItems[i].Remarks = oData.results[i].Remarks;
            var MaterialData = that.allMasterData.materials[oData.results[i].Material];
            allItems[i].Material = oData.results[i].Material;
            allItems[i].Description = MaterialData.ProductName;
            allItems[i].MaterialCode = MaterialData.ProductCode;
            var oTablePath = "/itemData" + '/' + i;
            oEvent.sId = "orderReload";
            that.Calculation(oEvent,oTablePath,i);
          }
          that.getView().getModel("orderItems").setProperty("/itemData", allItems);
        }
           })
     .catch(function(oError) {
       that.getView().setBusy(false);
       var oPopover = that.getErrorMessage(oError);
                 	});

//Assign return table values
that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
                 "/OrderHeaders('" + orderId + "')/ToOrderReturns",
                 "GET",{}, {}, that)
.then(function(oData) {
   debugger;
oEvent.sId = "orderReload";
if (oData.results.length > 0) {
  	var allReturns = that.getView().getModel("returnModel").getProperty("/TransData");
  for (var i = 0; i < oData.results.length; i++) {
    debugger;
    allReturns[i].ReturnId = oData.results[i].id;
    allReturns[i].Type = oData.results[i].Type;
    allReturns[i].Weight = oData.results[i].Weight;
    allReturns[i].KWeight = oData.results[i].KWeight;
    allReturns[i].Tunch = oData.results[i].Tunch;
    allReturns[i].Qty = oData.results[i].Qty;
    allReturns[i].Bhav = oData.results[i].Bhav;
    allReturns[i].Key = oData.results[i].Key;
    allReturns[i].Remarks = oData.results[i].Remarks;
    that.getView().getModel("returnModel").setProperty("/TransData", allReturns);
    var seletedLine = "/TransData" + '/' + i;
    var orderHeader = that.getView().getModel('local').getProperty('/orderHeader');
    that.returnCalculation(oEvent, orderHeader, seletedLine);
    }
    // that.getView().getModel("returnModel").setProperty("/TransData", allReturns);
    }
    })
    .catch(function(oError) {
    that.getView().setBusy(false);
    var oPopover = that.getErrorMessage(oError);
    });
      })
   .catch(function(oError) {
   that.getView().setBusy(false);
   var oPopover = that.getErrorMessage(oError);
       		});
},
//on order valuehelp,get the exsisting order from //DB
valueHelpOrder:function(oEvent){
  debugger;
this.orderPopup(oEvent);
// this.orderSearchPopup.destroyItems();
},
onCancel:function(oEvent) {
// this.orderSearchPopup.destroyItems();
},
//on order create Button
orderCreate:function(oEvent){
  debugger;
var that = this;
debugger;
if (this.getView().getModel('local').getProperty('/orderHeader').OrderNo)
{
  var id = oEvent.getSource().getParent().getParent().getParent().getId().split('---')[1].split('--')[0];
  sap.m.MessageBox.confirm("Are you sure to delete the unsaved Data?",{
  title: "Confirm",                                    // default
  // id:id,                                               // Id
  styleClass: "",                                      // default
  initialFocus: null,                                  // default
  textDirection: sap.ui.core.TextDirection.Inherit,     // default
  onClose : function(sButton){
  if (sButton === MessageBox.Action.OK) {
    debugger;
    var orderdate = that.getView().getModel('local').getProperty('/orderHeader').Date;
    var customerNo = that.getView().getModel('local').getProperty('/orderHeader').Customer;
    var customerId = that.getView().getModel('local').getProperty('/orderHeaderTemp').CustomerId;
    var customerName = that.getView().getModel('local').getProperty('/orderHeaderTemp').CustomerName;
    var order = that.getView().getModel('local').getProperty('/orderHeader')
    that.onClear(oEvent,id);
    that.getView().getModel('local').setProperty('/orderHeaderTemp/CustomerId',customerId);
    that.getView().byId("Sales--custName").setText(customerName);
    that.getView().getModel('local').setProperty('/orderHeader/Customer',customerNo);
    that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
			    "/CustomCalculations", "GET", {}, {}, that)
			    .then(function(oData) {
          that.orderCheck();
  }).catch(function(oError) {
	 that.getView().getModel("local").setProperty("/orderHeader/GoldBhav22", 0);
	 that.getView().getModel("local").setProperty("/orderHeader/GoldBhav20", 0);
	 that.getView().getModel("local").setProperty("/orderHeader/GoldBhav", 0);
	 that.getView().getModel("local").setProperty("/orderHeader/SilverBhav", 0);
	});
}//Sbutton if condition
}//onClose
});
}else {
  that.orderCheck();
}
      },
orderCheck:function(){
  var that = this;
  that.getView().setBusy(true);
  that.byId("Sales--idSaveIcon").setColor('red');
  // get the data from screen in local model
  var orderData = this.getView().getModel('local').getProperty("/orderHeader");
  if (orderData.Customer === "") {
        this.getView().byId("Sales--customerId").setValueState("Error").setValueStateText("Mandatory Input");
        that.getView().setBusy(false);
      }
  else {
    if (orderData) {
      orderData.id = "";
      orderData.CreatedBy = "";
      orderData.ChangedBy = "";
      orderData.CreatedOn = "";
      orderData.CreatedBy = "";
      delete orderData.ToOrderItems;
      delete orderData.ToCustomers;
      delete orderData.ToOrderReturns;
      that.orderCustomCalculations();
    }
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
  debugger;
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
onReturnSave:function(oEvent,oId,oCommit,oHeader) {
  debugger;
var returnTable = this.getView().getModel('local').getProperty('/OrderReturn');
var oReturnTable = this.getView().byId('OrderReturn');
var oBindingR = oReturnTable.getBinding("rows");
for (var i = 0; i < oBindingR.getLength(); i++) {
  var that = this;
  var data = oBindingR.oList[i];
  //key
  if (data.Key != "") {
    returnTable.Key= data.Key;
  //Type
  if (data.Type === "" || data.Type === 0) {
    returnTable.Type= 0;
  }else {
    returnTable.Type=data.Type;
    //OrderId
      if ((oId) || (oId !="")) {
        returnTable.OrderNo= oId;
      }
    else if (oHeader.id) {
      returnTable.OrderNo=oHeader.id;
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
debugger;
var oReturnOrderClone = JSON.parse(JSON.stringify(returnTable));
if (data.ReturnId) {
  // that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
  //                       "/OrderReturns('"+ oId +"')", "PUT",
  //                        {},oReturnOrderClone, that)
  //   .then(function(oData) {
  //      debugger;
  //   that.getView().setBusy(false);
  //            })
  //   .catch(function(oError){
  //    that.getView().setBusy(false);
  //    var oPopover = that.getErrorMessage(oError);
  //    		});
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
}//key check
}//forloop
return oCommit;
},
ValueChangeHeader:function(oEvent){
  debugger;
  var that = this;
  var oHeader = that.getView().getModel('local').getProperty('/orderHeader');
  var oTable = this.getView().byId("orderItemBases").getBinding('rows');
  var oPath = oTable.getPath();
  var oTableLength = oTable.getLength();
  var field = oEvent.getSource().getId().split('---')[1].split('--')[2];
  var newvalue = oEvent.getParameter('newValue');
  var oLocale = new sap.ui.core.Locale("en-US");
  var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);
  this.headerNoChange = true;
  if (field === 'Gbhav2Id') {
  if ( newvalue === "" ){
//Gold bhav 22/22
    oHeader.GoldBhav22 = 0;
    this.headerNoChange = true;
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
    this.Calculation(oEvent,oTablePath,i);
    this.noChangeTable.push(this.noChange);
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
if (valueCheck === true && returnCheck === true && itemError === false) {
  var statusGreen = true;
  return statusGreen;
}
},
commitRecords:function(oEvent){
  if (this.byId('Sales--idSaveIcon').getColor() === 'red') {
  var that = this;
  debugger;
  var oHeader = that.getView().getModel('local').getProperty('/orderHeader');
  var oId = that.getView().getModel('local').getProperty('/OrderId').OrderId;
  if (this.headerNoChange === true) {
//order header put
  that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                        "/OrderHeaders('"+ oId +"')", "PUT",
                         {},oHeader, this)
  .then(function(oData) {
    debugger;
    message.show("Order Saved");
        that.getView().setBusy(false);
       })
  .catch(function(oError) {
      that.getView().setBusy(false);
      var oPopover = that.getErrorMessage(oError);
                });
        }
  var oOrderDetail = this.getView().getModel('local').getProperty('/OrderItem')
  var oTableDetails = this.getView().byId('orderItemBases');
  var oBinding = oTableDetails.getBinding("rows");
  var itemError = false;
  var oCommit = false;
for (var i = 0; i < oBinding.getLength(); i++) {
  var that = this;
  var data = oBinding.oList[i];
  if (data.Material !== "") {
    if (oId != "") {
      oOrderDetail.OrderNo=oId;//orderno // ID
    }else if (oHeader.id) {
      oOrderDetail.OrderNo = oHeader.id;//orderno // ID
    }
  oOrderDetail.Material=data.Material;
  // Quantity
  if (data.Qty === "" || data.Qty === 0) {
    oOrderDetail.Qty= 0;
  }else {
    oOrderDetail.Qty=data.Qty;
  }
  // QuantityD
  if (data.QtyD === "" || data.QtyD === 0) {
    oOrderDetail.QtyD= 0;
  }else {
    oOrderDetail.QtyD=data.QtyD;
  }
  // Weight
  if (data.Weight === "" || data.Weight === 0) {
    oOrderDetail.Weight= 0;
  }else {
    oOrderDetail.Weight=data.Weight;
  }
  // WeightD
  if (data.WeightD === "" || data.WeightD === 0) {
    oOrderDetail.WeightD= 0;
  }else {
    oOrderDetail.WeightD=data.WeightD;
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
  // oOrderDetail.SubTotal=data.SubTot;
  var oOrderDetailsClone = JSON.parse(JSON.stringify(oOrderDetail));
  debugger;
//Item data save
if (data.itemNo) {
  // if (this.noChange.flag === false) {
  //   debugger;
  //   that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
  //           "/OrderItems('"+ data.itemNo +"')","PUT", {},
  //           oOrderDetailsClone, this)
  //   .then(function(oData) {
  //         debugger;
  //         that.getView().setBusy(false);
  // })
  //   .catch(function(oError){
  //   that.getView().setBusy(false);
  //   var oPopover = that.getErrorMessage(oError);
  //       });
  // }
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
        break;
      }//material compare if condition
    }//for loop
    that.getView().getModel("orderItems").setProperty("/itemData",allItems);
    that.getView().setBusy(false);
    sap.m.MessageToast.show("Data Saved Successfully");
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
that.onReturnSave(oEvent,oId,oCommit,oHeader);
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
onClearScreen:function(oEvent){
  var that = this;
  var saveStatus = this.byId('Sales--idSaveIcon').getColor();
  if (!id) {
  var id = oEvent.getSource().getParent().getParent().getId().split('---')[1].split('--')[1];
  }
  if (saveStatus == "red") {
  sap.m.MessageBox.error("Are you sure you want to clear all entries? All unsaved changes will be lost!", {
       title: "Alert!",
       actions: ["Save & Clear", "Clear", MessageBox.Action.CANCEL],
       onClose: function(oAction) {
         if (oAction === "Clear") {
           that.onClear(oEvent,id);
           that.byId("Sales--idSaveIcon").setColor('green');

           MessageToast.show("Screen cleared successfully!");
         } else if (oAction === "Save & Clear") {
           if (that.onSave(oEvent)) {
             that.onClear(oEvent,id);
             MessageToast.show("Data has been Saved! Screen cleared successfully!");
           }
         }
       }
     });
  }else {
    sap.m.MessageBox.error("Are you sure you want to clear all entries?",
     {
         title: "Alert!",
         actions: ["Clear", MessageBox.Action.CANCEL],
         onClose: function(oAction) {
           if (oAction === "Clear") {
             that.onClear(oEvent,id);
             that.byId("Sales--idSaveIcon").setColor('green');
             MessageToast.show("Screen cleared successfully!");
           }
           }
         });
  }
},
onClear:function(oEvent,id){
var that = this;
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
that.getView().getModel('local').setProperty('/orderHeader',oHeader);
that.getView().getModel("local").setProperty("/orderHeader/Date", formatter.getFormattedDate(0));
that.getView().byId("Sales--DateId").setDateValue(new Date());
debugger;
this.orderCustomCalculations();
//set the bhav details on Header
// that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
//     "/CustomCalculations", "GET", {}, {}, this)
//   .then(function(oData) {
//     that.getView().getModel("local").setProperty("/CustomCalculations",oData);
//     that.getView().getModel("local").setProperty("/orderHeader/GoldBhav22", oData.results[0].First);
//     that.getView().getModel("local").setProperty("/orderHeader/GoldBhav20", oData.results[0].Second);
//     that.getView().getModel("local").setProperty("/orderHeader/GoldBhav", oData.results[0].Gold);
//     that.getView().getModel("local").setProperty("/orderHeader/SilverBhav", oData.results[0].Silver);
//   }).catch(function(oError) {
//     that.getView().getModel("local").setProperty("/orderHeader/GoldBhav22", 0);
//     that.getView().getModel("local").setProperty("/orderHeader/GoldBhav20", 0);
//     that.getView().getModel("local").setProperty("/orderHeader/GoldBhav", 0);
//     that.getView().getModel("local").setProperty("/orderHeader/SilverBhav", 0);
//   });
//Clear Item table
this.orderItem(oEvent,id);
//return table
this.orderReturn(oEvent,id);
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
ValueChange:function(oEvent){
  var tablePath = "";
  var i = "";
  this.Calculation(oEvent ,tablePath,i);
  this.noChangeTable.push(this.noChange);
  this.byId("Sales--idSaveIcon").setColor('red');
},//ValueChange function end

setNewValue:function(data,fieldId,newValue){
  //get the weight
  if (fieldId === "IdWeight") {
    if (data.Weight !== newValue) {
      data.Weight = newValue;
    }}
    if (fieldId === "IdWeightD") {
      if (data.WeightD !== newValue) {
        data.WeightD = newValue;
      }
    }
    //get the making charges
    if (fieldId === "IdMaking") {
      if (data.Making !== newValue) {
        data.Making = newValue;
      }
    }
    //making D
    if (fieldId === "IdMakingD") {
      if (data.MakingD !== newValue) {
        data.MakingD = newValue;
      }
    }
    // quantity of stone / quantityD
    if (fieldId === "IdQtyD") {
      if (data.QtyD !== newValue) {
        data.QtyD = newValue;
      }
    }
    // quantity
    if (fieldId === "IdQty") {
      if (data.Qty !== newValue) {
        data.Qty = newValue;
      }
    }
},

getFloatValue:function(data,oFloatFormat,quantityOfStone){
  if (data.Making === "") {
    data.Making = 0;
  // data.Making = 0;
  }else if (data.Making ===0) {
  data.Making = 0;
  // making = 0;
  }else {
  var making = data.Making.toString();
  data.Making = oFloatFormat.parse(making);
  }

//MakindD
  if (data.MakingD === "" ){
    data.MakingD=0;
    makingD = 0;
  }else if (data.MakingD === 0) {
    data.MakingD=0;
    makingD = 0;
  }else {
   var makingD = data.MakingD.toString();
    data.MakingD = oFloatFormat.parse(makingD);
  }
//weight
  if ( data.Weight === "" ){
    data.Weight  = 0;
  }else
    if (data.Weight === 0) {
    data.Weight  = 0;
    }else{
  var weight = data.Weight.toString();
    data.Weight  = oFloatFormat.parse(weight);
    }
//WeightD
  if ( data.WeightD === "") {
     data.WeightD = 0;
  } else if(data.WeightD ===0){
     data.WeightD = 0;
  }else {
    var weightD = data.WeightD.toString();
    data.WeightD = oFloatFormat.parse(weightD);
  }
  //Quantity
    if (data.Qty === ""){
      data.Qty = 0;
    }else if (data.Qty === 0) {
      data.Qty = 0;
    }else {
      var qty = data.Qty.toString();
      data.Qty = oFloatFormat.parse(qty);
    }
//Quantity D
  if (data.QtyD === ""){
    data.QtyD = 0;
    quantityOfStone = 0;
  }else if (data.QtyD === 0) {
    data.QtyD = 0;
    quantityOfStone = 0;
  }else {
    var qtyD = data.QtyD.toString();
    data.QtyD = oFloatFormat.parse(qtyD);
    quantityOfStone = data.QtyD;
  }
},

finalCalculation:function(category,data,priceF,tablePath,cells,
                          quantityOfStone,gold20pergm,gold22pergm,
                          silverpergm){
  if ((category.Type === 'Gold' && category.Category === "gm") ||
      (category.Type === 'Silver' && category.Category === "gm"))
  {
  //get the final weight
  if (data.WeightD !== "" ||
      data.WeightD !== 0) {
  var weightF = data.Weight - data.WeightD;
  }else {
  var weightF = data.Weight;
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
  //Making charges
  var makingCharges  = data.Making * weightF;
  var stonevalue = quantityOfStone * data.MakingD;
  if (priceF || makingCharges || stonevalue) {
  var subTot = (priceF + makingCharges + stonevalue) ;
  var subTotF =  this.getIndianCurr(subTot);
    // gold price per gram
    if (tablePath) {
     debugger;
    category.SubTot = subTotF;
    this.byId("Sales--idSaveIcon").setColor('red');
    //capture if there is any change
    // this.noChange.flag = true;
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
  //charges of german silver
  var charges = data.Qty * data.Making ;
  var chargesD = data.QtyD * data.MakingD;
  //final charges on GS
  if (charges) {
    var subTot = charges + chargesD;
    var subTotF =  this.getIndianCurr(subTot);
  if (tablePath) {
   debugger;
  category.SubTot = subTotF;
  this.byId("Sales--idSaveIcon").setColor('red');
  this.noChange = true;
  this.getView().byId("orderItemBases").getModel("orderItems").setProperty(tablePath , category);
  }else {
  cells[cells.length - 1].setText(subTotF);
  }
  }else {
    cells[cells.length - 1].setText(0);
  }}
  else if ((category.Type ==="Gold" && category.Category === "pcs")||
          (category.Type === 'Silver' && category.Category === "pcs"))
  {
      //get the final weight
      if (data.WeightD !== "" ||
          data.WeightD !== 0) {
      var weightF = data.Weight - data.WeightD;
      }else {
      var weightF = data.Weight;
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
  //Making of Product
  var makingOfProduct = data.Qty * data.Making;
  if (!makingOfProduct) {
    var makingOfProduct = 0;
  }
  //Stone value
  var stonevalue = quantityOfStone * data.MakingD;
  if (!stonevalue) {
    var stonevalue = 0;
  }
  if (priceF || makingOfProduct || stonevalue) {
  // gold price per gram
  var subTot = priceF + makingOfProduct + stonevalue;
  var subTotF =  this.getIndianCurr(subTot);
  if (tablePath) {
  category.SubTot = subTotF;
  this.noChange = true;
  this.byId("Sales--idSaveIcon").setColor('red');
  this.getView().byId("orderItemBases").getModel("orderItems").setProperty(tablePath , category);
  }else {
  cells[cells.length - 1].setText(subTotF);
  }
  }else {
    cells[cells.length - 1].setText(0)
  }}//end of per PCs calculation
},

Calculation:function(oEvent,tablePath,i){
  debugger;
  var that = this;
  var orderHeader = this.getView().getModel('local').getProperty('/orderHeader');
  if ((oEvent.getId() === "orderReload")
  || (oEvent.getSource().getBindingInfo('value').binding.getPath().split('/')[1] === 'orderHeader'))
  {
  if (tablePath) {
  var category = this.getView().byId("orderItemBases").getModel("orderItems").getProperty(tablePath);
  var path = tablePath;
  var cells = this.getView().byId("orderItemBases")._getVisibleColumns();
  }
  }else{
  var oPath = oEvent.getSource().getParent().getBindingContext("orderItems").getPath();
  var category = this.getView().byId("orderItemBases").getModel("orderItems").getProperty(oPath);
  var path = this.getView().byId('orderItemBases').getBinding().getPath() + '/' + oEvent.getSource().getParent().getIndex();
  var oCurrentRow = oEvent.getSource().getParent();
  var cells = oCurrentRow.getCells();
  var i = oEvent.getSource().getParent().getIndex();
}
  var data = this.getView().getModel('orderItems').getProperty(path);
  var priceF = 0.00;
  var tempWeight  = 0.00;
  if (oEvent.getId() != "orderReload") {
  var fieldId = oEvent.getSource().getId().split('---')[1].split('--')[1].split('-')[0];
  var newValue = oEvent.getParameters().newValue;
  }
//per gm
  var gold22pergm = orderHeader.GoldBhav22 / 10;
  var gold20pergm = orderHeader.GoldBhav20 / 10;
  var silverpergm = orderHeader.SilverBhav / 1000;
  var quantityOfStone=0;
  var oLocale = new sap.ui.core.Locale("en-US");
  var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oLocale);

  if ((!category.Category) || (!category.Type) ) {
    if (category.Material !== "") {
    that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                     "/Products('" + category.Material + "')", "GET",
                     {}, {}, that)
      .then(function(oData) {
        debugger;
        category.Category = oData.Category;
        category.Making = oData.Making;
        category.Tunch = oData.Tunch;
        category.Type = oData.Type;
        category.Karat = oData.Karat;
        that.setNewValue(data,fieldId,newValue);
        that.getFloatValue(data,oFloatFormat,quantityOfStone);
        that.finalCalculation(category,data,priceF,tablePath,cells,
                              quantityOfStone,gold20pergm,gold22pergm,
                              silverpergm);
      })
      .catch(function(oError) {
        that.getView().setBusy(false);
        var oPopover = that.getErrorMessage(oError);
      });
    }
  }else {
    this.setNewValue(data,fieldId,newValue);
    this.getFloatValue(data,oFloatFormat,quantityOfStone);
    this.finalCalculation(category,data,priceF,tablePath,cells,
                          quantityOfStone,gold20pergm,gold22pergm,
                          silverpergm);
}//Category else part
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
