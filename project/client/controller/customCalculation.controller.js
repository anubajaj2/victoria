sap.ui.define([
  "victoria/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/routing/History",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "victoria/models/formatter"
],
function(BaseController, JSONModel, History, MessageToast, MessageBox, formatter){
  // "use strict";

  return BaseController.extend("victoria.controller.customCalculation", {
  formatter:formatter,
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
	onInit : function () {
    var oViewModel1 = new JSONModel({
         "First": "",
            "Second": "",
            "Gold": "",
            "Silver": "",
            "Gold Returns": "",
            "Silver Returns": "",
            "Gold1": "",
            "Silver1": "",
            "Kaccha Gold": "",
            "Kaccha Silver":"",
            "Gold Returns1":"",
            "Silver Returns1":"",
            "Kaccha Gold R": "",
            "Kaccha Silver R": ""

            });
            this.setModel(oViewModel1, "customModel");
  BaseController.prototype.onInit.apply(this);
    var oRouter = this.getRouter();
    oRouter.getRoute("Customizing").attachMatched(this._onRouteMatched, this);
},

getRouter: function () {
return sap.ui.core.UIComponent.getRouterFor(this);
},
_onRouteMatched : function(){
  var that = this;
  // that.getView().getModel("local").setProperty("/CustomCalculations");
	this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
	 "/CustomCalculations", "GET", {}, {}, this)
		.then(function(oData) {
			var oModelCalculation = new JSONModel();
	oModelCalculation.setData(oData);
  if(oData.results.length > 0){
 var myData = that.getView().getModel("local").setProperty("/CustomCalculation", oData.results[0], oModelCalculation);
}
else{
  var myData = that.getView().getModel("local").getProperty("/CustomCalculation");
}
		}).catch(function(oError) {
				MessageToast.show("cannot fetch the data");
		});
this.ClearCalculation();
},

  ClearCalculation : function(){

  },
  validateAll : function(myData){
     var retVal = true;
    if(myData.First < 25000 || myData.Second < 25000
     || myData.Gold < 25000 || myData.Gold1 < 25000 ||
     myData.GoldReturns < 25000 || myData.GoldReturns1 < 25000
     || myData.KacchaGold < 25000 || myData.KacchaGoldR < 25000 ||
     myData.First > 40000 || myData.Second > 40000
      || myData.Gold > 40000 || myData.Gold1 > 40000 ||
      myData.GoldReturns > 40000 || myData.GoldReturns1 > 40000
      || myData.KacchaGold > 40000 || myData.KacchaGoldR > 40000){
        MessageBox.error("Value range for Gold should be between 25000 and 40000");
        retVal = false;
        return retVal;
      }
      else{
        if(myData.Silver < 32000 || myData.Silver1 < 32000 ||
         myData.SilverReturns < 32000 || myData.SilverReturns1 < 32000
         || myData.KacchaSilver < 32000 || myData.KacchaSilverR < 32000 ||
        myData.Silver > 65000 || myData.Silver1 > 65000 ||
          myData.SilverReturns > 65000 || myData.SilverReturns1 > 65000
          || myData.KacchaSilver > 65000 || myData.KacchaSilverR > 65000){
            MessageBox.error("Value range for Silver should be between 32000 and 65000");
            retVal = false;
          }
          else{
        retVal = true;
      }
        return retVal;
      }
  },
  // onValidateFieldGroup: function(oEvent){
  //   var that =  this;
  //   var valid = true;
  //   var oFieldId = oEvent.getParameters().fieldGroupIds;
  //   var oFieldValue = oEvent.getSource().getValue();
  //   if(oFieldId[0] === "GoldField") {
  //   var oReturn = that.handleGoldValidation(oFieldValue);
  //   }
  //   if(oReturn === false){
  //     oEvent.getSource().setValueState("Error").setValueStateText("Gold value should be between 25000 and 40000");
  //     return oReturn;
  //   }
  //   else{
  //     oEvent.getSource().setValueState("None");
  //     return oReturn;
  //   }
  // },
  onliveChange: function(oEvent){
    var that = this;
    this.byId("idSaveIcon").setColor('red');

  },
  onValueChange: function(oEvent){
    var oFieldLab = oEvent.getSource().getIdForLabel();
  },

  SaveCalculation : function(oEvent){
    var that = this;
    var retVal = true;
    that.getView().setBusy(true);
      var myData = that.getView().getModel("local").getProperty("/CustomCalculation");
      var id = myData.id;
      var retVal = that.validateAll(myData);
      if(retVal === true) {
       // var calculationJson = that.getView().getModel("myData").results;
       // function getCustomCode(id) {
       //      return calculationJson.filter(
       //        function (data) {
       //          return data.id === id;
       //        }
       //      );
       //    }
       //
       //      	var found = getCustomCode(id);
        if(id){
        this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
         "/CustomCalculations('"+myData.id+"')", "PUT", {},myData , this)
          .then(function(oData) {
            that.getView().setBusy(false);
          MessageToast.show("Data saved successfully");
          that._onRouteMatched();
          that.byId("idSaveIcon").setColor('green');
          // that._onRouteMatched();
          }).catch(function(oError) {
            that.getView().setBusy(false);
            var oPopover = that.getErrorMessage(oError);
          });
        }
      else {
        this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
         "/CustomCalculations", "POST", {}, myData , this)
        .then(function(oData) {
          that.getView().setBusy(false);
        MessageToast.show("Data saved successfully");
        that._onRouteMatched();
        that.byId("idSaveIcon").setColor('green');
        // that._onRouteMatched();
        }).catch(function(oError) {
          that.getView().setBusy(false);
          var oPopover = that.getErrorMessage(oError);
        });
      }
    }
    else{
        that.getView().setBusy(false);
    }
            ;

// else {
//
// }
},
        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Binds the view to the object path.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched : function (oEvent) {
          var sObjectId =  oEvent.getParameter("arguments").objectId;
          this.getModel().metadataLoaded().then( function() {
            var sObjectPath = this.getModel().createKey("city", {
              Id :  sObjectId
            });
            this._bindView("/" + sObjectPath);
          }.bind(this));


  },
  /**
   * Binds the view to the object path.
   * @function
   * @param {string} sObjectPath path to the object to be bound
   * @private
   */
  _bindView : function (sObjectPath) {
    var oViewModel1 = this.getModel("objectView"),
      oDataModel = this.getModel();

    this.getView().bindElement({
      path: sObjectPath,
      events: {
        change: this._onBindingChange.bind(this),
        dataRequested: function () {
          oDataModel.metadataLoaded().then(function () {
            // Busy indicator on view should only be set if metadata is loaded,
            // otherwise there may be two busy indications next to each other on the
            // screen. This happens because route matched handler already calls '_bindView'
            // while metadata is loaded.
            oViewModel1.setProperty("/busy", true);
          });
        },
        dataReceived: function () {
          oViewModel1.setProperty("/busy", false);
        }
      }
    });
  },
});
}
);
