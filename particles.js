window.loop.animations.particle = 
  function createParticleField(createParticle, field, compositionMethod, color, size){
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
                  vd = field(p, particles),
                  elapsedtime = (now - p[5])/1000;

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

