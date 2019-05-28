'use strict';

module.exports = function(OrderHeader) {
  debugger;
  OrderHeader.observe('before save', function computePercentage(ctx, next) {
    if (ctx.instance) {
      //ctx.instance.OrderNo = 990;
      //Read only max order no for given, if order is found, +1 and create
      //if not found, give it as order no 1
      OrderHeader.findOne(
        { order: 'OrderNo DESC'}
        // { where: {  "date":{Date.now()}}

      ).then(function(record){
        if(record){
          console.log(record);
          ctx.instance.OrderNo = record.OrderNo + 1;
        }else{
          ctx.instance.OrderNo = 1;
        }
      });
    }
    return next();
  });
};
