(function(m, box, camera){

  /**
   * Simple camera 
   * Tracks an object
   * Adds more parameter to the render function of a given animation
   */
  camera.simple = function simpleCamera( animation ){
    var trackedPosition = vec2.fromValues(0,0);
    var tileSize = vec2.fromValues(0,0);

    var oldInit   = animation._init.bind(animation);
    animation._init   = function initWithCamera(w, h, sys, ioState, resources){
      oldInit(w, h, sys, ioState, resources, function setTrackedPosition( positionnable, zoom ){
          var z = zoom || 1;
          trackedPosition = {
            p : vec2.fromValues(positionnable.position.x, positionnable.position.y),
            z : z
          }
        }, function mapConfig(mapData){
          tileSize = vec2.fromValues( mapData.tileheight, mapData.tilewidth );
        });
      var oldRender = animation.render.bind(animation);
      animation.render  = function renderWithCamera(ctx, w, h){
        var args    = Array.prototype.splice.call(arguments, 0);
        var zoom    = trackedPosition.z;
        var screenSize = vec2.divide( vec2.create(), 
          [w, h], 
          vec2.scale( vec2.create(), tileSize, zoom)
        );
        var camera  = {
          box     : box.getBoundingBoxCenter(trackedPosition.p, screenSize),
          zoom    : zoom
        };
        loop.debug( "camera.top", camera.box[box.TOP].toFixed(4) );
        loop.debug( "camera.right", camera.box[box.RIGHT].toFixed(4) );
        loop.debug( "camera.bottom", camera.box[box.BOTTOM].toFixed(4) );
        loop.debug( "camera.left", camera.box[box.LEFT].toFixed(4) );
        args.push( camera );
        return oldRender.apply( animation, args );
      };
    };
    return animation;
  };

})(
    window.micromando         = window.micromando || {},
    window.micromando.box     = window.micromando.box || {},
    window.micromando.camera  = window.micromando.camera || {} 
  )
