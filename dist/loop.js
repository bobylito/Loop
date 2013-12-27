// stats.js r10 - http://github.com/mrdoob/stats.js
var Stats=function(){var l=Date.now(),m=l,g=0,n=1E3,o=0,h=0,p=1E3,q=0,r=0,s=0,f=document.createElement("div");f.id="stats";f.addEventListener("mousedown",function(b){b.preventDefault();t(++s%2)},!1);f.style.cssText="width:80px;opacity:0.9;cursor:pointer";var a=document.createElement("div");a.id="fps";a.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#002";f.appendChild(a);var i=document.createElement("div");i.id="fpsText";i.style.cssText="color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
i.innerHTML="FPS";a.appendChild(i);var c=document.createElement("div");c.id="fpsGraph";c.style.cssText="position:relative;width:74px;height:30px;background-color:#0ff";for(a.appendChild(c);74>c.children.length;){var j=document.createElement("span");j.style.cssText="width:1px;height:30px;float:left;background-color:#113";c.appendChild(j)}var d=document.createElement("div");d.id="ms";d.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";f.appendChild(d);var k=document.createElement("div");
k.id="msText";k.style.cssText="color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";k.innerHTML="MS";d.appendChild(k);var e=document.createElement("div");e.id="msGraph";e.style.cssText="position:relative;width:74px;height:30px;background-color:#0f0";for(d.appendChild(e);74>e.children.length;)j=document.createElement("span"),j.style.cssText="width:1px;height:30px;float:left;background-color:#131",e.appendChild(j);var t=function(b){s=b;switch(s){case 0:a.style.display=
"block";d.style.display="none";break;case 1:a.style.display="none",d.style.display="block"}};return{domElement:f,setMode:t,begin:function(){l=Date.now()},end:function(){var b=Date.now();g=b-l;n=Math.min(n,g);o=Math.max(o,g);k.textContent=g+" MS ("+n+"-"+o+")";var a=Math.min(30,30-30*(g/200));e.appendChild(e.firstChild).style.height=a+"px";r++;b>m+1E3&&(h=Math.round(1E3*r/(b-m)),p=Math.min(p,h),q=Math.max(q,h),i.textContent=h+" FPS ("+p+"-"+q+")",a=Math.min(30,30-30*(h/100)),c.appendChild(c.firstChild).style.height=
a+"px",m=b,r=0);return b},update:function(){l=this.end()}}};
;window.jsPlot=function(g,i,j){var k=Math.log(10),f={extend:j,createCanvas:function(b,a){var d=i.getElementById(b),c=d.getElementsByTagName("canvas")[0];c||(c=i.createElement("canvas"),d.appendChild(c));c.width=a.canvasWidth;c.height=a.canvasHeight;return c.getContext("2d")},findNiceRoundStep:function(b,a){var d=b/a,c=Math.floor(Math.log(d)/k),e=Math.pow(10,c),d=d/e;1.5>d?d=1:3.5>d?d=2:7.5>d?d=5:(e=Math.pow(10,c+1),d=1);return d*e},drawAxes:function(b,a){b.save();b.strokeStyle="#888";b.beginPath();
b.moveTo(a.Xmin*a.xscale,0);b.lineTo(a.Xmax*a.xscale,0);b.moveTo(0,a.Ymin*a.yscale);b.lineTo(0,a.Ymax*a.yscale);b.stroke();b.fillStyle="black";b.beginPath();b.moveTo(a.Xmax*a.xscale,0);b.lineTo(a.Xmax*a.xscale-10,6);b.lineTo(a.Xmax*a.xscale-10,-6);b.lineTo(a.Xmax*a.xscale,0);b.moveTo(0,a.Ymax*a.yscale);b.lineTo(-6,a.Ymax*a.yscale-10);b.lineTo(6,a.Ymax*a.yscale-10);b.lineTo(0,a.Ymax*a.yscale);b.fill();b.scale(-1,1);b.font="13px helvetica";b.textAlign="end";b.textBaseline="bottom";b.rotate(Math.PI);
b.save();b.translate(a.Xmax*a.xscale-13,-2);b.fillText(a.xLabel,0,0);b.restore();b.rotate(-Math.PI/2);b.translate(a.Ymax*a.yscale-13,-2);b.fillText(a.yLabel,0,0);b.restore()},drawGrid:function(b,a){var d=f.findNiceRoundStep(a.Xmax-a.Xmin,15);b.save();b.font="15px helvetica";b.strokeStyle="#CCF";b.lineWidth=1;b.beginPath();for(var c=a.Xmin-a.Xmin%d;c<a.Xmax;c+=d)b.moveTo(c*a.xscale,a.Ymin*a.yscale),b.lineTo(c*a.xscale,a.Ymax*a.yscale);b.stroke();b.beginPath();for(c=a.Ymin-a.Ymin%d;c<a.Ymax;c+=d)b.moveTo(a.Xmin*
a.xscale,c*a.yscale),b.lineTo(a.Xmax*a.xscale,c*a.yscale);b.stroke();b.save();b.rotate(-Math.PI);b.scale(-1,1);for(c=a.Xmin-a.Xmin%(2*d);c<a.Xmax;c+=2*d)b.fillText(Math.round(1E6*c)/1E6,c*a.xscale,0);b.rotate(-Math.PI/2);for(c=a.Ymin-a.Ymin%(2*d);c<a.Ymax;c+=2*d){var e=Math.round(1E6*c)/1E6;0!==e&&b.fillText(e,c*a.yscale,0)}b.restore();b.restore()},drawFunction:function(b,a,d){try{var c=a.Xmin*a.xscale,e=a.Xmax*a.xscale,f=b.strokeStyle,g=d.color?d.color:"#000";b.lineWidth=d.width?d.width:1;b.strokeStyle=
g;b.moveTo(c,d(c));for(b.beginPath();c<=e;c++){var h=d(c/a.xscale),h=h<a.Ymin?a.Ymin-1:h,h=h>a.Ymax?a.Ymax+1:h;b.lineTo(c,h*a.yscale)}b.stroke()}catch(m){}finally{b.stokeStyle=f}}},l={Xmin:0,Xmax:10,Ymin:0,Ymax:3,xLabel:"x",yLabel:"y",canvasHeight:500,canvasWidth:500,gridVisible:!0},g=function(b,a,d){var a=f.extend({},l,a),c=a.X=a.Xmax-a.Xmin,e=a.Y=a.Ymax-a.Ymin,c=a.xscale=a.canvasWidth/c,e=a.yscale=a.canvasHeight/e,b=f.createCanvas(b,a);b.scale(1,-1);b.translate(0,-a.canvasHeight);b.translate(-(a.Xmin*
c),-(a.Ymin*e));a.gridVisible&&f.drawGrid(b,a);f.drawAxes(b,a);for(c=0;c<d.length;c++)f.drawFunction(b,a,d[c])};g.tools={datasetToFunc:function(b){return b.reduce(function(a,b,c,e){c=e[c+1];if(void 0===c)return function(c){return c>b[0]?void 0:a(c)};var f=(c[1]-b[1])/(c[0]-b[0]),g=b[1]-f*b[0],h=b[0];return function(b){return b>=h?f*b+g:a(b)}},function(){})},funcToDataset:function(b,a){for(var d=f.findNiceRoundStep(a.Xmax-a.Xmin,15),c=[],e=a.Xmin-a.Xmin%d;e<a.Xmax;e+=d)c.push(b(e));return c}};return g}(window,
document,function(g){[].slice.call(arguments,1).forEach(function(i){for(key in i)g[key]=i[key]});return g});
;(function( Loop, benchmark){
  benchmark.particles = function(){
    var nbParticles = document.createElement("div");
    nbParticles.innerHTML = 0;
    document.body.appendChild(nbParticles);
    
    return {
      _init:function(outputs, animationSystem){
        var bench = this;
        animationSystem.on("start", function(){
          bench.pf = animationSystem._animations.filter(function(f){
            return !!f.getParticleCount;
          });
        });
      },
      animate:function(){ return true;},
      render:function(){
        nbParticles.innerHTML = this.pf.reduce(function(m, e){ return m + e.getParticleCount();}, 0);
      }
    };
  };
})(
    window.Loop = window.Loop || {},
    window.Loop.benchmark = window.Loop.benchmark || {}
  );
