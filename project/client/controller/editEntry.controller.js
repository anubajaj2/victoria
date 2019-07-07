sap.ui.define(["victoria/controller/BaseController",
"sap/ui/model/json/JSONModel"],
function (BaseController, JSONModel) {
  "use strict";
  return BaseController.extend("victoria.controller.editEntry",{
    onInit: function () {
      var oViewModel = new JSONModel({
                  "id": "",
                  "City": "",
                  "CustomerCode": "",
                  "Name": "",
                  });

                  this.setModel(oViewModel, "customerModel");
    },
    onPressDownload: function() {
      debugger;
      var test = this.getView().getModel("customerModel");
      var custId = test.oData.id;
      $.post("/kaachiDownload",{id: custId}).then();
    },

    customerCodeCheck : function(oEvent){
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
