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

        return BaseController.extend("victoria.controller.sales", {

            formatter: formatter,

            /* =========================================================== */
            /* lifecycle methods */
            /* =========================================================== */

            /**
             * Called when the worklist controller
             * is instantiated.
             *
             * @public
             */
            productId: "",
            customerId: "",
            globalDate: "",
            aItems: [],
            rowIndex: null,
            sDescription: null,
            iFine: null,
            oSalesItem: {
                ItmCode: "",
                ItmId: "",
                description: "",
                Weight: 0,
                Tunch: 0,
                Qty: 0,
                Making: 0,
                FineS: 0,
                FineG: 0,
                Cash: 0,
                PType: ""

            },
            oSalesItemModel: new JSONModel([this.oSalesItem]),
            onInit: function () {

                this.router = sap.ui.core.UIComponent
                    .getRouterFor(this);
                this.getRouter()
                    .attachRoutePatternMatched(
                        this.onGetModel,
                        this);

// set the default date as system date
          debugger;
          this.getView().byId("DateId").setDateValue( new Date());
// Item Table as input table
                this.orderItem();
// Return Item Table as input table
                this.orderReturn();


                // // Create new sales model
                // var oSalesHeaderModel = new JSONModel({
                //     BillNo: 0,
                //     Date: new Date(),
                //     OrderType: "",
                //     CustomerCode: "",
                //     CustomerId: "",
                //     ProductId: "",
                //     ProductName: "",
                //     Weight: 0,
                //     WeightLess: 0,
                //     Tunch: 0,
                //     Making: 0,
                //     MakingExtra: 0,
                //     Pcs: 0,
                //     PcsExtra: 0,
                //     Hindi: "",
                //     Category: "",
                //     PType: "",
                //     TotGold: 0,
                //     TotCash: 0,
                //     TotSlv: 0,
                //     GrossSlv: 0,
                //     TotalPcs: 0,
                //     GrossGld: 0,
                //     BhavS: 0,
                //     BhavG: 0
                // });
                // this.setModel(oSalesHeaderModel, "salesHeaderModel");
                //
                // this.setModel(this.oSalesItemModel, "SalesItemModel");
                //
                //
                // var oTransData = new JSONModel();
                // var aTtype = [];
                // for (var i = 0; i < 5; i++) {
                //     var line = {
                //         "Remarks": "",
                //         "Transactiontype": 0,
                //         "Tunch": "",
                //         "Weight": ""
                //     };
                //     aTtype.push(line);
                // }
                // oTransData.setData({
                //     "TransData": aTtype
                // });
                // this.setModel(oTransData, "TransData");
            },
            //customer value help
            valueHelpCustomer:function(oEvent){
              debugger;
              this.getCustomerPopup(oEvent);
            },
            // onPayDateChange: function(oEvent) {
            //   debugger;
			      //   var dateString = oEvent.getSource().getValue();
			      //   var from = dateString.split(".");
			      //   var dateObject = new Date(from[2], from[1] - 1, from[0]);
			      //   var newDate = new Date(from[2], from[1] - 1, from[0]);
			      //   var PaymentDueDate = this.formatter.getIncrementDate(dateObject, 1);
			      //   this.getView().getModel("local").setProperty("/orderHeader_t/Date", PaymentDueDate);
            //   },

            onConfirm:function(oEvent){
              debugger;
              var oId = oEvent.getParameter('selectedItem').getId();
              var oSource = oId.split("-"[0])
              if (oSource[0] === 'idCoCustPopup'){

                var selCust = oEvent.getParameter("selectedItem").getLabel();
                var selCustName = oEvent.getParameter("selectedItem").getValue();
                this.getView().byId("customerId").setValue(selCust);
                this.getView().byId("custName").setText(selCustName);
                //whatever customer id selected push that in local model
                var myData = this.getView().getModel("local").getProperty("/orderHeader");
                myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
                this.getView().getModel("local").setProperty("/orderHeader", myData);
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
              // var orderData = this.getOwnerComponent().getModel('local').getProperty('/orderHeaders');
              var orderData = this.getView().getModel('local').getProperty('/orderHeader')
              // orderData.Customer  = this.getView().byId('customerId').getValue();
              orderData.Date      = this.getView().byId('DateId').getValue();
              orderData.Goldbhav1 = this.getView().byId('Gbhav1Id').getValue();
              orderData.Silverbhav= this.getView().byId('sbhav').getValue();


              // if (orderData.Customer === " ") {
              //
                // else {
                  this.getView().getModel("local").setProperty("/orderHeaders", orderData);
                  //call the odata promise method to post the data
                  this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/orderHeaders",
                                            "POST", {}, orderData, this)
                  .then(function(oData) {
                    that.getView().setBusy(false);
                    sap.m.MessageToast.show("Data Saved Successfully");
                     }).catch(function(oError) {
                    that.getView().setBusy(false);
                    var oPopover = that.getErrorMessage(oError);
                		});
                // }}
            }
//             onGetModel: function (oEvent) {
//                 var oModel = this.getView()
//                     .getModel();
//                 oModel
//                     .read(
//                         "/Orders",
//                         {
//                             success: function (data) {
//                                 var oOrders = new JSONModel(
//                                     data.results);
//                                 // oOrders.sort(this.sort_by('OrderId',
//                                 // true,
//                                 // parseInt));
//                             }
//                         });
//             },
//             createNewRow: function () {
//                 var headerData = this.getView().getModel("salesHeaderModel").getProperty("/");
//                 var lineItem = {
//                     ItmCode: "",
//                     ItmId: "",
//                     description: "",
//                     Weight: 0,
//                     Tunch: 0,
//                     Qty: 0,
//                     Making: 0,
//                     FineS: 0,
//                     FineG: 0,
//                     Cash: 0,
//                     PType: ""
//                 };
//                 lineItem.ItmCode = headerData.ProductName;
//                 lineItem.ItmId = headerData.ProductId;
//                 lineItem.description = headerData.Hindi + ", " + headerData.PType;
//                 lineItem.Weight = parseFloat(headerData.Weight);
//                 lineItem.Tunch = parseFloat(headerData.Tunch);
//                 lineItem.Qty = parseFloat(headerData.Pcs);
//                 lineItem.Making = parseFloat(headerData.Making);
//                 if (headerData.PType == "Silver") {
//                     lineItem.FineS = (headerData.Weight - headerData.WeightLess) * headerData.Tunch / 100;
//                     lineItem.Cash = ( headerData.Making * headerData.Pcs ) + (headerData.PcsExtra * headerData.MakingExtra);
//                 }
//                 else if (headerData.PType == "Gold") {
//                     lineItem.FineG = (headerData.Weight - headerData.WeightLess) * headerData.Tunch / 100;
//                     lineItem.Cash = ( headerData.Making * headerData.Pcs ) + (headerData.PcsExtra * headerData.MakingExtra);
//                 }
//                 else {
//                     lineItem.Cash = ( headerData.Making * headerData.Pcs ) + (headerData.PcsExtra * headerData.MakingExtra);
//                 }
//                 lineItem.PType = headerData.PType;
//
//                 this.aItems.push(lineItem);
//                 // create 50 blank rows
//                 // this.oSalesItemModel.setData({
//                 //     modelData: this.aItems
//                 // }); // Set Model
//                 // this.setModel(this.oSalesItemModel,
//                 // "salesItemModel");
//                 // var oTable = this.byId("Orders");
//                 // oTable.setModel(this.oSalesItemModel, "salesItemModel");
//                 // oTable.bindRows("salesItemModel>/modelData");
//                 this.oSalesItemModel.setData(this.aItems);
//                 //this.calculateTotal();
//             },
//             calculateTotal: function () {
//                 var oTable = this
//                     .byId("Orders");
//                 var oModel = oTable.getModel(
//                     "salesItemModel");
//                 var sData = oModel.getData().modelData;
//                 var pcs = 0, ggold = 0, gold = 0;
//                 var cash = 0, silver = 0, gslv = 0;
//                 for (var i = 0; i < sData.length; i++) {
//                     var item = sData[i];
//                     cash = cash + sData[i].Cash;
//                     silver = silver + sData[i].Fines;
//                     gold = gold + sData[i].FineG;
//                     if (item.PType == "Silver") {
//                         gslv = gslv + sData[i].Weight;
//                     }
//                     else if (item.PType == "Gold") {
//                         ggold = ggold + sData[i].Weight;
//                     }
//                     pcs = pcs + sData[i].Qty;
//                 }
//                 this.getView().getModel("salesHeaderModel").setProperty("/TotSlv", silver);
//                 this.getView().getModel("salesHeaderModel").setProperty("/TotGold", gold);
//                 this.getView().getModel("salesHeaderModel").setProperty("/TotCash", cash);
//                 this.getView().getModel("salesHeaderModel").setProperty("/TotalPcs", pcs);
//                 this.getView().getModel("salesHeaderModel").setProperty("/GrossGld", ggold);
//                 this.getView().getModel("salesHeaderModel").setProperty("/GrossSlv", gslv);
//             },
//             selectedProduct: function (oEvent) {
//                 var item = oEvent.getParameter("selectedItem");
//                 var key = item.getText();
//                 var keya = item.getKey();
//                 var oView = this.getView();
//                 var that = this;
//                 this.getModel().read("/Products(" + keya + ")",
//                     {
//                         urlParameters: {"$expand": "CategoryDetails"},
//                         success: function (data) {
//                             that.getView().getModel("salesHeaderModel").setProperty("/Hindi", data.Hindi);
//                             that.getView().getModel("salesHeaderModel").setProperty("/PType", data.Description);
//                             that.getView().getModel("salesHeaderModel").setProperty("/Tunch", data.ListPrice);
//                             that.getView().getModel("salesHeaderModel").setProperty("/Making", data.MinimumReorderQuantity);
//                             that.getView().getModel("salesHeaderModel").setProperty("/PType", data.Description);
//                             that.getView().getModel("salesHeaderModel").setProperty("/Category", data.CategoryDetails.Category);
//                             that.getView().getModel("salesHeaderModel").setProperty("/ProductName", data.ProductName);
//                             that.getView().getModel("salesHeaderModel").setProperty("/ProductId", data.Id);
//                         }
//                     });
//             },
//             oncellClick: function (oEvent) {
//                 this.rowIndex = oEvent
//                     .getParameter("rowIndex");
//                 // this.colIndex =
//                 // oEvent.getParameter("rowIndex");
//             },
//             onCreate: function (sId) {
//                 var that = this;
//                 var oView = this.getView();
//                 var oHeaderModel = oView.getModel("salesHeaderModel");
//                 var updatedData = {
// //                                "Extra1": null,
// //                                "Extra2": null,
// //                                "Extra3": "0.0",
// //                                "Extra4": "0.0",
// //                                "Id": 5,
//                     "OrderDate": oHeaderModel.getProperty("/Date") || new Date(),
//                     "OrderId": sId,
//                     "OrderTypeBean": 0, //this.byId("idOrderType").getSelectedKey(),
//                     "Status": 3,
//                     "CustomerDetails": {
//                         "__metadata": {
//                             "uri": "http://localhost:8080/bhavysoft/galaxyService.svc/Customers(" + this.byId("idSCustCde").getSelectedKey() + ")"
//                         }
//                     },
//                     "OrderTypeDetails": {
//                         "__metadata": {
//                             "uri": "http://localhost:8080/bhavysoft/galaxyService.svc/OrderTypes(" + this.byId("idOrderType").getSelectedKey() + ")"
//                         }
//                     }
//                 };
//                 this.getModel().create(
//                     "/Orders",
//                     updatedData,
//                     {
//                         success: function () {
//                             oHeaderModel.setProperty("/BillNo", sId);
//                             MessageToast
//                                 .show("Created successfully");
//                             // that.loadDataInTables();
//                         }
//                     });
//             },
//             onChangeTunch: function (oEvent) {
//                 var context = oEvent.getSource().getParent().oBindingContexts.TransData.oModel.getProperty(oEvent.getSource().getParent().oBindingContexts.TransData.sPath);
//                 context.fine = context.amount * parseFloat(oEvent.getParameter("newValue")) / 100;
//                 oEvent.getSource().getParent().oBindingContexts.TransData.oModel.setProperty(oEvent.getSource().getParent().oBindingContexts.TransData.sPath, context);
//             },
//             onLiveChangeWght: function (oEvent) {
//
//                 var oView = this.getView();
//                 var iWght = parseInt(oEvent
//                     .getParameter("liveValue"));
//                 var iTnch = parseInt(oView.byId(
//                     "idSTnch-col3-row"
//                     + this.rowIndex)
//                     .getValue());
//                 this.iFine = iWght * iTnch / 100;
//                 if (iFine > 0) {
//                     if (this.sDescription === "Silver") {
//                         oView
//                             .byId(
//                                 "idSFS-col6-row"
//                                 + this.rowIndex)
//                             .setText(iFine);
//                         oView
//                             .byId(
//                                 "idSFG-col7-row"
//                                 + this.rowIndex)
//                             .setText(0);
//                     } else {
//                         oView
//                             .byId(
//                                 "idSFG-col7-row"
//                                 + this.rowIndex)
//                             .setText(iFine);
//                     }
//
//                 }
//
//             },
//             onSave: function () {
//                 this.createOrderDetails();
//             },
//             onGenerateBillNumber: function (oEvent) {
//                 var oCurrentDateStart = new Date();
//                 oCurrentDateStart.setHours(0, 0, 0, 0);
//                 var oCurrentDateEnd = new Date();
//                 oCurrentDateEnd.setHours(23, 59, 59, 999);
//                 var that = this;
//
//                 var oModel = this.getView().getModel();
//                 oModel.setUseBatch(false);
//                 oModel.read(
//                     "/Orders",
//                     {
//                         filters: [new Filter("OrderDate", "BT", oCurrentDateStart, oCurrentDateEnd)],
//                         // urlParameters : {"$filter" : " gt datetime'("+oCurrentDateStart.toISOString()+")'"},
//                         success: function (data) {
//                             var response = data.results || [];
//                             console.log(response.length);
//                             that.onCreate(response.length + 1);
//                         },
//                         error: function (e) {
//                             console.log(e);
//                         }
//                     });
//
//             },
//             createOrderDetails: function () {
//                 var oSalesHeaderModel = this.getView().getModel("salesHeaderModel");
//                 var oSalesItemModel = this.getView().getModel("SalesItemModel");
//                 var oDataModel = this.getModel();
//                 var changeSetId = "ItemsTableBatchId";
// //                oDataModel.setUseBatch(true);
//                 var oLineOrder = {
//                     Tunch: "",
//                     Wastage: "",
//                     Weight: "",
//                     Lessweight: "",
//                     Qty: "",
//                     Lessqty: "",
//                     Making: "",
//                     Makingextra: "",
//                 };
//
//                 for(var i=0;i<this.aItems.length;i++){
//                     oLineOrder.Tunch = parseFloat(this.aItems[i].Tunch) || 0;
//                     oLineOrder.Wastage=parseFloat(this.aItems[i].Wastage) || 0;
//                     oLineOrder.Weight=parseFloat(this.aItems[i].Weight) || 0;
//                     oLineOrder.Lessweight=parseFloat(this.aItems[i].LessWeight) || 0;
//                     oLineOrder.Qty = parseFloat(this.aItems[i].Qty) || 0;
//                     oLineOrder.Lessqty = parseFloat(this.aItems[i].LessQty) || 0;
//                     oLineOrder.Making=parseFloat(this.aItems[i].Making) || 0;
//                     oLineOrder.Makingextra=parseFloat(this.aItems[i].MakingExtra) || 0;
//                     oLineOrder.OrderDetails= {
//                         "__metadata": {
//                             "uri": "http://localhost:8080/bhavysoft/galaxyService.svc/Orders(" + oSalesHeaderModel.getProperty("/BillNo") + ")"
//                         }
//                     };
//                     oLineOrder.ProductDetails= {
//                         "__metadata": {
//                             "uri": "http://localhost:8080/bhavysoft/galaxyService.svc/Products(" + this.aItems[i].ItmId + ")"
//                         }
//                     }
//
//                     console.log(oLineOrder);
// //                    oDataModel.create("/OrderDetails", oLineOrder, {"groupId": changeSetId});
// //                    oDataModel.setDeferredGroups([changeSetId])
//                     oDataModel.create("/OrderDetails", oLineOrder, {
//                     	success : function(){
//                     		 MessageToast.show("Created successfully");
//                     	},
//                     	error : function(e){
//                     		console.log(e);
//                     	}
//                     });
//                 }
// //                oDataModel.submitChanges({"groupId": changeSetId}, {
// //                    success: function () {
// //                        MessageToast.show("Created successfully");
// //                    }
// //                });
//             },
//             convertToJSONDate: function (date) {
//                 var yyyy = date.substring(0, 4);
//                 var mm = date.substring(4, 6);
//                 var dd = date.substring(6, 8);
//                 var d = new Date();
//                 var today = yyyy + '-' + mm + '-'
//                     + dd + 'T00:00:00';
//                 var dt = new Date(yyyy + '-' + mm
//                     + '-' + dd);
//                 // dt.setDate(dt.getDate() - 1);
//
//                 var newDate = new Date(dt
//                         .getFullYear(), dt
//                         .getMonth(), dt.getDate(),
//                     d.getHours(), d
//                         .getMinutes(), d
//                         .getSeconds(), d
//                         .getMilliseconds());
//                 return '/Date(' + newDate.getTime()
//                     + ')/';
//             },
//             onLiveChangeQty: function (oEvent) {
//                 var oView = this.getView();
//                 var iQty = parseInt(oEvent
//                     .getParameter("liveValue"));
//
//             },
//             sort_by: function (field, reverse, primer) {
//                 var key = primer ? function (x) {
//                     return primer(x[field])
//                 } : function (x) {
//                     return x[field]
//                 };
//
//                 reverse = !reverse ? 1 : -1;
//
//                 return function (a, b) {
//                     return
//                     a = key(a), b = key(b), reverse
//                     * ((a > b) - (b > a));
//                 }
//             }

        });

    });