;(function( loopModule ){
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
   */
  function Loop( /* Output managers here */ ){
    if(arguments.length < 1) throw new Error("No output managers provided.");
    var outputManagers = Array.prototype.splice.call(arguments, 0);

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
    loop:function(){
      var animSys = this,
          ioState = this.calculateIOState();

      this.stats.begin();

      this._trigger("renderStart");

      for(var i0 = 0; i0<this._animations.length;i0++){
        this._animations[i0].render( this._out );
      }

      this._trigger("renderEnd");

      //Copie canvas offscreen vers canvas on

      for(var i = this._animations.length-1; i>=0; i--){
        if( !this._animations[i].animate(ioState) ){
          this._animations.splice(i,1);
        }
      }
      this.stats.end();

      if(this.status){
        requestAnimFrame( this.loop );
      }
    },
    start: function(){
      this._trigger("start");
      this.status = true;
      this.loop();
    },
    stop: function(){
      this._trigger("stop");
      this.status = false;
    },
    registerAnimation: function(animation){
      if(typeof(animation._init) === "function")
        animation._init( this._out, this, this.calculateIOState());
      this._animations.push(animation);
    },
    addIO : function( ioManager ){
      if(!ioManager._init){
        console.log( "Wrong IOManager : ",ioManager );
        throw new Error("IOmanagers should have _init method");
      }
      ioManager._init( this._out );
      this._io.push( ioManager );
    },
    _addOutput : function( outputManager ){
      if(!outputManager._init){
        console.log( "Wrong OutputManager : ",outputManager );
        throw new Error("OutputManagers should have _init method");
      }
      this._out[outputManager.name] = outputManager._init( this );
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
        var fs = this.eventRegister[eventType];
        if( !fs || !fs.length) return;
        for(var i = fs.length - 1; i >=0; i--){
            fs[i].call(animationSystem);
        }
      }
    }
  };

  loopModule.create = function( outputManagers ){
    return new Loop( outputManagers );
  };

  return Loop;
})(
    window.Loop = window.Loop || {},
    window.Loop.animations = window.Loop.animations || {}
  );
