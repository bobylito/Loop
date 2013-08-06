Loop.text = (function( ){
  var simple = function(text, duration){
          return {
            _init   : function(w, h, sys, ioState){
              this.startTime = ioState.time;
            },
            animate : function(ioState){return ioState.time < this.startTime + duration ;},
            render: function(ctx, w, h){
                var m = ctx.measureText(text);
                ctx.fillStyle="white";
                ctx.fillText(text, w/2-m.width/2, h/2);
            }
          }
      };
  return {
    simple: simple
  };
})();;
