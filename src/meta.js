(function(Loop, meta){
  /***
   * Meta animation that takes at least two animations and display them sequentially
   */
  var andThen = function(){
    if(arguments.length < 1) throw new Error("andThen must have at least one animation");
    var animations = Array.prototype.slice.call(arguments, 0);
    return {
      _init:function(w, h, sys, ioState){
        this._loop    = sys;
        this._result  = null;
        this.current  = animations.shift();
        this.current._init.apply(this.current, arguments);
      },
      animate : function(ioState, w, h){
        var isAlive = this.current.animate.apply(this.current, arguments);
        if( !isAlive ){
          var lastResult = (function(a){
            if(a.result && typeof a.result === "function") return a.result();
            else return null;
          })(this.current);
          this._result = lastResult;
          if(animations.length < 0){
            return false;
          }
          this.current = animations.shift();
          this.current._init(w, h, this._loop, ioState, lastResult);
        }
        return true;
      },
      render  : function(){
        this.current.render.apply(this.current, arguments);
      },
      result : function(){
        return this._result;         
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
        this._results= [];
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
        var self = this;
        this.animations = this.animations.reduce(function(memo, a){
          var isAlive = a.animate.apply(a, args);
          if(isAlive) memo.push(a);
          else if(a.result) {
            self._results.push( a.result() );
          }
          return memo;
        }, []);
        return this.animations.length > 0;
      },
      result : function(){
        return this._results.filter(function(e){ return !!e; })
                            .reduce(function(m, r){
          for(var k in r){
            if(r.hasOwnProperty(k)) m[k] = r[k];
          }
          return m;
        }, {});         
      }
    };
  };

  var some = function(){
    var a = all.apply(window, arguments);
    var newAnimate = function(ioState, w, h){
      var args = arguments;
      var self = this;
      this.animations = this.animations.reduce(function(memo, a){
        var isAlive = a.animate.apply(a, args);
        if(isAlive) memo.push(a);
        else {
          self._results = self.animations.map(function(anim){ return anim.result ? anim.result() : {}; });
        } 
        return memo;
      }, []);
      return this._results.length === 0;
    };
    a.animate = newAnimate.bind(a);
    return a;
  };

  var until = function(animationGenƒ, untilƒ){
    return {
      _init   : function(){
        this._initArgs = arguments;
        this.initSubAnimation();
      },
      animate : function(){
        var res = this._anim.animate.apply(this._anim, arguments);
        if(!res){
          var untilRes = untilƒ( this._anim.result() );
          if( untilRes ) {
            return false;
          }
          this.initSubAnimation();
        }
        return true;
      },
      render  : function(){
        this._anim.render.apply(this._anim, arguments);
      },
      result  : function(){
        return this._anim.result.apply(this._anim);          
      },
      initSubAnimation : function(){
        this._anim = animationGenƒ();
        this._anim._init.apply(this._anim, this._initArgs);
      }
    };
  };

  //Module exports
  meta.andThen  = andThen;
  meta.all      = all;
  meta.some     = some;
  meta.until    = until;
})(
    window.Loop = window.Loop || {},
    window.Loop.meta = window.Loop.meta || {}
  );
