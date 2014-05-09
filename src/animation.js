(function( loopModule ){
  function Animation(){}
  Animation.prototype = {
    /**
     * _init is called when the animation is first used (might not be at startup)
     *  - context (object) : contains the whole context given
     *    - inputState
     *    - outputState
     *    - resources (everything that has been loaded so far)
     *    - system (main loop) // Accessing that part is an indication of some
     *      API limitations
     */
    _init:function( context ){
      this.context.system.on("start", this.onStart);
      this.context.system.on("stop", this.onStop);
    },
    /**
     * Force the animation to clean its mess
     * Next animate will return death?
     */
    clean : function(){},
    // When animation is actually started
    onStart : function(){},
    // when animation is stopped (paused) but not killed
    onStop : function(){},
    /**
     * return animation life status : true is alive, false otherwise
     */
    animate : function(ioState){},
    render : function(outputs){},
    /**
     * return something for the next animation
     */
    result : function(){},
  };

  function Entity(id, types){
    this.id = id || window.performance.now().toString(); //Ugly
    this.types = types || [];
    this.state = {};
  }
  Entity.prototype = {
    /**
     * add a new type on a given entity
     *  - name : name of the type to added
     *  - properties : properties related to the type and their initial values
     *    >> {x : 0, y : 0}
     */
    addType : function(name, properties){
      if(!name) throw new Error("name not defined");
      if(!this.types[name]){
        throw new Error("Type already defined on entity : " + this.id);
      }
      this.types.push(name);
    },
  };

  function Scene(){
    this.entities = [];
  }

  function Image( imageId, entityId ){
    this.imgId = imageId;
    this.entityId = entityId;
  }
  Image.prototype = Object.create(Animation);
  Image.prototype._init = function( context ){
    Animation.prototype._init.apply(this, arguments);
    this.img = context.resources.img[this.imgId];
  };
  Image.prototype.clean = function(){
    this.img = null;
  };
  Image.prototype.render = function( outputContext ){
    outputContext.canvas2D.drawImage(this.img, 0, 0);
  };
})(
    window.Loop = window.Loop || {},
    window.Loop.animations = window.Loop.animations || {}
  );
