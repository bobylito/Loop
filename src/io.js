(function( Loop, input){
  function InputManager( ioStateModifier, variables ){
    this.update     = ioStateModifier.bind(this);
    this.variables  = variables;
  }

  InputManager.prototype = {
    _init : function( outputContexts ){
      this.el = outputContexts.canvas2d ? outputContexts.canvas2d.parameters.canvas : document.body;
      this.elPos = this.el.getBoundingClientRect();
    }
  };

  var keyboardIO = function( watchedKeys ){
    var inputK = new InputManager(function(ioState){
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
 
    inputK._keys = {};
    inputK._inversedConfig = {};
    for(var k in watchedKeys ){
      inputK._keys[k] = false;
      inputK._inversedConfig[ watchedKeys[k] ] = k;
    }

    inputK._currentKeys = function(){
      document.addEventListener("keydown", function(e){
        var code = e.keyCode;
        if( code in inputK._inversedConfig ){
          inputK._keys[ inputK._inversedConfig[code] ] = true;
        }
      });
      document.addEventListener("keyup", function(e){
        var code = e.keyCode;
        if( code in inputK._inversedConfig ){
          inputK._keys[ inputK._inversedConfig[code] ] = false;
        }
      });
      inputK._currentKeys = function(){
        return this._keys;
      };
      return this._keys;
    };

    return inputK;
  };

  var noAutoKeyboardIO = function( watchedKeys ){
    var inputK = new InputManager(function(ioState){
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
 
    inputK._keys = {};
    inputK._firedKeys = {};
    inputK._inversedConfig = {};

    for(var k in watchedKeys ){
      inputK._keys[k] = false;
      inputK._firedKeys[k] = false;
      inputK._inversedConfig[ watchedKeys[k] ] = k;
    }

    inputK._currentKeys = function(){
      document.addEventListener("keydown", function(e){
        var code = e.keyCode;
        if( code in inputK._inversedConfig && 
              !inputK._firedKeys[ inputK._inversedConfig[code] ] ){
          inputK._keys[ inputK._inversedConfig[code] ] = true;
          inputK._firedKeys[ inputK._inversedConfig[code] ] = true;
        }
      });
      document.addEventListener("keyup", function(e){
        var code = e.keyCode;
        if( code in inputK._inversedConfig ){
          inputK._keys[ inputK._inversedConfig[code] ] = false;
          inputK._firedKeys[ inputK._inversedConfig[code] ] = false;
        }
      });
      inputK._currentKeys = function(){
        return this._keys;
      };
      return this._keys;
    };

    inputK._resetKeys = function(){
      for( var code in this._keys ){
        this._keys[ code ] = false;
      }
    };

    return inputK;
  };

  var mouseIO = function(){
    var io = new InputManager( function(ioState){
      var pos = this._positionValue();
      ioState.position = {
        x : pos.x ? pos.x - this.elPos.left : pos.x,
        y : pos.y ? pos.y - this.elPos.top  : pos.y
      };
      ioState.actions = this._buttonsValue();
      return ioState;
    }, ["position", "buttons"]);

    input._buttonsValue = function(){
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

    input._positionValue = function(){
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

  var timeIO = new InputManager( function(ioState){
    ioState.time = Date.now();
    return ioState;
  }, ["time"] );

  var deltaTimeIO = (function(){
    var lastTime = Date.now();
    return new InputManager( function(ioState){
      var currentTime = Date.now();
      ioState.deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      return ioState;
    }, ["deltaTime"] );
  })();

  var controledTimeIO = function( timeLength ){
    var io = new InputManager( function(ioState ){
      ioState.time = this._timeValue();
      return ioState;
    }, ["time"]);
    input._timeValue = function(){
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
  input.mouse          = mouseIO;
  input.time           = timeIO;
  input.deltaTime      = deltaTimeIO;
  input.controlTime    = controledTimeIO;
  input.keyboard       = keyboardIO;
  input.noAutoKeyboard = noAutoKeyboardIO;
})(
    window.Loop = window.Loop || {},
    window.Loop.io = window.Loop.io || {}
  );
