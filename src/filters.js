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

  //Module exports 
  filters.glsl = glsl;
})(
    window.Loop = window.Loop || {},
    window.Loop.filters = window.Loop.filters || {}
  );
