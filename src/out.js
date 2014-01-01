(function( Loop, out){

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

  var WebaudioOutputManager = OutputManager.bind(null, "webaudio", function initWebaudio(){
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new AudioContext();
    return {
      ctx : context
    };
  });

  out.canvas2d = CanvasOutputManager;
  out.webaudio = WebaudioOutputManager;
})(
    window.Loop = window.Loop || {},
    window.Loop.out = window.Loop.out || {}
  );
