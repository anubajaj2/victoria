sap.ui.define([
	"victoria/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"victoria/models/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/ui/core/Fragment"
], function (BaseController, JSONModel, formatter, MessageToast, MessageBox, Dialog, Fragment) {
	"use strict";
	var coId;
	var selRow;
	return BaseController.extend("victoria.controller.CustomerOrders", {
		formatter: formatter,
		// buttonState: "12",
		onInit: function () {
			BaseController.prototype.onInit.apply(this);
			this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oRouter = this.getRouter();
			oRouter.getRoute("customerOrders").attachMatched(this._onRouteMatched, this);
			var that = this;
			var currentUser = this.getModel("local").getProperty("/CurrentUser");
			var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			loginUser = "Hey " + loginUser;
			this.getView().byId("idUser").setText(loginUser);
		},

		_onRouteMatched: function () {
			var that = this;
			that.getView().byId("idCoDate").setDateValue(new Date());
			var date = new Date();
			var dd = date.getDate();
			var mm = date.getMonth() + 1;
			var yyyy = date.getFullYear();
			that.getView().byId("idCoDelDate").setDateValue(new Date(yyyy, mm, dd));
		},

		handlePopoverPress: function (oEvent) {
			var that = this;
			var oCurrentControl = oEvent.getSource();
			var oRow = oCurrentControl.getParent();
			// this.buttonState = oRow.getCells()[10];

			var oButton = oEvent.getSource(),
				oView = this.getView();

			if (oButton.getText() === "Ready") {
				oButton.setEnabled(false);
				oButton.setText("Delivered");
				oButton.setType("Accept");
				// that._oPopover.close();
			} else {
				if (!this._pPopover) {
					this._oPopover = sap.ui.xmlfragment("victoria.fragments.Popover", that);
					this.getView().addDependent(this._oPopover);
				}
				this._oPopover.openBy(oEvent.getSource());
			}
		},
		onReady: function (oEvent) {
			// this.buttonState.setText("Ready");
			// this.buttonState.setType("Critical");
			this._oPopover.close();
		},
		onCancel: function (oEvent) {
			// this.buttonState.setEnabled(false);
			// this.buttonState.setText("Cancelled");
			// this.buttonState.setType("Reject");
			// this._oPopover.close();
		},
		onBlocked: function (oEvent) {
			// this.buttonState.setEnabled(false);
			// this.buttonState.setText("Blocked");
			// this.buttonState.setType("Reject");
			this._oPopover.close();
		},

		onValueHelp: function (oEvent) {
			this.getCustomerPopup(oEvent);
		},

		onMaterialValueHelp: function () {
			this.getMaterialPopup();
		},

		onValueHelpKarigar: function (oEvent) {
			this.getKarigarPopup(oEvent);
		},

		onKarigarSelect: function (oEvent, custName, custId) {

			var that = this;
			if (oEvent.getParameter("selectedItem")) {
				var selectedData = oEvent.getParameter("selectedItem").getBindingContext().getObject();
				this.setKarigar(selectedData);
			}
		},

		setKarigar: function (selectedCustomer) {

			// this.getView().getModel("local").setProperty("/selectedCustomer", selectedCustomer)
			var that = this;
			var cityId = selectedCustomer.City;
			var customerCode = selectedCustomer.CustomerCode;
			var name = selectedCustomer.Name;

			var custOrderKarigarId = this.getView().byId("idCoKarigar");

			if (custOrderKarigarId) {
				this.getView().byId("idCoKarigar").setValue(customerCode);
				this.getView().byId("idCoKarigarName").setValue(name);
			}
		},

		onEnter: function (oEvent) {
			let custCode = oEvent.getSource().getValue();
			if(!custCode) return;
			this.setCustomerFilter(custCode);
		},

		onMaterialEnter: function (oEvent) {

			this.getView().byId("idCoQty").focus();
			this.getView().byId("idCoQty").$().find("input").select();
		},

		onKarigarEnter: function (oEvent) {

			this.getView().byId("idCoRemarks").focus();
			this.getView().byId("idCoRemarks").$().find("input").select();
		},
		onRemarksSubmit: function (oEvent) {

			this.getView().byId("acceptButton").focus();
		},

		onMaterialSelect: function (oEvent) {
			var selectedMatData = oEvent.getParameter("selectedItem").getModel().getProperty(oEvent.getParameter("selectedItem").getBindingContext().getPath());
			var selMat = oEvent.getParameter("selectedItem").getText();
			var selMatName = oEvent.getParameter("selectedItem").getAdditionalText();
			var selType = oEvent.getParameter("selectedItem").getKey();

			this.getView().getModel("local").setProperty("/customerOrder/Material", this.allMasterData.materialsId[selMat].id);
			this.getView().getModel("local").setProperty("/coTemp/MaterialCode", selMat);

			this.getView().byId("idCoMaterial").setValue(selMat);
			this.getView().byId("idCoMatName").setValue(selMatName);
			this.getView().byId("idCoMatType").setValue(this.allMasterData.materialsId[selMat].Type);
			this.getView().byId("idCoMatKarat").setValue(this.allMasterData.materialsId[selMat].Karat);
			this.getView().byId("idCoMatMaking").setValue(this.allMasterData.materialsId[selMat].Making + "/" + this.allMasterData.materialsId[selMat].Category);
		},

		onPressReportDownload: function (oEvent) {
			const customerCode = this.getView().byId("idCoCustomer").getValue();
			const that = this;
			if (customerCode !== "") {
				const custId = this.getView().getModel("local").getProperty("/customerOrder/Customer");
				const custCode = this.getView().getModel("local").getProperty("/coTemp/CustomerCode");

				if (custId === "") {
					alert("Please, select a valid Customer!");
				} else {
					window.open("/customerOrderReport?id=" + custId + "&code=" + custCode);
				}
			} else {
				window.open("/allCustomerOrderReport?id=" + "6043ad0632a5213cb0ec5519" + "&code=" + "AA02");
			}
		},

		onConfirm: function (oEvent) {
			//whatever customer id selected push that in local model
			var myData = this.getView().getModel("local").getProperty("/customerOrder");
			if (oEvent.getSource().getTitle() === "Material Search") {
				var selMat = oEvent.getParameter("selectedItem").getLabel();
				var selMatName = oEvent.getParameter("selectedItem").getValue();
				this.getView().byId("idCoMatName").setValue(selMatName);
				var matId = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
				this.getView().getModel("local").setProperty("/customerOrder/Material", matId);
				this.getView().getModel("local").setProperty("/coTemp/MaterialCode", selMat);
				this.getView().byId("idCoMaterial").setValueState("None");
				this.getView().byId("idCoMaterial").setValueStateText("");
				var materialData = this.allMasterData.materials[matId];
				// fill Material Type, Karat, Making and Category based on the material code selected
				this.getView().byId("idCoMatType").setValue(materialData.Type);
				this.getView().byId("idCoMatKarat").setValue(materialData.Karat);
				this.getView().byId("idCoMatMaking").setValue(materialData.Making + "/" + materialData.Category);
			} else if (oEvent.getSource().getTitle() === "Karigar Search") {

				var selKarigar = oEvent.getParameter("selectedItem").getLabel();
				var selKarigarName = oEvent.getParameter("selectedItem").getValue();
				this.getView().byId("idCoKarigarName").setValue(selKarigarName);
				this.getView().getModel("local").setProperty("/customerOrder/Karigar",
					oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1]);
				this.getView().getModel("local").setProperty("/coTemp/KarigarCode",
					selKarigar);
			} else {
				var selCust = oEvent.getParameter("selectedItem").getLabel();
				var selCustName = oEvent.getParameter("selectedItem").getValue();
				console.log(selCust, selCustName);
				this.getView().byId("idCoCustomerText").setText(selCustName);
				this.getView().getModel("local").setProperty("/customerOrder/Customer",
					oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1]);
				this.getView().getModel("local").setProperty("/coTemp/CustomerCode",
					selCust);
				this.getView().byId("idCoCustomer").setValueState("None");
				this.getView().byId("idCoCustomer").setValueStateText("");

				myData.Customer = oEvent.getParameter("selectedItem").getBindingContextPath().split("'")[1];
				var oFilter = new sap.ui.model.Filter("Customer", "EQ", "'" + myData.Customer + "'");
				this.getView().byId("idCoTable").getBinding("items").filter(oFilter);
			}
		},
		// Search in dialog for material and customer f4 help
		onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("query");
			if (!sValue) {
				sValue = oEvent.getParameter("value");
			}

			var oFilter;
			if (oEvent.getSource().getTitle() === "Material Search") {
				var oFilter1 = new sap.ui.model.Filter(
					"ProductCode",
					sap.ui.model.FilterOperator.Contains,
					sValue);
				var oFilter2 = new sap.ui.model.Filter(
					"ProductName",
					sap.ui.model.FilterOperator.Contains,
					sValue);
				oFilter = new sap.ui.model.Filter({
					filters: [oFilter1, oFilter2],
					and: false
				});

			} else {
				var oFilter1 = new sap.ui.model.Filter(
					"CustomerCode",
					sap.ui.model.FilterOperator.Contains,
					sValue);
				var oFilter2 = new sap.ui.model.Filter(
					"Name",
					sap.ui.model.FilterOperator.Contains,
					sValue);
				// var oFilter3 = new sap.ui.model.Filter(
				//               "City",
				//               sap.ui.model.FilterOperator.Contains,
				//               sValue );

				oFilter = new sap.ui.model.Filter({
					filters: [oFilter1, oFilter2],
					and: false
				});
			}
			//Filter object- is used to filter the data from the model
			var aFilter = [oFilter]; //AND operator by default
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(aFilter);

		},
		// check if date and delivery date are valid and when date changed set delivery
		// date to +1 month
		onDateChange: function (oEvent) {
			var oDP = oEvent.getSource();
			var bValid = oEvent.getParameter("valid");
			if (bValid) {
				oDP.setValueState(sap.ui.core.ValueState.None);
			} else {
				oDP.setValueState(sap.ui.core.ValueState.Error);
			}
			var fieldId = oEvent.getSource().getId();

			if (fieldId.split("--")[2] === "idCoDate") {
				var sValue = oEvent.getParameter("value");
				var parts = sValue.split('-');
				// sValu format yyyy-MM-dd; MM starts from 0-11 for months
				var dateObj = new Date(parts[0], parts[1], parts[2]);
				this.getView().byId("idCoDelDate").setDateValue(dateObj);
				// var myData = this.getView().getModel("local").getProperty("/customerOrder");
				// myData.Date = this.getView().byId("idCoDate").getDateValue();
				//
				// var oFilter = new sap.ui.model.Filter("Date","EQ", "'" + myData.Date + "'");
				// this.getView().byId("idCoTable").getBinding("items").filter(oFilter);
			}
		},

		onSubmit: function (evt) {

			// $(function() {
			//         $('input:text:first').focus();
			//
			//         var $inp = $('input:text');
			//         $inp.bind('keypress', function(e) {
			//             //var key = (e.keyCode ? e.keyCode : e.charCode);
			//             var key = e.which;
			//             if (key == 13) {
			//                 e.preventDefault();
			//                 var nxtIdx = $inp.index(this) + 1;
			//                 $(":input:text:eq(" + nxtIdx + ")").focus();
			//             }
			//         });
			//     });

			this.getView().byId("idCoWeight").focus();
			this.getView().byId("idCoWeight").$().find("input").select();
		},
		onSubmitWeight: function (evt) {
			this.getView().byId("idCoMaking").focus();
			this.getView().byId("idCoMaking").$().find("input").select();
		},
		onSubmitMaking: function (evt) {
			this.getView().byId("idSize").focus();
			this.getView().byId("idSize").$().find("input").select();
		},
		onSizeSubmit: function (evt) {
			this.getView().byId("idCoKarigar").focus();
			this.getView().byId("idCoKarigar").$().find("input").select();
		},
		onCoCashSubmit: function (evt) {
			this.getView().byId("idCoGold").focus();
			this.getView().byId("idCoGold").$().find("input").select();
		},
		onCoGoldSubmit: function (evt) {
			this.getView().byId("idCoSilver").focus();
			this.getView().byId("idCoSilver").$().find("input").select();
		},
		onCoSilverSubmit: function (evt) {
			this.getView().byId("acceptButton").focus();
		},

		onSelectPhoto: function (oEvent) {
			var that = this;
			if (oEvent.getSource().getId().includes("idOrderPictureUpload")) {
				if (!that.photoPopup) {
					that.photoPopup = new sap.ui.xmlfragment("victoria.fragments.PhotoUploadDialog", that);
					that.getView().addDependent(that.photoPopup);
				}
				var oModelPhoto = new JSONModel();
				oModelPhoto.setData();
				that.getView().setModel(oModelPhoto, "photo");
				that.photoPopup.open();
			} else {
				this.selRow = oEvent.getSource().getBindingContext().getObject();
				var relPath = oEvent.getSource().getBindingContext().getPath() + ("/ToPhotos");
				console.log(oEvent.getSource().getBindingContext().getPath(), relPath)
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					relPath, "GET", {}, {}, this)
					.then(function (oData) {
						if (!that.photoPopup) {
							that.photoPopup = new sap.ui.xmlfragment("victoria.fragments.PhotoUploadDialog", that);
							that.getView().addDependent(that.photoPopup);
						}
						var oModelPhoto = new JSONModel();
						oModelPhoto.setData(oData.results[0]);
						that.getView().setModel(oModelPhoto, "photo");
						that.photoPopup.open();
					}).catch(function (oError) {
						that.getView().setBusy(false);
						// var oPopover = that.getErrorMessage(oError);
					});
			}
			// move selected row data to global variable
		},

		onSelectPhoto2: function (oEvent) {
			var that = this;
			if (!that.photoPopup2) {
				that.photoPopup2 = new sap.ui.xmlfragment("victoria.fragments.PhotoUploadDialog2", that);
				that.getView().addDependent(that.photoPopup2);
			}
			that.photoPopup2.open();
		},
		handleOkPress: function () {
			sap.ui.getCore().byId("idCoUploader2").setValue();
			this.photoPopup2.close();
		},
		handleCancelPress: function () {
			sap.ui.getCore().byId("idCoUploader2").setValue();
			var oModelPhoto = new JSONModel();
			oModelPhoto.setData();
			this.getView().setModel(oModelPhoto, "photo2");
			this.photoPopup2.close();
		},
		onFileUploaderChange2: function () {
			var that = this;
			var oFileUploader = sap.ui.getCore().byId("idCoUploader2");
			if (oFileUploader.getValue()) {
				// this.flag = 'U';
				var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
				var fileName = file.name;
				var fileType = file.type;
				var reader = new FileReader();
				reader.onload = function (e) {
					var oFile = {};
					oFile.imgContent = e.currentTarget.result;
					var picture = oFile.imgContent;
					var oModelPhoto = new JSONModel();
					oModelPhoto.setData({
						Content: picture,
						Filename: fileName,
						Filetype: fileType
					});
					that.getView().setModel(oModelPhoto, "photo2");
				}
				reader.readAsDataURL(file);
			}
		},
		handleUploadPress: function (oEvent) {

			var oFileUploader = sap.ui.getCore().byId("idCoUploader");
			// if (!oFileUploader.getValue()) {
			//   sap.m.MessageToast.show("Choose a file first");
			//   return;
			// }
			var that = this;
			if (oFileUploader.getValue()) {
				this.flag = 'U';
				var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
				this.fileName = file.name;
				this.fileType = file.type;
				var reader = new FileReader();
				reader.onload = function (e) {
					var oFile = {};
					oFile.imgContent = e.currentTarget.result;
					var picture = oFile.imgContent;
					var that2 = that;
					that.savePicToDb(that.fileName, that.fileType, picture);
					//if picture already exists update the picture
					// if (that.selRow.Picture==="X") {
					//   var photoId = that.getView().getModel("photo").getData().id;
					//   var payload = {
					//     id: photoId,
					//     Content: picture,
					//     name: that.fileName,
					//     type:that.fileType
					//   };
					//   $.post('/updatePhoto', payload)
					//     .done(function(data, status) {
					//       sap.m.MessageToast.show("Photo updated");
					//
					//       var oModelPhoto = new JSONModel();
					//       oModelPhoto.setData(payload);
					//       that.getView().setModel(oModelPhoto, "photo");
					//     })
					//     .fail(function(xhr, status, error) {
					//       sap.m.MessageBox.error("Failed to update photo");
					//     });
					// } else{
					// // if picture doesn't exist then create new record
					//     var payload = {
					//       CustomerOrderId: that.selRow.id,
					//       Content: picture,
					//       Filename: that.fileName,
					//       Filetype: that.fileType
					//     }
					//     that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Photos",
					//                       "POST", {}, payload, that)
					//       .then(function(oData) {
					//           sap.m.MessageToast.show("Photo uploaded Successfully");
					//           // update picture flag in customer orders
					//
					//     //show uploaded picture
					//           var oModelPhoto = new JSONModel();
					//           oModelPhoto.setData(oData);
					//           that.getView().setModel(oModelPhoto, "photo");
					//    // update photo flag in customer order
					//           that2.selRow.Picture = "X";
					//           var payload = {
					//             id: that2.selRow.id,
					//             PhotoValue : that2.selRow.Picture
					//           };
					//           $.post('/updatePhotoFlag', payload)
					//   					.done(function(data, status) {
					//   						sap.m.MessageToast.show("Data updated");
					//   					})
					//   					.fail(function(xhr, status, error) {
					//   						sap.m.MessageBox.error("Failed to update");
					//   					});
					//     // call clear to update the color of the image
					//             that2.onClear();
					//           that2.getView().setBusy(false);
					//         }).catch(function(oError) {
					//           that2.getView().setBusy(false);
					//           var oPopover = that.getErrorMessage(oError);
					//         });
					//   ;}
				}
				reader.readAsDataURL(file);
			} else if (this.flag === 'C') {
				var snapId = 'Capture';
				this.savePicToDb(this.attachName,
					"jpeg",
					document.getElementById(snapId).toDataURL())
			} else {
				sap.m.MessageToast.show(that.resourceBundle.getText("Pic1"));
				return;
			}
		},

		handleCapturePress: function () {
			//This code was generated by the layout editor.
			var that = this;
			this.flag = 'C';
			//Step 1: Create a popup object as a global variable
			this.fixedDialog = new Dialog({
				title: "Click on Capture to take photo",
				beginButton: new sap.m.Button({
					text: "Capture Photo",
					press: function (oEvent) {

						// TO DO: get the object of our video player which live camera stream is running
						//take the image object out of it and set to main page using global variable
						that.imageVal = document.getElementById("player");
						var oPopup = oEvent.getSource();
						that.attachName = oPopup.getParent().getContent()[1].getValue();
						that.fixedDialog.close();
					}
				}),
				content: [
					new sap.ui.core.HTML({
						content: "<video id='player' autoplay></video>"
					}),
					new sap.m.Input({
						placeholder: 'please enter image name here',
						required: true
					})
				],
				endButton: new sap.m.Button({
					text: "Cancel",
					press: function () {

						that.fixedDialog.close();
					}
				})
			});

			this.getView().addDependent(this.fixedDialog);
			//Step 2: Launch the popup
			this.fixedDialog.open();

			this.fixedDialog.attachBeforeClose(this.setImage, this);

			var handleSuccess = function (stream) {
				player.srcObject = stream;
			}

			navigator.mediaDevices.getUserMedia({
				video: true
			}).then(handleSuccess);

		},

		setImage: function () {
			//Take the running image from the video stream of camera

			var oVBox = this.getView().getDependents()[0].getContent()[0].getContent()[0];
			// var items = oVBox.getItems();
			// var snapId = 'anubhav-' + items.length;
			// var textId = snapId + '-text';
			var snapId = 'Capture';
			var textId = snapId + '-text';
			var imageVal = this.imageVal;

			//set that as a canvas element on HTML page
			var oCanvas = new sap.ui.core.HTML({
				content: "<canvas id='" + snapId + "' width='320px' height='320px' " +
					" style='2px solid red'></canvas> " +
					" <label id='" + textId + "'>" + this.attachName + "</label>"
			});
			oVBox.addItem(oCanvas);
			oCanvas.addEventDelegate({
				onAfterRendering: function () {
					var snapShotCanvas = document.getElementById(snapId);
					var oContext = snapShotCanvas.getContext('2d');
					oContext.drawImage(imageVal, 0, 0, snapShotCanvas.width, snapShotCanvas.height);
				}
			});
		},

		savePicToDb: function (fileName, fileType, picture) {

			var that = this;
			if (this.selRow && this.selRow.Picture === "X") {
				var photoId = this.getView().getModel("photo").getData().id;
				var payload = {
					id: photoId,
					Content: picture,
					name: this.fileName,
					type: this.fileType
				};
				$.post('/updatePhoto', payload)
					.done(function (data, status) {
						sap.m.MessageToast.show(that.resourceBundle.getText("Pic2"));

						var oModelPhoto = new JSONModel();
						oModelPhoto.setData(payload);
						that.getView().setModel(oModelPhoto, "photo");
					})
					.fail(function (xhr, status, error) {
						sap.m.MessageBox.error(that.resourceBundle.getText("Pic3") + ", " + error);
					});
			} else {
				// if picture doesn't exist then create new record
				var that = this;
				var payload = {
					CustomerOrderId: this.selRow.id,
					Content: picture,
					Filename: this.fileName,
					Filetype: this.fileType
				}
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Photos",
					"POST", {}, payload, this)
					.then(function (oData) {
						sap.m.MessageToast.show(that.resourceBundle.getText("Pic4"));
						// update picture flag in customer orders

						//show uploaded picture
						var oModelPhoto = new JSONModel();
						oModelPhoto.setData(oData);
						that.getView().setModel(oModelPhoto, "photo");
						// update photo flag in customer order
						that.selRow.Picture = "X";
						var payload = {
							id: that.selRow.id,
							PhotoValue: that.selRow.Picture
						};
						$.post('/updatePhotoFlag', payload)
							.done(function (data, status) {
								sap.m.MessageToast.show(that.resourceBundle.getText("Data12"));
							})
							.fail(function (xhr, status, error) {
								sap.m.MessageBox.error(that.resourceBundle.getText("Update12"));
							});
						// call clear to update the color of the image
						that.onClear();
						that.getView().setBusy(false);
					}).catch(function (oError) {
						that.getView().setBusy(false);
						var oPopover = that.getErrorMessage(oError);
					});;
			}
		},
		savePicToDb2: function (fileName, fileType, picture, customerOrderId) {
			// if picture doesn't exist then create new record
			var that = this;
			var payload = {
				CustomerOrderId: customerOrderId,
				Content: picture,
				Filename: fileName,
				Filetype: fileType
			}
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Photos",
				"POST", {}, payload, this)
				.then(function (oData) {
					sap.m.MessageToast.show(that.resourceBundle.getText("Pic4"));
					var oModelPhoto = new JSONModel();
					oModelPhoto.setData();
					that.getView().setModel(oModelPhoto, "photo2");
					// update picture flag in customer orders
					var payload = {
						id: customerOrderId,
						PhotoValue: "X"
					};
					$.post('/updatePhotoFlag', payload)
						.done(function (data, status) {
							sap.m.MessageToast.show(that.resourceBundle.getText("Data12"));
						})
						.fail(function (xhr, status, error) {
							sap.m.MessageBox.error(that.resourceBundle.getText("Update12"));
						});
					// call clear to update the color of the image
					that.onClear();
					that.getView().setBusy(false);
				}).catch(function (oError) {
					that.getView().setBusy(false);
					var oModelPhoto = new JSONModel();
					oModelPhoto.setData();
					that.getView().setModel(oModelPhoto, "photo2");
					var oPopover = that.getErrorMessage(oError);
				});;
		},
		// close photo upload popup
		handleClosePress: function (oEvent) {

			// if (!this.photoPopup) {
			//     this.photoPopup = new sap.ui.xmlfragment("victoria.fragments.PhotoUploadDialog", this);
			// }
			var oFileUploader = sap.ui.getCore().byId("idCoUploader");
			oFileUploader.setValue("");
			// var oVBox = this.getView().getDependents()[0].getContent()[0].getContent()[0];
			//oVBox.getItems()[3].destroyLayoutData();
			// oVBox.getItems()[3].setProperty("content", "");
			this.photoPopup.close();
		},

		onSave: function (oEvent) {
			var that = this;
			let oResourceBundle = this.resourceBundle;
			var myData = this.getView().getModel('local').getProperty("/customerOrder");
			myData.Date = this.getView().byId("idCoDate").getDateValue();
			myData.DelDate = this.getView().byId("idCoDelDate").getDateValue();

			if(myData.Cash == 0 && myData.Gold == 0  && myData.Silver == 0 && myData.Qty == 0 && myData.Weight == 0){
				MessageBox.show(oResourceBundle.getText('ATLEASTONE'));
				return;
			}

			// Validate the data of customer order
			var oValidate = this.isCustOrderDataValid(myData);
			if (!oValidate.isValid) {
				oValidate.errMessages.forEach(oErrMsg => {
						let oField = this.getView().byId(oErrMsg.sFieldId);
						oField.setValueState("Error");
						oField.setValueStateText(oErrMsg.sMessage);
				});
				this.getView().byId(oValidate.errMessages[0].sFieldId).focus();
				return;
			}
			this.getView().getModel("local").setProperty("/customerOrder/Date", myData.Date);
			this.getView().getModel("local").setProperty("/customerOrder/DelDate", myData.DelDate);
			this.getView().setBusy(true);
			// if (myData.Qty === "0") {
			// 	var Qty = this.getView().byId("idCoQty");
			// 	Qty.setValueState(sap.ui.core.ValueState.Error).setValueStateText("Qty can't be 0")
			// 	that.getView().setBusy(false);
			// 	return;
			// } else {
			// 	var Qty = this.getView().byId("idCoQty");
			// 	Qty.setValueState(sap.ui.core.ValueState.None);
			// }
			// myData.Date = this.getView().byId("idCoDate").getDateValue();
			// myData.DelDate = this.getView().byId("idCoDelDate").getDateValue();
			// if (myData.Date > myData.DelDate) {
			// 	sap.m.MessageBox.error(that.resourceBundle.getText("DeliveryDate"));
			// 	that.getView().setBusy(false);
			// 	return;
			// }
			// this.getView().getModel("local").setProperty("/customerOrder/Date", myData.Date);
			// this.getView().getModel("local").setProperty("/customerOrder/DelDate", myData.DelDate);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/CustomerOrders",
				"POST", {}, myData, this)
				.then(function (oData) {
					that.getView().setBusy(false);
					if (that.getView().getModel("photo2") && that.getView().getModel("photo2").getData().Content) {
						var pPayload = that.getView().getModel("photo2").getData();
						that.savePicToDb2(pPayload.Filename, pPayload.Filetype, pPayload.Content, oData.id);
					}
					sap.m.MessageToast.show(that.resourceBundle.getText("dataSucess"));
					that.onClear();
				}).catch(function (oError) {
					that.getView().setBusy(false);
					var oPopover = that.getErrorMessage(oError);
				});;
		},
		isCustOrderDataValid: function (oCustOrderData) {
			// Fields which must be entered for creating the customer order
			/*
				Field Name		Rule
				Customer		Customer cannot be blank
				Qty				Quantity must be greated than 0
				Material		Material cannot be blank
				Date			Date cannot be blank
				DelDate			Delivery date must be greater than date 
				Weight			Weight must be greater than 0

				
			*/
			let oValidations = {
				isValid: true,
				errMessages: []
			}
			let oResourceBundle = this.resourceBundle;
			if (!oCustOrderData.Date) {
				// Date is not entered
				oValidations.errMessages.push({
					sMessage: oResourceBundle.getText("DATE_CANNOT_BE_BLANK_VS"),
					sFieldId: "idCoDate"
				});
			} else {
				this.getView().byId("idCoDate").setValueState("None");
				this.getView().byId("idCoDate").setValueStateText("");
			}
			if (!oCustOrderData.DelDate) {
				oValidations.errMessages.push({
					sMessage: oResourceBundle.getText("DATE_CANNOT_BE_BLANK_VS"),
					sFieldId: "idCoDelDate"
				});
			} else {
				if (oCustOrderData.Date > oCustOrderData.DelDate) {
					oValidations.errMessages.push({
						sMessage: oResourceBundle.getText("DATE_GREATER_THAN_DELV"),
						sFieldId: "idCoDelDate"
					});
				} else {
					this.getView().byId("idCoDelDate").setValueState("None");
					this.getView().byId("idCoDelDate").setValueStateText("");
				}
			}
			if (!oCustOrderData.Customer) {
				oValidations.errMessages.push({
					sMessage: oResourceBundle.getText("CUSTOMER_BLANK_VS"),
					sFieldId: "idCoCustomer"
				});
			} else {
				this.getView().byId("idCoCustomer").setValueState("None");
				this.getView().byId("idCoCustomer").setValueStateText("");
			}
			if (!oCustOrderData.Material) {
				oValidations.errMessages.push({
					sMessage: oResourceBundle.getText("MATERIAL_BLANK"),
					sFieldId: "idCoMaterial"
				});
			} else {
				this.getView().byId("idCoMaterial").setValueState("None");
				this.getView().byId("idCoMaterial").setValueStateText("");
			}
			// if (!oCustOrderData.Qty || parseFloat(oCustOrderData.Qty) <= 0) {
			// 	oValidations.errMessages.push({
			// 		sMessage: oResourceBundle.getText("QTY_GREATER_THAN_VS"),
			// 		sFieldId: "idCoQty"
			// 	});
			// }else {
			// 	this.getView().byId("idCoQty").setValueState("None");
			// 	this.getView().byId("idCoQty").setValueStateText("");
			// }
			// if (!oCustOrderData.Weight || parseFloat(oCustOrderData.Weight) <= 0) {
			// 	oValidations.errMessages.push({
			// 		sMessage: oResourceBundle.getText("WEIGHT_GREATER_THAN_VS"),
			// 		sFieldId: "idCoWeight"
			// 	});
			// }else {
			// 	this.getView().byId("idCoWeight").setValueState("None");
			// 	this.getView().byId("idCoWeight").setValueStateText("");
			// }

			if (oValidations.errMessages.length) {
				oValidations.isValid = false;
			}
			return oValidations;
		},

		onDelete: function () {
			var that = this;
			sap.m.MessageBox.confirm(that.resourceBundle.getText("Do1"), {
				title: "Confirm", // default
				styleClass: "", // default
				initialFocus: null, // default
				textDirection: sap.ui.core.TextDirection.Inherit, // default
				onClose: function (sButton) {
					if (sButton === MessageBox.Action.OK) {
						var aSelectedLines = that.byId("idCoTable").getSelectedItems();
						if (aSelectedLines.length) {
							for (var i = 0; i < aSelectedLines.length; i++) {
								var myUrl = aSelectedLines[i].getBindingContext().sPath;
								that.ODataHelper.callOData(that.getOwnerComponent().getModel(), myUrl,
									"DELETE", {}, {}, that);
							} //end for
						} //end if aSelectedLines
						sap.m.MessageToast.show(that.resourceBundle.getText("Selected12"));
					} //end if sButton
				}
			});
		},
		onClear: function () {

			var that = this;
			this.getView().byId("idCoDate").setDateValue(new Date());
			var date = new Date();
			var dd = date.getDate();
			var mm = date.getMonth() + 1;
			var yyyy = date.getFullYear();
			this.getView().byId("idCoDelDate").setDateValue(new Date(yyyy, mm, dd));
			// this.byId("idCoCustomerText").setValue("");
			this.byId("idCoMaterial").setValue("");
			this.byId("idCoMatName").setValue("");
			this.byId("idCoMatType").setValue("");
			this.byId("idCoMatKarat").setValue("");
			this.byId("idCoMatMaking").setValue("");
			this.byId("idCoQty").setValue("1");
			this.byId("idCoWeight").setValue("0");
			this.byId("idCoMaking").setValue("0");
			this.byId("idCoRemarks").setValue("");
			this.byId("idCoCash").setValue("0");
			this.byId("idCoGold").setValue("0");
			this.byId("idCoSilver").setValue("0");
			this.byId("idCoKarigar").setValue("");
			this.byId("idCoKarigarName").setValue("");
			this.getView().getModel("local").setProperty("/coTemp/MaterialCode", "");
			this.getView().getModel("local").setProperty("/coTemp/CustomerCode", "");
			this.getView().getModel("local").setProperty("/coTemp/KarigarCode", "");
			this.getView().getModel("local").setProperty("/customerOrder/Karigar", "");
			this.getView().getModel("local").setProperty("/customerOrder/Material", "");
			this.getView().getModel("local").setProperty("/customerOrder/Customer", "");
			this.getView().getModel("local").setProperty("/customerOrder/Picture", "");
			this.getView().byId("idCoTable").getBinding("items").filter([]);
			var oModelPhoto = new JSONModel();
			oModelPhoto.setData();
			that.getView().setModel(oModelPhoto, "photo2");
		},

		onRefresh: function () {
			this.onClear();
		},


		onSuggest: function (oEvent) {

			// var key = oEvent.which || oEvent.keyCode || oEvent.charCode;
			const key = oEvent.key
			var id1 = oEvent.getParameter("id").split("--")[2]
			// if() alert('backspace');
			var searchStr = oEvent.getParameter("suggestValue");
			if (searchStr === "" || key == 8 || key === "Backspace" || key === "Delete") {
				this.getView().byId("idCoCustomer").setValue("");
				return;
			}
			if (!searchStr) {
				searchStr = oEvent.getParameter("newValue");
			}
			if (searchStr) {
				var oFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("CustomerCode", sap.ui.model.FilterOperator.Contains, searchStr.toUpperCase()),
						new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, searchStr.toUpperCase())
					],
					and: false
				});
			}

			oEvent.getSource().getBinding("suggestionItems").filter(oFilter);
			var oSorter = new sap.ui.model.Sorter({

				path: "CustomerCode",
				descending: false

			});
			oEvent.getSource().getBinding("suggestionItems").sort(oSorter);
			this.getView().byId("idCoCustomer").setValue(searchStr);

			// this.getView().byId("idCash").focus();
			// this.getView().byId("idCash").$().find("input").select();
		},


		onSuggest1: function (oEvent) {

			// var key = oEvent.which || oEvent.keyCode || oEvent.charCode;
			const key = oEvent.key
			var id1 = oEvent.getParameter("id").split("--")[2]
			// if() alert('backspace');
			var searchStr = oEvent.getParameter("suggestValue");
			if (searchStr === "" || key == 8 || key === "Backspace" || key === "Delete") {
				this.getView().byId("idCoKarigar").setValue("");
				return;
			}
			if (!searchStr) {
				searchStr = oEvent.getParameter("newValue");
			}
			if (searchStr) {
				var oFilter = new sap.ui.model.Filter({
					filters: [
						new sap.ui.model.Filter("CustomerCode", sap.ui.model.FilterOperator.Contains, searchStr.toUpperCase()),
						new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, searchStr.toUpperCase())
					],
					and: false
				});
			}

			oEvent.getSource().getBinding("suggestionItems").filter(oFilter);
			var oSorter = new sap.ui.model.Sorter({

				path: "CustomerCode",
				descending: false

			});
			oEvent.getSource().getBinding("suggestionItems").sort(oSorter);
			this.getView().byId("idCoKarigar").setValue(searchStr);

			// this.getView().byId("idCash").focus();
			// this.getView().byId("idCash").$().find("input").select();
		},



		onUpdateFinished: function (oEvent) {
			var oTable = oEvent.getSource();
			var itemList = oTable.getItems();
			var noOfItems = itemList.length;
			var value1;
			var id;
			var cell;
			var title = this.getView().getModel("i18n").getProperty("coTableTitle");
			//this.getView().byId("idCoTitle").setText(title + " " + "(" + noOfItems + ")");
			this.getView().byId("idCoTable").getHeaderToolbar().getTitleControl().setText(title + " " + "(" + noOfItems + ")");
			for (var i = 0; i < noOfItems; i++) {
				//Read the GUID from the Screen for customer, material and karigar
				var customerId = oTable.getItems()[i].getCells()[3].getText();
				var customerData = this.allMasterData.customers[customerId];
				oTable.getItems()[i].getCells()[2].setText(customerData.CustomerCode + ' - ' + customerData.Name);

				var materialId = oTable.getItems()[i].getCells()[5].getText();
				var materialData = this.allMasterData.materials[materialId];
				oTable.getItems()[i].getCells()[4].setText(materialData.ProductCode + ' - ' + materialData.ProductName);

				var karigarId = oTable.getItems()[i].getCells()[15].getText();
				if (karigarId !== "null" && karigarId !== "") {

					var customerData = this.allMasterData.customers[karigarId];
					oTable.getItems()[i].getCells()[14].setText(customerData.CustomerCode + ' - ' + customerData.Name);
				}
				var remarks = oTable.getItems()[i].getCells()[9].getText();
				if (remarks === "null") {
					oTable.getItems()[i].getCells()[9].setText(" ");
				}
			}
		},


		


	});
});