;(function( Loop, filters){

  var vertexShaderSrc = 
        " attribute vec2 a_position; "+
        " void main() { gl_Position = vec4(a_position, 0, 1);}";

  var glsl = function( fragShaderSrc ){
    return {
      glCanvas : document.createElement("canvas"),
      _init   : function(outputManagers, sys, ioState){
        var compiled;
        var w = outputManagers.canvas2d.parameters.width;
        var h = outputManagers.canvas2d.parameters.height;

        this.glCanvas.width = w;
        this.glCanvas.height = h;
        var gl = this.glContext = this.glCanvas.getContext("experimental-webgl");
        gl.viewport(0,0,w,h);

        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource( vertexShader, vertexShaderSrc);
        gl.compileShader(vertexShader);
        compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
        if (!compiled) {
          lastError = gl.getShaderInfoLog(vertexShader);
          console.log("*** Error compiling vertexShader '" + vertexShader + "':" + lastError);
        }
        var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource( fragShader, fragShaderSrc);
        gl.compileShader(fragShader);
        compiled = gl.getShaderParameter(fragShader, gl.COMPILE_STATUS);
        if (!compiled) {
          lastError = gl.getShaderInfoLog(fragShader);
          console.log("*** Error compiling fragShader '" + fragShader + "':" + lastError);
        }

        var prog = gl.createProgram();
        gl.attachShader(prog, vertexShader);
        gl.attachShader(prog, fragShader);
        gl.linkProgram( prog);
        gl.useProgram(  prog);

        var positionLocation = gl.getAttribLocation(prog, "a_position");
        var buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER, 
          new Float32Array([
                -1.0, -1.0, 
                1.0, -1.0, 
                -1.0,  1.0, 
                -1.0,  1.0, 
                1.0, -1.0, 
                1.0,  1.0]), 
          gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1i( gl.getUniformLocation(prog, "u_canvas"), 0);
      },
      animate : function(ioState){ return true;},
      render  : function(outputManagers){
        var w = outputManagers.canvas2d.parameters.width;
        var h = outputManagers.canvas2d.parameters.height;
        var gl = this.glContext;
        var texture   = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, outputManagers.canvas2d.parameters.canvas);
        this.glContext.drawArrays(this.glContext.TRIANGLES, 0, 6);

        outputManagers.canvas2d.context.clearRect(0,0,w,h);
        outputManagers.canvas2d.context.drawImage(this.glCanvas, 0, 0, w, h);
      }
    };
  };

  //Module exports 
  filters.glsl = glsl;
})(
    window.Loop = window.Loop || {},
    window.Loop.filters = window.Loop.filters || {}
  );
