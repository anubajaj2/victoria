sap.ui.define([
  "victoria/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/routing/History",
  "sap/m/MessageToast",
  "victoria/models/formatter"
],
function(BaseController, JSONModel, History, MessageToast, formatter){
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
  // that.getView().getModel("local").setProperty("/CustomCalculation");
	// this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
	//  "/CustomCalculation", "GET", {}, {}, this)
	// 	.then(function(oData) {
	// 		var oModelCalculation = new JSONModel();
	// oModelCalculation.setData(oData);
	// that.getView().setModel(oModelCalculation, "calculationModelInfo");
  //
	// 	}).catch(function(oError) {
	// 			MessageToast.show("cannot fetch the data");
	// 	});
this.ClearCalculation();
},

  ClearCalculation : function(){

  },
  onliveChange: function(oEvent){
    this.byId("idSaveIcon").setColor('red');
    // var oCurrentRow = oEvent.getSource().getParent();
    // var cells = oCurrentRow.getCells();
    // cells[3].setValue(cells[1].getValue() * cells[2].getValue() / 100);
    // this.byId("idTunch")

  },

  SaveCalculation : function(){
    var that = this;
    // var valid = true;
    var oGoldId = this.getView().byId("idGold")
    var oSilverId = this.getView().byId("idSilver");
      var oreturn = that.handleGoldSilverValidation(oGoldId, oSilverId);
      // if(!handleGoldSilverValidation(oGold1, oSilver1)) {
      //   return false;
      // }
 if (oreturn == true){
    that.getView().setBusy(true);
        var myData = this.getView().getModel("local").getProperty("/CustomCalculation");
    var i = 0;
    var id = "";
    // var id  = that.getView().getModel("local").getProperty("/CustomCalculation")[i].id;
    var myUrl = "/CustomCalculations('" + id + "')"
     // this.getView().getModel("local").setProperty("/CustomCalculation", myData);
     // var calculationJson = this.getView().getModel("calculationModelInfo").getData().results;
     // this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
     //  myUrl, "GET", {}, {}, this)
     //   .then(function(oData) {
     //     var oModelCustom = new JSONModel();
     // oModelCustom.setData(oData);
     // that.getView().setModel(oModelCustom, "CustomCalculationInfo");
     // var found = 1;
     //
     //   }).catch(function(oError) {
     //       MessageToast.show("cannot fetch the data");
     //   });
     // var customModel = this.getView().getModel("CustomCalculation");
     // var customId = "/CustomCalculations("+that.getModel("CustomCalculation").getProperty("/Id")+ ")";
     //  var customJson = this.getView().getModel("CustomCalculationInfo");
     // function getCustomId(customId) {
     //   return customJson.filter(
     //        function (myData) {
     //          return myData.id === customId;
     //        }
     //      );
     //    }
     //
     //    var found = getCustomId(customId);
     var customModel = this.getView().getModel("customModel");
     var customCode = customModel.getData().id;
     var customJson = this.getView().getModel("CustomCalculation").getData().results;
     function getCustomId(customCode) {
       return customJson.filter (
            function (data) {
              return data.id === customCode;
            }
          );
        }

        var found = getCustomCode(customCode);
        if(found.length > 0){

          this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
           "/CustomCalculations('"+found[0].id+"')", "PUT", {}, myData , this)
            .then(function(oData) {
            MessageToast.show("Data saved successfully");
            that._onRouteMatched();
            }).catch(function(oError) {
                MessageToast.show("Data could not be saved");
            });

        }
        else {
          this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
           "/CustomCalculations", "POST", {}, myData , this)
            .then(function(oData) {
              that.getView().setBusy(false);
            MessageToast.show("Data saved successfully");
            // that._onRouteMatched();
            }).catch(function(oError) {
              that.getView().setBusy(false);
              var oPopover = that.getErrorMessage(oError);
            });
          }
            ;
}
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
