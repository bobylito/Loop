//Handling many implementations
window.requestAnimFrame = (function(){
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
var Stats = Stats || function(){
  this.setMode = function(){};
  this.begin = function(){};
  this.end = function(){};
};

function Loop( canvas, fadeoutf ){
  this.eventRegister= {};
  this._animations  = [];
  this._io          = [];

  this.canvas       = canvas || document.createElement("canvas");
  this.canvasOff    = (function copyProperties(newC, original){
    newC.height = original.height;
    newC.width  = original.width;
    return newC;
  })(document.createElement("canvas"), this.canvas);
  this.ctx          = this.canvas.getContext("2d");
  this.ctxOff       = this.canvasOff.getContext("2d");

  this.height       = canvas.height;
  this.width        = canvas.width;
  this.fadeoutf     = fadeoutf || function(){
    this.ctxOff.globalCompositeOperation = "source-over";
    this.ctxOff.fillStyle = "#000000";
    this.ctxOff.fillRect(0,0,this.width,this.height);
  }
  this.status = undefined;
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

  this.loop = this.loop.bind(this);
}

Loop.prototype = {
  loop:function(){
    var animSys = this,
        ioState = this.calculateIOState();
    this.fadeoutf(this.ctxOff, this.width, this.height);

    this.stats.begin();
    this._animations.forEach(function(anim){
      anim.render( this.ctxOff, this.width, this.height );
    }, this);

    //Copie canvas offscreen vers canvas on
    this.ctx.drawImage(this.canvasOff, 0, 0);

    for(var i = this._animations.length-1; i>=0; i--){
      if(!this._animations[i].animate(ioState, this.width, this.height)){
        this._animations.splice(i,1);
      }
    }
    this.stats.end();

    if(status){
      window.requestAnimFrame( this.loop );
    }
  },
  start: function(){
    this._trigger("start");
    this.fadeoutf(this.ctxOff, this.width, this.height);
    status = true;
    this.loop();
  },
  stop: function(){
    this._trigger("stop");
    status = false;
  },
  registerAnimation: function(animation){
    if(typeof(animation._init) === "function")
      animation._init( this.width, this.height, this, this.calculateIOState());
    this._animations.push(animation);
  },
  addIO : function( ioManager ){
    this._io.push( ioManager );
  },
  calculateIOState : function(){
    return this._io.map(    function(o){ return o.update;})
                   .reduce( function(state, updateF){ return updateF(state);}, {});
  },
  on : function(eventType, funK){
    if( this.eventRegister[eventType] === undefined ){
      this.eventRegister[eventType] = [];
    }
    this.eventRegister[eventType].push(funK);
  },
  _trigger: function(eventType){
    if( this.eventRegister[eventType] ){
      var animationSystem = this;
      this.eventRegister[eventType].forEach(function(f){
          f.call(animationSystem);
      });
    }
  }
};

Loop.animations = {};
window.loop = new Loop( document.getElementById("scene") );
