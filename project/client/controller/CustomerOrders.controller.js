sap.ui.define([
  "victoria/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "victoria/models/formatter",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/m/Dialog"
],function (BaseController, JSONModel, formatter, MessageToast, MessageBox, Dialog) {
      "use strict";
        var coId;
        var selRow;
  return BaseController.extend("victoria.controller.CustomerOrders", {
    formatter: formatter,
    onInit: function () {
      BaseController.prototype.onInit.apply(this);

      var oRouter = this.getRouter();
    oRouter.getRoute("customerOrders").attachMatched(this._onRouteMatched, this);
  },

  _onRouteMatched : function(){
  	var that = this;
    that.getView().byId("idCoDate").setDateValue(new Date());
    var date = new  Date();
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    that.getView().byId("idCoDelDate").setDateValue(new Date(yyyy, mm, dd));
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
        var myData = this.getView().getModel("local").getProperty("/customerOrder");
        if(oEvent.getSource().getTitle() === "Material Search"){
          var selMat = oEvent.getParameter("selectedItem").getLabel();
          var selMatName = oEvent.getParameter("selectedItem").getValue();
          //this.getView().byId("idCoMaterial").setValue(selMat);
          this.getView().byId("idCoMatName").setValue(selMatName);
          var matId = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
          this.getView().getModel("local").setProperty("/customerOrder/Material", matId);
          this.getView().getModel("local").setProperty("/coTemp/MaterialCode", selMat);
          var materialData = this.allMasterData.materials[matId];
          // fill Material Type, Karat, Making and Category based on the material code selected
            this.getView().byId("idCoMatType").setValue(materialData.Type);
            this.getView().byId("idCoMatKarat").setValue(materialData.Karat);
            this.getView().byId("idCoMatMaking").setValue(materialData.Making + "/" + materialData.Category );
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
          myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
          var oFilter = new sap.ui.model.Filter("Customer","EQ", "'" + myData.Customer + "'");
          this.getView().byId("idCoTable").getBinding("items").filter(oFilter);
        }

        //this.getView().getModel("local").setProperty("/customerOrder", myData);
    },
    // Search in dialog for material and customer f4 help
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
// check if date and delivery date are valid and when date changed set delivery
// date to +1 month
    onDateChange:function(oEvent){
      var oDP = oEvent.getSource();
      var bValid = oEvent.getParameter("valid");
      if (bValid) {
            oDP.setValueState(sap.ui.core.ValueState.None);
          } else {
            oDP.setValueState(sap.ui.core.ValueState.Error);
          }
      var fieldId = oEvent.getSource().getId();
      debugger;
      if (fieldId.split("--")[2] === "idCoDate"){
          var sValue = oEvent.getParameter("value");
          var parts = sValue.split('-');
          // sValu format yyyy-MM-dd; MM starts from 0-11 for months
          var dateObj = new Date(parts[0], parts[1], parts[2]);
          this.getView().byId("idCoDelDate").setDateValue(dateObj);
          //var myData = this.getView().getModel("local").getProperty("/customerOrder");
          // myData.Date = this.getView().byId("idCoDate").getDateValue();

          // var oFilter = new sap.ui.model.Filter("Date","EQ", "'" + sValue + "'");
          // this.getView().byId("idCoTable").getBinding("items").filter(oFilter);
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

    onSelectPhoto: function(oEvent){
      debugger;
      var that = this
      //Check if photo already exists for the CO Order
      // move the id of selected row to global variable
       //coId = oEvent.getSource().getBindingContext().getPath().split("'")[1];
       coId = oEvent.getSource().getBindingContext().getProperty("id");
       this.selRow = oEvent.getSource().getBindingContext().getObject();
       var relPath = oEvent.getSource().getBindingContext().getPath() + ("/ToPhotos");

       this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
     	 relPath, "GET", {}, {}, this)
     		.then(function(oData) {
          debugger;
        // if photo not assigned, call photo upload popup else show photo
        //  if (oData.results.length === 0) {
              if (!that.photoPopup) {
                that.photoPopup = new sap.ui.xmlfragment("victoria.fragments.PhotoUploadDialog", that);
                that.getView().addDependent(that.photoPopup);
              }
              var oModelPhoto = new JSONModel();
              oModelPhoto.setData(oData.results[0]);
              that.getView().setModel(oModelPhoto, "photo");
              that.photoPopup.open();
            // }else {
            //   var oModelPhoto = new JSONModel();
            //   oModelPhoto.setData(oData.results[0]);
            //   that.getView().setModel(oModelPhoto, "photo");
            //   if (!that.photogallPopup) {
            //     that.photogallPopup = new sap.ui.xmlfragment("victoria.fragments.PhotoGalleryDialog", that);
            //     that.getView().addDependent(that.photogallPopup);
            //   }
            //   that.photogallPopup.open();
            // }
     		}).catch(function(oError) {
     				//MessageToast.show("cannot fetch the data");

     		});
     },

    handleUploadPress: function(oEvent) {
      debugger;
      // var oFileUploader = this.getView().byId("idCoUploader");
      // var domRef = oFileUploader.getFocusDomRef();
      // var file = domRef.files[0];
      var oFileUploader = sap.ui.getCore().byId("idCoUploader");
      if (!oFileUploader.getValue()) {
        sap.m.MessageToast.show("Choose a file first");
        return;
      }
      var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];

      var that = this;
      this.fileName = file.name;
      this.fileType = file.type;

        var reader = new FileReader();
        reader.onload = function(e) {
          var oFile = {};
          //oFile.imgContent = e.currentTarget.result.replace("data:image/jpeg;base64,", "");
          oFile.imgContent = e.currentTarget.result;
          // that.aFiles.push(oFile);
          var picture = oFile.imgContent ; //btoa(encodeURI(oFile.imgContent));
          //that.getView().getModel("local").setProperty("/customerOrder/Picture",  oFile.imgContent);
          var payload = {
            CustomerOrderId: coId,
            //Photo: picture
            Content: picture,
            Filename: that.fileName,
            Filetype: that.fileType
          }
          var that2 = that;
          //TODO: if its not there POST, update our main table record with "X"
          //else, simply shpow the popup and upload buuton should do an update of photo content
          that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Photos",
                            "POST", {}, payload, that)
            .then(function(oData) {
              debugger;
                sap.m.MessageToast.show("Photo uploaded Successfully");
// update picture flage in customer orders
                that2.selRow.Picture = "X";
                var payload = {
                  id: that2.selRow.id,
                  PhotoValue : "X"
                };
                $.post('/updatePhotoFlag', payload)
        					.done(function(data, status) {
        						sap.m.MessageToast.show("Data updated");
        					})
        					.fail(function(xhr, status, error) {
        						sap.m.MessageBox.error("Failed to update");
        					});
                // that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/CustomerOrders('" + that2.selRow.id + "')",
                //                   "PUT", {}, that2.selRow, that)
                //   .then(function(oData) {
                //       debugger;
                //   }).catch(function(oError) {
                //     that.getView().setBusy(false);
                //     var oPopover = that.getErrorMessage(oError);
                //   });
                that.getView().setBusy(false);
              }).catch(function(oError) {
                that.getView().setBusy(false);
                var oPopover = that.getErrorMessage(oError);
              });
            ;
        }
        reader.readAsDataURL(file);

    },
// close photo upload popup
    handleClosePress: function(oEvent){
      if (!this.photoPopup){
        this.photoPopup = new sap.ui.xmlfragment("victoria.fragments.PhotoUploadDialog", this);
      }
      var oFileUploader = sap.ui.getCore().byId("idCoUploader");
      oFileUploader.setValue("");
      this.photoPopup.close();
    },

    onSave: function(oEvent){
      var that = this;
      that.getView().setBusy(true);
      debugger;
      var myData = this.getView().getModel('local').getProperty("/customerOrder");
      if (myData.Qty === "0") {
        var Qty = this.getView().byId("idCoQty");
        Qty.setValueState(sap.ui.core.ValueState.Error).setValueStateText("Qty can't be 0")
        that.getView().setBusy(false);
        return;
      }else{
        var Qty = this.getView().byId("idCoQty");
        Qty.setValueState(sap.ui.core.ValueState.None);
      }
      myData.Date = this.getView().byId("idCoDate").getDateValue();
      myData.DelDate = this.getView().byId("idCoDelDate").getDateValue();
      if (myData.Date > myData.DelDate ) {
        sap.m.MessageBox.error("Delivery date should be greater than Date");
        that.getView().setBusy(false);
        return;
      }
      this.getView().getModel("local").setProperty("/customerOrder/Date",   myData.Date);
       this.getView().getModel("local").setProperty("/customerOrder/DelDate", myData.DelDate);
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/CustomerOrders",
                                "POST", {}, myData, this)
      .then(function(oData) {
        debugger;
        that.getView().setBusy(false);
        sap.m.MessageToast.show("Data Saved Successfully");
        that.onClear();

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
      debugger;
      this.getView().byId("idCoDate").setDateValue(new Date());
      var date = new  Date();
      var dd = date.getDate();
      var mm = date.getMonth() + 1;
      var yyyy = date.getFullYear();
      this.getView().byId("idCoDelDate").setDateValue(new Date(yyyy, mm, dd));
      //this.byId("idCoCustomer").setValue("");
      this.byId("idCoCustomerText").setValue("");
      this.byId("idCoMaterial").setValue("");
      this.byId("idCoMatName").setValue("");
      this.byId("idCoMatType").setValue("");
      this.byId("idCoMatKarat").setValue("");
      this.byId("idCoMatMaking").setValue("");
      this.byId("idCoQty").setValue("1");
      this.byId("idCoWeight").setValue("0");
      this.byId("idCoMaking").setValue("0");
      this.byId("idCoRemarks").setValue("");
      this.byId("idCoCash").setValue("0");
      this.byId("idCoGold").setValue("0");
      this.byId("idCoSilver").setValue("0");
      //this.byId("idCoPicture").setValue("");
      this.byId("idCoKarigar").setValue("");
      this.byId("idCoKarigarName").setValue("");
      this.getView().getModel("local").setProperty("/coTemp/MaterialCode", "");
      this.getView().getModel("local").setProperty("/coTemp/CustomerCode", "");
      this.getView().getModel("local").setProperty("/coTemp/KarigarCode", "");
      this.getView().getModel("local").setProperty("/customerOrder/Karigar","");
      this.getView().getModel("local").setProperty("/customerOrder/Material","");
      this.getView().getModel("local").setProperty("/customerOrder/Customer","");
      this.getView().byId("idCoTable").getBinding("items").filter([]);
    },

    onUpdateFinished: function(oEvent){
      var oTable = oEvent.getSource();
      var itemList = oTable.getItems();
      var noOfItems = itemList.length;
      var value1;
      var id;
      var cell;
      debugger;
      var title = this.getView().getModel("i18n").getProperty("coTableTitle");
      //this.getView().byId("idCoTitle").setText(title + " " + "(" + noOfItems + ")");
      this.getView().byId("idCoTable").getHeaderToolbar().getTitleControl().setText(title + " " + "(" + noOfItems + ")");
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
