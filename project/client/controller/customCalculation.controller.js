sap.ui.define([
  "victoria/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/routing/History",
  "sap/m/MessageToast",
],
function(BaseController, JSONModel, History, MessageToast){
  // "use strict";

  return BaseController.extend("victoria.controller.customCalculation", {
	// onInit : function () {
  //
  // });   // var oViewModel1 = new JSONModel({
    //      "First": "",
    //         "Second": "",
    //         "Gold": "",
    //         "Silver": "",
    //         "Gold Returns": "",
    //         "Silver Returns": "",
    //         "Gold1": "",
    //         "Silver1": "",
    //         "Kaccha Gold": "",
    //         "Kaccha Silver":"",
    //         "Gold Returns1":"",
    //         "Silver Returns1":"",
    //         "Kaccha Gold R": "",
    //         "Kaccha Silver R": ""
    //
    //         });
    // this.setModel(oViewModel1, "calculationModel");

//     var oViewDetailModel = new JSONModel({
//       "buttonText" : "Save",
//       "deleteEnabled" : false
//
//     });
//     this.setModel(oViewDetailModel, "viewModel");
    // var oRouter = this.getRouter();
    // oRouter.getRoute("CustomCalculation").attachMatched(this._onRouteMatched, this);
// },
//
// getRouter: function () {
// return sap.ui.core.UIComponent.getRouterFor(this);
// },
// _onRouteMatched : function(){
// 	var that = this;
// 	var viewModel = this.getView().getModel("viewModel");
// 	// viewModel.setProperty("/codeEnabled", true);
// 	// viewModel.setProperty("/buttonText", "Save");
//
// 	this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
// 	 "/CustomCalculation", "GET", {}, {}, this)
// 		.then(function(oData) {
// 			var oModelCalculation = new JSONModel();
// 	oModelCalculation.setData(oData);
// 	that.getView().setModel(oModelCalculation, "calculationModelInfo");
//
// 		}).catch(function(oError) {
// 				MessageToast.show("cannot fetch the data");
// 		});
// this.ClearCalculation();
// },
//
//   ClearCalculation : function(){
//
//   },
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
  SaveCalculation : function(){
    var that = this;
    that.getView().setBusy(true);
    var myData = this.getView().getModel("local").getProperty("/CustomCalculation");
    // myData.First = this.getView().byId("idFirst").getValue();
    // myData.Second = this.getView().byId("idSecond").getValue();
    // myData.Gold = this.getView().byId("idGold").getValue();
    // myData.Silver = this.getView().byId("idSilver").getValue();
    // myData.GoldReturns = this.getView().byId("idGoldR").getValue();
    // myData.SilverReturns = this.getView().byId("idSilverR").getValue();
    // myData.Gold1 = this.getView().byId("idGold1").getValue();
    // myData.Silver1 = this.getView().byId("idSilver1").getValue();
    // myData.KacchaGold = this.getView().byId("idKacchaGold").getValue();
    // myData.KacchaSilver = this.getView().byId("idKacchaSilver").getValue();
    // myData.GoldReturns1 = this.getView().byId("idGoldR1").getValue();
    // myData.SilverReturns1 = this.getView().byId("idSilverR1").getValue();
    // myData.KacchaGoldR = this.getView().byId("idKacchaGoldR").getValue();
    // myData.KacchaSilverR = this.getView().byId("idKacchaSilverR").getValue();
     // this.getView().getModel("local").setProperty("/CustomCalculation", myData);
     // var calculationJson = this.getView().getModel("calculationModelInfo").getData().results;

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
            ;
        }


  //       /* =========================================================== */
  //       /* internal methods                                            */
  //       /* =========================================================== */
  //
  //       /**
  //        * Binds the view to the object path.
  //        * @function
  //        * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
  //        * @private
  //        */
  //       _onObjectMatched : function (oEvent) {
  //         var sObjectId =  oEvent.getParameter("arguments").objectId;
  //         this.getModel().metadataLoaded().then( function() {
  //           var sObjectPath = this.getModel().createKey("city", {
  //             Id :  sObjectId
  //           });
  //           this._bindView("/" + sObjectPath);
  //         }.bind(this));
  //
  //
  // },
  // /**
  //  * Binds the view to the object path.
  //  * @function
  //  * @param {string} sObjectPath path to the object to be bound
  //  * @private
  //  */
  // _bindView : function (sObjectPath) {
  //   var oViewModel1 = this.getModel("objectView"),
  //     oDataModel = this.getModel();
  //
  //   this.getView().bindElement({
  //     path: sObjectPath,
  //     events: {
  //       change: this._onBindingChange.bind(this),
  //       dataRequested: function () {
  //         oDataModel.metadataLoaded().then(function () {
  //           // Busy indicator on view should only be set if metadata is loaded,
  //           // otherwise there may be two busy indications next to each other on the
  //           // screen. This happens because route matched handler already calls '_bindView'
  //           // while metadata is loaded.
  //           oViewModel1.setProperty("/busy", true);
  //         });
  //       },
  //       dataReceived: function () {
  //         oViewModel1.setProperty("/busy", false);
  //       }
      // }
    });
  // },
// });
}
);
