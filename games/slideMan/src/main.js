(function( micromando, models ){
  var loading = Loop.text.loading({
    img : ["ouno.png", "textureMap.png"],
    data : ["map.json"]
  });

  var m = foreground();
  var b = background();
  var c = character();
  var i = items();
  var game = gameScreen( b, m, c, i ); 
  var end  = finishScreen();

  loop.addIO( Loop.io.time );
  loop.addIO( Loop.io.keyboard( {"UP":38,"DOWN":40,"LEFT":37,"RIGHT":39,"SPACE":32} ) );
  loop.registerAnimation( Loop.tools.debug() );
  loop.registerAnimation( Loop.tools.debugGraph() );
  loop.registerAnimation( Loop.meta.while1(Loop.meta.andThen.bind(window, loading, game, end) ) );

  loop.start();

  function finishScreen(){
    return {
      _init   : function(w, h, sys, ioState){
      },
      animate : function(ioState){ return !ioState.keys["SPACE"] ;},
      render: function(ctx, w, h){
          ctx.fillStyle="white";

          var m1 = ctx.measureText("GAME OVER");
          ctx.fillText("GAME OVER", w/2-m1.width/2, h * 0.33);

          var m2 = ctx.measureText("press >space< to restart");
          ctx.fillText("press >space< to restart", w/2-m2.width/2, h * 0.66);
      }
    };
  }

  function gameScreen(backgroundAnim,mapAnim, characterAnim, itemsAnim){
    var gameScreenAnim  = simpleCamera({
      _init   : function(w, h, sys, ioState, resources, trackPositionƒ, mapConfigƒ){
        var allAnimations = this.allAnimations = Loop.meta.some.call(window, backgroundAnim, mapAnim, characterAnim, itemsAnim);
        this.render = allAnimations.render.bind(allAnimations);
        this.track = trackPositionƒ;

        this.player = micromando.models.Player.create(resources["map.json"]);
        this.lastT  = ioState.time;

        mapConfigƒ( resources["map.json"] );
        this.track( this.player );

        allAnimations._init.call(allAnimations, w, h, sys, ioState, resources, this.player, mapAnim);
      },
      animate : function(ioState, width, height){ 
        var deltaT = (ioState.time - this.lastT) / 1000;
        if( ioState.keys.LEFT ) this.player.motion.x = Math.max( this.player.motion.x - 0.3, -10);
        if( ioState.keys.RIGHT) this.player.motion.x = Math.min( this.player.motion.x + 0.3,  10);
        if(!ioState.keys.LEFT && !ioState.keys.RIGHT) {
          var newXMotion = this.player.motion.x / 2;
          this.player.motion.x = Math.max(Math.abs(newXMotion) < 0.001 ? 0 : newXMotion, 0);
        }

        if( ioState.keys.SPACE && this.player.colliding[2] ) this.player.motion.y = -10;
        if( ioState.keys.SPACE && this.player.colliding[1] ) {
          this.player.motion.y = -8;
          this.player.motion.x = -5;
        }
        if( ioState.keys.SPACE && this.player.colliding[3] ) {
          this.player.motion.y = -8;
          this.player.motion.x = 5;
        }
        if( ioState.keys.RIGHT && this.player.colliding[1] ) {
          var tmp = this.player.motion.y - 0.2
          this.player.motion.y -= Math.max(tmp, 0);
        }
        if( ioState.keys.LEFT && this.player.colliding[3] ) {
          var tmp = this.player.motion.y - 0.2
          this.player.motion.y -= Math.max(tmp, 0);
        }
  
        if( !(ioState.keys.UP && this.player.colliding[0]) ){
          this.player.motion.y = this.player.motion.y + 0.3;
        }
        /*if( ioState.keys.UP )   this.player.motion.y -= 0.3;
        if( ioState.keys.DOWN ) this.player.motion.y += 0.3;
        if(!ioState.keys.UP && !ioState.keys.DOWN) {
          var newYMotion = this.player.motion.y / 2;
          this.player.motion.y = Math.max(Math.abs(newYMotion) < 0.001 ? 0 : newYMotion, 0);
        }*/

        this.lastT  = ioState.time;
        this.logPlayer(this.player);
        var resAnim = this.allAnimations.animate.apply(this.allAnimations, arguments);
        //Gravity

        this.track( this.player, 1 - Math.abs( this.player.motion.x / 70) );

        return resAnim ;
      },
      logPlayer : function( p ){
        loop.debug( "position.x", p.position.x.toFixed(4) );
        loop.debug( "position.y", p.position.y.toFixed(4) );
        loop.debug( "motion.x"  , p.motion.x.toFixed(4) );
        loop.debug( "motion.y"  , p.motion.y.toFixed(4) );
      }
    });
      
    return gameScreenAnim;
  }

  function character(){
    return {
      _init : function(w, h, sys, ioState, resources, character, map){
        this.sprite = resources["ouno.png"];
        this.model  = character;
        this.lastT  = ioState.time;
        this.map    = map;
      },
      render  : function(ctx, w, h, camera){
        ctx.drawImage(this.sprite, 0,0, 20, 20,w/2 , h/2, 20 * camera.zoom , 20 * camera.zoom);
      },
      animate : function(ioState, w, h){
        var deltaT = (ioState.time - this.lastT) / 1000;
        var computedPosition = {
          x : this.model.position.x + this.model.motion.x * deltaT,
          y : this.model.position.y + this.model.motion.y * deltaT
        };
        var correctedPosition = this.map.moveTo( this.model, computedPosition );
        if( correctedPosition.x != computedPosition.x ) this.model.motion.x = 0;
        if( correctedPosition.y != computedPosition.y ) {
          if(this.model.motion.y > 15) this.model.isAlive = false;
          this.model.motion.y = 0;
        }
        this.model.position = correctedPosition;
        this.lastT = ioState.time;
        return this.model.isAlive; 
      }
    };
  }

  //pattern application in an animation
  function foreground(){
    return {
      _init : function(w,h,sys,ioState, resources, positionnable){
        var mapData = this.mapData = resources["map.json"];
        this.texture = resources["textureMap.png"];
        this.txH = mapData.tileheight;
        this.txW = mapData.tilewidth ;
        this.center = positionnable;
        this.mapLayer = mapData.layers.filter(function(l){ return l.name === "Map" })[0];
      },
      render : function(ctx, width, height, camera){
        var mapWidth = this.mapLayer.width;
        var deltaI = camera.left  - Math.floor(camera.left);
        var deltaJ = camera.top   - Math.floor(camera.top);
        for( var i = Math.floor(camera.left) , x = 0; i < Math.ceil(camera.right) ; i++, x++){
          for( var j = Math.floor(camera.top), y = 0; j < Math.ceil(camera.bottom); j++, y++){
            var imgX = -1;
            var imgY =  0;
            if(j >= 0 && j <= this.mapData.height && i >= 0 && i < this.mapData.width){
              var dataPos = i + j * mapWidth;
              imgX = this.mapLayer.data[ dataPos ] - 1;
            }
            ctx.drawImage(this.texture, imgX * this.txW, imgY * this.txH, 
                                   this.txW, this.txH, 
                                   (x - deltaI) * this.txW * camera.zoom, 
                                   (y - deltaJ) * this.txH * camera.zoom, 
                                   this.txW * camera.zoom, 
                                   this.txH * camera.zoom);
          }
        }
      },
      animate: function(ioState, width, height){ 
        return true; 
      }, 
      tileAt : function( position ){
        var map  = this.mapLayer;
        if(position.y <= 0) return 10;
        if(position.x <= 0) return 10;
        if(position.x > map.width) return 10;

        var mapX = Math.floor(position.x);
        var mapY = Math.floor(position.y);
        return map.data[ mapX + mapY * map.width];
      },
      correctFace : function( face ){
        if( face[0] === 0 ) return { x: 0, y :  Math.ceil( face[1]) - face[1] };
        if( face[0] === 1 ) return { y: 0, x :  Math.floor(face[1]) - face[1] };
        if( face[0] === 2 ) return { x: 0, y : (Math.floor(face[1]) - face[1])};
        if( face[0] === 3 ) return { y: 0, x :  Math.ceil( face[1]) - face[1] };
        return {x:0, y:0}
      },
      moveTo : function(positionnable, newPosition){
        var d = positionnable.direction();
        if( d === undefined) 
          return newPosition;
        var bBox = positionnable.getBoundingBoxAt(newPosition);
        var collidingP  = positionnable.collidingPoints(bBox, this.tileAt.bind(this));
        var correction  = positionnable.correctionVector(bBox, collidingP, d, this.correctFace);
        return {
          x : newPosition.x + correction.x,
          y : newPosition.y + correction.y
        };
      }
    };
  }

  function background(){
    return {
      _init : function(w,h,sys,ioState, resources, positionnable){
        var mapData = this.mapData = resources["map.json"];
        this.texture = resources["textureMap.png"];
        this.txH = mapData.tileheight;
        this.txW = mapData.tilewidth ;
        this.center = positionnable;
        this.mapLayer = mapData.layers.filter(function(l){ return l.name === "Background" })[0];
      },
      render : function(ctx, width, height, camera){
        var mapWidth = this.mapLayer.width;
        var deltaI = camera.left  - Math.floor(camera.left);
        var deltaJ = camera.top   - Math.floor(camera.top);
        for( var i = Math.floor(camera.left) , x = 0; i < Math.ceil(camera.right) ; i++, x++){
          for( var j = Math.floor(camera.top), y = 0; j < Math.ceil(camera.bottom); j++, y++){
            var imgX = -1;
            var imgY =  0;
            if(j >= 0 && j <= this.mapData.height && i >= 0 && i < this.mapData.width){
              var dataPos = i + j * mapWidth;
              imgX = this.mapLayer.data[ dataPos ] - 1;
            }
            ctx.drawImage(this.texture, imgX * this.txW, imgY * this.txH, 
                                   this.txW, this.txH, 
                                   (x - deltaI) * this.txW * camera.zoom, 
                                   (y - deltaJ) * this.txH * camera.zoom, 
                                   this.txW * camera.zoom, 
                                   this.txH * camera.zoom);
          }
        }
      },
      animate: function(ioState, width, height){ 
        return true; 
      }
    };
  }

  function items(){
    return {
      _init : function(w,h,sys,ioState, resources, positionnable){
        var mapData = this.mapData = resources["map.json"];
        this.texture = resources["textureMap.png"];
        this.txH = mapData.tileheight;
        this.txW = mapData.tilewidth ;
        this.center = positionnable;
        this.mapLayer = mapData.layers.filter(function(l){ return l.name === "Background" })[0];
      },
      render : function(ctx, width, height, camera){
                 /*
        var mapWidth = this.mapLayer.width;
        var deltaI = camera.left  - Math.floor(camera.left);
        var deltaJ = camera.top   - Math.floor(camera.top);
        for( var i = Math.floor(camera.left) , x = 0; i < Math.ceil(camera.right) ; i++, x++){
          for( var j = Math.floor(camera.top), y = 0; j < Math.ceil(camera.bottom); j++, y++){
            var imgX = -1;
            var imgY =  0;
            if(j >= 0 && j <= this.mapData.height && i >= 0 && i < this.mapData.width){
              var dataPos = i + j * mapWidth;
              imgX = this.mapLayer.data[ dataPos ] - 1;
            }
            ctx.drawImage(this.texture, imgX * this.txW, imgY * this.txH, 
                                   this.txW, this.txH, 
                                   (x - deltaI) * this.txW * camera.zoom, 
                                   (y - deltaJ) * this.txH * camera.zoom, 
                                   this.txW * camera.zoom, 
                                   this.txH * camera.zoom);
          }
        }
        */
      },
      animate: function(ioState, width, height){ 
        return true; 
      }
    };
  }

  /**
   * Adds more parameter to the render function of a given animation
   */
  function simpleCamera( animation ){
    var trackedPosition = {
      x:0,
      y:0
    };
    var map = {
      width   : 0,
      height  : 0
    };
    var oldInit   = animation._init.bind(animation);
    animation._init   = function initWithCamera(w, h, sys, ioState, resources){
      oldInit(w, h, sys, ioState, resources, function setTrackedPosition( positionnable, zoom ){
        var z = zoom || 1;
        trackedPosition = {
          x : positionnable.position.x,
          y : positionnable.position.y,
          z : z
        }
      }, function mapConfig(mapData){
        map.tileheight  = mapData.tileheight;
        map.tilewidth   = mapData.tilewidth ;
      });
      var oldRender = animation.render.bind(animation);
      animation.render  = function renderWithCamera(ctx, w, h){
        var args    = Array.prototype.splice.call(arguments, 0);
        var zoom    = trackedPosition.z;
        var mapH2   = h / (2 * map.tileheight * zoom);
        var mapW2   = w / (2 * map.tilewidth * zoom);
        var camera  = {
          top     : (trackedPosition.y - mapH2) ,
          right   : (trackedPosition.x + mapW2) ,
          bottom  : (trackedPosition.y + mapH2) ,
          left    : (trackedPosition.x - mapW2) ,
          zoom    : zoom
        };
        loop.debug( "camera.top", camera.top.toFixed(4) );
        loop.debug( "camera.right", camera.right.toFixed(4) );
        loop.debug( "camera.bottom", camera.bottom.toFixed(4) );
        loop.debug( "camera.left", camera.left.toFixed(4) );
        args.push( camera );
        return oldRender.apply( animation, args );
      };
    };
    return animation;
  }
})(
    window.micromando = window.micromando || {},
    window.micromando.models = window.micromando.models || {}
  );
