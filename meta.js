Loop.meta = (function(){
  /***
   * Meta animation that takes at least two animations and display them sequentially
   */
  var andThen = function(){
    if(arguments.lenght < 1) throw new Error("andThen must have at least one animation");
    var animations = Array.prototype.slice.call(arguments, 0);
    return {
      _init:  function(){
        this.current = animations.shift();
        this.current._init.apply(this.current, arguments);
      },
      animate : function(ioState, w, h){
        var isAlive = this.current.animate.apply(this.current, arguments);
        if( !isAlive ){
          if(animations.length > 0){
            this.current = animations.shift();
            //FIXME : loop might not be defined
            this.current._init(w, h, loop, ioState);
          }
          else{
            return false;
          }
        }
        return true;
      },
      render  : function(){
        this.current.render.apply(this.current, arguments);
      }
    }
  };

  return {
    andThen : andThen
  };
})();
