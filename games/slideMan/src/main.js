(function( micromando, models, camera, box, loader ){
  var width = 300;
  var height = 300;

  var loop = Loop.create( new Loop.out.canvas2d(document.getElementById("principal"), width, height) );

  var loading = Loop.text.loading({
    img : ["assets/textureMap_.png", "assets/character.png"],
    data : ["assets/maps/playground.json", "assets/character.json"]
  });

  var m = foreground();
  var b = background();
  var c = character();
  var i = items();
  var e = ennemies();
  var game = gameScreen( b, m, c, i, e ); 
  var end  = finishScreen();

  loop.addIO( Loop.io.time );
  loop.addIO( Loop.io.deltaTime );
  loop.addIO( Loop.io.keyboard( {"DOWN":40,"LEFT":37,"RIGHT":39, "UP":38} ) );
  loop.addIO( Loop.io.noAutoKeyboard( {"ACTION":88,"SPACE":32} ) );
  loop.registerAnimation( Loop.tools.debug() );
  //loop.registerAnimation( Loop.tools.debugGraph() );
  loop.registerAnimation( Loop.meta.while1(Loop.meta.andThen.bind(window, loading, game, end) ) );

  loop.start();

  function finishScreen(){
    return {
      _init   : function(w, h, sys, ioState, result){
        var missionSuccess = this.success = result.character.isAlive && result.character.scroll;
        this.message = missionSuccess ? "Mission completed!":"Mission failed!"; 
      },
      animate : function(ioState){ return !ioState.keys["SPACE"] ;},
      render: function(ctx, w, h){
          ctx.fillStyle = this.success ? "green" : "red";
          var m1 = ctx.measureText(this.message);
          ctx.fillText(this.message, w/2-m1.width/2, h * 0.33);

          ctx.fillStyle="white";
          var m2 = ctx.measureText("press >space< to restart");
          ctx.fillText("press >space< to restart", w/2-m2.width/2, h * 0.66);
      }
    };
  }

  function gameScreen(backgroundAnim,mapAnim, characterAnim, itemsAnim, ennemies){
    var gameScreenAnim  = camera.bound({
      _init   : function(w, h, sys, ioState, resources, trackPositionƒ, mapConfigƒ){
        var allAnimations = this.allAnimations = Loop.meta.some.call(window, backgroundAnim, mapAnim, characterAnim, itemsAnim, ennemies);
        this.render = allAnimations.render.bind(allAnimations);
        this.track = trackPositionƒ;

        this.player     = micromando.models.Player.create(resources["assets/maps/playground.json"]);
        this.pickups    = micromando.models.Pickup.createAll(resources["assets/maps/playground.json"]);
        this.ennemies   = micromando.models.Ennemy.createAll(resources["assets/maps/playground.json"]);
        this.activables = micromando.models.Activable.createAll(resources["assets/maps/playground.json"]);

        this.lastT  = ioState.time;

        mapConfigƒ( resources["assets/maps/playground.json"] );
        this.track( this.player );

        allAnimations._init.call(allAnimations, w, h, sys, ioState, resources, { 
          player  : this.player,
          pickups : this.pickups,
          ennemies: this.ennemies
        }, mapAnim);
      },
      animate : function(ioState, width, height){ 
        for(var k in ioState.keys){
          loop.debug("key:"+k, ioState.keys[k]);
        }

        var deltaT = ioState.deltaTime / 1000;
        var playerBBox = box.getBoundingBoxTopLeft(
              this.player.position,
              this.player.size
            );

        if( this.player.colliding[box.BOTTOM]){
          if( ioState.keys.DOWN ) {
            this.player.motion[0] = this.player.motion[0] / 1.05 ; //* (this.player.motion[0] /this.player.motion[0]);
          }
          else if( ioState.keys.ACTION ){
            var collidingActivables = this.activables.filter(function(act){
              var actBBox = box.getBoundingBoxTopLeft(act.position, act.size);
              return box.collide(playerBBox, actBBox); 
            });

            collidingActivables.forEach(function(p){
              p.activate(this.player);
            }, this);
          }
          else{
            if( ioState.keys.LEFT ) this.player.motion[0] = Math.min(0, Math.max( this.player.motion[0] - 1, -15));
            if( ioState.keys.RIGHT) this.player.motion[0] = Math.max(0, Math.min( this.player.motion[0] + 1,  15));
            if(!ioState.keys.LEFT && !ioState.keys.RIGHT) {
              var newXMotion = this.player.motion[0] / 2;
              this.player.motion[0] = Math.max(Math.abs(newXMotion) < 0.001 ? 0 : newXMotion, 0);
            }
          }
        }
        else if( ioState.keys.UP && this.player.colliding[ box.TOP ] ){
          this.player.motion[1] = this.player.motion[1] - 0.1;
          if( ioState.keys.LEFT ) this.player.motion[0] = Math.min(0, Math.max( this.player.motion[0] - 0.4, -5));
          if( ioState.keys.RIGHT) this.player.motion[0] = Math.max(0, Math.min( this.player.motion[0] + 0.4,  5));
          if(!ioState.keys.LEFT && !ioState.keys.RIGHT) {
            var newXMotion = this.player.motion[0] / 2;
            this.player.motion[0] = Math.max(Math.abs(newXMotion) < 0.001 ? 0 : newXMotion, 0);
          }
        } else {
          if( ioState.keys.LEFT ) this.player.motion[0] = Math.min(0, Math.max( this.player.motion[0] - 0.4, -10));
          if( ioState.keys.RIGHT) this.player.motion[0] = Math.max(0, Math.min( this.player.motion[0] + 0.4,  10));
          this.player.motion[1] = this.player.motion[1] + 0.5; // GRAVITY
        }

        if( this.player.can("jump") && ioState.keys.SPACE ){
          if( this.player.colliding[box.BOTTOM] ) {
            this.player.motion[1] = -15;
          }
          else if( this.player.colliding[box.RIGHT] ) {
            this.player.motion[1] = -10;
            this.player.motion[0] = -8;
          }
          else if( this.player.colliding[box.LEFT] ) {
            this.player.motion[1] = -10;
            this.player.motion[0] = 8;
          }
        }

        //Wall grip
        if( ioState.keys.RIGHT && this.player.colliding[box.RIGHT] || 
            ioState.keys.LEFT && this.player.colliding[box.LEFT]      ) {
          this.player.motion[1] = 0.2;
        }

        var collidingPickups = this.pickups.filter(function(pick){
          var pickBBox = box.getBoundingBoxTopLeft(pick.position, pick.size);
          return box.collide(playerBBox, pickBBox); 
        });

        collidingPickups.forEach(function(p){
          p.activate(this.player);
          this.pickups.splice( this.pickups.indexOf(p) , 1);
        }, this);

        var collidingEnnemies = this.ennemies.filter(function(ennemy){
          return box.collide(playerBBox, ennemy.box);
        });

        collidingEnnemies.forEach( function(e){
          e.hurt(this.player);
        }, this);

        this.lastT  = ioState.time;
        this.logPlayer(this.player);
        
        var resAnim = this.allAnimations.animate.apply(this.allAnimations, arguments);

        this.track( this.player );

        return resAnim ;
      },
      logPlayer : function( p ){
        loop.debug( "position.x", p.position[0].toFixed(4) );
        loop.debug( "position.y", p.position[1].toFixed(4) );
        loop.debug( "motion.x"  , p.motion[0].toFixed(4) );
        loop.debug( "motion.y"  , p.motion[1].toFixed(4) );
      },
      result : function(){
        return {
          character : this.player
        };        
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
          w * ((this.model.position[0] - camera.box[box.LEFT])   / (camera.box[box.RIGHT] - camera.box[box.LEFT])), 
          h * ((this.model.position[1] - camera.box[box.TOP]) / (camera.box[box.BOTTOM]- camera.box[box.TOP] )), 
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
            if(this.model.motion[0] > 0){
              if( ioState.keys["DOWN"]){
                currentState = "slide.right"
              }
              else{
                currentState = "run.right";
              }
            }
            else if(this.model.motion[0] < 0){
              if( ioState.keys["DOWN"]){
                currentState = "slide.left"
              }
              else{
                currentState = "run.left";
              }
            }
          }
        }
        else if(this.model.colliding[box.TOP] ){
          if(ioState.keys["UP"]){
            if(this.model.motion[0] > 0){
              currentState = "crouch.right";
            }
            else if(this.model.motion[0] < 0){
              currentState = "crouch.left";
            }
            else {
              currentState = "ceiling-grip";
            }
          }
          else {
            if(this.model.motion[0] > 0){
              currentState = "jump.right";
            }
            else if(this.model.motion[0] < 0){
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
          if(this.model.motion[0] > 0){
            currentState = "jump.right";
          }
          else if(this.model.motion[0] < 0){
            currentState = "jump.left";
          }
        }
        var currentDef = this.currentSprite = this.spriteDef[currentState];

        var computedPosition = [
          this.model.position[0] + this.model.motion[0] * deltaT,
          this.model.position[1] + this.model.motion[1] * deltaT
        ];
        var correctedPosition = this.map.moveTo( this.model, computedPosition );
        if( correctedPosition[0] != computedPosition[0] ) this.model.motion[0] = 0;
        if( correctedPosition[1] != computedPosition[1] ) {
          if(this.model.motion[1] > 50) this.model.isAlive = false;
          this.model.motion[1] = 0;
        }
        this.model.position = correctedPosition;
        this.lastT = ioState.time;
        return this.model.isAlive && !this.model.missionComplete; 
      }
    };
  }

function drawTiles(mapLayer, texture, tileSize, x, y, i, j, deltaI, deltaJ, camera, ctx){
  var imgX = -1;
  var imgY =  0;
  if(j >= 0 && j <= mapLayer.height && i >= 0 && i < mapLayer.width){
    var dataPos = i + j * mapLayer.width;
    var tilePos = mapLayer.data[ dataPos ] - 1;
    imgX = tilePos % 5;
    imgY = Math.floor(tilePos / 5)
  }
  if(imgX!=-1){
    ctx.drawImage(texture, imgX * tileSize[0], imgY * tileSize[1], 
                           tileSize[0], tileSize[1], 
                           Math.ceil( (x - deltaI) * tileSize[0] * camera.zoom ), 
                           Math.ceil( (y - deltaJ) * tileSize[1] * camera.zoom ), 
                           tileSize[0] * camera.zoom, 
                           tileSize[1] * camera.zoom);
  }
}

  function foreground(){
    return {
      _init : function(w, h, sys, ioState, resources, models){
        var mapData = this.mapData = resources["assets/maps/playground.json"];
        this.texture = resources["assets/textureMap_.png"];
        this.tileSize = [
          mapData.tilewidth,
          mapData.tileheight
        ];
        this.mapLayer = mapData.layers.filter(function(l){ return l.name === "Map" })[0];
        this.drawTiles = drawTiles.bind(this, this.mapLayer, this.texture, this.tileSize);
      },
      render : function(ctx, width, height, camera){
        camera.forEach(this.drawTiles, this, ctx);
      },
      animate: function(ioState, width, height){ 
        return true; 
      }, 
      tileAt : function( position ){
        var map  = this.mapLayer;
        if(position[1] <= 0) return 10;
        if(position[0] <= 0) return 10;
        if(position[0] > map.width) return 10;

        var mapX = Math.floor(position[0]);
        var mapY = Math.floor(position[1]);
        return map.data[ mapX + mapY * map.width];
      },
      tilesOnXAxis:function(axis, lowerBound, upperBound){
        var tiles = [];
        for(var i=lowerBound; i <= Math.ceil(upperBound); i++){
          var t = this.tileAt([i, axis]);
          tiles.push([ 
            box.getBoundingBoxTopLeft( [~~i, ~~axis], [1, 1] ), 
            t
          ]);
        } 
        return tiles;
      },
      tilesOnYAxis:function(axis, lowerBound, upperBound){
        var tiles = [];
        for(var i=lowerBound; i <= Math.ceil(upperBound); i++){
          var t = this.tileAt([axis, i]);
          tiles.push([ 
            box.getBoundingBoxTopLeft( [~~axis, ~~i], [1,1]), 
            t
          ]);
        } 
        return tiles;
      },
      surroundingTiles : function( bbox, nBox ){
        var surroundings = [];

        surroundings[box.TOP]    = this.tilesOnXAxis( bbox[box.TOP],    nBox[box.LEFT], nBox[box.RIGHT]);
        surroundings[box.BOTTOM] = this.tilesOnXAxis( bbox[box.BOTTOM], nBox[box.LEFT], nBox[box.RIGHT]);

        surroundings[box.RIGHT]  = this.tilesOnYAxis( bbox[box.RIGHT],  nBox[box.TOP],  nBox[box.BOTTOM]);
        surroundings[box.LEFT]   = this.tilesOnYAxis( bbox[box.LEFT],   nBox[box.TOP],  nBox[box.BOTTOM]);

        return surroundings;
      },
      moveTo : function(positionnable, newPosition){
        var newPosBox = box.getBoundingBoxTopLeft(newPosition, positionnable.size);
        var collidingFaces = positionnable.collisionBoxesMap(
          box.getBoundingBoxTopLeft(positionnable.position, positionnable.size),
          newPosBox,
          this
        );

        var correction = positionnable.correctionVector(collidingFaces, newPosBox);
        var pos = [
          newPosition[0] + correction[0],
          newPosition[1] + correction[1]
        ];

        var newBox = box.getBoundingBoxTopLeft(pos, positionnable.size);
        positionnable.colliding = positionnable.collisionBoxesMap( 
          newBox,
          box.expand( box.fromBox( newBox ), 0.01),
          this
        );
        return pos;
      }
    };
  }

  function background(){
    return {
      _init : function(w,h,sys,ioState, resources, models){
        var mapData = this.mapData = resources["assets/maps/playground.json"];
        this.texture = resources["assets/textureMap_.png"];
        this.tileSize = [
          mapData.tilewidth,
          mapData.tileheight
        ];
        this.mapLayer = mapData.layers.filter(function(l){ return l.name === "Background" })[0];
        this.drawTiles = drawTiles.bind(this, this.mapLayer, this.texture, this.tileSize);
      },
      render : function(ctx, width, height, camera){
        camera.forEach( this.drawTiles, this, ctx);
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
        this.texture= resources["assets/textureMap_.png"];
        this.pickups= models["pickups"];
      },
      render : function(ctx, width, height, camera){
        this.pickups.filter( isInCamera.bind(window, camera) ).forEach( function(p){
          ctx.drawImage(this.texture, 0 * this.txW, 1 * this.txH, 
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

  function ennemies(){
    return {
      _init : function(w,h,sys,ioState, resources, models, map){
        var mapData   = this.mapData  = resources["assets/maps/playground.json"];
        this.txH      = mapData.tileheight;
        this.txW      = mapData.tilewidth ;
        this.texture  = resources["assets/textureMap_.png"];
        this.ennemies = models["ennemies"];
        this.map      = map;
      },
      render : function(ctx, width, height, camera){
        this.ennemies.filter( isInCamera2.bind(window, camera) ).forEach( function drawSingleBaddy(p){
          ctx.drawImage(this.texture, p.pixPos[0] * this.txW, p.pixPos[1] * this.txH, 
             p.size[0] * this.txW , 
             p.size[1] * this.txH , 
             (p.position[0] - camera.box[box.LEFT]) * this.txW * camera.zoom, 
             (p.position[1] - camera.box[box.TOP] ) * this.txH * camera.zoom, 
             p.size[0] * this.txW * camera.zoom, 
             p.size[1] * this.txH * camera.zoom);
        }, this);
      },
      animate: function(ioState, width, height){ 
        this.ennemies.forEach(function(e){
          var computedPosition  = vec2.add( [], e.position, e.motion);
          var correctedPosition = this.map.moveTo( e, computedPosition );
          e.setPosition(correctedPosition);
          if(e.colliding[box.LEFT]) e.motion  = [0.1, 0.1];
          if(e.colliding[box.RIGHT]) e.motion = [-0.1, 0.1];
        }, this);
        return true; 
      }
    };
  }

  function isInCamera(camera, positionnable){
    return box.collide(camera.box, 
        box.getBoundingBoxTopLeft( positionnable.position, positionnable.size ) 
      );
  }

  function isInCamera2(camera, positionnable){
    return box.collide(camera.box, positionnable.box);
  }
})(
    window.micromando         = window.micromando || {},
    window.micromando.models  = window.micromando.models || {},
    window.micromando.camera  = window.micromando.camera || {},
    window.micromando.box     = window.micromando.box || {},
    window.micromando.loader  = window.micromando.loader || {}
  );
