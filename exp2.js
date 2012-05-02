(function(){
  //Handling many implementations
  window.requestAnimFrame = (function(){
    return window.requestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.msRequestAnimationFrame;
  })();

  //keys to the global array
  var CANVAS="CANVAS";
  var CANVAS_SHADOW="CANVAS_SHADOW";
  var CANVAS_CTX="CANVAS_CTX"; //Contexte canvas
  var CANVAS_SHADOW_CTX="CANVAS_SHADOW_CTX"; //Contexte canvas
  var CANVAS_HEIGHT="CANVAS_HEIGHT";
  var CANVAS_WIDTH="CANVAS_WIDTH";

  //global storage of some interesting infos
  var datastore= (function init(d,w){
    var canvasDom = d.getElementById("scene"),
        canvasOff = d.createElement("canvas");

    //FULLSCREEN
    canvasDom.height=w.innerHeight;
    canvasDom.width=w.innerWidth;

    canvasOff.height=w.innerHeight;
    canvasOff.width=w.innerWidth;
    
    canvasDom.style.cssText="position:absolute;top:0;left:0";

    return {
      CANVAS: canvasDom,
      CANVAS_CTX : canvasDom.getContext("2d"),
      CANVAS_SHADOW: canvasOff,
      CANVAS_SHADOW_CTX : canvasOff.getContext("2d"),
      CANVAS_HEIGHT : canvasDom.height,
      CANVAS_WIDTH : canvasDom.width
    }
  })(document, window);

  function createParticleField(createParticle, field, compositionMethod, color){
    var particles = [],
        context = datastore[CANVAS_SHADOW_CTX],
        width = datastore[CANVAS_WIDTH],
        height = datastore[CANVAS_HEIGHT],
        res = {
          render:function(){
            context.globalCompositeOperation = compositionMethod;
            context.fillStyle = color;
            for(var i = 0; i < particles.length; i++){
              var p = particles[i];
              context.fillRect(~~p[0], ~~p[1], ~~p[6], ~~p[6]);
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


  //MAIN LOOP
  function createMainLoop(){
    var animations=[],
        context = datastore[CANVAS_SHADOW_CTX],
        canvasOff = datastore[CANVAS_SHADOW],
        contextOn = datastore[CANVAS_CTX],
        lastUpdate = undefined,
        status = undefined, 
        fadeOutScreen = function(){
          context.globalCompositeOperation = "source-over";
          context.fillStyle = "rgb(0,0,0)";
          context.fillRect(0,0,datastore[CANVAS_WIDTH],datastore[CANVAS_HEIGHT]);
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
      start: function(){
        context.fillStyle = "#000";
        context.fillRect(0,0,datastore[CANVAS_WIDTH],datastore[CANVAS_HEIGHT]);
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
  }


  var loop = createMainLoop();
/*  
 *  Fire bottom
 */
/*
  var fireFP = createParticleField(
      function(now){
        return [  
          // x 
          Math.random() * datastore[CANVAS_WIDTH],
          // y
          datastore[CANVAS_HEIGHT] ,
          // Date d'expiration
          (new Date()).getTime() + 300 + Math.random() * 1000,
          // Valeur de déplacement sur x
          0,
          // Valeur de deplacement sur y
          1,
          30,
          2,
          now
        ];
      },
      function(p){
        var rx = 0.5 - (Math.random()),
            ry = - (Math.random());

        p[3] = p[3] + rx;
        p[4] = p[4] + ry;

        return p;
      });

  fireFP.create(2000);

  setInterval(function(){
    fireFP.create(400);
  }, 10)

  loop.registerAnimation(fireFP);
*/

/**
 *
 * FOUNTAIN
 *
  loop.registerAnimation(createParticleField(
        function(){
          return [  
            // x 
            datastore[CANVAS_WIDTH]/2,
            // y
            datastore[CANVAS_HEIGHT]/2,
            // Date d'expiration
            (new Date()).getTime() + 2000,
            // Valeur de déplacement sur x
            5 - Math.random()*10,
            // Valeur de deplacement sur y
            5 - Math.random()*10,
            //Color tint
            200,
            2 
          ];
        },
        function(p){
          var rx = 0.5 - (Math.random()),
              ry = 1 - (Math.random());

          p[3] = p[3] + rx;
          p[4] = p[4] + ry;

          return p;
        })
      );
*/

/*
  loop.registerAnimation(createParticleField(
        function(){
          return [  
            // x 
            datastore[CANVAS_WIDTH]/3,
            // y
            datastore[CANVAS_HEIGHT]/2,
            // Date d'expiration
            (new Date()).getTime() + 200 + Math.random()*2000,
            // Valeur de déplacement sur x
            0.25 - Math.random()/2,
            // Valeur de deplacement sur y
            0.25 - Math.random()/2,
            //Color tint
            30,
            //Particle size
            5 
          ];
        },
        function(p){
          var rx = 0.25 - (Math.random())/2,
              ry = 0.15 - (Math.random())*0.4;

          p[3] = p[3] + rx;
          p[4] = p[4] + ry;


          return p;
        })
      );
 */

  var sunPF = createParticleField(
    function(now){
      var r = Math.random();
      return [  
        // x 
        datastore[CANVAS_WIDTH] / 2,
        // y
        datastore[CANVAS_HEIGHT] / 2,
        // Date d'expiration
        now + 1500 + Math.random()*600,
        // Valeur de déplacement sur x
        Math.sin(r * Math.PI * 2) / 2,
        // Valeur de deplacement sur y
        Math.cos(r * Math.PI * 2 ) / 2,
        //Color tint
        20,
        //Particle size
        4,
        //Start time
        now 
      ];
    },
    function(p){
      return p;
    },
    "lighter", 
    "hsl(20, 90%, 10%)")

  sunPF.create(500);

  setInterval(function(){
    sunPF.create(100);
  }, 50);
 
  var pow = 1; 
 
  var starfieldPF = createParticleField(
    function(now){
      var r = Math.random(),
          x = (datastore[CANVAS_WIDTH] + 1000) * Math.random() - 500,
          y = (datastore[CANVAS_HEIGHT] + 1000) * Math.random() - 500;

      return [  
        // x 
        x,
        // y
        y,
        // Date d'expiration
        now + 20000,
        // Valeur de déplacement sur x
        0,
        // Valeur de deplacement sur y
        0,
        //Color tint
        20,
        //Particle size
        (1 - r) * 2+1,
        now
      ];
    },
    function(p){
      var xPrime = (p[0] - datastore[CANVAS_WIDTH]/2),
          yPrime = (p[1] - datastore[CANVAS_HEIGHT]/2),
          d = Math.sqrt(Math.pow(xPrime,2) + Math.pow(yPrime,2));

      p[3] -= 1000/Math.pow(d, 2) * (xPrime>0?1:-1) * pow;
      p[4] -= 1000/Math.pow(d, 2) * (yPrime>0?1:-1) * pow;

      return p;
    }, 
    "source-over",
    "hsl(0, 100%, 100%)");


  
  var explosionPF = createParticleField(
    function(now){
      var r = Math.random();
      return [  
        // x 
        datastore[CANVAS_WIDTH] / 2,
        // y
        datastore[CANVAS_HEIGHT] / 2,
        // Date d'expiration
        now + 2000 + Math.random()*3000,
        // Valeur de déplacement sur x
        Math.sin(r * Math.PI * 2) / 2,
        // Valeur de deplacement sur y
        Math.cos(r * Math.PI * 2 ) / 2,
        //Color tint
        20,
        //Particle size
        1,
        now
      ];
    },
    function(p){
      p[3] = 1.03 * p[3];
      p[4] = 1.03 * p[4];
      return p;
    }, 
    "lighter", 
    "hsl(20, 90%, 10%)")

  setInterval(function(){
    starfieldPF.create(10);
  }, 200)
  setInterval(function(){
    explosionPF.create(500);
    pow = -20;
    setInterval(function(){pow = 2 }, 300);
  }, 5000);

  loop.registerAnimation(starfieldPF);
  loop.registerAnimation(sunPF);
  loop.registerAnimation(explosionPF);

  //Start the loop
  loop.start();
})();
