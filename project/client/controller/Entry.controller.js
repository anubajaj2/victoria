sap.ui.define(["victoria/controller/BaseController","sap/ui/model/json/JSONModel","victoria/models/formatter"],
function (BaseController,JSONModel,formatter) {
  "use strict";
  return BaseController.extend("victoria.controller.Entry",{
    formatter:formatter,
    onInit: function () {
        BaseController.prototype.onInit.apply(this);

        var iOriginalBusyDelay,
        oViewModel = new JSONModel({
          busy : false,
          delay : 0,
          dateValue: new Date(),
          Customer:"",
          Cash:1400,
          Gold:0,
          Silver:0,
          Remarks:"",
          Weight:0,
          Tunch:0,
          DueDate:""
        });
        	this.setModel(oViewModel, "objectView");
          this.getView().byId("DateId").setDateValue( new Date());
      },


    onValueHelpRequest: function (oEvent) {
      this.getCustomerPopup(oEvent);
    },
    onCalculate: function (evt) {
      debugger;
      var wtValue = this.byId("idweight").getValue();
      var thValue = this.byId("idtunch").getValue();
      var X = wtValue * thValue / 100;
      var CR = "=Silver Received @ Weight X Tunch T";
      var SR = "=Gold Received @ Weight X Tunch T";
      var KR = "=Kacchi Received @ Weight X Tunch T";
      if (X > 0 && this.getView().byId("RB-1").getSelected()){
        this.getView().byId("idSilver").setValue(X);
        this.getView().byId("idRemarks").setValue(CR);
      }
      else if (X > 0 && this.getView().byId("RB-2").getSelected()){
        this.getView().byId("idGold").setValue(X);
        this.getView().byId("idRemarks").setValue(SR);
      }
      else if (X > 0 && this.getView().byId("RB-3").getSelected()){
        this.getView().byId("idSilver").setValue(X);
        this.getView().byId("idRemarks").setValue(KR);
      }
    },

    onSubmit: function (evt) {
          $(function() {
                  $('input:text:first').focus();
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

    onRadioButtonSelect: function (oEvent) {
      debugger;
    jQuery.sap.delayedCall(500, this, function() {
        this.getView().byId("idweight").focus();
    });
},

    onConfirm: function (oEvent) {
     var myData = this.getView().getModel("local").getProperty("/EntryData");
     var selCust = oEvent.getParameter("selectedItem").getLabel();
     var selCustName = oEvent.getParameter("selectedItem").getValue();
     this.getView().byId("idCust").setValue(selCust);
     this.getView().byId("idCustText").setValue(selCustName);
     myData.Customer=oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
     this.getView().getModel("local").getProperty("/EntryData",myData);
   },

   onSend: function (oEvent) {
     debugger;
     var that=this;
     that.getView().setBusy(true);
     var myData = this.getView().getModel("local").getProperty("/EntryData");
     myData.Date = this.getView().byId("DateId").getDateValue();
     myData.Gold = this.getView().byId("idGold").getValue();
     myData.Cash = this.getView().byId("idCash").getValue();
     myData.Silver = this.getView().byId("idSilver").getValue();
     myData.Remarks = this.getView().byId("idRemarks").getValue();
     myData.Weight = this.getView().byId("idweight").getValue();
     myData.Tunch = this.getView().byId("idtunch").getValue();
     myData.DueDate = this.getView().byId("DueDateId").getDateValue();
     this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Entrys",
                               "POST", {}, myData, this)
     .then(function(oData) {
       that.getView().setBusy(false);
       sap.m.MessageToast.show("Data Saved Successfully");

     }).catch(function(oError) {
       that.getView().setBusy(false);
       var oPopover = that.getErrorMessage(oError);
     });
   },

   onDelete: function(){
     debugger;
     var aSelectedLines = this.byId("idTable").getSelectedItems();
     if (aSelectedLines.length) {
       for(var i=0; i < aSelectedLines.length; i++){
         var myUrl = aSelectedLines[i].getBindingContext().sPath;
         this.ODataHelper.callOData(this.getOwnerComponent().getModel(), myUrl,
                                   "DELETE", {}, {}, this);
       }
     }
   },

   onClear: function(){
       this.getView().byId("DateId").setDateValue( new Date());
     this.byId("idCust").setValue("");
     this.byId("idCustText").setValue("");
     this.byId("idweight").setValue("0");
     this.byId("idRemarks").setValue("");
     this.byId("idCash").setValue("0");
     this.byId("idGold").setValue("0");
     this.byId("idSilver").setValue("0");
     this.byId("idtunch").setValue("0");

   },

   onUpdateFinished: function (oEvent) {
     debugger;
     var oTable = oEvent.getSource();
     var itemList = oTable.getItems();
      var noOfItems = itemList.length;
      var value1;
      var id;
      var cell;
      for (var i=0; i < noOfItems; i++) {
        var customerId = oTable.getItems()[i].getCells()[1].getText();
        var customerData = this.allMasterData.customers[customerId];
        oTable.getItems()[i].getCells()[1].setText(customerData.CustomerCode + ' - ' + customerData.Name );

      }
   }
  });

});
