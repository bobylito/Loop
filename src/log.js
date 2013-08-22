(function(){
  /*
   * Provides an efficient way to log stuff about what is happening in the animation
   */
  var debug = function(){
    var outDom = document.createElement("div");
    outDom.id="debugData";
    document.body.appendChild(outDom);
    return { 
      _out : outDom,
      _messages : [],
      _init     : function(w, h, animationSystem){
        var logger = this;
        if(animationSystem.debug){
          var oldDebug = animationSystem.debug ;
          animationSystem.debug=function( key, value ){
            oldDebug(key, value);
            logger._messages.push([key, value]);
          };
        }
        else {
          animationSystem.debug=function( key, value ){
            logger._messages.push([key, value]);
          };
        }
      },
      animate   : function(){ return true;},
      render    : function(){
        var orderedMessages = this._messages.sort( function(m1, m2){ return m1[0].localeCompare(m2[0]); });
        this._out.innerHTML = orderedMessages.reduce( function(msg, m){
          return msg + m[0] + " : " + m[1] + "<br/>";
        }, "");
        this._messages=[];
      }
    };
  };

  var graph = function(){
    var container = document.createElement("div");
    container.id = "debugGraph"; 
    document.body.appendChild(container);
    var colors = [
      "hsl(0, 66%, 30%)",
      "hsl(40, 66%, 30%)",
      "hsl(80, 66%, 30%)",
      "hsl(120, 66%, 30%)",
      "hsl(160, 66%, 30%)"
      ];
    return {
      _messages : [],
      _dataSets : {},
      lastT     : 0,
      originalT : 0,
      _init: function( w, h, animationSystem, ioState){
        var logger = this;
        this.originalT = ioState.time;
        if(animationSystem.debug){
          var oldDebug = animationSystem.debug ;
          animationSystem.debug=function( key, value ){
            oldDebug(key, value);
            logger._messages.push([key, value]);
          };
        }
        else {
          animationSystem.debug=function( key, value ){
            logger._messages.push([key, value]);
          };
        }
      },
      render: function(){
        if(window.jsPlot){
          var fs = (function(ds){ 
                var fs = [];
                var k;
                var i = 0;
                for(k in ds){
                  var d = ds[k];
                  var f = jsPlot.tools.datasetToFunc(d);
                  f.color = colors[ i++ % colors.length];
                  fs.push(f);
                }
                return fs;
              })(this._dataSets);
          var delta = (this.lastT - this.originalT)/10;
          var minT  = (function(ds, v){
                var k ;
                for( k in ds){
                  var d = ds[k];
                  var t = d[0][0];
                  if(t<v) v = t;
                }
                return v;
              })(this._dataSets, delta);
          jsPlot("debugGraph", {Xmin : minT, Xmax: delta, Ymin: -10, Ymax: 10, canvasHeight: 250, canvasWidth: 500, gridVisible:false}, fs);
        }
      },
      animate: function(ioState){ 
        var data = this._dataSets;
        if(ioState.time > (this.lastTime + 1000)) return true;
        var t = this.lastT - this.originalT;
        this.lastT = ioState.time;
        var asN = this.asNumber;
        this._messages.forEach(function(m){
          var k = m[0];
          var v = asN(m[1]);
          if( v === undefined ) return;
          if( !data[k] ){
            data[k] = [];
          }
          if(data[k].length >= 200){
            data[k].shift();
          }
          data[k].push([t / 10, v]);
        });
        this._messages = [];
        return true;
      },
      asNumber : function(n){
        if(typeof n === "number") return n;
        if(typeof n === "string") {
          try {
            var p = parseFloat(n);
            if( isNaN(p) ) return undefined;
            return p;
          }
          catch(e){
            return undefined;
          }
        }
        return undefined;
      }
    };
  };

  Loop.tools = {
    debug : debug,
    debugGraph : graph
  };
})();
