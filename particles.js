window.loop.animations.particle =
(function(){
  var fields = [],
      height = 0, 
      width = 0;

  var pGen = function createParticleField(init, createParticle, field, compositionMethod, color, size, eolCallback){
    if(size){
      // I know these variables won't be scope in the if (semantic purpose)
      var particleCanvas = document.createElement("canvas"),
          particleContext = particleCanvas.getContext('2d'),
          half = size / 2 ;
      
      particleCanvas.width = size;
      particleCanvas.height = size;

      particleContext.fillStyle = color;
      particleContext.beginPath();
      particleContext.arc(half, half, half, 0, 2 * Math.PI, true);
      particleContext.closePath();
      particleContext.fill();
    }else{
      // let's assume if we don't have a size, we'll have a canvas... (FIXME)
      particleCanvas = color;
    }

    if(typeof(eolCallback)!="function"){
      eolCallback = function(){};
    }

    var particles = [],
        res = {
          _init : function(n, w, h){
            particles = init(n, w,h);
          },
          render:function(context, width, height){
                   context.globalCompositeOperation = compositionMethod;
                   for(var i = 0; i < particles.length; i++){
                     var p = particles[i];
                     context.drawImage(particleCanvas, ~~p[0], ~~p[1]);
                   }
                 },
          animate:function(now, width, height){
                    for(var i = 0; i < particles.length; i++){
                      var p = particles[i],
                        vd = field(p, particles),
                           elapsedtime = (now - p[5])/1000;

                      p[0] = p[0] + p[3];
                      p[1] = p[1] + p[4];

                      if( p[0] > width+500 || 
                          p[1] > height+500 || 
                          p[0] < -500 || 
                          p[1] < -500 ||
                          p[2] < now ){
                        eolCallback(p)
                        particles.splice(i, 1);
                      }
                    }

                    return true;
                  }
        }

  res.create = function(nbParticules) {
    var now = (new Date()).getTime();
    for(var i = 0; i<nbParticules; i++){
      particles.push(createParticle(now, width, height));
    }
  };

  fields.push(res);
  return res;
}
pGen._init = function(w, h){
  height = h;
  width = w;
  fields.forEach(function(e){e._init(new Date(),w,h)})
}
return pGen;
})();

