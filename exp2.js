(function(){

/*  
 *  Fire bottom
 */
/*
*/
/*
  loop.registerAnimation(loop.animations.particle(
        function(){
          return [  
            // x 
            datastore["CANVAS_WIDTH"]/3,
            // y
            datastore["CANVAS_HEIGHT"]/2,
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

  var sunPF = loop.animations.particle(
    function(now){
      var r = Math.random();
      return [  
        // x 
        datastore["CANVAS_WIDTH"] / 2,
        // y
        datastore["CANVAS_HEIGHT"] / 2,
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
 
  var starfieldPF = loop.animations.particle(
    function(now){
      var r = Math.random(),
          x = (datastore["CANVAS_WIDTH"] + 1000) * Math.random() - 500,
          y = (datastore["CANVAS_HEIGHT"] + 1000) * Math.random() - 500;

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
      var xPrime = (p[0] - datastore["CANVAS_WIDTH"]/2),
          yPrime = (p[1] - datastore["CANVAS_HEIGHT"]/2),
          d = Math.sqrt(Math.pow(xPrime,2) + Math.pow(yPrime,2));

      if(d<30){
        p[0] = datastore["CANVAS_WIDTH"]/2;
        p[1] = datastore["CANVAS_HEIGHT"]/2;
        p[3] = p[4] = 0;

        return p;
      }

      p[3] -= 1000/Math.pow(d, 2) * (xPrime>0?1:-1);
      p[4] -= 1000/Math.pow(d, 2) * (yPrime>0?1:-1);

      return p;
    }, 
    "source-over",
    "hsl(0, 100%, 100%)");


  
  var explosionPF = loop.animations.particle(
    function(now){
      var r = Math.random();
      return [  
        // x 
        datastore["CANVAS_WIDTH"] / 2,
        // y
        datastore["CANVAS_HEIGHT"] / 2,
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
  }, 5000);

  loop.registerAnimation(starfieldPF);
  loop.registerAnimation(sunPF);
  loop.registerAnimation(explosionPF);

  //Start the loop
  loop.start();
})();
