(function( Loop, sprite ){
  var introScreen = function intro( resourceId, time ){
    return {
      _init:function(w, h, sys, ioState, resources){
        this.img = resources["title.png"];
        this.start = ioState.time;
        this.resources = resources;
      },
      render:function(ctx, w, h){
        ctx.drawImage(this.img, 0, 0); 
      },
      animate:function(ioState){
        return (ioState.time - this.start) < 1000;
      },
      result:function(){
        return this.resources;       
      }
    };
  };

  sprite.intro = introScreen;
})(
    window.Loop = window.Loop || {},
    window.Loop.sprite = window.Loop.sprite || {}
  );
