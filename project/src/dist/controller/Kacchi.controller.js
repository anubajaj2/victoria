sap.ui.define(["victoria/controller/BaseController","sap/ui/model/json/JSONModel","sap/ui/core/routing/History","victoria/models/formatter","sap/m/MessageToast","sap/ui/model/Filter","sap/m/MessageBox"],function(e,t,a,i,r,o,s){"use strict";var l;return e.extend("victoria.controller.Kacchi",{formatter:i,onInit:function(){debugger;this.resourceBundle=this.getOwnerComponent().getModel("i18n").getResourceBundle();e.prototype.onInit.apply(this);var t=this.getRouter();t.getRoute("Kacchi").attachMatched(this._onRouteMatched,this);var a=this;var i=this.getModel("local").getProperty("/CurrentUser");var r=this.getModel("local").oData.AppUsers[i].UserName;r="Hey "+r;this.getView().byId("idUser").setText(r);this.byId("idTransferButton").setEnabled(false)},getRouter:function(){return this.getOwnerComponent().getRouter()},_onRouteMatched:function(e){var t=this;t.clearScreen();t.createModel();t.byId("idSaveIcon").setColor("green")},onSelDelete:function(){debugger;var e=this.byId("idCustTable");var t=e.getBinding("rows").getLength();var a=this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");var i=this.getView().byId("idCustTable").getSelectedIndices();for(var r=i.length-1;r>=0;--r){a.splice(i[r],1);a.push({id:"",deleteInd:"",Date:"",Customer:"",PaggaNo:0,Weight:0,Tunch:0,Fine:0})}this.getView().getModel("kachhiLocalModel").setProperty("/kachhiData",a);e.clearSelection()},toggleFullScreen:function(e){debugger;var t="idFullScreenBtn";var a="idKacchiHead";this.toggleUiTable(t,a)},getTotals:function(){debugger;var e=0,t=0,a=0,i=0,r=0,o=0;this.byId("idItemsCount").setText("");this.byId("idTotalWeight").setText("");this.byId("idTotalFine").setText("");this.byId("idTotalTunch").setText("");var s=this.byId("idCustTable");var l=this.byId("idItemsCount");var n=this.byId("idTotalWeight");var d=this.byId("idTotalTunch");var g=this.byId("idTotalFine");var c=s.getBinding("rows").getLength();var u=this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");for(var h=0;h<c;h++){var v=s.getContextByIndex(h);var b=v.getProperty("PaggaNo");var f=v.getProperty("Weight");var y=v.getProperty("Tunch");var p=v.getProperty("Fine");if(b){t=t+1;l.setText(t);if(f){a=+a+ +f;a=a.toFixed(2);n.setText(a)}if(y){r=r+1;i=(+i+ +y)/r;i=i.toFixed(2);d.setText(i)}if(p){o=+o+ +p;o=o.toFixed(2);g.setText(o)}}}},onSuggest:function(e){debugger;const t=e.key;var a=e.getParameter("id").split("--")[2];var i=e.getParameter("suggestValue");if(i===""||t==8||t==="Backspace"||t==="Delete"){this.getView().byId("idCustNo").setValue("");return}if(!i){i=e.getParameter("newValue")}if(i){var r=new sap.ui.model.Filter({filters:[new sap.ui.model.Filter("CustomerCode",sap.ui.model.FilterOperator.Contains,i.toUpperCase()),new sap.ui.model.Filter("Name",sap.ui.model.FilterOperator.Contains,i.toUpperCase())],and:false})}e.getSource().getBinding("suggestionItems").filter(r);this.getView().byId("idCustNo").setValue(i)},onliveChange:function(e){debugger;var t=0;this.byId("idSaveIcon").setColor("red");var a=e.getSource().getParent();var i=a.getCells();var r=i[0].getValue;var o=i[1].getValue;var s=i[2].getValue;if(o!==0||o!==""){i[1].setValueState(sap.ui.core.ValueState.None)}if(s!==0||s!==""){i[2].setValueState(sap.ui.core.ValueState.None)}if(r){t=i[1].getValue()*i[2].getValue()/100;if(t!=0){t=t.toFixed(2);i[3].setValue(t)}else{i[3].setValue(t)}var l=i[2].getValue();if(l>100){i[2].setValueState("Error").setValueStateText("Tunch can not be greater then 100")}else{i[2].setValueState(sap.ui.core.ValueState.None)}}this.getTotals()},onliveChangeWeight:function(e){debugger;var t=0;this.byId("idSaveIcon").setColor("red");var a=e.getSource().getParent();var i=a.getCells();var r=i[0].getValue;var o=i[1].getValue;var s=i[2].getValue;if(o!==0||o!==""){i[1].setValueState(sap.ui.core.ValueState.None);if(this.getView().byId("idRb1").getSelected()){var l=e.mParameters.value.match(/^[+-]?\d{0,5}(\.\d{0,2})?/)[0];i[1].setValue(l)}else if(this.getView().byId("idRb2").getSelected()){var l=e.mParameters.value.match(/^[+-]?\d{0,6}(\.\d{0,3})?/)[0];i[1].setValue(l)}}if(s!==0||s!==""){i[2].setValueState(sap.ui.core.ValueState.None)}if(r){t=i[1].getValue()*i[2].getValue()/100;if(t!=0){t=t.toFixed(3);i[3].setValue(t)}else{i[3].setValue(t)}var n=i[2].getValue();if(n>100){i[2].setValueState("Error").setValueStateText("Tunch can not be greater then 100")}else{i[2].setValueState(sap.ui.core.ValueState.None)}}this.getTotals()},onTransfer:function(){debugger;var e=this;var t=this.byId("idSaveIcon").getColor();var a=this.byId("idTotalFine").getText();if(this.validateCustomer()===true&&t=="green"&&a!==""){e.getView().setBusy(true);var i=this.getView().getModel("local").getProperty("/EntryData");i.Date=this.getView().byId("idDate").getDateValue();i.Remarks="[Auto-Entry]kachhi parchi on"+" "+i.Date;i.Silver="-"+this.byId("idTotalFine").getText();i.Customer=this.customerId;this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Entrys","POST",{},i,this).then(function(t){e.getView().setBusy(false);sap.m.MessageToast.show(e.resourceBundle.getText("Transferred"))}).catch(function(t){e.getView().setBusy(false);var a=e.getErrorMessage(t)});this.kachhiBackup()}else if(t=="red"){s.show(e.resourceBundle.getText("Please12"),{icon:s.Icon.ERROR,title:"Error",actions:[s.Action.OK],onClose:function(e){}})}else if(a==""||a==0){s.show(e.resourceBundle.getText("Please13"),{icon:s.Icon.ERROR,title:"Error",actions:[s.Action.OK],onClose:function(e){}})}},kachhiBackup:function(){var e=this;this.getView().setBusy(true);var t=this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");for(var a=0;a<t.length;a++){var i=this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData")[a];if(i.PaggaNo!==0){i.Customer=this.getView().getModel("local").getProperty("/kacchiData").Customer;i.Date=this.getView().byId("idDate").getDateValue();if(this.validateAll(i,a)===true){this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/KacchisBackup","POST",{},i,this).then(function(t){e.getView().setBusy(false);e.byId("idSaveIcon").setColor("green")}).catch(function(t){e.getView().setBusy(false);var a=e.getErrorMessage(t)});var r=this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData")[a].id;var o="/Kacchis('"+r+"')";if(r!==""){e.ODataHelper.callOData(e.getOwnerComponent().getModel(),o,"DELETE",{},{},e)}}}}e.getView().byId("idCustTable").clearSelection();e.byId("idTransferButton").setEnabled(false);e.clearScreen();e.createModel();e.getView().setBusy(false)},onPrint:function(e){var t;debugger;var a="<center><h3>Kachhi Report</h3></center><hr>"+"<table width='40%'><tr><td><b>Date:</b></td><td>"+this.byId("idDate").getValue()+"</td></tr>"+"<tr><td><b>Customer Name:</b></td><td>"+this.byId("idCustName").getText()+"</td></tr></table><br>";var i="<table width='40%'><tr><td><b>Total Weight:</b></td><td>"+this.byId("idTotalWeight").getText()+"</td></tr>"+"<tr><td><b>Total Fine:</b></td><td>"+this.byId("idTotalFine").getText()+"</td></tr></table><br>";var r="<table style='border-collapse: collapse;border:1px solid black;'width='95%'';'text-align:center';'border-spacing: 5px';><tr><th style=border:1px solid black;>pagga</th><th style=border:1px solid black;>Weight</th><th style=border:1px solid black;>Tunch</th><th style=border:1px solid black;>Fine</th></tr>";var o=this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");for(t=0;t<o.length;t++){if(o[t].PaggaNo){r+="<tr>";r+="</td><td style='border: 1px solid black;'>"+o[t].PaggaNo+"</td><td style='border: 1px solid black;'>"+o[t].Weight+"</td><td style='border: 1px solid black;'>"+o[t].Tunch+"</td><td style='border: 1px solid black;'>"+o[t].Fine+"</td></tr>"}}r+="</table>";var s=window.open("","PrintWindow","width=200,height=100");s.document.write(a+r+"<br>"+i);s.print();s.stop()},createModel:function(){var e=new t;var a=[];for(var i=1;i<=20;i++){var r={id:"",deleteInd:"",Date:"",Customer:"",PaggaNo:0,Weight:0,Tunch:0,Fine:0};a.push(r)}e.setData({kachhiData:a,kacchiHeader:{cdate:new Date,customer:""}});this.getView().setModel(e,"kachhiLocalModel");this.byId("idDate").setDateValue(new Date)},onCustValueHelp:function(e){debugger;this.getCustomerPopup(e)},onPressKacchiDownload:function(){debugger;var e=this.getView().getModel("local");debugger;var t="Kacchi";var a=e.oData.kacchiData.Customer;var i=e.oData.kachhiHeaderTemp.CustomerName;window.open("/kaachiDownload?type=Kacchi&id="+a+"&name="+i)},validateCustomer:function(){var e=this;var t=true;var a=this.byId("idCustNo").getValue();if(a===""){t=false;s.show("Please Select Customer first",{icon:s.Icon.ERROR,title:"Error",actions:[s.Action.OK],onClose:function(t){if(t===s.Action.OK){e.getView().byId("idCustNo").setValueState("Error").setValueStateText("Customer is Mandatory Input")}}})}return t},validateAll:function(e,t){debugger;var a=true;var i=this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");var r=this.getView().byId("idCustTable");var o=r.getBinding("rows");if(e.PaggaNo!==0||e.PaggaNo!==""){if(e.Weight==0||e.Weight===""){r.getRows()[t].getCells()[1].setValueState("Error").setValueStateText("Weight Can't be Initial");a=false;return}else{r.getRows()[t].getCells()[1].setValueState("None")}if(e.Tunch==0||e.Tunch===""){r.getRows()[t].getCells()[2].setValueState("Error").setValueStateText("Tunch Can't be Initial");a=false;return}else{r.getRows()[t].getCells()[2].setValueState("None")}}return a},onSave:function(e){debugger;var t=this;var a=t.byId("idItemsCount").getText();if(a==0||a==""){s.show(t.resourceBundle.getText("Save11"),{icon:s.Icon.ERROR,title:"Error",actions:[s.Action.OK],onClose:function(e){}})}else if(this.validateCustomer()===true){this.getView().setBusy(true);var i=this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");var r=this.getView().byId("idCustTable");var o=r.getBinding("rows");for(var l=0;l<o.getLength();l++){var n=this.getView().getModel("kachhiLocalModel").getProperty("/kachhiData")[l];if(n.PaggaNo!==0){n.Customer=this.getView().getModel("local").getProperty("/kacchiData").Customer;n.Date=this.getView().byId("idDate").getDateValue();if(this.validateAll(n,l)===true&&n.id==""){this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Kacchis","POST",{},n,this).then(function(e){t.getView().setBusy(false);sap.m.MessageToast.show(t.resourceBundle.getText("dataSave"));debugger;var a=e.id;var i=e.PaggaNo;var r=t.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");for(var o=0;o<r.length;o++){if(r[o].PaggaNo==e.PaggaNo){r[o].id=a;break}}t.getView().getModel("kachhiLocalModel").setProperty("/kachhiData",r);t.byId("idSaveIcon").setColor("green");t.byId("idTransferButton").setEnabled(true)}).catch(function(e){t.getView().setBusy(false);var a=t.getErrorMessage(e)})}}else{}}}this.getView().setBusy(false)},onConfirmMessageBox:function(e,t,a,i,r){},onClear:function(){debugger;var e=this;var t=this.byId("idSaveIcon").getColor();if(t=="red"){sap.m.MessageBox.confirm(e.resourceBundle.getText("Are11"),{title:"Confirm",styleClass:"",initialFocus:null,textDirection:sap.ui.core.TextDirection.Inherit,actions:["Save & Clear","Clear",s.Action.CANCEL],onClose:function(t){if(t==="Clear"){e.clearScreen();e.createModel();e.byId("idSaveIcon").setColor("green");sap.m.MessageToast.show(e.resourceBundle.getText("Screen11"))}else if(t==="Save & Clear"){e.onSave();e.clearScreen();e.createModel();e.byId("idSaveIcon").setColor("green");sap.m.MessageToast.show(e.resourceBundle.getText("Screen12"))}}})}else if(t=="green"){sap.m.MessageBox.confirm(e.resourceBundle.getText("Are11"),{title:"Confirm",styleClass:"",initialFocus:null,textDirection:sap.ui.core.TextDirection.Inherit,actions:["Clear",s.Action.CANCEL],onClose:function(t){if(t==="Clear"){e.clearScreen();e.createModel();e.byId("idSaveIcon").setColor("green");sap.m.MessageToast.show(e.resourceBundle.getText("Screen11"))}}})}},clearScreen:function(){var e=this;e.byId("idCustNo").setValue("");e.byId("idCustName").setText("");e.byId("idDate").setDateValue(new Date);e.byId("idItemsCount").setText("");e.byId("idTotalWeight").setText("");e.byId("idTotalFine").setText("");e.byId("idTotalTunch").setText("")},onDelete:function(e){debugger;var t=this;var a=t.byId("idItemsCount").getText();if(a==0||a==""){s.show(t.resourceBundle.getText("Screen13"),{icon:s.Icon.ERROR,title:"Error",actions:[s.Action.OK],onClose:function(e){}})}else{sap.m.MessageBox.confirm(t.resourceBundle.getText("Screen14"),{title:"Confirm",styleClass:"",initialFocus:null,textDirection:sap.ui.core.TextDirection.Inherit,onClose:function(e){debugger;if(e===s.Action.OK){var a=t.getView().byId("idCustTable").getSelectedIndices();var i=t.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");if(a.length){for(var r=0;r<a.length;r++){var o=a[r];var l=i[o].id;if(l!==""){var n="/Kacchis('"+l+"')";t.ODataHelper.callOData(t.getOwnerComponent().getModel(),n,"DELETE",{},{},t)}}t.onSelDelete();t.getTotals();sap.m.MessageToast.show(t.resourceBundle.getText("Selected12"))}else{s.show(t.resourceBundle.getText("Screen15"),{icon:s.Icon.ERROR,title:"Error",actions:[s.Action.OK],onClose:function(e){}})}}}})}},clearHeaderTotal:function(){this.byId("idItemsCount").setText("");this.byId("idTotalWeight").setText("");this.byId("idTotalFine").setText("");this.byId("idTotalTunch").setText("")},getCustDataFromDB:function(e){var t=this;this.getView().setBusy(true);this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Kacchis","GET",{filters:[e]},{},this).then(function(e){debugger;t.getView().setBusy(false);if(e.results.length>0){t.createModel();var a=t.getView().getModel("kachhiLocalModel").getProperty("/kachhiData");for(var i=0;i<e.results.length;i++){debugger;a[i].PaggaNo=e.results[i].PaggaNo;a[i].id=e.results[i].id;a[i].Tunch=e.results[i].Tunch;a[i].Weight=e.results[i].Weight;a[i].Fine=e.results[i].Fine}t.getView().getModel("kachhiLocalModel").setProperty("/kachhiData",a);t.byId("idSaveIcon").setColor("green");t.byId("idTransferButton").setEnabled(true);t.getTotals()}else{t.createModel();t.clearHeaderTotal();t.byId("idSaveIcon").setColor("green");t.byId("idTransferButton").setEnabled(false);sap.m.MessageToast.show(t.resourceBundle.getText("Screen16"))}}).catch(function(e){});this.getView().setBusy(false)},onConfirm:function(e){debugger;var t=this;var a=this.getView().getModel("local").getProperty("/kacchiData");a.Customer=e.getParameter("selectedItem").getBindingContextPath().split("'")[1];this.customerId=a.Customer;this.getView().getModel("local").setProperty("/kacchiData",a);var i=e.getParameter("selectedItem").getLabel();var r=e.getParameter("selectedItem").getValue();if(i){var o=this.getView().getModel("local").getProperty("/kachhiHeaderTemp");o.CustomerId=i;o.CustomerName=r;this.getView().getModel("local").setProperty("/kachhiHeaderTemp",o);this.getView().byId("idCustNo").setValueState()}var s=new sap.ui.model.Filter("Customer","EQ","'"+a.Customer+"'");this.getCustDataFromDB(s);var l=e.getParameter("selectedItem").getModel().getProperty(e.getParameter("selectedItem").getBindingContext().getPath());var t=this;var a=this.getView().getModel("local").getProperty("/kacchiData");var i=e.getParameter("selectedItem").getLabel();var r=e.getParameter("selectedItem").getValue();this.getView().byId("idCustNo").setValue(i);this.getView().getModel("local").setProperty("/kacchiData/Customer",e.getParameter("selectedItem").getBindingContextPath().split("'")[1]);this.getView().getModel("local").setProperty("/kachhiHeaderTemp/customerId",i);var s=new sap.ui.model.Filter("Customer","EQ","'"+a.Customer+"'");this.getCustDataFromDB(s)},onEnter:function(e){debugger;this.getCustomer(e);this.getView().byId("idTotalFine").focus();this.getView().byId("idTotalFine").$().find("input").select()}})});