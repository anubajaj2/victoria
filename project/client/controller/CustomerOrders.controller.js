sap.ui.define([
  "victoria/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "victoria/models/formatter",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/Dialog"
],function (BaseController, JSONModel, formatter, MessageToast, MessageBox, Dialog) {
      "use strict";
  return BaseController.extend("victoria.controller.CustomerOrders", {
    formatter: formatter,
    onInit: function () {
      BaseController.prototype.onInit.apply(this);

      var oRouter = this.getRouter();
    oRouter.getRoute("customerOrders").attachMatched(this._onRouteMatched, this);
  },

  _onRouteMatched : function(){
  	var that = this;
    debugger;
    that.getView().byId("idCoDate").setDateValue(new Date());
    var date = new  Date();
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    that.getView().byId("idCoDelDate").setDateValue(new Date(yyyy, mm, dd));
    // that.getView().getModel("local").setProperty("/customerOrder/Date", formatter.getFormattedDate(0));
    // that.getView().getModel("local").setProperty("/customerOrder/DelDate", formatter.getFormattedDate(1));

  },

    onValueHelp: function(oEvent){
      this.getCustomerPopup(oEvent);
    },

    onValueHelpMat: function(){
      this.getMaterialPopup();
    },

    onValueHelpKarigar: function(oEvent){
      this.getKarigarPopup(oEvent);
    },

    onConfirm: function(oEvent){
      //whatever customer id selected push that in local model
        //var myData = this.getView().getModel("local").getProperty("/customerOrder");
        if(oEvent.getSource().getTitle() === "Material Search"){
          var selMat = oEvent.getParameter("selectedItem").getLabel();
          var selMatName = oEvent.getParameter("selectedItem").getValue();
          //this.getView().byId("idCoMaterial").setValue(selMat);
          this.getView().byId("idCoMatName").setValue(selMatName);
          this.getView().getModel("local").setProperty("/customerOrder/Material",
                oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1]);
          this.getView().getModel("local").setProperty("/coTemp/MaterialCode",
                                                selMat);
          //myData.Material = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
        }else if (oEvent.getSource().getTitle() === "Karigar Search") {

          var selKarigar = oEvent.getParameter("selectedItem").getLabel();
          var selKarigarName = oEvent.getParameter("selectedItem").getValue();
          //this.getView().byId("idCoKarigar").setValue(selKarigar);
          this.getView().byId("idCoKarigarName").setValue(selKarigarName);
          this.getView().getModel("local").setProperty("/customerOrder/Karigar",
                oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1]);
          this.getView().getModel("local").setProperty("/coTemp/KarigarCode",
                                                selKarigar);
          //myData.Karigar = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
        }
        else{
          var selCust = oEvent.getParameter("selectedItem").getLabel();
          var selCustName = oEvent.getParameter("selectedItem").getValue();
          //this.getView().byId("idCoCustomer").setValue(selCust);
          this.getView().byId("idCoCustomerText").setValue(selCustName);
          this.getView().getModel("local").setProperty("/customerOrder/Customer",
                oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1]);
          this.getView().getModel("local").setProperty("/coTemp/CustomerCode",
                                                selCust);
          //myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
        }

        //this.getView().getModel("local").setProperty("/customerOrder", myData);
    },
    onSelectPhoto: function(oEvent){
      debugger;
      // if (!this.searchPopup) {
      //   this.searchPopup = new sap.ui.xmlfragment("victoria.fragments.CustomerOrderPhoto", this);
      //   this.getView().addDependent(this.searchPopup);
      //   var title = this.getView().getModel("i18n").getProperty("customer");
      //   this.searchPopup.setTitle(title);
        // this.searchPopup.bindAggregation("items",{
        //   path: '/Customers',
        //   template: new sap.m.DisplayListItem({
        //        id: "idCoCustPopup",
        //     label: "{CustomerCode}",
        //     value: "{Name} - {City}"
        //   })
        // });
      // }

    },
    onSearch: function(oEvent){
        var sValue = oEvent.getParameter("query");
        if(!sValue){
        sValue = oEvent.getParameter("value");
        }
        if(oEvent.getSource().getTitle() === "Material Search"){
          var oFilter1 = new sap.ui.model.Filter(
                        "ProductCode",
                        sap.ui.model.FilterOperator.Contains,
                        sValue  );
          var oFilter2 = new sap.ui.model.Filter(
                        "ProductName",
                        sap.ui.model.FilterOperator.Contains,
                        sValue );
          var oFilter = new sap.ui.model.Filter(
                        {
                        filters: [oFilter1, oFilter2],
                        and: false
                        });

        }else{
          var oFilter1 = new sap.ui.model.Filter(
                        "CustomerCode",
                        sap.ui.model.FilterOperator.Contains,
                        sValue  );
          var oFilter2 = new sap.ui.model.Filter(
                        "Name",
                        sap.ui.model.FilterOperator.Contains,
                        sValue );
          var oFilter3 = new sap.ui.model.Filter(
                        "City",
                        sap.ui.model.FilterOperator.Contains,
                        sValue );

          var oFilter = new sap.ui.model.Filter(
                        {
                        filters: [oFilter1, oFilter2, oFilter3],
                        and: false
                        });
        }
        //Filter object- is used to filter the data from the model
        var aFilter = [oFilter]; //AND operator by default
        var oBinding = oEvent.getSource().getBinding("items");
        oBinding.filter(aFilter);

  },

    onDateChange:function(oEvent){
      debugger;
      var oDP = oEvent.getSource();
      var bValid = oEvent.getParameter("valid");
      if (bValid) {
            oDP.setValueState(sap.ui.core.ValueState.None);
          } else {
            oDP.setValueState(sap.ui.core.ValueState.Error);
          }
      var fieldId = oEvent.getSource().getId();
      if (fieldId.split("--")[2] === "idCoDate"){
          var sValue = oEvent.getParameter("value");
          var parts = sValue.split('-');
          // sValu format yyyy-MM-dd; MM starts from 0-11 for months
          var dateObj = new Date(parts[0], parts[1], parts[2]);
          //this.getView().getModel("local").setProperty("/customerOrder/DelDate", dateObj);
          this.getView().byId("idCoDelDate").setDateValue(dateObj);
          //this.getView().getModel("local").setProperty("/customerOrder/DelDate", formatter.getIncrementDate(dateObj,1));
      }
    },

    onSubmit: function (evt) {
          $(function() {
                  $('input:text:first').focus();
                      debugger;
                  var $inp = $('input:text');
                  $inp.bind('keydown', function(e) {
                      //var key = (e.keyCode ? e.keyCode : e.charCode);
                      var key = e.which;
                      if (key == 13) {
                          e.preventDefault();
                          var nxtIdx = $inp.index(this) + 1;
                          $(":input:text:eq(" + nxtIdx + ")").focus();
                      }
                  });
              });
    },

    handleUploadPress: function(oEvent) {
      debugger;
      var oFileUploader = this.getView().byId("idCoUploader");
      var domRef = oFileUploader.getFocusDomRef();
      var file = domRef.files[0];
      var that = this;
      this.fileName = file.name;
      this.fileType = file.type;

        var reader = new FileReader();
        reader.onload = function(e) {
          debugger;
          var oFile = {};
          oFile.imgContent = e.currentTarget.result.replace("date:image/jpeg;base64,", "");
          // that.aFiles.push(oFile);
          var picture = btoa(encodeURI(oFile.imgContent));
          that.getView().getModel("local").setProperty("/customerOrder/Picture",  oFile.imgContent);
        }
        reader.readAsDataURL(file);

    },

    handleResponsivePopoverPress: function (oEvent) {
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("sap.m.sample.ResponsivePopover.CustomerOrderPhoto", this);
				this._oPopover.bindElement("/ProductCollection/0");
				this.getView().addDependent(this._oPopover);
			}

			this._oPopover.openBy(oEvent.getSource());
		},

		handleCloseButton: function (oEvent) {
			this._oPopover.close();
		},

    onSave: function(oEvent){

      var that = this;
      that.getView().setBusy(true);
      debugger;
      var myData = this.getView().getModel('local').getProperty("/customerOrder");
      // myData.Date =  this.getView().byId("idCoDate").getValue();
      // myData.DelDate = this.getView().byId("idCoDelDate").getValue();
      // var dateObj = this.getView().byId("idCoDate").getDateValue();
      // var delDateObj = this.getView().byId("idCoDelDate").getDateValue();
      myData.Date = this.getView().byId("idCoDate").getDateValue();
      myData.DelDate = this.getView().byId("idCoDelDate").getDateValue();
       this.getView().getModel("local").setProperty("/customerOrder/Date",   myData.Date);
       this.getView().getModel("local").setProperty("/customerOrder/DelDate", myData.DelDate);
      // this.getView().getModel("local").setProperty("/customerOrder/Date", dateObj);
      // this.getView().getModel("local").setProperty("/customerOrder/DelDate", delDateObj);
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/CustomerOrders",
                                "POST", {}, myData, this)
      .then(function(oData) {
        debugger;
        that.getView().setBusy(false);
        sap.m.MessageToast.show("Data Saved Successfully");

      }).catch(function(oError) {
        that.getView().setBusy(false);
        var oPopover = that.getErrorMessage(oError);
      });
      ;
    },

    onDelete: function(){
      debugger;
      var that = this;
      sap.m.MessageBox.confirm("Do you want to delete the selected entries",{
    title: "Confirm",                                    // default
    styleClass: "",                                      // default
    initialFocus: null,                                  // default
    textDirection: sap.ui.core.TextDirection.Inherit,     // default
    onClose : function(sButton){
      debugger;
      if (sButton === MessageBox.Action.OK) {
        var aSelectedLines = that.byId("idCoTable").getSelectedItems();
        if (aSelectedLines.length) {
          for(var i=0; i < aSelectedLines.length; i++){
            var myUrl = aSelectedLines[i].getBindingContext().sPath;
            that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,
                                      "DELETE", {}, {}, that);
          } //end for
        } //end if aSelectedLines
        sap.m.MessageToast.show("Selected lines are deleted");
      } //end if sButton
    }
});
},
    onClear: function(){
      //this.byId("idCoDate").setValue("");
      //this.byId("idCoDelDate").setValue("");
      // this.getView().getModel("local").setProperty("/customerOrder/Date", formatter.getFormattedDate(0));
      // this.getView().getModel("local").setProperty("/customerOrder/DelDate", formatter.getFormattedDate(1));

      this.getView().byId("idCoDate").setDateValue(new Date());
      var date = new  Date();
      var dd = date.getDate();
      var mm = date.getMonth() + 1;
      var yyyy = date.getFullYear();
      this.getView().byId("idCoDelDate").setDateValue(new Date(yyyy, mm, dd));
      this.byId("idCoCustomer").setValue("");
      this.byId("idCoCustomerText").setValue("");
      this.byId("idCoMaterial").setValue("");
      this.byId("idCoMatName").setValue("");
      this.byId("idCoQty").setValue("0");
      this.byId("idCoWeight").setValue("0");
      this.byId("idCoMaking").setValue("0");
      this.byId("idCoRemarks").setValue("");
      this.byId("idCoCash").setValue("0");
      this.byId("idCoGold").setValue("0");
      this.byId("idCoSilver").setValue("0");
      this.byId("idCoPicture").setValue("");
      this.byId("idCoKarigar").setValue("");
      this.byId("idCoKarigarName").setValue("");
    },

    onUpdateFinished: function(oEvent){
      var oTable = oEvent.getSource();
      var itemList = oTable.getItems();
      var noOfItems = itemList.length;
      var value1;
      var id;
      var cell;
      debugger;
      for (var i = 0; i < noOfItems; i++) {
        //Read the GUID from the Screen for customer, material and karigar
        var customerId = oTable.getItems()[i].getCells()[3].getText();
        var customerData = this.allMasterData.customers[customerId];
        oTable.getItems()[i].getCells()[2].setText(customerData.CustomerCode + ' - ' + customerData.Name );

        var materialId = oTable.getItems()[i].getCells()[5].getText();
        var materialData = this.allMasterData.materials[materialId];
        oTable.getItems()[i].getCells()[4].setText(materialData.ProductCode + ' - ' + materialData.ProductName );

        var karigarId = oTable.getItems()[i].getCells()[11].getText();
        if (karigarId !== "null" && karigarId !== " ") {
          var customerData = this.allMasterData.customers[karigarId];
          oTable.getItems()[i].getCells()[10].setText(customerData.CustomerCode + ' - ' + customerData.Name );
        }

        var remarks = oTable.getItems()[i].getCells()[9].getText();
        if (remarks === "null") {
          oTable.getItems()[i].getCells()[9].setText(" ");
        }
      }
    }

  });
});
