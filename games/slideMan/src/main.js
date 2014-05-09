(function( micromando, models, camera, box, loader, sfxUtils ){
  var width = 800;
  var height = 600;

  var loop = Loop.create( new Loop.out.canvas2d(document.getElementById("principal"), width, height), new Loop.out.webaudio() );

  var loading = Loop.text.loading({
    img : ["assets/textureMap_.png", "assets/character.png"],
    data: ["assets/maps/playground.json", "assets/character.json"],
    sfx : ["assets/sfx/jump.wav", "assets/sfx/fail.wav", "assets/sfx/pickup.wav"]
  });

  var m = foregroundPainter();
  var b = backgroundPainter();
  var o = objectsPainter();
  var c = character();
  var i = items();
  var e = ennemies();
  var game = Loop.filters.fadeOut(gameScreen( b, o, m, c, i, e ), 500); 
  var end  = finishScreen();

  loop.addIO( Loop.io.time );
  loop.addIO( Loop.io.deltaTime );
  loop.addIO( Loop.io.keyboard( {"DOWN":40,"LEFT":37,"RIGHT":39, "UP":38} ) );
  loop.addIO( Loop.io.noAutoKeyboard( {"ACTION":88,"SPACE":32} ) );
  //loop.registerAnimation( Loop.tools.debug() );
  //loop.registerAnimation( Loop.tools.debugGraph() );
  loop.registerAnimation( Loop.meta.andThen(titleScreen(), Loop.meta.while1(Loop.meta.andThen.bind(window, loading, game, end) ) ) );

  loop.start();

  function titleScreen(){
    var loader = Loop.text.loading({
      img:["assets/img/title.png"]
    });
    return Loop.filters.fadeOut( Loop.filters.waitForAKey( Loop.meta.andThen( loader, {
      _init:function(outputManagers, sys, ioState, resources){
        this.startT = ioState.time;
        this.img = resources["assets/img/title.png"];
      },
      render:function(outputManagers){
        var ctx = outputManagers.canvas2d.context;
        var params = outputManagers.canvas2d.parameters;
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, params.width, params.height);
        ctx.drawImage(this.img, (params.width/2) -(this.img.width/2) ,(params.height/2) - (this.img.height/2));
      },
      animate:function(ioState){
        var now = ioState.time;
        return (this.startT + 3000) > now;
      },
      result:function(){ return null;}
    }) ), 500);
  }

  function finishScreen(){
    return {
      _init   : function(outputManagers, sys, ioState, result){
        var missionSuccess = this.success = result.character.isAlive && result.character.scroll;
        this.message = missionSuccess ? "Mission completed!":"Mission failed!"; 
      },
      animate : function(ioState){ return !ioState.keys["SPACE"] ;},
      render: function(outputManagers){
          var ctx = outputManagers.canvas2d.context;
          var w = outputManagers.canvas2d.parameters.width;
          var h = outputManagers.canvas2d.parameters.height;
          ctx.fillStyle = this.success ? "green" : "red";
          var m1 = ctx.measureText(this.message);
          ctx.fillText(this.message, w/2-m1.width/2, h * 0.33);

          ctx.fillStyle="white";
          var m2 = ctx.measureText("press >space< to restart");
          ctx.fillText("press >space< to restart", w/2-m2.width/2, h * 0.66);
      }
    };
  }

  function gameScreen(backgroundAnim, objectsAnim, mapAnim, characterAnim, itemsAnim, ennemies){
    var gameScreenAnim  = camera.bound({
      _init   : function(outputManagers, sys, ioState, resources, trackPositionƒ, mapConfigƒ){
        var allAnimations = this.allAnimations = Loop.meta.some.call(window, backgroundAnim, objectsAnim, mapAnim, characterAnim, itemsAnim, ennemies);
        this.renderSubAnimations = allAnimations.render.bind(allAnimations);
        this.track = trackPositionƒ;

        var level = resources["assets/maps/playground.json"];

        this.player     = micromando.models.Player.create( level );
        this.pickups    = micromando.models.Pickup.createAll( level );
        this.ennemies   = micromando.models.Ennemy.createAll( level );
        this.activables = micromando.models.Activable.createAll( level );

        this.mapLayer       = micromando.models.Map.create( level, "Map" );
        this.backgroundLayer= micromando.models.Map.create( level, "Background" );
        this.objectsLayer   = micromando.models.Map.create( level, "Objects" );

        this.events = [];
        this.resources = resources;

        this.lastT  = ioState.time;

        mapConfigƒ( level );
        this.track( this.player );

        allAnimations._init.call(allAnimations, outputManagers, sys, ioState, resources, { 
          player  : this.player,
          pickups : this.pickups,
          ennemies: this.ennemies,
          layers : {
            Map         : this.mapLayer,
            Background  : this.backgroundLayer,
            Objects     : this.objectsLayer
          }
        });
      },
      render : function( outputManagers ){
        this.events.forEach( function(e){
          if(e==="pickup"){
            sfxUtils.playBuffer(
              outputManagers.webaudio.context, 
              this.resources["assets/sfx/pickup.wav"]
            );
          }
          if(e==="death"){
            sfxUtils.playBuffer(
              outputManagers.webaudio.context, 
              this.resources["assets/sfx/fail.wav"]
            );
          }
        }, this);
        this.renderSubAnimations.apply(this, arguments);
      },
      animate : function(ioState){ 
        this.events = [];
//      for(var k in ioState.keys){
//        loop.debug("key:"+k, ioState.keys[k]);
//      }

        this.player.resetActions(["climb"]);
        var deltaT = ioState.deltaTime / 1000;
        var playerBBox = box.getBoundingBoxTopLeft(
              this.player.position,
              this.player.size
            );

        switch(true) {
          case this.player.actions.climb : this.climbingPhysicsBehavior(ioState, playerBBox); break;
          default : this.defaultPhysicsBehavior(ioState, playerBBox);
        }

        var collidingPickups = this.pickups.filter(function(pick){
          var pickBBox = box.getBoundingBoxTopLeft(pick.position, pick.size);
          return box.collide(playerBBox, pickBBox); 
        });

        collidingPickups.forEach(function(p){
          p.activate(this.player);
          this.pickups.splice( this.pickups.indexOf(p) , 1);
          this.events.push("pickup");
        }, this);

        var collidingEnnemies = this.ennemies.filter(function(ennemy){
          return box.collide(playerBBox, ennemy.hitBox);
        });

        collidingEnnemies.forEach( function(e){
          e.hurt(this.player);
        }, this);

        this.lastT  = ioState.time;
        this.logPlayer(this.player);
        
        var resAnim = this.allAnimations.animate.apply(this.allAnimations, arguments);

        if(!resAnim) 
          this.events.push("death");

        this.track( this.player );

        return resAnim ;
      },
      defaultPhysicsBehavior : function( ioState, playerBBox ){
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
            this.player.actions.jump = true;
          }
          else if( this.player.colliding[box.RIGHT] ) {
            this.player.motion[1] = -10;
            this.player.motion[0] = -8;
            this.player.actions.jump = true;
          }
          else if( this.player.colliding[box.LEFT] ) {
            this.player.motion[1] = -10;
            this.player.motion[0] = 8;
            this.player.actions.jump = true;
          }
        }

        //Wall grip
        if( ioState.keys.RIGHT && this.player.colliding[box.RIGHT] || 
            ioState.keys.LEFT && this.player.colliding[box.LEFT]      ) {
          this.player.motion[1] = 0.2;
        }
        
        //Ladders climb
        if(ioState.keys["UP"]){
          // FIXME Test collision with ladders // make sense out of that
          var collidingTiles = this.objectsLayer.surroundingTiles( playerBBox, playerBBox ).reduce(function(mts, tiles){
            return mts + tiles.reduce(function(mt, tile){
              return mt + tile[1];
            }, 0);
          }, 0);
          if(collidingTiles !== 0){
            this.player.actions.climb = true;
          }
        }
      },
      climbingPhysicsBehavior : function( ioState, playerBBox ){
        this.player.motion = [0,0];
        if(ioState.keys["SPACE"]){
          this.player.actions.climb = false;
          if(ioState.keys["LEFT"]){
            this.player.motion[0] = -8;
          }
          if(ioState.keys["RIGHT"]){
            this.player.motion[0] = 8;
          }
          this.player.motion[1] = -10;
        }
        else {
          if(ioState.keys["UP"]){
            this.player.motion[1] = -3;
          }
          if(ioState.keys["DOWN"]){
            this.player.motion[1] = 3;
          }
          if(ioState.keys["LEFT"]){
            this.player.motion[0] = -3;
          }
          if(ioState.keys["RIGHT"]){
            this.player.motion[0] = 3;
          }
        }

        var collidingTiles = this.objectsLayer.surroundingTiles( playerBBox, playerBBox ).reduce(function(mts, tiles){
          return mts + tiles.reduce(function(mt, tile){
            return mt + tile[1];
          }, 0);
        }, 0);
        if(collidingTiles < 40){
          this.player.actions.climb = false;
        }
      },
      logPlayer : function( p ){
//      loop.debug( "position.x", p.position[0].toFixed(4) );
//      loop.debug( "position.y", p.position[1].toFixed(4) );
//      loop.debug( "motion.x"  , p.motion[0].toFixed(4) );
//      loop.debug( "motion.y"  , p.motion[1].toFixed(4) );
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
      _init : function(outputManagers, sys, ioState, resources, models){
        this.resources = resources;
        this.sprite = resources["assets/character.png"];
        this.spriteDef = resources["assets/character.json"];
        this.currentSprite = this.spriteDef.standing;
        this.currentFrame = 0;
        this.model  = models["player"];
        this.lastT  = ioState.time;
        this.map    = models.layers["Map"];
      },
      render  : function(outputManagers, camera){
        if( this.model.actions.jump ){
          sfxUtils.playBuffer(outputManagers.webaudio.context, this.resources["assets/sfx/jump.wav"]);
        }
        var ctx = outputManagers.canvas2d.context;
        var w = outputManagers.canvas2d.parameters.width;
        var h = outputManagers.canvas2d.parameters.height;
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
      animate : function(ioState){
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

  function tilePainter( layerModelName ){
    return {
      _init : function(outputManagers, sys, ioState, resources, models){
        var model     = this.model    = models.layers[layerModelName]; 
        this.texture  = resources["assets/textureMap_.png"];
        this.drawTiles= drawTiles.bind( this, this.model._data, this.texture, this.model._tileSize);
      },
      render : function(outputManagers, camera){
        var ctx = outputManagers.canvas2d.context;
        camera.forEach(this.drawTiles, this, ctx);
      },
      animate: function(ioState){ 
        return true; 
      }, 
    };
  }

  function foregroundPainter(){
    return tilePainter("Map");
  }

  function backgroundPainter(){
    return tilePainter("Background");
  }

  function objectsPainter(){
    return tilePainter("Objects");
  }

  function items(){
    return {
      _init : function(outputManagers, sys, ioState, resources, models){
        var mapData = resources["assets/maps/playground.json"];
        this.txH    = mapData.tileheight;
        this.txW    = mapData.tilewidth ;
        this.texture= resources["assets/textureMap_.png"];
        this.pickups= models["pickups"];
      },
      render : function(outputManagers, camera){
        var ctx = outputManagers.canvas2d.context;
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
      animate: function(ioState){ 
        return true; 
      }
    };
  }

  function ennemies(){
    return {
      _init : function(outputManagers, sys, ioState, resources, models){
        var mapData   = resources["assets/maps/playground.json"];
        this.txH      = mapData.tileheight;
        this.txW      = mapData.tilewidth ;
        this.texture  = resources["assets/textureMap_.png"];
        this.ennemies = models["ennemies"];
        this.map      = models.layers["Map"];
      },
      render : function(outputManagers, camera){
        var ctx = outputManagers.canvas2d.context;
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
      animate: function(ioState){ 
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
    window.micromando.loader  = window.micromando.loader || {},
    window.micromando.sfxUtils= window.micromando.sfxUtils || {}
  );
