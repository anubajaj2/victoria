sap.ui.define(["sap/ui/core/format/NumberFormat", "sap/ui/core/format/DateFormat"], function(NumberFormat, DateFormat) {
	return {
		getFormattedDate: function(monthInc) {
			var dateObj = new Date();
			dateObj.setDate(dateObj.getDate());
			var dd = dateObj.getDate();
			dateObj.setMonth(dateObj.getMonth() + monthInc);
			var mm = dateObj.getMonth() + 1;
			var yyyy = dateObj.getFullYear();
			if (dd < 10) {
				dd = '0' + dd;
			}
			if (mm < 10) {
				mm = '0' + mm;
			}
			return dd + '.' + mm + '.' + yyyy;
		},


				textBold: function(sText) {
		        if (typeof sText === "string") {
		            if (sText.indexOf("(Self)") > -1) {
		                this.setDesign("Bold");
		            }
		        }
		        return sText;
		     },


		convertPDFToUrl: function(vContent) {
			// var decodedPdfContent=vContent;
			// var decodedPdfContent = atob(vContent.replace("data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,", ""));
			var decodedPdfContent = vContent;
			var byteArray = new Uint8Array(decodedPdfContent.length);
			for (var i = 0; i < decodedPdfContent.length; i++) {
				byteArray[i] = decodedPdfContent.charCodeAt(i);
			}

			var blob = new Blob([byteArray.buffer], {
				// type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				type:'application/octet-stream'
			});
			jQuery.sap.addUrlWhitelist("blob");
			return URL.createObjectURL(blob);
		},
		getDateDDMMYYYYFormat: function(date){
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
											  pattern: "dd.mm.yyyy"});

		var oNow = date;
		return oDateFormat.format(oNow); //string in the same format as "Thu, Jan 29, 2017"
		},
		getIndianCurr: function(value){

			if(value){
				var x=value;
				x=x.toString();
				var lastThree = x.substring(x.length-3);
				var otherNumbers = x.substring(0,x.length-3);
				if(otherNumbers != '')
				    lastThree = ',' + lastThree;
				var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
				return res;
			}

		},
		checkPhotoStat: function(value){
			if(value){
				if(value === "X"){
					return "Accept";
				}else if(value.length>10){
					return "Accept";
				}else{
					return "Reject";
				}
			}else{
				return "Reject";
			}

		},
		byNameCity: function(Name, City){
			if(City) {
				return Name + "-" + this.allMasterData.cities[City].cityName;
			}
			// return Name + "-" + this.allMasterData.cities[City].cityName;
		},
		byNameCityGroup: function(customerId){

			if (customerId && customerId !== "null"){
				var customerData = this.allMasterData.customers[customerId]
				var Name = customerData.Name;
				var City = this.allMasterData.cities[customerData.City].cityName;
				var Group = this.allMasterData.groups[customerData.Group].groupName;
				return Name + "-" + City + "-" + Group;
			}
		},
		sortByProperty: function(array, property) {
			var lol = function dynamicSort(property) {
				var sortOrder = 1;
				if (property[0] === "-") {
					sortOrder = -1;
					property = property.substr(1);
				}
				return function(a, b) {
					var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
					return result * sortOrder;
				}
			};

			return array.sort(lol(property));
		},
		getIncrementDate: function(dateObj, monthInc) {

			//	var dd = dateObj.getDate();
			dateObj.setMonth(dateObj.getMonth() + monthInc);
			var dd = dateObj.getDate();
			var mm = dateObj.getMonth() + 1;
			var yyyy = dateObj.getFullYear();
			if (dd < 10) {
				dd = '0' + dd;
			}
			if (mm < 10) {
				mm = '0' + mm;
			}
			return dd + '.' + mm + '.' + yyyy;
		},
		getDateCheck: function(dateObj) {
			var dd = dateObj.getDate();
			var mm = dateObj.getMonth();
			var yyyy = dateObj.getFullYear();

			var ddToday = new Date();

			var dd1 = ddToday.getDate();
			var mm1 = ddToday.getMonth();
			var yyyy1 = ddToday.getFullYear();


			if (yyyy > yyyy1) {
				return true;
			} else {
				if (yyyy == yyyy1) {
					if (mm > mm1) {
						return true;
					} else {
						if (mm == mm1) {
							if (dd > dd1) {
								return true;
							} else {
								return false;
							}
						} else {
							return false;
						}
					}
				} else { //(yyyy < yyyy1)
					return false;
				}
			}
		},

		formatIconColor: function(bValue) {
			if (bValue === true) {
				return "red";
			} else {
				return "green";
			}
		},

		formatRowHighlight: function(bValue) {
			if (bValue === true) {
				return "Error";
			} else {
				return "Success";
			}
		},

		formatStatusValue: function(sValue) {

			switch (sValue) {
				case "L": return "Live";
				case "V": return "Video";
				case "A": return "Live and Video";
			}
		},
		formatCurrency: function (a,b){
			var oCurrencyFormat = NumberFormat.getCurrencyInstance();
			return oCurrencyFormat.format(a,b);
		},
		getInterestAmount: function(customerId, Amount, date) {

			var oCustomer = this.allMasterData.customers[customerId];
			var interest  = oCustomer.Interest;
			var date2 = new Date();
			var date1 = date;
			var Difference_In_Time = date2.getTime() - date1.getTime();
			var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
			var days = parseInt(Difference_In_Days);

			var totalAmt = ((Amount*interest*days)/3000);
			totalAmt = parseFloat(totalAmt.toFixed(2));
			return totalAmt;

		}




	};
});
