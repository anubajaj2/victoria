sap.ui.define(["victoria/controller/BaseController","sap/m/MessageBox","sap/m/MessageToast","sap/ui/model/Filter","sap/ui/export/library","sap/ui/export/Spreadsheet","sap/ui/model/FilterOperator"],function(e,t,i,a,r,o,n){"use strict";var d=r.EdmType;return e.extend("victoria.controller.dayBook",{onInit:function(){debugger;var t=this;e.prototype.onInit.apply(this);var i=this.getRouter();i.getRoute("dayBook").attachMatched(this._onRouteMatched,this);var t=this;var a=this.getModel("local").getProperty("/CurrentUser");var r=this.getModel("local").oData.AppUsers[a].UserName;r="Hey "+r;this.getView().byId("idUser").setText(r)},getRouter:function(){debugger;return sap.ui.core.UIComponent.getRouterFor(this)},_onRouteMatched:function(){debugger;this.getView().getModel("local").setProperty("/Footer",false)},onValueHelpRequest:function(e){debugger;this.getCustomerPopup(e)},onEnter:function(e){debugger;this.getCustomer(e)},_getSecureDetails:function(){var e=this},onPressEntryDownload:function(){debugger;var e=this.getView().byId("idCustDay").getValue();var t=this.getView().byId("dateRangeId").getDateValue();var i=this.getView().byId("dateRangeId").getSecondDateValue();var a=this.getView().getModel("local").getProperty("/EntryData");var r=null;var o=null;this.getView().getModel("local").getProperty("/EntryData",a);if(t===null&&i===null){window.open("/entryDownload?id="+a.Customer+"&type=DayBook&name="+o+"&city="+r+"&min="+t+"&max="+i)}else if(e===""){window.open("/entryDownloadDate?id="+e+"&type=DayBook&name="+o+"&city="+r+"&min="+t.toISOString()+"&max="+i.toISOString())}else{window.open("/entryDownloadBetween?id="+a.Customer+"&type=DayBook&name="+o+"&city="+r+"&min="+t.toISOString()+"&max="+i.toISOString())}},onBeforeExport:function(e){var t=e.getParameter("exportSettings");t.worker=false},onExportExcel:function(){var e=this;debugger;var t=this.getView().getModel().oData;this.JSONToExcelConvertor(t,"Report",true)},JSONToExcelConvertor:function(e,t,i){debugger;var a=typeof e.tableDetails!="object"?JSON.parse(e.tableDetails):e.tableDetails;var r="";if(i){var o="";o=o.slice(0,-1)}o+='"'+this.getView().byId("id1").getText()+'",';o+='"'+this.getView().byId("id2").getText()+'",';o+='"'+this.getView().byId("id3").getText()+'",';o+='"'+this.getView().byId("id4").getText()+'",';o+='"'+this.getView().byId("cashid").getText()+'",';o+='"'+this.getView().byId("id5").getText()+'",';o+='"'+this.getView().byId("id6").getText()+'",';o+='"'+this.getView().byId("id7").getText()+'",';r+=o+"\r\n";for(var n=0;n<a.length;n++){var o="";for(var d in a[n]){o+='"'+a[n][d]+'",'}o.slice(1,o.length);r+=o+"\r\n"}var s="";s+='"",';s+='"",';s+='"",';s+='"Total:'+this.getView().byId("totalPickedWtId").getText()+'",';s+='"",';s+='"Total:'+this.getView().byId("totalPickedVolId").getText()+'",';s+='"",';r+=s+"\r\n";if(r==""){alert("Invalid data");return}var l="MyReport_";l+=t.replace(/ /g,"_");var g="data:application/vnd.ms-excel:base64,"+encodeURIComponent(r);var u=document.createElement("a");u.href=g;u.style="visibility:hidden";u.download=l+".xls";document.body.appendChild(u);u.click();document.body.removeChild(u)},onConfirm:function(e){debugger;var t=e.getParameter("selectedItem").getLabel();this.getView().byId("idCustDay").setValue(t);this.getView().getModel("local").setProperty("/EntryData/Customer",e.getParameter("selectedItem").getBindingContextPath().split("'")[1])},onUpdateFinished:function(e){debugger;var t=e.getSource();var i=t.getItems();var a=i.length;var r=a<=20?0:a-20;var o;var n;console.log(a);var d=this.getView().getModel("i18n").getProperty("allEntries");this.getView().byId("idTitle").setText(d+" "+"("+a+")");this.getView().byId("idTable1").setBlocked(false);this.getView().byId("idTable1").setShowOverlay(false);for(var s=0;s<a;s++){var l=t.getItems()[s].getCells()[2].getText();var g=t.getItems()[s].getCells()[3].getText();var u=this.allMasterData.customers[l];var c=this.allMasterData.materials[g];t.getItems()[s].getCells()[1].setText(u.CustomerCode+" - "+u.Name);if(g!==""&&c!==undefined){t.getItems()[s].getCells()[3].setText(c.ProductCode+" - "+c.ProductName)}}this.getView().byId("idTable1").setBlocked(false)},onFilterSearch:function(e){debugger;var t=this;var i=this.getView().byId("idCustDay").getValue();if(i!==""){var r=this.allMasterData.customersId[i].id}var o=this.getView().byId("dateRangeId").getDateValue();var n=this.getView().byId("dateRangeId").getSecondDateValue();var d=[];var s=new Date(n);if(o!==null&&n!==null){if(o.getTimezoneOffset()>0){o.setMinutes(o.getMinutes()+o.getTimezoneOffset())}else{o.setMinutes(o.getMinutes()-o.getTimezoneOffset())}if(n.getTimezoneOffset()>0){n.setMinutes(n.getMinutes()+n.getTimezoneOffset())}else{n.setMinutes(n.getMinutes()-n.getTimezoneOffset())}var l=new a([new sap.ui.model.Filter("Date",sap.ui.model.FilterOperator.BT,o,n)],true);d.push(l)}if(i!==""){var g=new sap.ui.model.Filter("Customer","EQ","'"+r+"'");d.push(g)}this.getView().byId("idTable1").getBinding("items").filter(d);if(o===null&&n===null){$.post("/getTotalEntryCustomer",{Customer:r}).then(function(e){debugger;t.getView().getModel("local").setProperty("/Footer",true);t.byId("idTC1").setText(parseFloat(e.CashTotal).toFixed(2));t.byId("idTC1").getText();parseFloat(t.byId("idTC1").getText());if(parseFloat(t.byId("idTC1").getText())>0){t.byId("idTC1").setState("Success");debugger}else{t.byId("idTC1").setState("Warning")}t.getView().byId("idG1").setText(parseFloat(e.GoldTotal.toFixed(3)));t.byId("idG1").getText();parseFloat(t.byId("idG1").getText());if(parseFloat(t.byId("idG1").getText())>0){t.byId("idG1").setState("Success");debugger}else{t.byId("idG1").setState("Warning")}t.getView().byId("idS1").setText(parseFloat(e.SilverTotal.toFixed(2)));t.byId("idS1").getText();parseFloat(t.byId("idS1").getText());parseFloat(t.byId("idS1").getText()).toFixed(3);if(parseFloat(parseFloat(t.byId("idS1").getText()).toFixed(3))>0){t.byId("idS1").setState("Success");debugger}else{t.byId("idS1").setState("Warning")}debugger})}else{if(i===""){var u=i}else{var u=r}o.setHours(0,0,0,0);$.post("/getTotalEntryCustomerBetween",{Customer:u,max:s,min:o}).then(function(e){debugger;t.getView().getModel("local").setProperty("/Footer",true);t.byId("idTC1").setText(parseFloat(e.CashTotal).toFixed(2));t.byId("idTC1").getText();parseFloat(t.byId("idTC1").getText());if(parseFloat(t.byId("idTC1").getText())>0){t.byId("idTC1").setState("Success");debugger}else{t.byId("idTC1").setState("Warning")}t.getView().byId("idG1").setText(parseFloat(e.GoldTotal.toFixed(3)));t.byId("idG1").getText();parseFloat(t.byId("idG1").getText());if(parseFloat(t.byId("idG1").getText())>0){t.byId("idG1").setState("Success");debugger}else{t.byId("idG1").setState("Warning")}t.getView().byId("idS1").setText(parseFloat(e.SilverTotal.toFixed(2)));t.byId("idS1").getText();parseFloat(t.byId("idS1").getText());parseFloat(t.byId("idS1").getText()).toFixed(3);if(parseFloat(parseFloat(t.byId("idS1").getText()).toFixed(3))>0){t.byId("idS1").setState("Success");debugger}else{t.byId("idS1").setState("Warning")}debugger})}},onFilterClear:function(e){debugger;this.getView().getModel("local").setProperty("/Footer",false);this.getView().byId("idTable1").getBinding("items").filter("/")},createColumnConfig:function(){var e=[];var t=[];e.push({label:"Date",property:["Date"],type:d.Date});e.push({property:["Name","CustomerCode"]});e.push({property:"Customer",type:d.String});e.push({property:"Product",type:d.String});e.push({property:"Cash",type:d.Number});e.push({property:"Gold",type:d.Number});e.push({property:"Silver",type:d.Number});e.push({property:"Remarks",type:d.String});t.push({property:"TA",type:d.Number});return e},onExport:function(){var e,t,i,a,r;if(!this._oTable){this._oTable=this.byId("idTable1")}r=this._oTable;t=r.getBinding("items");e=this.createColumnConfig();var n=t.getModel();i={workbook:{columns:e,hierarchyLevel:"Level"},dataSource:{type:"OData",dataUrl:t.getDownloadUrl?t.getDownloadUrl():null,serviceUrl:this._sServiceUrl,headers:n.getHeaders?n.getHeaders():null,count:t.getLength?t.getLength():null,useBatch:true},fileName:"Table export sample.xlsx",worker:false};a=new o(i);a.build().finally(function(){a.destroy()})},totalFormatter:function(e){debugger;return e.length},decimalvalidator1:function(e){debugger;if(e.mParameters.id==="__component0---idEntry--idCash"){$(function(){$("input").on("input.idCash",function(e){if(e.currentTarget.id=="__component0---idEntry--idCash-inner"){debugger;this.value=this.value.match(/^[+-]?\d{0,8}(\.\d{0,2})?/)[0]}})})}},decimalvalidator2:function(e){debugger;if(e.mParameters.id==="__component0---idEntry--idGold"){$(function(){$("input").on("input.idGold",function(e){if(e.currentTarget.id=="__component0---idEntry--idGold-inner"){debugger;this.value=this.value.match(/^[+-]?\d{0,6}(\.\d{0,3})?/)[0]}})})}},decimalvalidator3:function(e){debugger;if(e.mParameters.id==="__component0---idEntry--idSilver"){$(function(){$("input").on("input.idSilver",function(e){if(e.currentTarget.id=="__component0---idEntry--idSilver-inner"){debugger;this.value=this.value.match(/^[+-]?\d{0,5}(\.\d{0,2})?/)[0]}})})}},decimalvalidator4:function(e){debugger;if(e.mParameters.id==="__component0---idEntry--idweight"){$(function(){$("input").on("input.idweight",function(e){if(e.currentTarget.id=="__component0---idEntry--idweight-inner"){debugger;this.value=this.value.match(/^[+-]?\d{0,5}(\.\d{0,3})?/)[0]}})})}},decimalvalidator5:function(e){debugger;if(e.mParameters.id==="__component0---idEntry--idtunch"){$(function(){$("input").on("input.idtunch",function(e){if(e.currentTarget.id=="__component0---idEntry--idtunch-inner"){debugger;this.value=this.value.match(/^[+-]?\d{0,5}(\.\d{0,3})?/)[0]}})})}},onMaterialSelect:function(e){var t=e.getParameter("selectedItem").getModel().getProperty(e.getParameter("selectedItem").getBindingContext().getPath());var i=e.getParameter("selectedItem").getText();var a=e.getParameter("selectedItem").getAdditionalText();var r=e.getParameter("selectedItem").getKey();this.getView().byId("idMat").setValue(i);this.getView().byId("idMatText").setText(a+" - "+r)},onRemarksSubmit:function(e){this.getView().byId("sendButton").focus()},onSubmit:function(e){$(function(){$("input:text:first").focus();var e=$("input:text");e.bind("keypress",function(t){var i=t.which;if(i==13){t.preventDefault();var a=e.index(this)+1;$(":input:text:eq("+a+")").focus()}})})},onCashSubmit:function(e){this.getView().byId("idGold").focus()},onGoldSubmit:function(e){this.getView().byId("idSilver").focus()},onSilverSubmit:function(e){this.getView().byId("idRemarks").focus()},onRemarksSubmit:function(e){this.getView().byId("sendButton").focus()},onSubmitSideWeight:function(e){this.getView().byId("idtunch").focus()},onSubmitSideTunch:function(e){this.getView().byId("calculateButton").focus()},onSelect:function(e){jQuery.sap.delayedCall(500,this,function(){})},inpField:"",onSelectValue:function(e){debugger;var t=e.getParameter("selectedItem");var i=t.getLabel();sap.ui.getCore().byId(this.inpField).setValue(i);var a=this;this.getView().byId("idCustDay").setValue(i)},onSuggest:function(e){debugger;const t=e.key;var i=e.getParameter("id").split("--")[2];var a=e.getParameter("suggestValue");if(a===""||t==8||t==="Backspace"||t==="Delete"){this.getView().byId("idCustDay").setValue("");return}if(!a){a=e.getParameter("newValue")}if(a){var r=new sap.ui.model.Filter({filters:[new sap.ui.model.Filter("CustomerCode",sap.ui.model.FilterOperator.Contains,a.toUpperCase()),new sap.ui.model.Filter("Name",sap.ui.model.FilterOperator.Contains,a.toUpperCase())],and:false})}e.getSource().getBinding("suggestionItems").filter(r);this.getView().byId("idCustDay").setValue(a)}})});