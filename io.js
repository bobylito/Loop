Loop.io = (function(){
  function IOManager( ioStateModifier, variables ){
    this.update     = ioStateModifier.bind(this);
    this.variables  = variables;
  };

  IOManager.prototype = {
    _init : function( sceneDom ){
      this.el = sceneDom;
      this.elPos = sceneDom.getBoundingClientRect();
    }
  };

  var keyboardIO = function( watchedKeys ){
    var io = new IOManager(function(ioState){
      ioState.keys = this._currentKeys();
      return ioState;
    });
 
    io._keys = {};
    io._inversedConfig = {};
    for(k in watchedKeys ){
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
      }
      return this._keys;
    };

    return io;
  }

  var mouseIO = function(){
    var io = new IOManager( function(ioState){
      var pos = this._positionValue()
      ioState.position = {
        x : pos.x ? pos.x - this.elPos.left : pos.x,
        y : pos.y ? pos.y - this.elPos.top  : pos.y
      };
      return ioState;
    }, ["position"]);

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
      }
      return this._position;
    };

    return io;
  }

  var timeIO = new IOManager( function(ioState){
    ioState.time = Date.now();
    return ioState;
  }, ["time"] );

  var controledTimeIO = new IOManager( function(ioState ){
    ioState.time = this._timeValue();
    return ioState;
  }, ["time"]);

  controledTimeIO._timeValue = function(){
    this._el = (function(self){
      var d = document.createElement("input");
      d.setAttribute("type", "range");
      d.addEventListener("change", function(){
         self._time = parseInt(this.value, 10) * 100;
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
  }

  return {
    mouse : mouseIO,
    time : timeIO,
    keyboard : keyboardIO,
    controlTime : controledTimeIO
  };
})();
