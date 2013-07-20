//Handling many implementations
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame || 
  window.webkitRequestAnimationFrame   || 
  window.mozRequestAnimationFrame      || 
  window.oRequestAnimationFrame        || 
  window.msRequestAnimationFrame       || 
  function( callback ){
    window.setTimeout(callback, 1000 / 60);
  };
})();

var Stats = Stats || function(){
  this.setMode = function(){};
  this.begin = function(){};
  this.end = function(){};
};

window.datastore = (function init(d,w){
  var canvasDom = d.getElementById("scene"),
      canvasOff = d.createElement("canvas");

  canvasOff.height = canvasDom.height;
  canvasOff.width  = canvasDom.width;

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
    var stats = (function(){
          var s = new Stats();
          s.setMode(1);
          if(s.domElement){
            s.domElement.style.position = 'absolute';
            s.domElement.style.right = '0px';
            s.domElement.style.top = '0px';

            document.body.appendChild( s.domElement );
          }
          return s;
        })(),
        animations=[],
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

          stats.begin();
          animations.forEach(function(anim){
            anim.render(context, datastore["CANVAS_WIDTH"],datastore["CANVAS_HEIGHT"]);
          });

          //Copie canvas offscreen vers canvas on
          contextOn.drawImage(canvasOff, 0, 0);

          for(var i = animations.length-1; i>=0; i--){
            if(!animations[i].animate(time, datastore["CANVAS_WIDTH"],datastore["CANVAS_HEIGHT"])){
              animations.splice(i,1);
            }
          }

          stats.end();
          if(status){
            window.requestAnimFrame(loop);
          }
        };

    var loadCount = 0;
    return {
      animations:{},
      start: function(){
        for(anim in this.animations){
          if(this.animations.hasOwnProperty(anim) && typeof(this.animations[anim]._init) === "function")
            this.animations[anim]._init(datastore["CANVAS_WIDTH"],datastore["CANVAS_HEIGHT"])
        }
        animations.forEach(function(anim){
          if(typeof(anim._init) === "function")
            anim._init(datastore["CANVAS_WIDTH"],datastore["CANVAS_HEIGHT"])
        });
        context.fillStyle = "#000";
        context.fillRect(0,0,datastore["CANVAS_WIDTH"], datastore["CANVAS_HEIGHT"]);
        status = true;
        loop();
      },
      stop: function(){
        status = false;
      },
      registerAnimation: function(animation){
        if(status){
          if(typeof(animation._init) === "function")
            animation._init(datastore["CANVAS_WIDTH"],datastore["CANVAS_HEIGHT"])
        }
        animations.push(animation);
      },
      loadImage: function registerImageRequest(uri, callback){
	var domImage = new Image();
        domImage.src = uri;
        loadCount++;
        domImage.onload = function(){
            callback(domImage);
            loadCount--;
        }
      }
    };
  })();
