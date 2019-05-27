/*global location*/
sap.ui.define(
    ["victoria/controller/BaseController"],
    function (BaseController) {
        "use strict";

        return BaseController.extend("victoria.controller.salesws", {
          onInit: function (){
            var orderItems = [
              { "material": "",
                "description": "",
                "qty" : "",
                "qtyD": "",
                "weight": "",
                "weightD": "",
                "making": "",
                "makingD": "",
                "tunch": "",
                "remarks": "",
                "subTotal": ""
              },
              { "material": "",
                "description": "",
                "qty" : "",
                "qtyD": "",
                "weight": "",
                "weightD": "",
                "making": "",
                "makingD": "",
                "tunch": "",
                "remarks": "",
                "subTotal": ""
              },
              { "material": "",
                "description": "",
                "qty" : "",
                "qtyD": "",
                "weight": "",
                "weightD": "",
                "making": "",
                "makingD": "",
                "tunch": "",
                "remarks": "",
                "subTotal": ""
              },
              { "material": "",
                "description": "",
                "qty" : "",
                "qtyD": "",
                "weight": "",
                "weightD": "",
                "making": "",
                "makingD": "",
                "tunch": "",
                "remarks": "",
                "subTotal": ""
              },
              { "material": "",
                "description": "",
                "qty" : "",
                "qtyD": "",
                "weight": "",
                "weightD": "",
                "making": "",
                "makingD": "",
                "tunch": "",
                "remarks": "",
                "subTotal": ""
              },
              { "material": "",
                "description": "",
                "qty" : "",
                "qtyD": "",
                "weight": "",
                "weightD": "",
                "making": "",
                "makingD": "",
                "tunch": "",
                "remarks": "",
                "subTotal": ""
              },
              { "material": "",
                "description": "",
                "qty" : "",
                "qtyD": "",
                "weight": "",
                "weightD": "",
                "making": "",
                "makingD": "",
                "tunch": "",
                "remarks": "",
                "subTotal": ""
              },
              { "material": "",
                "description": "",
                "qty" : "",
                "qtyD": "",
                "weight": "",
                "weightD": "",
                "making": "",
                "makingD": "",
                "tunch": "",
                "remarks": "",
                "subTotal": ""
              },
              { "material": "",
                "description": "",
                "qty" : "",
                "qtyD": "",
                "weight": "",
                "weightD": "",
                "making": "",
                "makingD": "",
                "tunch": "",
                "remarks": "",
                "subTotal": ""
              },
              { "material": "",
                "description": "",
                "qty" : "",
                "qtyD": "",
                "weight": "",
                "weightD": "",
                "making": "",
                "makingD": "",
                "tunch": "",
                "remarks": "",
                "subTotal": ""
              }
            ];
            var oModel= new sap.ui.model.json.JSONModel();
            oModel.setData({"orderItems":orderItems});
            sap.ui.getCore().setModel(oModel,"localModel");
          }
        });

    });
