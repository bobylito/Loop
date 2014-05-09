(function( Loop, filters){

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

  var waitForAKey = function(anim, key){
    var k = key || "SPACE";
    return {
      _init   : function(){
        this.end = false;
        anim._init.apply(anim, arguments);
      },
      render  : function(outputManagers){
        anim.render.apply(anim, arguments);
        if(this.end){
          var params = outputManagers.canvas2d.parameters;
          var ctx = outputManagers.canvas2d.context;
          var msg = "PRESS " + k;
          ctx.font = "20px sans-serif";
          var size = ctx.measureText(msg);
          ctx.fillStyle = "red";
          ctx.fillText( msg, 
              params.width/2 - size.width/2, 
              params.height - 50);
        }
      },
      animate : function(ioState){
        if(this.end){
          return !ioState.keys[k];
        }
        else {
          var r = anim.animate.apply(anim, arguments);
          if(!r) this.end = true;
          return true;
        }
      },
      result  : anim.result.bind(anim)
    };
  };
  /**
   * fadeOut : Animation filter to fade out when animation ends
   */
  var fadeOut = function(anim, duration){
    var fadeLevel = 0;
    var t0 = null;
    var size = null;
    return {
      _init   : function(outputM){
        t0 = null;
        fadeLevel = 0;
        size = [
          outputM.canvas2d.parameters.width,
          outputM.canvas2d.parameters.height
        ];
        anim._init.apply(anim, arguments);
      },
      render  : function(outputManagers){
        var ctx = outputManagers.canvas2d.context;
        anim.render.apply(anim, arguments);
        if(t0 !== null){
          var oldColor = ctx.fillStyle;
          ctx.fillStyle = "rgba(0,0,0," + fadeLevel + ")";
          ctx.fillRect(0,0,size[0],size[1]);
          ctx.fillStyle = oldColor;
        }
      },
      animate : function(ioState){
        if( t0 !== null ){
          t = ioState.time - t0;
          fadeLevel = t/duration; 
          return (fadeLevel <= 1);
        }
        else {
          var res = anim.animate.apply(anim, arguments);
          if( !res ){
            t0 = ioState.time;
          }
          return true;
        }
      },
      result : anim.result.bind(anim) 
    };
  };

  //Module exports 
  filters.fadeOut = fadeOut;
  filters.glsl    = glsl;
  filters.waitForAKey = waitForAKey; 
})(
    window.Loop = window.Loop || {},
    window.Loop.filters = window.Loop.filters || {}
  );
