/*global location*/
sap.ui.define(
    ["victoria/controller/BaseController", "sap/ui/model/Filter","victoria/models/formatter"],
    function (BaseController, Filter, formatter) {
        "use strict";

        return BaseController.extend("victoria.controller.StockItems", {
          formatter:formatter,

          onAfterRendering: function(){
            this.getView().byId("idDate").setDateValue(new Date());
          },

          valueHelpOrder:function(oEvent){
            this.orderPopup(oEvent);
          },
          onPayDateChange:function(oEvent){
     debugger;
     var dDateStart = oEvent.getSource().getProperty('dateValue');
     dDateStart.setHours(0, 0, 0, 1);
     var dDateEnd = new Date(dDateStart);
     dDateEnd.setHours(23, 59, 59, 59);
     var oFilter = [];
     var oFilter1 = null;
     var oFilter2 = null;
     oFilter1 = new Filter([
        new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.BT, dDateStart, dDateEnd)
      ], true);
      oFilter = new sap.ui.model.Filter({
        filters: [oFilter1],
        and: true
      });
      this.getView().byId("idTable1").getBinding("items").filter(oFilter,true);

        },
          decimalvalidator: function (oEvent) {
                  debugger;
                  if(oEvent.getSource().getValue() <= 0 ){
                    debugger;
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
                    dialogSave.setEnabled(false);
                  }
                  else{
                    oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
                    dialogSave.setEnabled(true);
                  }
                if(oEvent.mParameters.id==="__component0---idStockItems--idWeight"){

                $(function() {
                  $('input').on('input.idWeight',function(event) {
                    if(event.currentTarget.id=="__component0---idStockItems--idWeight-inner"){
                        debugger;
                    this.value = this.value.match(/^[+-]?\d{0,6}(\.\d{0,3})?/)[0];
                  }
                  });
                });
                }
          },
          onConfirm:function(oEvent){
            debugger;
            var oFiltern = null;
            var oFilter = [];
            var oFilter1 = null;
            var oFilter2 = null;
            var that = this;
            var selectItem = oEvent.getParameter("selectedItem");
            if(selectItem){
               var orderNo = selectItem.getLabel();
               var orderNoI = parseInt(orderNo);
               this.getView().getModel("local").setProperty("/StockItemsData/Order", orderNo);
               var orderId = oEvent.getParameter("selectedItem").getBindingContextPath().split('/')[2];
               var index = null;
               if(orderId){
                 index = parseInt(orderId);
               }
               this.getView().getModel("local").setProperty("/StockItemsData/OrderNo",that.getView().getModel("temp").oData.items[index].id);
            }
            var oDNum = this.getView().getModel("temp").oData.items[index].id;
            //var oStr= "" + oDNum + "";
              var oStr=oDNum.toString();
          var oFiltern = new sap.ui.model.Filter("OrderNo", sap.ui.model.FilterOperator.EQ, 'oStr');
            //this.getView().byId("idTable1").getBinding("items").filter(oFiltern,true);
              var orderDate = this.byId("idDate").getValue();
            var dateFrom = new Date(orderDate);
            dateFrom.setHours(0, 0, 0, 1)
            var dateTo = new Date(orderDate);
            dateTo.setHours(23, 59, 59, 59)
            var oFilter1 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.GE, dateFrom);
            var oFilter2 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.LE, dateTo);

            var oFilter = new sap.ui.model.Filter({
              filters: [oFilter1, oFilter2, oFiltern],
              and: true
            });
          // //  var oFilter = new sap.ui.model.Filter({
          //     filters: [oFiltern],
          //     and: true
          //   });
             this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
               "/StockItems", "GET", {filters: [oFilter]}, {}, this)
               .then(function(oData) {
               debugger;
                 var items = oData.results;
                 var json = new sap.ui.model.json.JSONModel();
                 json.setData({
                   "StockItems": items
                 });
                 var table = that.getView().byId("idTable1");
                 table.setModel(json);
                // this.refreshModel();

               }).catch(function(oError) {
               });
          },
          onMaterialSelect: function(oEvent) {
            debugger;
            var that = this;
            var oFiltern = null;
            var oFilter = [];
            var oFilter1 = null;
            var oFilter2 = null;
            var oFilter3 = null;
            var selectedMatData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
            this.getView().getModel("local").setProperty("/StockItemsData/Material",selectedMatData.id);
            if(selectedMatData.HindiName){
              this.getView().byId("matName").setText(selectedMatData.HindiName);
            }
            else{
              this.getView().byId("matName").setText(selectedMatData.ProductName);
            }
            var selectItem = this.getView().byId("idOrderNo").getValue();
            var index = null;
            index = parseInt(selectItem);
            var oDNum = this.getView().getModel("temp").oData.items[index].id;
            var oStr=oDNum.toString();
           var oFiltern = new sap.ui.model.Filter("OrderNo", sap.ui.model.FilterOperator.EQ, 'oStr');
// this.getView().byId("idTable1").getBinding("items").filter(oFiltern,true);
          var orderDate = this.byId("idDate").getValue();
            var dateFrom = new Date(orderDate);
            dateFrom.setHours(0, 0, 0, 1)
            var dateTo = new Date(orderDate);
              dateTo.setHours(23, 59, 59, 59)
              var oFilter1 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.GE, dateFrom);
                   var oFilter2 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.LE, dateTo);
