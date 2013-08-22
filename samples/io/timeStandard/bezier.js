//Exp2 : come get some bezier

(function(Loop, io){
  var utilMvt = {
    f1: function(t, tn, d, seed){
      var x = t/tn;
      var funcRes = ((10 * x + Math.sin(x*5*Math.PI+seed) ) * 5 ) / 50; 
      return d-(funcRes*d);
    }  
  };

  var utilAmpl = {
    f1 : function(t, tn, amplitude, seed){
      var x = t/tn;
      return Math.cos(x*5*Math.PI+seed)*amplitude + 3;// Math.cos(x)*amplitude+2; 
    }
  };

  function createBlob(pos, amplitude, width, height){
    var it = 0,
        animaSeed = Math.random()*Math.PI*2;

    pos = pos || {x:50, y:50};
    amplitude = amplitude || 20;
    height = height || 30;
    width = width || 50;

    var res = {
      x:pos.x,
      y:pos.y,
      h:height,
      dh:0,
      w:width,
      angle:0,
      _init : function(width, height, animSys, initialIOState){
        this.t0 = initialIOState.time;
      }, 
      render: function( context, width, height){
        context.save();
        context.beginPath();
        context.lineWidth = 0;
        context.moveTo(this.x, this.y);
        var lineargradient = context.createLinearGradient(this.x,this.y,this.x,this.y+this.w);  
        lineargradient.addColorStop(0,'rgba(255,255,255,0.4)');  
        lineargradient.addColorStop(1,'rgba(200,200,255,0.1)');  
        context.fillStyle = lineargradient;
        context.shadowBlur = 30;
        context.shadowOffsetY = 5;
        context.shadowColor = "white";
        var d = (this.h-this.dh);2

        context.bezierCurveTo(
            this.x-d,
            this.y,
            this.x-d,
            this.y+this.w,
            this.x-(this.w/2), this.y+this.w);
        context.quadraticCurveTo(
            this.x,
            this.y+this.w-d/6,
            this.x+(this.w/2), this.y+this.w
            );

        context.bezierCurveTo(
            this.x+d,
            this.y+this.w,
            this.x+d,
            this.y,
            this.x, this.y);

        context.fill();
        context.restore();
      },
      animate: function(ioState, width, height){
        var d   = ioState.time - this.t0;
        this.dh = utilAmpl.f1(d, 16000, amplitude, animaSeed);
        this.y  = utilMvt.f1(d, 16000, pos.y, animaSeed);
        return true;//!(this.y<-this.w);
      }
    };
    return res;
  }

  var loop = window.loop = Loop.create(document.getElementById("scene"), function(context, width, height){
    context.save();
    var lineargradient = context.createLinearGradient(0,0,0,height);  
    lineargradient.addColorStop(0,'rgba(0,0,30,0.1)');  
    lineargradient.addColorStop(1,'rgba(0,0,70,0.2)');  
    context.fillStyle = lineargradient;
    context.fillRect(0,0,width,height);
    context.restore();
  });
  loop.addIO(io.time);
  loop.registerAnimation(createBlob({y:-50, x:100}, 10, 20, 20));

  for(var i = 0; i < 10; i++){
    var randX = Math.random()* window.loop.width;
    var randSizeFactor = Math.random()+1;
    loop.registerAnimation(createBlob({y: window.loop.height + 60 , x: randX}, 5*randSizeFactor, 20*randSizeFactor, 20*randSizeFactor));
  }

  setInterval(function(){
    for(var i = 0; i < 3; i++){
      var randX = Math.random()* window.loop.width;
      var randSizeFactor = Math.random()+1;
      loop.registerAnimation(createBlob({y: window.loop.height + 60 , x: randX}, 5*randSizeFactor, 20*randSizeFactor, 20*randSizeFactor));
    }
  }, 1000);

  loop.start();
})(
    window.Loop,
    window.Loop.io
  );
