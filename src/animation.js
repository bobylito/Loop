(function( loopModule ){
  function Animation(){}
  Animation.prototype = {
    /**
     * _init is called when the animation is first used (might not be at startup)
     *  - context (object) : contains the whole context given 
     *    - inputState
     *    - outputState
     *    - resources (everything that has been loaded so far)
     *    - system (main loop)
     */
    _init:function( context ){},
    /**
     * Force the animation to clean its mess
     * Next animate will return death?
     */
    clean : function(){}
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

  function Image( imageId ){
    this.imgId = imageId;
  }
  Image.prototype = Object.create(Animation);
  Image.prototype._init = function( context ){
    this.img = context.img[this.imgId];
  };
  Image.prototype.clean = function(){
    this.img = null;
  }
  Image.prototype.render = function( outputContext ){
    outputContext.canvas2D.drawImage(this.img, 0, 0);
  }

})(
    window.Loop = window.Loop || {},
    window.Loop.animations = window.Loop.animations || {}
  );