var oFilter3 = new sap.ui.model.Filter('Material', sap.ui.model.FilterOperator.Contains, selectedMatData.id);
var oFilter = new sap.ui.model.Filter({
  filters: [oFilter1, oFilter2, oFiltern, oFilter3],
  and: true
});

            this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
              "/StockItems", "GET", {filters: [oFilter]}, {}, this)
              .then(function(oData) {
              debugger;
              var items = oData.results;
              var aQuantity = items.map((i)=> {return i.Qty});
              var iQuantity =  aQuantity.reduce((a, b) => a + b, 0);
              var aWeight = items.map((i)=> {return i.Weight});
              var iWeight =  aWeight.reduce((a, b) => a + b, 0);
              var MaterialData = that.allMasterData;
              console.log(MaterialData)
              that.getView().byId("idQ").setText(parseFloat(iQuantity.toFixed(0)));
              that.getView().byId("idW").setText(parseFloat(iWeight.toFixed(3)));
              var updatedItems = items.map((i) => { i.MaterialName = selectedMatData.ProductCode; return i;})
              var json = new sap.ui.model.json.JSONModel();
              json.setData({
                "StockItems": items
              });
              var table = that.getView().byId("idTable1");
              table.setModel(json);
              //this.refreshModel();

              }).catch(function(oError) {
              });
          },
          validateValue: function(oEvent){
            // if(oEvent.getSource().getValue() <= 0 ){
            //   debugger;
            //   oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);
            //   dialogSave.setEnabled(false);
            // }
            // else{
            //   oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
            //   dialogSave.setEnabled(true);
            // }
          },
          refreshModel1:function(oEvent){
                     debugger;
                     var that = this;
                     var oFiltern = null;
                     var oFilter = [];
                     var oFilter1 = null;
                     var oFilter2 = null;
                     var oFilter3 = null;
                     var oSource = oEvent.getSource();
                     if(oEvent.getParameter("value")){
                       var searchValue = oEvent.getParameter("value").toLocaleUpperCase();
                       var items = oSource.getBinding("suggestionItems").aLastContextData;
                       var filteredObj = items.find((item)=> {
                         if(JSON.parse(item).ProductCode === searchValue){
                             return items;
                           }
                         });
                       var selectedMatData = JSON.parse(filteredObj);
                       this.getView().getModel("local").setProperty("/StockItemsData/Material",selectedMatData.id);
                       if(selectedMatData.HindiName){
                         this.getView().byId("matName").setText(selectedMatData.HindiName);
                       }
                       else{
                         this.getView().byId("matName").setText(selectedMatData.ProductName);
                       }
                     }
var selectItem = this.getView().byId("idOrderNo").getValue();
var index = null;
index = parseInt(selectItem);
var oDNum = this.getView().getModel("temp").oData.items[index].id;
var oStr=oDNum.toString();
var oFiltern = new sap.ui.model.Filter("OrderNo", sap.ui.model.FilterOperator.EQ, 'oStr');
// this.getView().byId("idTable1").getBinding("items").filter(oFiltern,true);
var orderDate = this.byId("idDate").getValue();
var dateFrom = new Date(orderDate);
dateFrom.setHours(0, 0, 0, 1)
var dateTo = new Date(orderDate);
  dateTo.setHours(23, 59, 59, 59)
  var oFilter1 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.GE, dateFrom);
       var oFilter2 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.LE, dateTo);
