sap.ui.define(["victoria/controller/BaseController",
"sap/ui/model/json/JSONModel",
"sap/m/MessageToast"],
function (BaseController, JSONModel, MessageToast) {
  "use strict";
  return BaseController.extend("victoria.controller.reports",{
    onInit: function () {
      var oViewModel = new JSONModel({
                  "id": "",
                  "City": "",
                  "CustomerCode": "",
                  "Name": "",
                  });

                  this.setModel(oViewModel, "customerModel");
    },
    onPressKacchiDownload: function() {
      var test = this.getView().getModel("customerModel");
      var reportType = "Kacchi";
      var custId = test.oData.id;
      var name = test.oData.Name;
      var city = test.oData.City;
      window.open("/kaachiDownload?type=Kacchi&id="+custId+"&name="+name+"&city="+city);
    //   $.post("/kaachiDownload",{id: custId, name: name, city: city, type: reportType}).then(function(oData)
    // {
    //   MessageToast.show("Data downloaded successfully");
    // },function(oError){debugger;
    //   MessageToast.show("Data could not be downloaded");
    // });
    },
    //
    onPressStockDownload: function(){
      var reportType = "Stock_Report";
      // $.post("/stockDownload",{type: reportType}).then(function()
      // {
      //   debugger;
      //   MessageToast.show("Data downloaded successfully");
      // },function(oError){
      //   debugger;
      //   MessageToast.show("Data could not be downloaded");
      // });
        window.open("/stockDownload?type=Stock_Report");
    },

    onPressEntryDownload: function() {
      var test = this.getView().getModel("customerModel");
      var reportType = "Entry";
      var custId = test.oData.id;
      var name = test.oData.Name;
      var city = test.oData.City;
      $.post("/entryDownload",{id: custId, name: name, city: city, type: reportType}).then(function(oData)
    {
      debugger;
      MessageToast.show("Data downloaded successfully");
    },function(oError){debugger;
      MessageToast.show("Data could not be downloaded");
    });
    },

    onPressBookingDownload:function(){
      var test = this.getView().getModel("customerModel");
      var reportType = "Booking_Summary";
      var custId = test.oData.id;
      var custName = test.oData.Name;
      // $.post("/bookingDownload",{id: custId, name: custName, type: reportType}).then(function(oData)
      // {
      // debugger;
      // MessageToast.show("Data downloaded successfully");
      // },function(oError){
      // debugger;
      // MessageToast.show("Data could not be downloaded");
      // });
      window.open("/bookingDownload?type=Booking_Summary&id="+custId+"&name="+custName);
    },

    onPressPOrderDownload:function(){
      var test = this.getView().getModel("customerModel");
      var reportType = "Pending_Order_Summary";
      var custId = test.oData.id;
      var name = test.oData.Name;
      var city = test.oData.City;
      $.get("/pOrderDownload").then(function(oData)
      {
      debugger;
      MessageToast.show("Data downloaded successfully");
      },function(oError){
      debugger;
      MessageToast.show("Data could not be downloaded");
      });
    },
// code added by surya -start
    onPressGWiseDownload: function() {
      var reportType = "Group_Wise_Report";
      $.post("/groupWiseEntryDownload",{type: reportType}).then(function(oData)
    {
      debugger;
      MessageToast.show("Data downloaded successfully");
    },function(oError){debugger;
      MessageToast.show("Data could not be downloaded");
    });
    },

    onPressCustCodeDownload: function() {
    //   var reportType = "Customer_Codes";
    //   $.post("/custCodeDownload",{type: reportType}).then(function(oData)
    // {
    //   debugger;
    //   MessageToast.show("Data downloaded successfully");
    // },function(oError){debugger;
    //   MessageToast.show("Data could not be downloaded");
    // });
    window.open("/custCodeDownload?type=Customer_Codes");
    },

    onPressMaterialDownload: function() {
      var reportType = "Materials";
    //   $.post("/materialDownload",{type: reportType}).then(function(oData)
    // {
    //   debugger;
    //   MessageToast.show("Data downloaded successfully");
    // },function(oError){debugger;
    //   MessageToast.show("Data could not be downloaded");
    // });
    window.open("/materialDownload?type=Materials");
    },

    onPressCityDownload: function() {
      var reportType = "City";
    //   $.post("/cityDownload",{type: reportType}).then(function(oData)
    // {
    //   debugger;
    //   MessageToast.show("Data downloaded successfully");
    // },function(oError){debugger;
    //   MessageToast.show("Data could not be downloaded");
    // });
    window.open("/cityDownload?type=City");
    },

    onPressGroupDownload: function() {
    //   var reportType = "Groups";
    //   $.post("/groupsDownload",{type: reportType}).then(function(oData)
    // {
    //   debugger;
    //   MessageToast.show("Data downloaded successfully");
    // },function(oError){debugger;
    //   MessageToast.show("Data could not be downloaded");
    // });
    window.open("/groupsDownload?type=Groups");
    },
// code added by surya end

    onPressClear: function(){
      this.getView().byId("idCustomerCode").setValue("");
      this.getView().byId("idName").setText("");
      this.getView().byId("idCity").setText("");
    },

    customerCodeCheck : function(oEvent){
      debugger;
          $(function() {
                  $('input:text:first').focus();
                  var $inp = $('input:text');
                  $inp.bind('keypress', function(e) {
                      //var key = (e.keyCode ? e.keyCode : e.charCode);
                      var key = e.which;
                      if (key == 13) {
                          e.preventDefault();
                          var nxtIdx = $inp.index(this) + 1;
                          $(":input:text:eq(" + nxtIdx + ")").focus();
                      }
                  });
              });

              var customerModel = this.getView().getModel("customerModel");
              var selectedCustData =oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
              var customerCode = selectedCustData.CustomerCode;

              var oCustCode = this.getView().byId("idCustomerCode").getValue();
               var found =  customerCode;

            if(found.length > 0){
              customerModel.setProperty("/CustomerCode", selectedCustData.CustomerCode);
              customerModel.setProperty("/id", selectedCustData.id);
              customerModel.setProperty("/City", selectedCustData.City);
              customerModel.setProperty("/Name", selectedCustData.Name);
              customerModel.refresh();
              }else{
                customerModel.getData().City = "";
                customerModel.getData().Name = "";
                customerModel.getData().id = "";
                customerModel.refresh();
              }
        },


    CustomerPopup: function (Evt) {
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
    },

    onValueHelpRequest: function () {
      this.CustomerPopup();
    },
    onConfirm: function (oEvent) {
     var myData = this.getView().getModel("local").getProperty("/editEntryData");
     var selCust = oEvent.getParameter("selectedItem").getLabel();
     var selCustName = oEvent.getParameter("selectedItem").getValue();
     this.getView().byId("idCust").setValue(selCust);
     this.getView().byId("idCustText").setValue(selCustName);
     myData.Customer=oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
     this.getView().getModel("local").getProperty("/editEntryData",myData);


    }

  });

});
