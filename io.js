Loop.io = (function(){
  function IOManager( ioStateModifier, variables ){
    this.update     = ioStateModifier.bind(this);
    this.variables  = variables;
  };

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
    time : timeIO,
    controlTime : controledTimeIO
  };
})();
