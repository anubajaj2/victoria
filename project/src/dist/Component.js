sap.ui.define(["sap/ui/core/UIComponent","victoria/models/models","sap/ui/model/json/JSONModel","sap/ui/core/routing/HashChanger"],function(e,t,i,n){return e.extend("victoria.Component",{metadata:{manifest:"json"},init:function(){n.getInstance().replaceHash("");debugger;sap.ui.core.UIComponent.prototype.init.apply(this);var e=this.getRouter();e.initialize()},destroy:function(){}})});