(function(){
  /**
   * Renderings are pluggable rendering for particles systems
   * Parameters : 
   *  - renderingOptions options specific to the rendering passed when the system is created
   *  - context canvas 2D context
   *  - width width of the canvas
   *  - height height of the canvas
   */
  var rendering = {
    /**
     * circle : rendering of particles as discs
     * Rendering options : 
     *  - color : color of the disc
     *  - size : diameter of the disc
     *  - compositionMethod : composition to use when drawing the disc
     */
    circle : function(renderingOptions, context, width, height){
      var half = renderingOptions.size / 2 ;
      if(!this.particleCanvas){
        this.particleCanvas = (function initCacheCanvas(){
          var particleCanvas = document.createElement("canvas"),
              particleContext = particleCanvas.getContext('2d');
          
          particleCanvas.width = renderingOptions.size;
          particleCanvas.height = renderingOptions.size;

          particleContext.fillStyle = renderingOptions.color;
          particleContext.beginPath();
          particleContext.arc(half, half, half, 0, 2 * Math.PI, true);
          particleContext.closePath();
          particleContext.fill();
          return particleCanvas;
        })();
      }
      context.globalCompositeOperation = renderingOptions.compositionMethod;
      for(var i = 0; i < this.particles.length; i++){
        var p = this.particles[i];
        context.drawImage(this.particleCanvas, ~~(p[0]-half), ~~(p[1]-half));
      }
    },
    /**
     * texture: rendering of particles as images
     *  - img : image dom element
     */
    texture: function(renderingOptions, context, width, height){
      for(var i = 0; i < this.particles.length; i++){
        var p = this.particles[i];
        context.drawImage(renderingOptions.img, ~~p[0], ~~p[1]);
      }
    },
    /**
     * line : rendering of the particles as lines drawn between particles
     * Rendering options : 
     *  - compositionMethod
     *  - color
     */
    line : function(renderingOptions, context, width, height){
      if(this.particles.length === 0) return ;
      context.globalCompositeOperation = renderingOptions.compositionMethod;
      context.beginPath();
      context.strokeStyle=renderingOptions.color;
      context.moveTo(~~(this.particles[0][0]), ~~(this.particles[0][1]));
      for(var i = 1; i < this.particles.length; i++){
        var p = this.particles[i];
        context.lineTo(~~p[0], ~~p[1]);
      }
      context.stroke();
    },
    /**
     * quadratic : rendering of the particles as curve drawn between particles
     * Rendering options : 
     *  - compositionMethod
     *  - color
     */
    quadratic : function(renderingOptions, context, width, height){
      if( this.particles.length === 0 ) return ;
      context.globalCompositeOperation = renderingOptions.compositionMethod;
      context.beginPath();
      context.strokeStyle = renderingOptions.color;
      context.moveTo(~~(this.particles[0][0]), ~~(this.particles[0][1]));
      for(var i = 1; i < this.particles.length; i++){
        var p = this.particles[i];
        context.quadraticCurveTo(p[0]- p[3] * 100, p[1] -p[4] * 100,~~p[0], ~~p[1]);
      }
      context.stroke();
    },
    imageData : function(renderingOptions, context, width, height){
      var imgData = context.getImageData(0, 0,width,height),
          data    = imgData.data;
      for(var i = 1; i < this.particles.length; i++){
        var p = this.particles[i],
            x = ~~p[0],
            y = ~~p[1],
            t = (x + y * width) * 4;
        //context.quadraticCurveTo(p[0]- p[3] * 100, p[1] -p[4] * 100,~~p[0], ~~p[1]);
        data[t] = 250;
        data[t+1] = 250;
        data[t+2] = 2;
        data[t+3] = 255;
      }
      context.putImageData(imgData, 0,0);
    },
  };


  /**
   * Object defining a type of particle system
   */
  function ParticleField( render ){
    this.render = render;
  }

  ParticleField.prototype = {
    /**
     *  Create field : create a field of particle
     *  initf : function executed at the initialization of the particle system
     *  createf: function that initialize a single particle
     *  fieldf: function that simulates the physic of the system
     *  renderingOptions : options given to the rendering engine
     *  endOfLifef : function executed when a particle is removed by the system
     */
    createField : function(
                      initf,
                      createParticlef,
                      fieldf,
                      renderingOptions,
                      endOfLifef 
                    ){
      var eolf    = endOfLifef || function(){},
          system  = {
            _init: function(w, h){
              this.width = w;
              this.height = h;
              this.particles = initf ? initf(w, h):[];
              this.toBeCreated = [];
            },
            animate:function(ioState, width, height){
              this.toBeCreated.forEach(function( n ){
                this._create(ioState, n);
              }, this);
              this.toBeCreated = [];
              for(var i = 0; i < this.particles.length; i++){
                var p   = this.particles[i],
                    now = ioState.time,
                    vd  = fieldf(p, this.particles, width, height, ioState);

                p[0] = p[0] + p[3];
                p[1] = p[1] + p[4];

                if( p[0] > width+500 || 
                    p[1] > height+500 || 
                    p[0] < -500 || 
                    p[1] < -500 ||
                    p[2] < now ){
                  eolf(p);
                  this.particles.splice(i, 1);
                }
              }

              return true;
            },
            create : function(nbParticles){
              this.toBeCreated.push(nbParticles);
            },
            _create : function(ioState, nbParticles) {
              var now = Date.now();
              for(var i = 0; i<nbParticles; i++){
                this.particles.push(this._createParticlef(ioState, this.width, this.height));
              }
            },
            getParticleCount:function(){
              return this.particles.length;
            }
          };
      system.render = this.render.bind(system, renderingOptions);
      system._createParticlef = createParticlef;
      return system;
    }
  };
  
  var circleParticleGenerator     = new ParticleField(rendering.circle);
  var lineParticleGenerator       = new ParticleField(rendering.line);
  var quadraticParticleGenerator  = new ParticleField(rendering.quadratic);
  var textureParticleGenerator    = new ParticleField(rendering.texture);
  var imageDataParticleGenerator  = new ParticleField(rendering.imageData);

  window.Loop.animations.particle         = circleParticleGenerator.createField.bind(circleParticleGenerator);
  window.Loop.animations.particleLasso    = lineParticleGenerator.createField.bind(lineParticleGenerator);
  window.Loop.animations.particleLasso2   = quadraticParticleGenerator.createField.bind(quadraticParticleGenerator);
  window.Loop.animations.particleTexture  = textureParticleGenerator.createField.bind(textureParticleGenerator);
  window.Loop.animations.particleImageData= imageDataParticleGenerator.createField.bind(imageDataParticleGenerator);
})( 
    window
  );