var oFilter3 = new sap.ui.model.Filter('Material', sap.ui.model.FilterOperator.Contains, selectedMatData.id);
var oFilter = new sap.ui.model.Filter({
filters: [oFilter1, oFilter2, oFiltern, oFilter3],
and: true
});

this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
  "/StockItems", "GET", {filters: [oFilter]}, {}, this)
  .then(function(oData) {
  debugger;
  var items = oData.results;
  var aQuantity = items.map((i)=> {return i.Qty});
  var iQuantity =  aQuantity.reduce((a, b) => a + b, 0);
  var aWeight = items.map((i)=> {return i.Weight});
  var iWeight =  aWeight.reduce((a, b) => a + b, 0);
  var MaterialData = that.allMasterData;
  console.log(MaterialData)
  that.getView().byId("idQ").setText(parseFloat(iQuantity.toFixed(0)));
  that.getView().byId("idW").setText(parseFloat(iWeight.toFixed(3)));
  var updatedItems = items.map((i) => { i.MaterialName = selectedMatData.ProductCode; return i;})
  var json = new sap.ui.model.json.JSONModel();
  json.setData({
    "StockItems": items
  });
  var table = that.getView().byId("idTable1");
  table.setModel(json);
  //this.refreshModel();

  }).catch(function(oError) {
  });
                   },
          refreshModel: function(oEvent){
            var oFilter = [];
            var oFilter1 = null;
            var oFilter2 = null;
            var that = this;
            debugger;
            var table = this.getView().byId("idTable1");
            var value = oEvent.getParameter("value");
            if(value == ""){
              var currentModel = this.getView().getModel();
              table.setModel(currentModel);
              this.getView().byId("idQ").setText("");
              this.getView().byId("idW").setText("");
              this.getView().byId("matName").setText("");
            }
          },
          orderPopup: function(oEvent) {
            var that = this;
            this.orderNoPopup = new sap.ui.xmlfragment("victoria.fragments.popup", this);
            this.getView().addDependent(this.orderNoPopup);
            var title = this.getView().getModel("i18n").getProperty("orderSearch");
            this.orderNoPopup.setTitle(title);
            var orderDate = this.byId("idDate").getValue();
            var dateFrom = new Date(orderDate);
            dateFrom.setHours(0, 0, 0, 1)
            var dateTo = new Date(orderDate);
            dateTo.setHours(23, 59, 59, 59)
            var oFilter1 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.GE, dateFrom);
            var oFilter2 = new sap.ui.model.Filter("Date", sap.ui.model.FilterOperator.LE, dateTo);
              debugger;
            var orFilter = new sap.ui.model.Filter({
              filters: [oFilter1, oFilter2],
              and: true
            });

            this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                   "/OrderHeaders",
                   "GET", {filters: [orFilter]}, {}, this)
            .then(function(oData) {
              var results  =  oData.results.slice();
              that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/WSOrderHeaders",
                                        "GET", {filters: [orFilter]}, {}, that)
              .then(function(oData) {
                var results1  = oData.results.slice();
                var abc = results.concat(results1);
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({
									"items": abc
								});
                that.getView().setModel(oModel, "temp");
                }).catch(function(oError) {
                console.log(oError);
              });
            })
            .catch(function(oError) {
              console.log(oError);
            })
              this.orderNoPopup.bindAggregation("items", {
                  path: 'temp>/items',
                  filters: orFilter,
                  template: new sap.m.DisplayListItem({
                  label: "{temp>OrderNo}",
                  value: {
                    path: 'temp>Customer',
                    formatter: this.getCustomerName.bind(this)
                    }
                  })
                });
            this.orderNoPopup.open();
          },
          onSend: function(oEvent){
 							debugger;
 							var that = this;
              var qty = this.getView().byId("idQuantity").getValue();
              var wgt = this.getView().byId("idWeight").getValue();
              var qty1= qty-(qty*2);
              var wgt1= wgt-(wgt*2);
              this.getView().getModel("local").setProperty("/StockItemsData/Qty", qty1);
              this.getView().getModel("local").setProperty("/StockItemsData/Weight", wgt1);
              var data = this.getView().getModel("local").getProperty("/StockItemsData");
              console.log(data)

              if(this.getView().byId("idMatCode").getValue() === "" ){
                sap.m.MessageBox.show("Please enter the Material");
              }
              else if(this.getView().byId("idOrderNo").getValue() === "" ){
                sap.m.MessageBox.show("Please select the Order");
              }
              // else if(this.getView().byId("idQuantity").getValue() <= 0){
              //   sap.m.MessageBox.show("Please enter the valid Quantity");
              // }
              // else if(
              // this.getView().byId("idWeight").getValue() <= 0 ){
              //   sap.m.MessageBox.show("Please enter the valid Weight");
              // }
              else{

                this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/StockItems",
  							                          "POST", {}, data, this)
  							.then(function(oData) {
  								that.getView().setBusy(false);
  								debugger;
  								sap.m.MessageToast.show("Data Saved Successfully");
                  that.getView().byId("idOrderNo").setValue("");
                  that.getView().byId("idMatCode").setValue("");
                  that.getView().byId("idQuantity").setValue("");
                  that.getView().byId("idWeight").setValue("");
                  that.getView().byId("idRemarks").setValue("");
                  that.getView().byId("idQ").setText("");
                  that.getView().byId("idW").setText("");
                  that.getView().byId("matName").setText("");
                  that.getView().getModel("local").setProperty("/StockItemsData/Order", "");
                  that.getView().getModel("local").setProperty("/StockItemsData/OrderNo","");
  							}).catch(function(oError) {
  								that.getView().setBusy(false);
  							});
              }
              var table = that.getView().byId("idTable1");
              var currentModel = that.getView().getModel();
              table.setModel(currentModel);
              that.getView().byId("idDelete").setEnabled(true);
						},

          onClear: function(){
              var that = this;
              that.getView().byId("idOrderNo").setValue("");
              that.getView().byId("idMatCode").setValue("");
              that.getView().byId("idQuantity").setValue("");
              that.getView().byId("idWeight").setValue("");
              that.getView().byId("idRemarks").setValue("");
              that.getView().byId("idQ").setText("");
              that.getView().byId("idW").setText("");
              that.getView().byId("matName").setText("");
              var table = that.getView().byId("idTable1");
              var currentModel = that.getView().getModel();
              table.setModel(currentModel);
              this.getView().byId("idDelete").setEnabled(true);
            },

          onDelete: function(){
              var that=this;
              sap.m.MessageBox.confirm(
                "Deleting Selected Records", {
                  title: "Confirm",
                  actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                  styleClass: "",
                  onClose: function(sAction) {
                    debugger;
                    if(sAction==="OK"){
                      debugger;
                      var y = that.getView().byId("idTable1");
                      var x = y.getSelectedItems();
                      if(x.length){
                         for(var i=0; i<x.length; i++){
                           debugger;
                           var myUrl = x[i].getBindingContext().sPath;
                           that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,"DELETE",{},{},that);
                           y.getModel().refresh(true);
                         }
                      }
                       sap.m.MessageToast.show("Selected records are deleted");
                       var table = that.getView().byId("idTable1");
                       var currentModel = that.getView().getModel();
                       table.setModel(currentModel);
                     }
                   }
                  }
                );
            },

          onUpdateFinished: function (oEvent) {
         		  debugger;
                  var oTable = oEvent.getSource();
              var itemList = oTable.getItems();
              var noOfItems = itemList.length;

         			var title = this.getView().getModel("i18n").getProperty("allEntries");
         			this.getView().byId("idTitle").setText(title + " " + "(" + noOfItems + ")");

               for (var i=0; i < noOfItems; i++) {
                 debugger;
                 var materialId = oTable.getItems()[i].getCells()[2].getText();
                 var orderId = oTable.getItems()[i].getCells()[1].getText();
                 var custId= oTable.getItems()[i].getCells()[5].getText();
               var ohId=this.allMasterData.orderHeader[orderId];
                var material = this.allMasterData.materials[materialId];
                  var cName=this.allMasterData.users[custId];
                if(material){
                 oTable.getItems()[i].getCells()[2].setText(material.ProductCode);
                }
            oTable.getItems()[i].getCells()[1].setText(ohId.OrderNo);
            oTable.getItems()[i].getCells()[5].setText(cName.UserName);
               }
            }
        });
    });