(function(m, box, camera){

  function Camera( cameraBox, zoom){
    this.box  = cameraBox;
    this.zoom = zoom;
    this.deltaI = cameraBox[box.LEFT] - Math.floor(cameraBox[box.LEFT]);
    this.deltaJ = cameraBox[box.TOP]  - Math.floor(cameraBox[box.TOP]);
  }

  Camera.prototype.forEach = function( f, self ){
    var args    = Array.prototype.splice.call(arguments, 0);
    if(args.length > 2){
      var otherArgs = args.slice(2);
    }
    var iMax = Math.ceil(this.box[box.RIGHT]);
    var jMax = Math.ceil(this.box[box.BOTTOM]);
    for( var i = Math.floor(this.box[box.LEFT]) , x = 0; 
         i < iMax; 
         i++, x++){
      for( var j = Math.floor(this.box[box.TOP]), y = 0; 
           j < jMax; 
           j++, y++){
        if(otherArgs){
          f.apply(self || window, 
                  [x, y, i, j, this.deltaI, this.deltaJ, this].concat(otherArgs) );
        }
        else {
          f.call(self || window, x, y, i, j, this.deltaI, this.deltaJ, this);
        }
      }
    }
  };

  /**
   * Simple camera 
   * Tracks an object
   * Adds more parameter to the render function of a given animation
   */
  camera.simple = function simpleCamera( animation ){
    var trackedPosition = vec2.fromValues(0,0);
    var tileSize = vec2.fromValues(0,0);

    var oldInit   = animation._init.bind(animation);
    animation._init   = function initWithCamera(outputManagers, sys, ioState, resources){
      oldInit(outputManagers, sys, ioState, resources, function setTrackedPosition( positionnable, zoom ){
          var z = zoom || 1;
          trackedPosition = {
            p : positionnable.position,
            z : z
          }
        }, function mapConfig(mapData){
          tileSize = vec2.fromValues( mapData.tileheight, mapData.tilewidth );
        });
      var oldRender = animation.render.bind(animation);
      animation.render  = function renderWithCamera(outputManagers){
        var params  = outputManagers.canvas2d.parameters;
        var args    = Array.prototype.splice.call(arguments, 0);
        var zoom    = trackedPosition.z;
        var screenSize = vec2.divide( vec2.create(), 
          [params.width, params.height], 
          vec2.scale( vec2.create(), tileSize, zoom)
        );
        var camera  = new Camera(
          box.getBoundingBoxCenter(trackedPosition.p, screenSize),
          zoom
        );
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
    animation._init   = function initWithCamera(outputManagers, sys, ioState, resources){
      oldInit(outputManagers, sys, ioState, resources, function setTrackedPosition( positionnable, zoom ){
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
      animation.render  = function renderWithCamera(outputManagers){
        var params  = outputManagers.canvas2d.parameters;
        var args    = Array.prototype.splice.call(arguments, 0);
        var zoom    = trackedPosition.z;
        var screenSize = vec2.divide( vec2.create(), 
          [params.width, params.height], 
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
        var camera  = new Camera(
          correctedBox,
          zoom
        );
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
