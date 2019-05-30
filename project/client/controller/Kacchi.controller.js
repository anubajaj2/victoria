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
          },


          onCustValueHelp: function(oEvent){
            this.getCustomerPopup(oEvent);
          },
          onSave: function(oEvent){
            debugger;
            var that = this;
                  for(var i=0; i < 5; i++){
                    var myData = this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData")[i];
                    if(myData){
                      myData.Customer = this.getView().getModel("local").getProperty("/kacchiData").Customer;
                      myData.Date = this.getView().byId("idDate").getDateValue();
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
              }
              // End of addition by Sweta
          }

        });

    });
