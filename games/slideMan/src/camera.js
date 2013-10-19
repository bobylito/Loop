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
            p : positionnable.position,
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

  /**
   * Bound camera 
   * Tracks an object but doesn't move out a perimeter
   * Adds more parameter to the render function of a given animation
   */
  camera.bound = function simpleCamera( animation ){
    var trackedPosition = vec2.fromValues(0,0);
    var tileSize = vec2.fromValues(0,0);
    var mapSize  = [0,0];

    var oldInit   = animation._init.bind(animation);
    animation._init   = function initWithCamera(w, h, sys, ioState, resources){
      oldInit(w, h, sys, ioState, resources, function setTrackedPosition( positionnable, zoom ){
          var z = zoom || 1;
          trackedPosition = {
            p : positionnable.position,
            z : z
          }
        }, function mapConfig(mapData){
          tileSize = vec2.fromValues( mapData.tileheight, mapData.tilewidth );
          mapSize  = vec2.fromValues( mapData.height, mapData.width);
        });
      var oldRender = animation.render.bind(animation);
      animation.render  = function renderWithCamera(ctx, w, h){
        var args    = Array.prototype.splice.call(arguments, 0);
        var zoom    = trackedPosition.z;
        var screenSize = vec2.divide( vec2.create(), 
          [w, h], 
          vec2.scale( vec2.create(), tileSize, zoom)
        );
        var b = box.getBoundingBoxCenter(trackedPosition.p, screenSize);
        var correctedBox = (function bindBox(b){
          if( b[box.LEFT] < 0){
            var deltaH = 0 - b[box.LEFT];
            b[box.LEFT] = 0;
            b[box.RIGHT] += deltaH;
          }
          else if(b[box.RIGHT] > mapSize[1]){
            var deltaH = mapSize[1] - b[box.RIGHT];
            b[box.RIGHT] = mapSize[1];
            b[box.LEFT] += deltaH;
          }

          if( b[box.TOP] < 0){
            var deltaH = 0 - b[box.TOP];
            b[box.TOP] = 0;
            b[box.BOTTOM] += deltaH;
          }
          else if(b[box.BOTTOM] > mapSize[0]){
            var deltaH = mapSize[0] - b[box.BOTTOM];
            b[box.BOTTOM] = mapSize[0];
            b[box.TOP] += deltaH;
          }

          return b;
        })(b);
        var camera  = {
          box     : correctedBox,
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
