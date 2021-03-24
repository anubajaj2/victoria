sap.ui.define(
	["sap/ui/core/UIComponent",
	"victoria/models/models",
	"sap/ui/model/json/JSONModel","sap/ui/core/routing/HashChanger"],
	function(UIComponent, Models,JSONModel,HashChanger){
		return UIComponent.extend("victoria.Component",{
			//includes metadata of app e.g. themes, router config, app name, version etc.
			metadata: {
				"manifest": "json"
			},

			//initialization needs to be done
			init: function(){
				//we must call the base class constructor to
				//initialize the readymade features
				// browser.driver.navigate().refresh();
        // browser.loadUI5Dependencies()
				HashChanger.getInstance().replaceHash("");
				debugger;
				sap.ui.core.UIComponent.prototype.init.apply(this);

     			var oRouter = this.getRouter();
				//Router will read manifest.json accordingly create view object
				oRouter.initialize();
			},
			//create the object of starting view - App.view.xml
			// createContent: function(){

			// 	// var oAppView = new sap.ui.view({
			// 	// 	viewName: "victoria.view.App",
			// 	// 	id: "idAppView",
			// 	// 	type: sap.ui.core.mvc.ViewType.XML
			// 	// });

			// 	//Global model will only be available if set at App view level
			// 	//var oModel = Models.createFruitModel();
			// 	//oAppView.setModel(oModel);

			// 	//Killed the dependency from index.html and instantiating views here
			// 	// var oView1 = new sap.ui.view({
			// 	// 	id: "idView1",
			// 	// 	viewName: "victoria.view.View1",
			// 	// 	type: sap.ui.core.mvc.ViewType.XML
			// 	// });

			// 	// var oView2 = new sap.ui.view({
			// 	// 	id: "idView2",
			// 	// 	viewName: "victoria.view.View2",
			// 	// 	type: sap.ui.core.mvc.ViewType.XML
			// 	// });

			// 	// oAppView.byId("idSplitApp").addMasterPage(oView1);
			// 	// oAppView.byId("idSplitApp").addDetailPage(oView2);

			// 	// return oAppView;

			// },
			//clean-up code when we close app it will be called
			destroy: function(){}
		});
	}
);
