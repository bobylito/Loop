(function(){
  var sunPF = Loop.animations.particleLasso(
    function(){return [];},
    function(now, width, height){
      var r = Math.random();
      return [  
        // x 
        width / 2,
        // y
        height / 2,
        // Date d'expiration
        now + 1500 + Math.random()*600,
        // Valeur de déplacement sur x
        Math.sin(r * Math.PI * 2) / 2,
        // Valeur de deplacement sur y
        Math.cos(r * Math.PI * 2 ) / 2,
        //Start time
        now 
      ];
    },
    function(p){
      return p;
    },
    {
      compositionMethod: "lighter", 
      color: "hsl(20, 90%, 10%)"
    });

 
  var starfieldPF = Loop.animations.particle(
    function(){return [];},
    function(now, width, height){
      var r = Math.random(),
          x = (width  + 1000) * Math.random() - 500,
          y = (height + 1000) * Math.random() - 500;

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
        now
      ];
    },
    function(p, allP, width, height){
      var xPrime = (p[0] - width/2),
          yPrime = (p[1] - height/2),
          d = Math.sqrt(Math.pow(xPrime,2) + Math.pow(yPrime,2));

      if(d<30){
        p[0] = width/2;
        p[1] = height/2;
        p[3] = p[4] = 0;

        return p;
      }

      p[3] -= 100/Math.pow(d, 2) * (xPrime>0?1:-1);
      p[4] -= 100/Math.pow(d, 2) * (yPrime>0?1:-1);

      return p;
    }, 
    {
      compositionMethod : "source-over",
      color:"hsl(0, 100%, 100%)",
      size: 3
    });

  var explosionPF = Loop.animations.particle(
    function(){return [];},
    function(now, width, height){
      var r = Math.random();
      return [  
        // x 
        width / 2,
        // y
        height/ 2,
        // Date d'expiration
        now + 2000 + Math.random()*3000,
        // Valeur de déplacement sur x
        Math.sin(r * Math.PI * 2) / 5,
        // Valeur de deplacement sur y
        Math.cos(r * Math.PI * 2 ) / 5,
        now
      ];
    },
    function(p, allP, width, height){
      p[3] = 1.05 * p[3];
      p[4] = 1.05 * p[4];
      return p;
    }, 
    {
      compositionMethod:"lighter", 
      color: "hsl(20, 70%, 30%)",
      size: 5
    });

  loop.registerAnimation(starfieldPF);
  loop.registerAnimation(sunPF);
  loop.registerAnimation(explosionPF);

  sunPF.create(100);

  setInterval(function(){
    sunPF.create(100);
  }, 50);
  setInterval(function(){
    starfieldPF.create(20);
  }, 200)
  setInterval(function(){
    explosionPF.create(300);
  }, 2000);

  loop.registerAnimation(Loop.animations.particle.bench());

  //Start the loop
  loop.start();
})();
