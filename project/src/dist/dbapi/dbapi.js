sap.ui.define(["jquery.sap.global"],function(e){"use strict";return{callOData:function(r,s,t,a,n,c){return new Promise(function(o,i){var u=new Date;var f=c.getModel("local").getProperty("/CurrentUser");if(t==="POST"){n.CreatedBy=f;n.ChangedBy=f;n.CreatedOn=u;n.ChangedOn=u}else if(t==="PUT"){n.ChangedBy=f;n.ChangedOn=u}if(!(r&&s&&t)){i("Invalid parameters passed")}if(!a){a={}}r.setUseBatch(false);switch(t.toUpperCase()){case"GET":r.read(s,{async:true,filters:a.filters,sorters:a.sorters,success:function(e,r){o(e)},error:function(e){i(e)}});break;case"POST":r.create(s,n,{async:true,filters:a.filters,sorters:a.sorters,success:function(e,r){o(e)},error:function(e){i(e)}});break;case"PUT":r.update(s,n,{async:true,filters:a.filters,sorters:a.sorters,success:function(e,r){debugger;o(e)},error:function(e){debugger;i(e)}});break;case"DELETE":r.remove(s,{async:true,filters:a.filters,sorters:a.sorters,success:function(e,r){o(e)},error:function(e){i(e)}});break;default:e.sap.log.error("No case matched");break}})}}});