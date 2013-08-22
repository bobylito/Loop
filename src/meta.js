(function(Loop, meta){
  /***
   * Meta animation that takes at least two animations and display them sequentially
   */
  var andThen = function(){
    if(arguments.length < 1) throw new Error("andThen must have at least one animation");
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
            var lastResult = (function(a){
              if(a.result && typeof a.result === "function") return a.result();
            })(this.current);
            this.current = animations.shift();
            //FIXME : loop might not be defined
            this.current._init(w, h, loop, ioState, lastResult);
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
    };
  };

  /**
   * Meta animation that takes n (>2) animations and animate them at the same time
   * Order matters : from background to foreground
   */
  var all = function(){
    if(arguments.length < 1) throw new Error("all must have at least 1 animation");
    return {
      animations : Array.prototype.slice.call(arguments, 0),
      _init   : function(){
        var args = arguments;
        this.animations.forEach(function(a){
          if(a._init && typeof a._init === "function") a._init.apply(a, args);
        });          
      },
      render  : function(){
        var args = arguments;
        this.animations.forEach(function(a){
          a.render.apply(a, args);
        });
      },
      animate : function(ioState, w, h){
        var args = arguments;
        this.animations = this.animations.reduce(function(memo, a){
          var isAlive = a.animate.apply(a, args);
          if(isAlive) memo.push(a);
          return memo;
        }, []);
        return this.animations.length > 0;
      }
    };
  };

  //Module exports
  meta.andThen  = andThen;
  meta.all      = all;
})(
    window.Loop = window.Loop || {},
    window.Loop.meta = window.Loop.meta || {}
  );
