
sap.ui.define(["victoria/controller/BaseController",
"sap/m/MessageBox",
"sap/m/MessageToast",
"sap/ui/core/routing/History"],
function (BaseController,MessageBox,MessageToast,History) {
  "use strict";
  return BaseController.extend("victoria.controller.pendingOrders", {
    onInit: function () {
    BaseController.prototype.onInit.apply(this);
    var oRouter = this.getRouter();
    oRouter.getRoute("pendingOrders").attachMatched(this._onRouteMatched,this);
  },
  getRouter: function () {
    return sap.ui.core.UIComponent.getRouterFor(this);
  },
  _onRouteMatched: function () {
    var that=this;
    that.getView().getModel("local").setProperty("/stockMaint/Date", new Date());
    this.getView().byId("idDate").setDateValue(new Date());
  },
  onSubmit: function (evt) {
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
},

decimalvalidator: function (oEvent) {

    if(oEvent.mParameters.id==="__component0---idpendingOrders--idweight"){
    $(function() {
      $('input').on('input.idweight',function(event) {
        if(event.currentTarget.id=="__component0---idpendingOrders--idweight-inner"){

        this.value = this.value.match(/^[+-]?\d{0,8}(\.\d{0,3})?/)[0];
      }
      });
    });
}
  },
  onMaterialSelect: function (oEvent) {
    var that=this;
    var selMat = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
    var myData = this.getView().getModel("local").getProperty("/stockMaint");
    selMat.ProductCode;
    selMat.ProductName;
    selMat.Type;
    this.getView().byId("idMat").setValue(selMat.ProductCode);
    this.getView().byId("idMatText").setText(selMat.ProductName + "-" + selMat.Type);
    this.getView().getModel("local").setProperty("/stockMaint/Product",
    oEvent.getParameter("selectedItem").getBindingContext().getPath().split("'")[1]);
     this.getView().getModel("local").getProperty("/stockMaint",myData);
    var oFilter = new sap.ui.model.Filter("Product","EQ", "'" + myData.Product + "'");
    this.getView().byId("idTable").getBinding("items").filter(oFilter);
    $.post("/getTotalStockProduct",{Product: myData.Product}).then(function(result){
      console.log(result);
      that.byId("idQty").setText(result.QuantityTotal);
      that.byId("idWt").setText(result.WeightTotal);
      if(parseFloat(that.byId("idQty").getText())>0){
        that.byId("idQty").setState('Success');
        }else{
        that.byId("idQty").setState('Warning');
      }
      if(parseFloat(that.byId("idWt").getText())>0){
        that.byId("idWt").setState('Success');
        }else{
        that.byId("idWt").setState('Warning');
      }
    });
  },
  onSend: function (oEvent) {
    var that=this;
    that.getView().setBusy(true);
    var myData = this.getView().getModel("local").getProperty("/stockMaint");
     myData.Date = this.getView().byId("idDate").getDateValue();
    // myData.Product=this.getView().byId("idMat").getValue();
    myData.Description=this.getView().byId("idMatText").getText();
    myData.Description=myData.Description.split("-")[0];
    myData.Quantity=this.getView().byId("idqty").getValue();
    var y=this.getView().byId("idweight").getValue();
    var y1=parseFloat(this.byId("idweight").getValue());
    if(this.getView().byId("idMatText").getText().split("-")[1]==="Gold")
    {
       var w1 = y1.toFixed(3);
       var w2 = parseFloat(w1);
       myData.Weight=w2;
     }
     else if(this.getView().byId("idMatText").getText().split("-")[1]==="Silver")
     {
       var w3 = y1.toFixed(2);
       var w4 = parseFloat(w3);
       myData.Weight=w4;
     }


    myData.Remarks = this.getView().byId("idRemarks").getValue();
    this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/stockMaints",
                            "POST", {}, myData, this)
    .then(function(oData){
      that.getView().setBusy(false);
      sap.m.MessageToast.show(that.resourceBundle.getText("Data"));
       that.onClear();
    }).catch(function(oError) {
      that.getView().setBusy(false);
      var oPopover = that.getErrorMessage(oError);
    });
    // this.getView().byId("idDate").setDateValue( new Date());
    // this.getView().byId("idMat").setValue("");
    var x=this.getView().byId("idQty").getText();
    var x1=parseFloat(this.byId("idQty").getText());
    var y=this.getView().byId("idqty").getValue();
    var y1=parseFloat(this.byId("idqty").getValue());
    var z = x1+y1;
    this.byId("idQty").setText(parseFloat(z));
    var z1 = this.byId("idQty").getText();
   if(parseFloat(z1)>0){
     that.byId("idQty").setState('Success');
   }else{
     that.byId("idQty").setState('Warning');
   }
   var x=this.getView().byId("idWt").getText();
   var x1=parseFloat(this.byId("idWt").getText());
   var y=this.getView().byId("idweight").getValue();
   var y1=parseFloat(this.byId("idweight").getValue());
   if(this.getView().byId("idMatText").getText().split("-")[1]==="Gold")
   {
      var y2 = y1.toFixed(3);
      var y3 = parseFloat(y2);
       var z = x1+y3;
    }
   else if(this.getView().byId("idMatText").getText().split("-")[1]==="Silver")
   {
     var y4 = y1.toFixed(2);
     var y5 = parseFloat(y4);
     var z = x1+y5;
   }
   // var z = x1+y3;
   this.byId("idWt").setText(parseFloat(z));
   var z1 = this.byId("idWt").getText();
  if(parseFloat(z1)>0){
    that.byId("idWt").setState('Success');
    }else{
    that.byId("idWt").setState('Warning');
  }
  },
  onClear: function (){
  this.getView().byId("idDate").setDateValue(new Date());
  // this.getView().byId("idMat").setValue("");
  // this.getView().byId("idMatText").setText("");
  this.getView().byId("idqty").setValue("0");
  this.getView().byId("idRemarks").setValue("");
  this.getView().byId("idweight").setValue("0");
  },
  onUpdateFinished: function(oEvent) {
    var oTable = oEvent.getSource();
    var itemList = oTable.getItems();
    var noofItems = itemList.length;
    var title = this.getView().getModel("i18n").getProperty("product");
    this.getView().byId("idTitle").setText(title + "(" + noofItems + ")");
    for(var i=0; i<noofItems; i++){
        var productId = oTable.getItems()[i].getCells()[2].getText();
        var productData = this.allMasterData.materials[productId];
        oTable.getItems()[i].getCells()[1].setText(productData.ProductCode);
    }
  },
  onDelete: function(){
    var that=this;
    sap.m.MessageBox.confirm(
that.resourceBundle.getText("DELETE11"), {
        title: "Confirm",
        actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
        styleClass: "",
        onClose: function(sAction) {
            if(sAction==="OK"){
             var x = that.getView().byId("idTable").getSelectedItems();
             var nQty = 0;
             var nWt = 0;
             for(var i=0; i<x.length; i++){

               var myUrl = x[i].getBindingContext().sPath;
               that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,"DELETE",{},{},that);
                sap.ui.getCore().byId("__component0---idpendingOrders--idTable").getModel().refresh(true);
          var p = x[i].getBindingContext().getObject().Quantity;
          var q = x[i].getBindingContext().getObject().Weight;
          if(p){
            nQty+= nQty + p - nQty;
          }
          if(q){
            nWt+= nWt + q - nWt;
          }
        }
          var TQ = that.byId("idQty").getText();
          var TQ1 = parseFloat(TQ);
          var TQ2 = TQ1-nQty;
          that.byId("idQty").setText(parseFloat(TQ2));
          // that.byId("idTC").setText(TCA);
          that.byId("idQty").getText();
          parseFloat(that.byId("idQty").getText());
          if(parseFloat(that.byId("idQty").getText())>0){
            that.byId("idQty").setState('Success');
            }else{
            that.byId("idQty").setState('Warning');
          }
          var TW = that.byId("idWt").getText();
          var TW1 = parseFloat(TW);
          var TW2 = TW1-nWt;
          that.byId("idWt").setText(parseFloat(TW2));
          // that.byId("idTC").setText(TCA);
          that.byId("idWt").getText();
          parseFloat(that.byId("idWt").getText());
          if(parseFloat(that.byId("idWt").getText())>0){
            that.byId("idWt").setState('Success');
            }else{
            that.byId("idWt").setState('Warning');
          }
            }
          }
        });
      }
  });
});