;(function( Loop, io){
  function IOManager( ioStateModifier, variables ){
    this.update     = ioStateModifier.bind(this);
    this.variables  = variables;
  }

  IOManager.prototype = {
    _init : function( outputContexts ){
      this.el = outputContexts.canvas2d ?  outputContexts.canvas2d.parameters.canvas : document.body;
      this.elPos = this.el.getBoundingClientRect();
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
;(function( Loop, tools){
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

  //Module exports
  tools.debug       = debug;
  tools.debugGraph  = graph;
})(
    window.Loop = window.Loop || {},
    window.Loop.tools = window.Loop.tools || {}
  );
;(function(Loop, meta){
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
          if(animations.length <= 0){
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

  var while1 = function(animationGenƒ){
      return until(animationGenƒ, function(){ return false;});
  };

  //Module exports
  meta.andThen  = andThen;
  meta.all      = all;
  meta.some     = some;
  meta.until    = until;
  meta.while1   = while1;
})(
    window.Loop = window.Loop || {},
    window.Loop.meta = window.Loop.meta || {}
  );
;(function( Loop, out){

  function OutputManager( name, initContext /*, parameters... */){
    if(arguments.length < 2){ throw new Error("Not enough arguments to build OutputManager", this); }

    var parameters = arguments.length > 2 ? Array.prototype.splice.call(arguments, 2) : [];

    this.name     = name;
    this.context  = null;
    this._initCtx = initContext;
    this._params  = parameters;
  }

  OutputManager.prototype = {
    _init: function( system ){
      var contextObject = this._initCtx.apply(this, this._params);
      if( contextObject.onRenderStart ) system.on("renderStart" , contextObject.onRenderStart );
      if( contextObject.onRenderEnd )   system.on("renderEnd"   , contextObject.onRenderEnd );
      return {
        context    : contextObject.ctx,
        parameters : contextObject.parameters
      };
    }
  };

  /**
   * CanvasOutputManager
   * Loop.out.canvas2d
   *
   * Use : 
   * new Loop.out.canvas2d( document.getDocumentById("parentDiv"), 300, 300 );
   */
  var CanvasOutputManager = OutputManager.bind(null, "canvas2d", function init2DCanvas( domParent, width, height, resetBG ){
    var canvas       = document.createElement("canvas");
    canvas.height    = height;
    canvas.width     = width;

    var canvasOff       = document.createElement("canvas");
    canvasOff.height    = height;
    canvasOff.width     = width;

    var ctx          = canvas.getContext("2d");
    var ctxOff       = canvas.getContext("2d");

    domParent.appendChild( canvas );

    var onRenderStartf = resetBG ? resetBG.bind(this, ctxOff, width, height) : function(){
      ctxOff.globalCompositeOperation = "source-over";
      ctxOff.fillStyle = "#000000";
      ctxOff.fillRect(0,0,width,height);
    };

    return {
      ctx           : ctxOff,
      parameters    : {
        height : height,
        width  : width,
        canvas : canvas
      },
      onRenderStart : onRenderStartf,
      onRenderEnd   : function(){
        ctx.drawImage(canvasOff, 0, 0);
      }
    };
  });

  out.canvas2d = CanvasOutputManager;
})(
    window.Loop = window.Loop || {},
    window.Loop.out = window.Loop.out || {}
  );
;(function(Loop, particles){
  /**
   * Renderings are pluggable rendering for particles systems
   * Parameters : 
   *  - renderingOptions options specific to the rendering passed when the system is created
   *  - outCtx canvas 2D outCtxS //FIXME
   *  - width width of the canvas
   *  - height height of the canvas
   */
  var rendering = {
    /**
     * circle : rendering of particles as discs
     * Rendering options : 
     *  - color : color of the disc
     *  - size : diameter of the disc
     *  - compositionMethod : composition to use when drawing the disc
     */
    circle : function(renderingOptions, outputs){
      var outCtx = outputs.canvas2d.context;
      var half = renderingOptions.size / 2 ;
      if(!this.particleCanvas){
        this.particleCanvas = (function initCacheCanvas(){
          var particleCanvas = document.createElement("canvas"),
              particleContext = particleCanvas.getContext('2d');
          
          particleCanvas.width = renderingOptions.size;
          particleCanvas.height = renderingOptions.size;

          particleContext.fillStyle = renderingOptions.color;
          particleContext.beginPath();
          particleContext.arc(half, half, half, 0, 2 * Math.PI, true);
          particleContext.closePath();
          particleContext.fill();
          return particleCanvas;
        })();
      }
      outCtx.globalCompositeOperation = renderingOptions.compositionMethod;
      for(var i = 0; i < this.particles.length; i++){
        var p = this.particles[i];
        outCtx.drawImage(this.particleCanvas, ~~(p[0]-half), ~~(p[1]-half));
      }
    },
    /**
     * texture: rendering of particles as images
     *  - img : image dom element
     */
    texture: function(renderingOptions, outputs){
      var outCtx = outputs.canvas2d.context;
      for(var i = 0; i < this.particles.length; i++){
        var p = this.particles[i];
        outCtx.drawImage(renderingOptions.img, ~~p[0], ~~p[1]);
      }
    },
    /**
     * line : rendering of the particles as lines drawn between particles
     * Rendering options : 
     *  - compositionMethod
     *  - color
     */
    line : function(renderingOptions, outputs){
      var outCtx = outputs.canvas2d.context;
      if(this.particles.length === 0) return ;
      outCtx.globalCompositeOperation = renderingOptions.compositionMethod;
      outCtx.beginPath();
      outCtx.strokeStyle=renderingOptions.color;
      outCtx.moveTo(~~(this.particles[0][0]), ~~(this.particles[0][1]));
      for(var i = 1; i < this.particles.length; i++){
        var p = this.particles[i];
        outCtx.lineTo(~~p[0], ~~p[1]);
      }
      outCtx.stroke();
    },
    /**
     * quadratic : rendering of the particles as curve drawn between particles
     * Rendering options : 
     *  - compositionMethod
     *  - color
     */
    quadratic : function(renderingOptions, outputs){
      var outCtx = outputs.canvas2d.context;
      if( this.particles.length === 0 ) return ;
      outCtx.globalCompositeOperation = renderingOptions.compositionMethod;
      outCtx.beginPath();
      outCtx.strokeStyle = renderingOptions.color;
      outCtx.moveTo(~~(this.particles[0][0]), ~~(this.particles[0][1]));
      for(var i = 1; i < this.particles.length; i++){
        var p = this.particles[i];
        outCtx.quadraticCurveTo(p[0]- p[3] * 100, p[1] -p[4] * 100,~~p[0], ~~p[1]);
      }
      outCtx.stroke();
    },
    imageData : function(renderingOptions, outputs){
      var outCtx = outputs.canvas2d.context;
      var imgData = outCtx.getImageData(0, 0, this.width, this.height),
          data    = imgData.data;
      for(var i = 1; i < this.particles.length; i++){
        var p = this.particles[i],
            x = ~~p[0],
            y = ~~p[1],
            t = (x + y * this.width) * 4;
        data[t] = 250;
        data[t+1] = 250;
        data[t+2] = 2;
        data[t+3] = 255;
      }
      outCtx.putImageData(imgData, 0,0);
    },
  };


  /**
   * Object defining a type of particle system
   */
  function ParticleField( render ){
    this.render = render;
  }

  ParticleField.prototype = {
    /**
     *  Create field : create a field of particle
     *  initf : function executed at the initialization of the particle system
     *  createf: function that initialize a single particle
     *  fieldf: function that simulates the physic of the system
     *  renderingOptions : options given to the rendering engine
     *  endOfLifef : function executed when a particle is removed by the system
     */
    createField : function(
                      initf,
                      createParticlef,
                      fieldf,
                      renderingOptions,
                      endOfLifef 
                    ){
      var eolf    = endOfLifef || function(){},
          system  = {
            _init: function( outputs ){
              var outCtx = outputs.canvas2d.parameters;
              this.width  = w = outCtx.width;
              this.height = h = outCtx.height;
              this.particles = initf ? initf(w, h):[];
              this.toBeCreated = [];
            },
            animate:function(ioState){
              this.toBeCreated.forEach(function( n ){
                this._create(ioState, n);
              }, this);
              this.toBeCreated = [];
              for(var i = 0; i < this.particles.length; i++){
                var p   = this.particles[i],
                    now = ioState.time,
                    vd  = fieldf(p, this.particles, this.width, this.height, ioState);

                p[0] = p[0] + p[3];
                p[1] = p[1] + p[4];

                if( p[0] > this.width+500 || 
                    p[1] > this.height+500 || 
                    p[0] < -500 || 
                    p[1] < -500 ||
                    p[2] < now ){
                  eolf(p);
                  this.particles.splice(i, 1);
                }
              }

              return true;
            },
            create : function(nbParticles){
              this.toBeCreated.push(nbParticles);
            },
            _create : function(ioState, nbParticles) {
              var now = Date.now();
              for(var i = 0; i<nbParticles; i++){
                this.particles.push(this._createParticlef(ioState, this.width, this.height));
              }
            },
            getParticleCount:function(){
              return this.particles.length;
            }
          };
      system.render = this.render.bind(system, renderingOptions);
      system._createParticlef = createParticlef;
      return system;
    }
  };
  
  var circleParticleGenerator     = new ParticleField(rendering.circle);
  var lineParticleGenerator       = new ParticleField(rendering.line);
  var quadraticParticleGenerator  = new ParticleField(rendering.quadratic);
  var textureParticleGenerator    = new ParticleField(rendering.texture);
  var imageDataParticleGenerator  = new ParticleField(rendering.imageData);

  //Module exports
  particles.circle   = circleParticleGenerator.createField.bind(circleParticleGenerator);
  particles.lasso    = lineParticleGenerator.createField.bind(lineParticleGenerator);
  particles.lasso2   = quadraticParticleGenerator.createField.bind(quadraticParticleGenerator);
  particles.texture  = textureParticleGenerator.createField.bind(textureParticleGenerator);
  particles.imageData= imageDataParticleGenerator.createField.bind(imageDataParticleGenerator);
})( 
    window.Loop = window.Loop || {},
    window.Loop.particles = window.Loop.particles = {}
  );

;(function( Loop, sprite ){
  var introScreen = function intro( resourceId, time ){
    return {
      _init:function(w, h, sys, ioState, resources){
        this.img = resources["title.png"];
        this.start = ioState.time;
        this.resources = resources;
      },
      render:function(ctx, w, h){
        ctx.drawImage(this.img, 0, 0); 
      },
      animate:function(ioState){
        return (ioState.time - this.start) < 1000;
      },
      result:function(){
        return this.resources;       
      }
    };
  };

  sprite.intro = introScreen;
})(
    window.Loop = window.Loop || {},
    window.Loop.sprite = window.Loop.sprite || {}
  );
;(function( Loop, text ){
  var simple = function(text, duration){
    return {
      _init   : function(outputs, sys, ioState){
        this.startTime = ioState.time;
      },
      animate : function(ioState){return ioState.time < this.startTime + duration ;},
      render: function(outputs){
          var c = outputs.canvas2d;
          var w = c.width;
          var h = c.height;
          var m = c.measureText(text);
          c.fillStyle="white";
          c.fillText(text, w/2-m.width/2, h/2);
      }
    };
  };

  /**
   * 
   */
  var loading = function(resources){
    var text = "loading";
    return {
      resources : resources,
      loaded    : {},
      totalLoad : 0, 
      total     : 0,
      _init     : function(outputs, sys, ioState){
        if(resources.data){
          this.total += resources.data.length;
          resources.data.forEach(function( path ){
            var xhr = new XMLHttpRequest();
            var self = this;
            xhr.addEventListener("load", function(){
              self.loaded[path] = JSON.parse(this.response);
              self.totalLoad++;
            });
            xhr.open("GET", path, true);
            xhr.send();
          }, this);
        }
        if(resources.img){
          this.total += resources.img.length;
          resources.img.forEach(function( imgPath ){
            var img = document.createElement("img");
            var self = this;
            img.addEventListener("load", function(){
              self.loaded[imgPath] = img;
              self.totalLoad++;
            });
            img.src = imgPath;
          }, this); 
        }
      },
      animate : function(ioState){
        return this.total > this.totalLoad ;
      },
      render: function(ctx, w, h){
        var m = ctx.measureText(text);
        ctx.fillStyle="white";
        ctx.fillText(text, w/2-m.width/2, h/2);
      },
      result : function(){
        return this.loaded;          
      }
    };
  };

  text.simple   = simple;
  text.loading  = loading;
})(
    window.Loop = window.Loop || {},
    window.Loop.text = window.Loop.text || {}
  );
