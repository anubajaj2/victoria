/*global location*/
sap.ui.define(
    ["victoria/controller/BaseController", "sap/ui/model/Filter"],
    function (BaseController, Filter) {
        "use strict";

        return BaseController.extend("victoria.controller.StockItems", {
          onAfterRendering: function(){
            this.getView().byId("idDate").setDateValue(new Date());
          },

          onConfirm:function(oEvent){
            var that = this;
            debugger;
            var orderNo = oEvent.getParameter("selectedItem").getLabel();
            var orderId = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
            this.getView().getModel("local").setProperty("/StockItemsData/Order", orderNo);
            this.getView().getModel("local").setProperty("/StockItemsData/OrderNo",orderId);
          },

          valueHelpOrder:function(oEvent){
            this.orderPopup(oEvent);
          },

          refreshModel: function(oEvent){
            var table = this.getView().byId("idTable1");
            var value = oEvent.getParameter("value");
            if(value == ""){
              var currentModel = this.getView().getModel();
              table.setModel(currentModel);
              this.getView().byId("idQ").setText("");
              this.getView().byId("idW").setText("");
            }

          },

          orderPopup: function(oEvent) {
            this.orderNoPopup = new sap.ui.xmlfragment("victoria.fragments.popup", this);
            this.getView().addDependent(this.orderNoPopup);
            var title = this.getView().getModel("i18n").getProperty("orderSearch");
            this.orderNoPopup.setTitle(title);
            var orderDate = this.byId("idDate").getValue();
            var customer = this.getView().getModel('local').getProperty('/orderHeader').Customer;
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
            this.orderNoPopup.bindAggregation("items", {
                path: '/OrderHeaders',
                filters: orFilter,
                template: new sap.m.DisplayListItem({
                label: "{OrderNo}",
                value: {
                  path: 'Customer',
                  formatter: this.getCustomerName.bind(this)
                  }
                })
              });
            this.orderNoPopup.open();
          },

          onSend: function(oEvent){
 							debugger;
 							var that = this;
              var data = this.getView().getModel("local").getProperty("/StockItemsData");
              console.log(data);
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
							}).catch(function(oError) {
								that.getView().setBusy(false);
							});
              var table = that.getView().byId("idTable1");
              var currentModel = that.getView().getModel();
              table.setModel(currentModel);
              this.getView().byId("idDelete").setEnabled(true);
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

          productCodeCheck: function(oEvent){
              debugger;
              var that = this;
              var matId = oEvent.getParameter("selectedItem").getBindingContext().getPath().split("'")[1];
              var data = this.getView().getModel("local").getProperty("/StockItemsData");
              data.Material = matId;
              var oFilter = new sap.ui.model.Filter("Material","EQ", matId);
              this.getView().byId("idTable1").getBinding("items").filter(oFilter);
              this.getView().byId("idDelete").setEnabled(false);
              this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/StockItems",
							                          "GET", {oFilter}, {}, this)
							.then(function(oData) {
								that.getView().setBusy(false);
								console.log(oData.results)
                var items = oData.results.filter((i)=>{return i.Material === matId});
                var aQuantity = items.map((i)=> {return i.Qty});
                var iQuantity =  aQuantity.reduce((a, b) => a + b, 0);
                var aWeight = items.map((i)=> {return i.Weight});
                var iWeight =  aWeight.reduce((a, b) => a + b, 0);
                that.getView().byId("idQ").setText(parseFloat(iQuantity.toFixed(0)));
                that.getView().byId("idW").setText(parseFloat(iWeight.toFixed(0)));
                var json = new sap.ui.model.json.JSONModel();
                json.setData({
									"StockItems": items
								});
                var table = that.getView().byId("idTable1");
                table.setModel(json);
							});
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
                 var materialId = oTable.getItems()[i].getCells()[1].getText();
                 var material = this.allMasterData.materials[materialId];
                 if(material){
                   oTable.getItems()[i].getCells()[1].setText(material.ProductCode);
                 }
               }
            }
        });
    });
