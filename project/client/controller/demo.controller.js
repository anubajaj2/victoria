/*global location*/
sap.ui.define(
    ["victoria/controller/BaseController"],
    function (BaseController) {
        "use strict";

        return BaseController.extend("victoria.controller.demo", {

          onValueHelp: function(){
            this.getCustomerPopup();
          },
          onSave: function(){
            
          }

        });

    });
