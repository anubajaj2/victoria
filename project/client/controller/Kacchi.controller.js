/*global location*/
sap.ui.define(
    ["victoria/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History", "victoria/models/formatter",
    "sap/m/MessageToast", "sap/ui/model/Filter"],
    function (BaseController,JSONModel,History,formatter,MessageToast,Filter) {
        "use strict";

        return BaseController.extend("victoria.controller.Kacchi", {
            formatter: formatter,
            oKacchiItem: {
                PaggaNo: "",
                Weight: "",
                Tunch: "",
                Fine: ""

            },
            // "myData": [],
          // oKacchiItemModel: new JSONModel([this.oKacchiItem]),

            onInit:function(){
              var oKacchiItem = new JSONModel();
        			//create array
        			var array=[];
        			//loop the array values
        			for (var i=1;i<=20;i++){
        				var oItem={
                  Date: "",
                  Customer:"",
                  PaggaNo: "",
                  Weight: "",
                  Tunch: "",
                  Fine: ""
        				};
                	array.push(oItem);
                }

              oKacchiItem.setData({
        					"kachhiData": array
        			});
        			this.getView().setModel(oKacchiItem, "kachhiLocalModel");
              this.byId("idDate").setDateValue(new Date());
          },

          onDateChanged: function(oEvent){
            debugger;
            var oDate = oEvent.getParameters().value;
            if(oDate){
              this.getView().byId("idCustNo").focus();
            }

          },
          onCustValueHelp: function(oEvent){
              if(!this.searchPopup){
                this.searchPopup=new sap.ui.xmlfragment("victoria.fragments.popup",this);
                this.getView().addDependent(this.searchPopup);
                var title= this.getView().getModel("i18n").getProperty("customer");
                this.searchPopup.setTitle(title);
                this.searchPopup.bindAggregation("items",{
                  path: '/Customers',
                  template: new sap.m.DisplayListItem({
                    id: "idCustPopup",
                    label:"{CustomerCode}",
                    value:"{Name}-{City}"
                  })

                });
              }
              this.searchPopup.open();
            // this.getCustomerPopup(oEvent);
          },
          onSave: function(oEvent){
            debugger;
            var that = this;
            that.getView().setBusy(true);
                  for(var i=0; i < 20; i++){
                    var myData = this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData")[i];
                    if(myData.PaggaNo.length > 0 &&
                       myData.Weight.length  > 0 &&
                       myData.Tunch.length   > 0 &&
                       myData.Fine.length    > 0 ){
                      myData.Customer = this.getView().getModel("local").getProperty("/kacchiData").Customer;
                      myData.Date = this.getView().byId("idDate").getDateValue();
                      // aKachhi.push(myData);
                      this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Kacchis",
                                                    "POST", {}, myData, this)

                        .then(function(oData) {
                					that.getView().setBusy(false);
                					sap.m.MessageToast.show("Data Saved Successfully");

                				}).catch(function(oError) {
                					that.getView().setBusy(false);
                					var oPopover = that.getErrorMessage(oError);
                				});
                      }
                    }
              },
            onDelete:function(){
                debugger;
                var aSelectedLines = this.byId("idCustTable").getSelectedItems();
                if (aSelectedLines.length) {
                  for(var i=0; i < aSelectedLines.length; i++){
                    var myUrl = aSelectedLines[i].getBindingContext().sPath;
                    this.ODataHelper.callOData(this.getOwnerComponent().getModel(), myUrl,
                                              "DELETE", {}, {}, this);
                  }
                }

            },

          onConfirm: function(oEvent){
            debugger;
            //whatever customer id selected push that in local model
              var myData = this.getView().getModel("local").getProperty("/kacchiData");
              myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
              this.getView().getModel("local").setProperty("/kacchiData", myData);
              // added by sweta to populate the selected cust and text to the input field
              var selCust = oEvent.getParameter("selectedItem").getLabel();
              var selCustName = oEvent.getParameter("selectedItem").getValue();
              if(selCust){
                this.getView().byId("idCustNo").setValue(selCust);
                this.getView().byId("idCustName").setText(selCustName);
                this.getView().byId("idPagga").focus();
              }
              // End of addition by Sweta
          }

        });

    });
