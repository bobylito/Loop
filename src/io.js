(function( Loop, io){
  function IOManager( ioStateModifier, variables ){
    this.update     = ioStateModifier.bind(this);
    this.variables  = variables;
  }

  IOManager.prototype = {
    _init : function( sceneDom ){
      this.el = sceneDom;
      this.elPos = sceneDom.getBoundingClientRect();
    }
  };

  var keyboardIO = function( watchedKeys ){
    var io = new IOManager(function(ioState){
      if(ioState.keys){
        var currentK = this._currentKeys();
        for(var k in currentK){
          ioState.keys[k] = currentK[k];
        }
      }
      else{
        ioState.keys = this._currentKeys();
      }
      return ioState;
    });
 
    io._keys = {};
    io._inversedConfig = {};
    for(var k in watchedKeys ){
      io._keys[k] = false;
      io._inversedConfig[ watchedKeys[k] ] = k;
    }

    io._currentKeys = function(){
      document.addEventListener("keydown", function(e){
        var code = e.keyCode;
        if( code in io._inversedConfig ){
          io._keys[ io._inversedConfig[code] ] = true;
        }
      });
      document.addEventListener("keyup", function(e){
        var code = e.keyCode;
        if( code in io._inversedConfig ){
          io._keys[ io._inversedConfig[code] ] = false;
        }
      });
      io._currentKeys = function(){
        return this._keys;
      };
      return this._keys;
    };

    return io;
  };

  var noAutoKeyboardIO = function( watchedKeys ){
    var io = new IOManager(function(ioState){
      if(ioState.keys){
        var currentK = this._currentKeys();
        for(var k in currentK){
          ioState.keys[k] = currentK[k];
        }
      }
      else{
        ioState.keys = this._currentKeys();
      }
      this._resetKeys();
      return ioState;
    });
 
    io._keys = {};
    io._firedKeys = {};
    io._inversedConfig = {};

    for(var k in watchedKeys ){
      io._keys[k] = false;
      io._firedKeys[k] = false;
      io._inversedConfig[ watchedKeys[k] ] = k;
    }

    io._currentKeys = function(){
      document.addEventListener("keydown", function(e){
        var code = e.keyCode;
        if( code in io._inversedConfig && 
              !io._firedKeys[ io._inversedConfig[code] ] ){
          io._keys[ io._inversedConfig[code] ] = true;
          io._firedKeys[ io._inversedConfig[code] ] = true;
        }
      });
      document.addEventListener("keyup", function(e){
        var code = e.keyCode;
        if( code in io._inversedConfig ){
          io._keys[ io._inversedConfig[code] ] = false;
          io._firedKeys[ io._inversedConfig[code] ] = false;
        }
      });
      io._currentKeys = function(){
        return this._keys;
      };
      return this._keys;
    };

    io._resetKeys = function(){
      for( var code in this._keys ){
        this._keys[ code ] = false;
      }
    };

    return io;
  };

  var mouseIO = function(){
    var io = new IOManager( function(ioState){
      var pos = this._positionValue();
      ioState.position = {
        x : pos.x ? pos.x - this.elPos.left : pos.x,
        y : pos.y ? pos.y - this.elPos.top  : pos.y
      };
      ioState.actions = this._buttonsValue();
      return ioState;
    }, ["position", "buttons"]);

    io._buttonsValue = function(){
      var self = this;
      this.el.addEventListener("mousedown", function(e){
        self._buttons = {
          left  : self._buttons.left  || (e.button === 0),
          right : self._buttons.right || (e.button === 2)
        };
      });
      this._buttonsValue = function(){
        var btnVal = this._buttons;
        this._buttons = {
          left : false,
          right: false
        };
        return btnVal;
      };
      this._buttons = {
        left  : false,
        right : false,
      };
    };

    io._positionValue = function(){
      var self = this;
      this.el.addEventListener("mousemove", function(e){
        self._position = {
          x : e.pageX,
          y : e.pageY
        };
      });
      this.el.addEventListener("mouseout", function(e){
        self._position = {
          x : null,
          y : null
        };
      });
      this._positionValue = function(){
        return this._position;
      };
      this._position = {
        x : null,
        y : null
      };
      return this._position;
    };

    return io;
  };

  var timeIO = new IOManager( function(ioState){
    ioState.time = Date.now();
    return ioState;
  }, ["time"] );

  var deltaTimeIO = (function(){
    var lastTime = Date.now();
    return new IOManager( function(ioState){
      var currentTime = Date.now();
      ioState.deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      return ioState;
    }, ["deltaTime"] );
  })();

  var controledTimeIO = function( timeLength ){
    var io = new IOManager( function(ioState ){
      ioState.time = this._timeValue();
      return ioState;
    }, ["time"]);
    io._timeValue = function(){
      this._el = (function(self){
        var d = document.createElement("input");
        d.setAttribute("type", "range");
        d.setAttribute("min", "0");
        d.setAttribute("max", timeLength);
        d.addEventListener("change", function(){
           self._time = parseInt(this.value, 10) ;
        });
        document.body.appendChild(d);
        d.value=0;
        self._time = 0;
        return d;
      })(this);

      this._timeValue = function(){
        return this._time;
      };
      return this._time;
    };
    return io;
  };

  //Module exports
  io.mouse          = mouseIO;
  io.time           = timeIO;
  io.deltaTime      = deltaTimeIO;
  io.controlTime    = controledTimeIO;
  io.keyboard       = keyboardIO;
  io.noAutoKeyboard = noAutoKeyboardIO;
})(
    window.Loop = window.Loop || {},
    window.Loop.io = window.Loop.io || {}
  );
