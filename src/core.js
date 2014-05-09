(function( loopModule ){
  //Request animation frame polyfill
  var requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame   ||
    window.mozRequestAnimationFrame      ||
    window.oRequestAnimationFrame        ||
    window.msRequestAnimationFrame       ||
    function( callback ){
      window.setTimeout(callback, 1000 / 60);
    };
  })();

  /**
   * Stats.js "polyfill"
   */
  var Stats = window.Stats || function(){
    this.setMode = function(){};
    this.begin = function(){};
    this.end = function(){};
  };

  /**
   * Loop(output1, output2...)
   * Creates a new loop object
   */
  function Loop( outputManagers /* Output managers here */ ){
    this.eventRegister= {};
    this._animations  = [];
    this._io          = [];
    this._out         = {};

    this.status = null;
    this.stats = (function(){
      var s = new Stats();
      if(s.domElement){
        s.domElement.style.position = 'absolute';
        s.domElement.style.right = '0px';
        s.domElement.style.top = '0px';
        document.body.appendChild( s.domElement );
      }
      return s;
    })();

    //Add output managers
    outputManagers.forEach( this._addOutput.bind(this) );

    this.loop = this.loop.bind(this);
  }

  Loop.prototype = {
    /**
     * Main loop function
     * Not to be used directly
     */
    loop:function(){
      if(this.status){
        requestAnimFrame( this.loop );
      }

      var animSys = this,
          ioState = this.calculateIOState();

      this.stats.begin();

      for(var i = this._animations.length-1; i>=0; i--){
        if( !this._animations[i].animate(ioState) ){
          this._animations.splice(i,1);
        }
      }

      this._trigger("renderStart");

      for(var i0 = 0; i0<this._animations.length;i0++){
        this._animations[i0].render( this._out );
      }

      this._trigger("renderEnd");

      //Copie canvas offscreen vers canvas on

      this.stats.end();

    },
    /**
     * Starts the animation stack
     */
    start: function(){
      this._trigger("start");
      this.status = true;
      this.loop();
    },
    /**
     * Stop the animation stack
     */
    stop: function(){
      this._trigger("stop");
      this.status = false;
    },
    /**
     * Add an animation to the stack
     */
    registerAnimation: function(animation){
      if(typeof(animation._init) === "function")
        animation._init( this._out, this, this.calculateIOState());
      this._animations.push(animation);
    },
    /**
     * Adds an input manager to the loop
     */
    addIO : function( ioManager ){
      if(!ioManager._init){
        console.log( "Wrong IOManager : ",ioManager );
        throw new Error("IOmanagers should have _init method");
      }
      ioManager._init( this._out );
      this._io.push( ioManager );
    },
    /**
     * Adds an output manager to the loop
     */
    _addOutput : function( outputManager ){
      if(!outputManager._init){
        console.log( "Wrong OutputManager : ",outputManager );
        throw new Error("OutputManagers should have _init method");
      }
      this._out[outputManager.name] = outputManager._init( this );
    },
    /**
     * Internal function that returns the ioState of the loop
     */
    calculateIOState : function(){
      return this._io.map(    function(o){ return o.update;})
                     .reduce( function(state, updateF){ return updateF(state);}, {});
    },
    /**
     * Internal event bind
     */
    on : function(eventType, funK){
      if( this.eventRegister[eventType] === undefined ){
        this.eventRegister[eventType] = [];
      }
      this.eventRegister[eventType].push(funK);
    },
    /**
     * Triggers event message for the loop
     */
    _trigger: function(eventType){
      if( this.eventRegister[eventType] ){
        var animationSystem = this;
        var fs = this.eventRegister[eventType];
        if( !fs || !fs.length) return;
        for(var i = fs.length - 1; i >=0; i--){
            fs[i].call(animationSystem);
        }
      }
    }
  };

  loopModule.create = function( /* OutputManagers */ ){
    if(arguments.length < 1) throw new Error("No output managers provided.");
    var outputManagers = Array.prototype.splice.call(arguments, 0);

    return new Loop( outputManagers );
  };

  return Loop;
})(
    window.Loop = window.Loop || {},
    window.Loop.animations = window.Loop.animations || {}
  );
