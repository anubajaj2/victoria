sap.ui.define(["victoria/controller/BaseController"],
function (BaseController) {
  "use strict";
  return BaseController.extend("victoria.controller.Entry",{
    onInit: function () {

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
    }
    // onConfirm: function (oEvent) {
    //  var myData = this.getView().getModel("local").getProperty("/EntryData");
    //  var selCust = oEvent.getParameter("selectedItem").getLabel();
    //  var selCustName = oEvent.getParameter("selectedItem").getValue();
    //  this.getView().byId("idCust").setValue(selCust);
    //  this.getView().byId("idCustText").setValue(selCustName);
    //  myData.Customer=oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
    //  this.getView().getModel("local").getProperty("/editEntryData",myData);
    //
    //
    // }

  });

});
