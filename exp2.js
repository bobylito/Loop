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
  var CANVAS_CTX="CANVAS_CTX"; //Contexte canvas
  var CANVAS_HEIGHT="CANVAS_HEIGHT";
  var CANVAS_WIDTH="CANVAS_WIDTH";

  //global storage of some interesting infos
  var datastore= (function init(d,w){
    var canvasDom = d.getElementById("scene");

    //FULLSCREEN
    canvasDom.height=w.innerHeight;
    canvasDom.width=w.innerWidth;
    canvasDom.style.cssText="position:absolute;top:0;left:0";

    return {
      CANVAS: canvasDom,
      CANVAS_CTX : canvasDom.getContext("2d"),
      CANVAS_HEIGHT : canvasDom.height,
      CANVAS_WIDTH : canvasDom.width
    }
  })(document, window);

  function createParticleField(createParticle, field, compositionMethod){
    var particles = [],
        context = datastore[CANVAS_CTX],
        width = datastore[CANVAS_WIDTH],
        height = datastore[CANVAS_HEIGHT],
        res = {
          render:function(){
            context.globalCompositeOperation = compositionMethod;
            for(var i = 0; i < particles.length; i++){
              var p = particles[i];
              context.fillStyle = "hsl("+p[5]+", 90%, 10%)";
              context.fillRect(p[0], p[1], p[6], p[6]);
            }
          },
          animate:function(now){
            for(var i = 0; i < particles.length; i++){
              var p = particles[i],
                  vd = field(p),
                  elapsedtime = (now - p[7])/1000;

              p[0] = p[0] + p[3] * elapsedtime;
              p[1] = p[1] + p[4] * elapsedtime;

              if( p[0] > width+100 || 
                  p[1] > height+100 || 
                  p[0] < -100 || 
                  p[1] < -100 ||
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
        context = datastore[CANVAS_CTX],
        lastUpdate = undefined,
        status = undefined, 
        fadeOutScreen = function(){
          context.globalCompositeOperation = "source-over";
          context.fillStyle = "rgba(0,0,0,0.2)";
          context.fillRect(0,0,datastore[CANVAS_WIDTH],datastore[CANVAS_HEIGHT]);
        },
        loop = function(time){
          fadeOutScreen();
          for(var i = animations.length-1; i>=0; i--){
            animations[i].render();
          }
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
        context.save();
        context.fillStyle = "#000";
        context.fillRect(0,0,datastore[CANVAS_WIDTH],datastore[CANVAS_HEIGHT]);
        context.restore();

        
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
        3,
        //Start time
        now 
      ];
    },
    function(p){
      return p;
    },
    "lighter")

  sunPF.create(500);

  setInterval(function(){
    sunPF.create(100);
  }, 50);
  
  loop.registerAnimation(sunPF);
 
  var starfieldPF = createParticleField(
    function(now){
      var r = Math.random();
      return [  
        // x 
        datastore[CANVAS_WIDTH] * Math.random(),
        // y
        datastore[CANVAS_HEIGHT],
        // Date d'expiration
        now + 10000,
        // Valeur de déplacement sur x
        0,
        // Valeur de deplacement sur y
        (r * -6 + 3) ,
        //Color tint
        20,
        //Particle size
        (1 - r) * 6+1,
        now
      ];
    },
    function(p){
      return p;
    }, 
    "source-over")

  setInterval(function(){
    starfieldPF.create(2);
  }, 1);

  loop.registerAnimation(starfieldPF);
  
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
      return p;
    }, 
    "lighter")

  setInterval(function(){
    explosionPF.create(500);
  }, 5000);

  loop.registerAnimation(explosionPF);

  //Start the loop
  loop.start();
})();
