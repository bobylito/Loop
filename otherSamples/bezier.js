//Exp2 : come get some bezier

(function(){

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
       animaSeed = Math.random()*Math.PI*2,
       t0 = (new Date()).getTime();

   if(pos===undefined || pos["x"]===undefined || pos["y"]===undefined){
     var pos = {x:50, y:50};
   }
   if(amplitude===undefined){
     var amplitude = 20;
   }
   if(height===undefined){
     var height = 30;
   }
   if(width===undefined){
     var width = 50;
   }
   var res = {
  x:pos.x,
  y:pos.y,
  h:height,
  dh:0,
  w:width,
  angle:0,
  render: function( context, width, height){
    context.save();
    context.beginPath();
    context.lineWidth = 0;
    context.moveTo(this.x, this.y);
    var lineargradient = context.createLinearGradient(this.x,this.y,this.x,this.y+this.w);  
    lineargradient.addColorStop(0,'rgba(255,255,255,0.6)');  
    lineargradient.addColorStop(1,'rgba(200,200,255,0.2)');  
    context.fillStyle = lineargradient;
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
           var d = ioState.time - t0;
           this.dh = utilAmpl.f1(d, 8000, amplitude, animaSeed);
           this.y = utilMvt.f1(d, 8000, pos.y, animaSeed);
           return !(this.y<-this.w);
         }
   };
 
   return res;
 }

 /*
 //WIP : Not yet interesting

 function createSeaWeed(pos){
 var context = datastore[CANVAS_CTX];

 var res = {
x:pos.x,
y:pos.y,
dx:0,
dy:0,
render: function(){
context.save();
context.beginPath();
context.lineWidth = 0;
context.moveTo(datastore[CANVAS_WIDTH], datastore[CANVAS_HEIGHT]);

context.fillStyle = "#FFF";

context.lineTo(datastore[CANVAS_WIDTH],datastore[CANVAS_HEIGHT]-10);

context.bezierCurveTo(
this.x+this.dx,
this.y+this.dy,
datastore[CANVAS_WIDTH],
datastore[CANVAS_HEIGHT]-10,
this.x, this.y);
context.bezierCurveTo(
datastore[CANVAS_WIDTH]-10,
datastore[CANVAS_HEIGHT],
this.x+this.dx,
this.y+this.dy,
datastore[CANVAS_WIDTH]-10, datastore[CANVAS_HEIGHT]);

context.lineTo(datastore[CANVAS_WIDTH],datastore[CANVAS_HEIGHT]);

context.fill();
context.restore();
},
animate: function(){
//this.dx=Math.cos(this.dx + 1)*10;
//this.dy=Math.sin(this.dy + 1)*10;
return true;
}
};
return res;
}
*/



var loop = window.loop = new Loop(document.getElementById("scene"), function(context, width, height){
        context.save();
        var lineargradient = context.createLinearGradient(0,0,0,height);  
        lineargradient.addColorStop(0,'rgba(0,0,30,0.1)');  
        lineargradient.addColorStop(1,'rgba(0,0,70,0.2)');  
        context.fillStyle = lineargradient;
        context.fillRect(0,0,width,height);
        context.restore();
    });
//instanciate animations2
loop.addIO(Loop.io.time);
loop.registerAnimation(createBlob({y:-50, x:100}, 10, 20, 20));

//loop.registerAnimation(createSeaWeed({x:datastore[CANVAS_WIDTH]-50, y:datastore[CANVAS_HEIGHT]-50}));

var meduseGen = setInterval(function(){
    var randX = Math.random()* window.loop.width;
    var randSizeFactor = Math.random()+1;
    loop.registerAnimation(createBlob({y: window.loop.height + 60, x: randX}, 5*randSizeFactor, 20*randSizeFactor, 20*randSizeFactor));
}, 50);

//Start the loop
loop.start();

setTimeout(function(){
    window.clearInterval(meduseGen);
    //loop.stop();
    }, 15000);
})();
