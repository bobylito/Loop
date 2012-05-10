window.loop.animations.particle = 
  function createParticleField(createParticle, field, compositionMethod, color, size){
    var particleCanvas = document.createElement("canvas"),
        particleContext = particleCanvas.getContext('2d'),
        size = size || 3,
        half = size / 2 ;
    
    particleCanvas.width = size || 3;
    particleCanvas.height = size || 3;

    particleContext.fillStyle = color;
    particleContext.beginPath();
      particleContext.arc(half, half, half, 0, 2 * Math.PI, true);
    particleContext.closePath();
    particleContext.fill();

    var particles = [],
        context = datastore["CANVAS_SHADOW_CTX"],
        width = datastore["CANVAS_WIDTH"],
        height = datastore["CANVAS_HEIGHT"],
        res = {
          render:function(){
            context.globalCompositeOperation = compositionMethod;
            for(var i = 0; i < particles.length; i++){
              var p = particles[i];
              context.drawImage(particleCanvas, ~~p[0], ~~p[1]);
            }
          },
          animate:function(now){
            for(var i = 0; i < particles.length; i++){
              var p = particles[i],
                  vd = field(p),
                  elapsedtime = (now - p[7])/1000;

              p[0] = p[0] + p[3] * elapsedtime;
              p[1] = p[1] + p[4] * elapsedtime;

              if( p[0] > width+500 || 
                  p[1] > height+500 || 
                  p[0] < -500 || 
                  p[1] < -500 ||
                  p[2] < now ){
                particles.splice(i, 1);
              }
            }
            
            return true;
          }
        }

    res.create = function(nbParticules) {
      var now = (new Date()).getTime();
      for(var i = 0; i<nbParticules; i++){
        particles.push(createParticle(now));
      }
    };

    return res;
  }

