window.Loop.animations.bench = 
(function(){
  return function(){
    var nbParticles = document.createElement("div");
    nbParticles.innerHTML = 0;
    document.body.appendChild(nbParticles);
    
    return {
      _init:function(w, h, animationSystem){
        var bench = this;
        animationSystem.on("start", function(){
          bench.pf = animationSystem._animations.filter(function(f){
            return !!f.getParticleCount;
          });
        });
      },
      animate:function(){ return true;},
      render:function(){
        nbParticles.innerHTML = this.pf.reduce(function(m, e){ return m + e.getParticleCount();}, 0);
      }
    };
  };
})()
