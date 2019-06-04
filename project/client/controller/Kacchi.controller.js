/*global location*/
sap.ui.define(
    ["victoria/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "victoria/models/formatter",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/m/MessageBox"],
  function (BaseController,JSONModel,History,formatter,MessageToast,Filter,MessageBox) {
        "use strict";

  return BaseController.extend("victoria.controller.Kacchi", {
      formatter: formatter,
      // oKacchiItem: {
      // PaggaNo: "",
      // Weight: "",
      // Tunch: "",
      // Fine: ""
      //
      // },

  onInit:function(){
    var oKacchiItem = new JSONModel();
		//create array
		var array=[];
		//loop the array values
		for (var i=1;i<=20;i++){
			var oItem={
        id:"",
        Date: "",
        Customer:"",
        PaggaNo: 0,
        Weight: 0,
        Tunch: 0,
        Fine: 0,
        status:true
			};
      	array.push(oItem);
      }

    oKacchiItem.setData({
				"kachhiData": array,
        "kacchiHeader": {
          "cdate": new Date(),
          "customer": ""
        }
		});
		this.getView().setModel(oKacchiItem, "kachhiLocalModel");
    this.byId("idDate").setDateValue(new Date());
},

  onDateChanged: function(oEvent){
    // debugger;
    // var oDate = oEvent.getParameters().value;
    // if(oDate){
    //   this.getView().byId("idCustNo").focus();
    // }

  },
  onCustValueHelp: function(oEvent){
      this.getCustomerPopup(oEvent);
  },
  onSave: function(oEvent){
    debugger;
    var that = this;
          for(var i=0; i < 20; i++){
            this.getView().setBusy(true);
             var myData = this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData")[i];
             myData.Customer = this.getView().getModel("local").getProperty("/kacchiData").Customer
             myData.Date = this.getView().byId("idDate").getDateValue();
            if(myData.PaggaNo  !== "" &&
               myData.Weight   !== "" &&
               myData.Tunch    !== "" &&
               myData.Fine     !== "" &&
               myData.Customer !== ""){
              this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Kacchis",
                                            "POST", {}, myData, this)

                .then(function(oData) {
        					that.getView().setBusy(false);
        					sap.m.MessageToast.show("Data Saved Successfully");
                  //read the data which is Saved
                  debugger;
                  var id = oData.id;
                  var pagga = oData.PaggaNo;
                  var allItems = that.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");
                  for (var i = 0; i < allItems.length; i++) {
                    if( allItems[i].PaggaNo == oData.PaggaNo){
                      allItems[i].id = id;
                      break;
                    }
                  }
                  that.getView().getModel("kachhiLocalModel").setProperty("/kachhiData",allItems);

        				}).catch(function(oError) {
        					that.getView().setBusy(false);
        					var oPopover = that.getErrorMessage(oError);
        				});
              }

            }
      },
      onChange: function() {
        debugger;
          	var cust = this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData/Customer");
            if(!cust){
              this.getView().byId("idCustNo").setValueState("Error").setValueStateText("Mandatory Input");
            }
      },
  onClear:function(){
    debugger;
      this.byId("idCustNo").setValue("");
      this.byId("idCustName").setValue("");
      // this.getView().getModel("kachhiLocalModel").getData();
      // this.getView().getModel("kachhiLocalModel").setData("/kacchiData", "");
      // this.byId("idPagga").setValue("");
      // this.byId("idWeight").setValue("");
      // this.byId("idTunch").setValue("");
      // this.byId("idFine").setValue("");

  },
  onDelete: function(oEvent) {
    debugger;
    var aSelectedLines = this.byId("idCustTable").getSelectedItems();
    if (aSelectedLines.length) {
      for(var i=0; i < aSelectedLines.length; i++){
        var myUrl = aSelectedLines[i].getBindingContextPath();
        this.ODataHelper.callOData(this.getOwnerComponent().getModel(), myUrl,
                                  "DELETE", {}, {}, this);
      }
    }
			// var that = this;
			// MessageBox.confirm("Do you want to delete the selected records?", function(conf) {
			// 	if (conf == 'OK') {
			// 		var items = that.getView().byId("idCustTable").getSelectedContexts();
			// 		for (var i = 0; i < items["length"]; i++) {
			// 			that.ODataHelper.callOData(that.getOwnerComponent().getModel(), items[i].sPath,
			// 					"DELETE", {}, {}, that)
			// 				.then(function(oData) {
			// 					sap.m.MessageToast.show("Deleted succesfully");
			// 				}).catch(function(oError) {
			// 					that.getView().setBusy(false);
			// 					that.oPopover = that.getErrorMessage(oError);
			// 					that.getView().setBusy(false);
			// 				});
      //
			// 		}
			// 	}
			// }, "Confirmation");
		},
  // onUpdateFinished: function(oEvent){
  //   debugger;
  //   var oTable = oEvent.getSource();
  // },
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
        // var custNumText = this.getView().getModel("kachhiLocalModel").getProperty("/kacchiHeader");
        // custNumText.customer = selCust;
        // this.getView().getModel("kachhiLocalModel").setProperty("/kacchiHeader", custNumText);
        this.getView().byId("idCustNo").setValue(selCust);
        this.getView().byId("idCustName").setValue(selCustName);
        // this.getView().byId("idPagga").focus();
      }
      // End of addition by Sweta
  }

        });

    });
