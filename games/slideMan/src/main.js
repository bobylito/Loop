(function( micromando, models, camera, box ){
  var loading = Loop.text.loading({
    img : ["ouno.png", "textureMap.png", "assets/character.png"],
    data : ["assets/maps/playground.json", "assets/character.json"]
  });

  var m = foreground();
  var b = background();
  var c = character();
  var i = items();
  var game = gameScreen( b, m, c, i ); 
  var end  = finishScreen();

  loop.addIO( Loop.io.time );
  loop.addIO( Loop.io.deltaTime );
  loop.addIO( Loop.io.keyboard( {"UP":38,"DOWN":40,"LEFT":37,"RIGHT":39} ) );
  loop.addIO( Loop.io.noAutoKeyboard( {"SPACE":32} ) );
  loop.registerAnimation( Loop.tools.debug() );
  //loop.registerAnimation( Loop.tools.debugGraph() );
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
    var gameScreenAnim  = camera.bound({
      _init   : function(w, h, sys, ioState, resources, trackPositionƒ, mapConfigƒ){
        var allAnimations = this.allAnimations = Loop.meta.some.call(window, backgroundAnim, mapAnim, characterAnim, itemsAnim);
        this.render = allAnimations.render.bind(allAnimations);
        this.track = trackPositionƒ;

        this.player = micromando.models.Player.create(resources["assets/maps/playground.json"]);
        this.pickups = micromando.models.Pickup.createAll(resources["assets/maps/playground.json"]);

        this.lastT  = ioState.time;

        mapConfigƒ( resources["assets/maps/playground.json"] );
        this.track( this.player );

        allAnimations._init.call(allAnimations, w, h, sys, ioState, resources, { 
          player  : this.player,
          pickups : this.pickups
        }, mapAnim);
      },
      animate : function(ioState, width, height){ 
        for(var k in ioState.keys){
          loop.debug("key:"+k, ioState.keys[k]);
        }

        var deltaT = ioState.deltaTime / 1000;
        if( this.player.colliding[box.BOTTOM]){
          if( ioState.keys.LEFT ) this.player.motion.x = Math.min(0, Math.max( this.player.motion.x - 0.3, -10));
          if( ioState.keys.RIGHT) this.player.motion.x = Math.max(0, Math.min( this.player.motion.x + 0.3,  10));
          if(!ioState.keys.LEFT && !ioState.keys.RIGHT) {
            var newXMotion = this.player.motion.x / 2;
            this.player.motion.x = Math.max(Math.abs(newXMotion) < 0.001 ? 0 : newXMotion, 0);
          }
        }
        else {
          if( ioState.keys.LEFT ) this.player.motion.x = Math.min(0, Math.max( this.player.motion.x - 0.05, -10));
          if( ioState.keys.RIGHT) this.player.motion.x = Math.max(0, Math.min( this.player.motion.x + 0.05,  10));
        }

        if( this.player.can("jump") && ioState.keys.SPACE ){
          if( this.player.colliding[box.BOTTOM] ) {
            this.player.motion.y = -10;
          }
          if( this.player.colliding[box.RIGHT] ) {
            this.player.motion.y = -8;
            this.player.motion.x = -5;
          }
          if( this.player.colliding[box.LEFT] ) {
            this.player.motion.y = -8;
            this.player.motion.x = 5;
          }
        }

        //Wall grip
        if( ioState.keys.RIGHT && this.player.colliding[1] ) {
          this.player.motion.y = 0.2;
        }
        if( ioState.keys.LEFT && this.player.colliding[3] ) {
          this.player.motion.y = 0.2; 
        }
  
        if( ioState.keys.UP && this.player.colliding[0] ){
          this.player.motion.y = this.player.motion.y - 0.1;
          if( ioState.keys.LEFT ) this.player.motion.x = Math.min(0, Math.max( this.player.motion.x - 0.2, -5));
          if( ioState.keys.RIGHT) this.player.motion.x = Math.max(0, Math.min( this.player.motion.x + 0.2,  5));
        } else{
          this.player.motion.y = this.player.motion.y + 0.3;
        }
        /*if( ioState.keys.UP )   this.player.motion.y -= 0.3;
        if( ioState.keys.DOWN ) this.player.motion.y += 0.3;
        if(!ioState.keys.UP && !ioState.keys.DOWN) {
          var newYMotion = this.player.motion.y / 2;
          this.player.motion.y = Math.max(Math.abs(newYMotion) < 0.001 ? 0 : newYMotion, 0);
        }*/

        var playerBBox = box.getBoundingBoxTopLeft(
              vec2.fromValues(this.player.position.x, this.player.position.y),
              vec2.fromValues(this.player.size.w, this.player.size.h)
            );

        var collidingPickups = this.pickups.filter(function(pick){
          var pickBBox = box.getBoundingBoxTopLeft(pick.position, pick.size);
          return box.collide(playerBBox, pickBBox); 
        });

        collidingPickups.forEach(function(p){
          p.enhancePlayer(this.player);
          this.pickups.splice( this.pickups.indexOf(p) , 1);
        }, this);

        this.lastT  = ioState.time;
        this.logPlayer(this.player);
        
        var resAnim = this.allAnimations.animate.apply(this.allAnimations, arguments);

        this.track( this.player );

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
      _init : function(w, h, sys, ioState, resources, models, map){
        this.sprite = resources["assets/character.png"];
        this.spriteDef = resources["assets/character.json"];
        this.currentSprite = this.spriteDef.standing;
        this.currentFrame = 0;
        this.model  = models["player"];
        this.lastT  = ioState.time;
        this.map    = map;
      },
      render  : function(ctx, w, h, camera){
        var frame = ~~(this.currentFrame/10 )%this.currentSprite.length;
        ctx.drawImage(this.sprite, 
          this.currentSprite[frame].position[0],
          this.currentSprite[frame].position[1], 
          this.currentSprite[frame].size[0],
          this.currentSprite[frame].size[1], 
          w * ((this.model.position.x - camera.box[box.LEFT])   / (camera.box[box.RIGHT] - camera.box[box.LEFT])), 
          h * ((this.model.position.y - camera.box[box.TOP]) / (camera.box[box.BOTTOM]- camera.box[box.TOP] )), 
          this.currentSprite[frame].size[0] * camera.zoom,
          this.currentSprite[frame].size[1] * camera.zoom 
        );
      },
      animate : function(ioState, w, h){
        var deltaT = ioState.deltaTime / 1000;
        this.currentFrame++;
        var currentState = "standing";
        if(this.model.colliding[box.BOTTOM]){
          if(this.model.colliding[box.RIGHT] ){
            if(ioState.keys["RIGHT"]){
              currentState = "push.right";
            }
          }
          else if(this.model.colliding[box.LEFT] ){
            if(ioState.keys["LEFT"]){
              currentState = "push.left";
            }
          }
          else {
            if(this.model.motion.x > 0){
              currentState = "run.right";
            }
            else if(this.model.motion.x < 0){
              currentState = "run.left";
            }
          }
        }
        else if(this.model.colliding[box.TOP] ){
          if(ioState.keys["UP"]){
            if(this.model.motion.x > 0){
              currentState = "crouch.right";
            }
            else if(this.model.motion.x < 0){
              currentState = "crouch.left";
            }
            else {
              currentState = "ceiling-grip";
            }
          }
          else {
            if(this.model.motion.x > 0){
              currentState = "jump.right";
            }
            else if(this.model.motion.x < 0){
              currentState = "jump.left";
            }
          }
        }
        else if(this.model.colliding[box.RIGHT] ){
          //if(ioState.keys["RIGHT"]){
            currentState = "wall-grip.right";
          //}
        }
        else if(this.model.colliding[box.LEFT] ){
          //if(ioState.keys["LEFT"]){
            currentState = "wall-grip.left";
          //}
        }
        else {
          if(this.model.motion.x > 0){
            currentState = "jump.right";
          }
          else if(this.model.motion.x < 0){
            currentState = "jump.left";
          }
        }
        var currentDef = this.currentSprite = this.spriteDef[currentState];

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

  function foreground(){
    return {
      _init : function(w,h,sys,ioState, resources, models){
        var mapData = this.mapData = resources["assets/maps/playground.json"];
        this.texture = resources["textureMap.png"];
        this.txH = mapData.tileheight;
        this.txW = mapData.tilewidth ;
        this.mapLayer = mapData.layers.filter(function(l){ return l.name === "Map" })[0];
      },
      render : function(ctx, width, height, camera){
        var mapWidth = this.mapLayer.width;
        var deltaI = camera.box[box.LEFT]  - Math.floor(camera.box[box.LEFT]);
        var deltaJ = camera.box[box.TOP]   - Math.floor(camera.box[box.TOP]);
        for( var i = Math.floor(camera.box[box.LEFT]) , x = 0; i < Math.ceil(camera.box[box.RIGHT]) ; i++, x++){
          for( var j = Math.floor(camera.box[box.TOP]), y = 0; j < Math.ceil(camera.box[box.BOTTOM]); j++, y++){
            var imgX = -1;
            var imgY =  0;
            if(j >= 0 && j <= this.mapData.height && i >= 0 && i < this.mapData.width){
              var dataPos = i + j * mapWidth;
              imgX = this.mapLayer.data[ dataPos ] - 1;
            }
            ctx.drawImage(this.texture, imgX * this.txW, imgY * this.txH, 
                                   this.txW, this.txH, 
                                   ~~( (x - deltaI) * this.txW * camera.zoom ), 
                                   ~~( (y - deltaJ) * this.txH * camera.zoom ), 
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
      _init : function(w,h,sys,ioState, resources, models){
        var mapData = this.mapData = resources["assets/maps/playground.json"];
        this.texture = resources["textureMap.png"];
        this.txH = mapData.tileheight;
        this.txW = mapData.tilewidth ;
        this.mapLayer = mapData.layers.filter(function(l){ return l.name === "Background" })[0];
      },
      render : function(ctx, width, height, camera){
        var mapWidth = this.mapLayer.width;
        var deltaI = camera.box[box.LEFT]  - Math.floor(camera.box[box.LEFT]);
        var deltaJ = camera.box[box.TOP]   - Math.floor(camera.box[box.TOP]);
        for( var i = Math.floor(camera.box[box.LEFT]) , x = 0; i < Math.ceil(camera.box[box.RIGHT]) ; i++, x++){
          for( var j = Math.floor(camera.box[box.TOP]), y = 0; j < Math.ceil(camera.box[box.BOTTOM]); j++, y++){
            var imgX = -1;
            var imgY =  0;
            if(j >= 0 && j <= this.mapData.height && i >= 0 && i < this.mapData.width){
              var dataPos = i + j * mapWidth;
              imgX = this.mapLayer.data[ dataPos ] - 1;
            }
            ctx.drawImage(this.texture, imgX * this.txW, imgY * this.txH, 
                                   this.txW, this.txH, 
                                   ~~( (x - deltaI) * this.txW * camera.zoom ), 
                                   ~~( (y - deltaJ) * this.txH * camera.zoom ), 
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
      _init : function(w,h,sys,ioState, resources, models){
        var mapData = this.mapData  = resources["assets/maps/playground.json"];
        this.txH    = mapData.tileheight;
        this.txW    = mapData.tilewidth ;
        this.texture= resources["textureMap.png"];
        this.pickups= models["pickups"];
      },
      render : function(ctx, width, height, camera){
        this.pickups.filter( isInCamera.bind(window, camera) ).forEach( function(p){
          ctx.drawImage(this.texture, 0 , 50, 
             p.size[0] * this.txW , 
             p.size[1] * this.txH , 
             (p.position[0] - camera.box[box.LEFT]) * this.txW * camera.zoom, 
             (p.position[1] - camera.box[box.TOP] ) * this.txH * camera.zoom, 
             p.size[0] * this.txW * camera.zoom, 
             p.size[1] * this.txH * camera.zoom);
        }, this);
      },
      animate: function(ioState, width, height){ 
        return true; 
      }
    };
  }

  function isInCamera(camera, positionnable){
    return box.collide(camera.box, 
        box.getBoundingBoxTopLeft( positionnable.position, positionnable.size ) 
      );
  }
})(
    window.micromando         = window.micromando || {},
    window.micromando.models  = window.micromando.models || {},
    window.micromando.camera  = window.micromando.camera || {},
    window.micromando.box     = window.micromando.box || {}
  );
