//Handling many implementations
window.requestAnimFrame = (function(){
  return window.requestAnimationFrame || 
  window.mozRequestAnimationFrame || 
  window.webkitRequestAnimationFrame || 
  window.msRequestAnimationFrame;
})();

window.datastore = (function init(d,w){
  var canvasDom = d.getElementById("scene"),
      canvasOff = d.createElement("canvas");

  //FULLSCREEN
  canvasDom.height=w.innerHeight;
  canvasDom.width=w.innerWidth;

  canvasOff.height=w.innerHeight;
  canvasOff.width=w.innerWidth;
  
  canvasDom.style.cssText="position:absolute;top:0;left:0";

  return {
    "CANVAS"            : canvasDom,
    "CANVAS_CTX"        : canvasDom.getContext("2d"),
    "CANVAS_SHADOW"     : canvasOff,
    "CANVAS_SHADOW_CTX" : canvasOff.getContext("2d"),
    "CANVAS_HEIGHT"     : canvasDom.height,
    "CANVAS_WIDTH"      : canvasDom.width
  }
})(document, window);

window.loop = (function createMainLoop(){
    var animations=[],
        context = datastore["CANVAS_SHADOW_CTX"],
        canvasOff = datastore["CANVAS_SHADOW"],
        contextOn = datastore["CANVAS_CTX"],
        lastUpdate = undefined,
        status = undefined, 
        fadeOutScreen = function(){
          context.globalCompositeOperation = "source-over";
          context.fillStyle = "rgb(0,0,0)";
          context.fillRect(0,0,datastore["CANVAS_WIDTH"],datastore["CANVAS_HEIGHT"]);
        },
        loop = function(time){
          fadeOutScreen();
          for(var i = animations.length-1; i>=0; i--){
            animations[i].render();
          }

          //Copie canvas offscreen vers canvas on
          contextOn.drawImage(canvasOff, 0, 0);

          for(var i = animations.length-1; i>=0; i--){
            if(!animations[i].animate(time)){
              animations.splice(i,1);
            }
          }
          if(status){
            window.requestAnimFrame(loop);
          }
        };

    return {
      animations:{},
      start: function(){
        context.fillStyle = "#000";
        context.fillRect(0,0,datastore["CANVAS_WIDTH"],
            datastore["CANVAS_HEIGHT"]);
        status = true;
        loop();
      },
      stop: function(){
        status = false;
      },
      registerAnimation: function(animation){
        animations.push(animation);
      }
    };
  })();
