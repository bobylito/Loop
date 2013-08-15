(function(){
  var loading = Loop.text.loading({
    img : ["ouno.png", "textureMap.png"],
    data : ["map.json"]
  });

  var m = cameraMap();
  var c = character();
  var game = gameScreen( m, c ); 

  loop.addIO( Loop.io.time );
  loop.addIO( Loop.io.keyboard( {"UP":38,"DOWN":40,"LEFT":37,"RIGHT":39,"SPACE":32} ) );
  loop.registerAnimation( Loop.tools.debug() );
  loop.registerAnimation( Loop.meta.andThen(loading, game) );
  loop.start();

  function gameScreen(mapAnim, characterAnim){
    var allAnimations   = Loop.meta.all.apply(window, arguments);
    var gameScreenAnim  = {
      _init   : function(w, h, sys, ioState, resources){
        var newArgs = Array.prototype.splice.call(arguments, 0);
        this.player = this.createPlayer(resources["map.json"]);
        this.lastT  = ioState.time;
        newArgs.push( this.player );
        newArgs.push( mapAnim );
        allAnimations._init.apply(allAnimations, newArgs);
      },
      render  : allAnimations.render.bind(allAnimations),
      animate : function(ioState, width, height){ 
        var deltaT = (ioState.time - this.lastT) / 1000;
        if( ioState.keys.LEFT ) this.player.motion.x = Math.max( this.player.motion.x - 0.3, -10);
        if( ioState.keys.RIGHT) this.player.motion.x = Math.min( this.player.motion.x + 0.3,  10);
        if(!ioState.keys.LEFT && !ioState.keys.RIGHT) {
          var newXMotion = this.player.motion.x / 2;
          this.player.motion.x = Math.max(Math.abs(newXMotion) < 0.001 ? 0 : newXMotion, 0);
        }

        if( ioState.keys.UP ) this.player.motion.y = -10;

        this.lastT  = ioState.time;
        this.logPlayer(this.player);
        var resAnim = allAnimations.animate.apply(allAnimations, arguments);
        //Gravity
        this.player.motion.y = this.player.motion.y + 0.3;
        return resAnim;
      },
      createPlayer : function(mapData){
        var charLayer = mapData.layers.filter(function(l){ return l.name === "character" });
        var start     = charLayer[0].objects.filter( function(o){ return o.name === "start" } )[0];
        return {
          position : {
            x : start.x / mapData.tilewidth,
            y : start.y / mapData.tileheight
          },
          motion : {
            x : 0,
            y : 0
          },
          size : {
            h : 0.5,
            w : 0.5       
          },
          getBoundingBoxAt : function( position ){
            return [
              { x : position.x, y : position.y},
              { x : position.x + 0.5, y : position.y},
              { x : position.y + 0.5, y : position.y + 0.5},
              { x : position.x, y : position.y + 0.5}
            ];                 
          },
          direction : function(){
            if(this.motion.x===0 && this.motion.y<0){ return 0;}
            if(this.motion.x>0 && this.motion.y<0){ return 1;}
            if(this.motion.x>0 && this.motion.y===0){ return 2;}
            if(this.motion.x>0 && this.motion.y>0){ return 3;}
            if(this.motion.x===0 && this.motion.y>0){ return 4;}
            if(this.motion.x<0 && this.motion.y>0){ return 5;}
            if(this.motion.x<0 && this.motion.y===0){ return 6;}
            if(this.motion.x<0 && this.motion.y<0){ return 7;}
          },
          meaningfulPoints : function(direction, destinationPoints){
            var firstPointIdx   = Math.floor(direction / 2); 
            var secondPointIdx  = firstPointIdx + (direction % 2) + 1;
            return [ destinationPoints[firstPointIdx], destinationPoints[secondPointIdx] ];
          },
          collidingPoints  : function(meaningfulPoints, tileAt){
            return meaningfulPoints.filter(function(p){ return tileAt(p) != 0; });
          },
          indicesOfPoints : function( points, pointsSubset ){
            return pointsSubset.map(function(p){ points.indexOf(p); }); 
          },
          correctionVector : function(points, direction, correctPoint){
            var motion = this.motion;
            return points.map(function(p, i){
                var correctedPoint = correctPoint(p, motion);
                return {
                  x : correctedPoint.x - p.x,
                  y : correctedPoint.y - p.y
                };
              }).reduce(function(vectorSum, v){
                  return {
                    x : vectorSum.x + v.x,
                    y : vectorSum.y + v.y
                  }
                }, {x : 0, y : 0});
          }
        };
      },
      logPlayer : function( p ){
        loop.debug( "position.x", p.position.x );
        loop.debug( "position.y", p.position.y );
        loop.debug( "motion.x"  , p.motion.x );
        loop.debug( "motion.y"  , p.motion.y );
      }
    };
      
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
      render  : function(ctx, w, h){
        ctx.drawImage(this.sprite, w/2, h/2);
      },
      animate : function(ioState, w, h){
        var deltaT = (ioState.time - this.lastT) / 1000;
        var computedPosition = {
          x : this.model.position.x + this.model.motion.x * deltaT,
          y : this.model.position.y + this.model.motion.y * deltaT
        };
        var correctedPosition = this.map.moveTo( this.model, computedPosition );
        if( correctedPosition.x != computedPosition.x ) this.model.motion.x = 0;
        if( correctedPosition.y != computedPosition.y ) this.model.motion.y = 0;
        this.model.position = correctedPosition;
        this.lastT = ioState.time;
        return true; 
      }
    };
  }

  //pattern application in an animation
  function cameraMap(){
    return {
      _init : function(w,h,sys,ioState, resources, positionnable){
        var mapData = this.mapData = resources["map.json"];
        this.texture = resources["textureMap.png"];
        this.txH = mapData.tileheight;
        this.txW = mapData.tilewidth ;
        this.center = positionnable;
      },
      render : function(ctx, width, height){
        var xIt = Math.ceil( width / this.txW ),
            yIt = Math.ceil( height/ this.txH );
        var cameraPosition = {
          x : this.center.position.x - xIt/2,
          y : this.center.position.y - yIt/2 
        };

        var naturalPos = {
          x : Math.floor(cameraPosition.x),
          y : Math.floor(cameraPosition.y)
        };

        var devPos = {
          x : cameraPosition.x - Math.floor(cameraPosition.x),
          y : cameraPosition.y - Math.floor(cameraPosition.y)
        };

        var translatePos = naturalPos.y * this.mapData.layers[0].width + naturalPos.x ;
        var mapWidth = this.mapData.layers[0].width;

        for( i = -1; i < xIt + 1; i++){
          for( j = -1; j < yIt + 1; j++){
            var dataPos = translatePos + i + j * mapWidth,
                imgX = Math.floor(dataPos / mapWidth) != (j + naturalPos.y)  ? -1 : this.mapData.layers[0].data[ dataPos ] - 1,
                imgY = 0;
            ctx.drawImage(this.texture, imgX * this.txW, imgY * this.txH, 
                                   this.txW, this.txH, 
                                   (i - devPos.x) * this.txW, 
                                   (j - devPos.y) * this.txH, 
                                   this.txW , 
                                   this.txH );
          }
        }
      },
      animate: function(ioState, width, height){ 
        return true; 
      }, 
      tileAt : function( position ){
        var map  = this.mapData.layers[0];
        var mapX = Math.floor(position.x);
        var mapY = Math.floor(position.y);
        return map.data[ mapX + mapY * map.width];
      },
      correctPoint : function( newPosition, motion ){
        var correctedPosition = {
          x : newPosition.x,
          y : newPosition.y
        }
        if( motion.y ){
          if( motion.y < 0 ){ correctedPosition.y = Math.ceil(newPosition.y); }
          if( motion.y > 0 ){ correctedPosition.y = Math.floor(newPosition.y); }
        }
        else{
          if( motion.x < 0 ){ correctedPosition.x = Math.ceil(newPosition.x); }
          if( motion.x > 0 ){ correctedPosition.x = Math.floor(newPosition.x);}
        }
        return correctedPosition;
      },
      moveTo : function(positionnable, newPosition){
        var d = positionnable.direction();
        if( !d ) return newPosition;
        var bBox = positionnable.getBoundingBoxAt(newPosition);
        var meaningfulP = positionnable.meaningfulPoints(d, bBox);
        var collidingP  = positionnable.collidingPoints(meaningfulP, this.tileAt.bind(this));
        var correction  = positionnable.correctionVector(collidingP, d, this.correctPoint);
        return {
          x : newPosition.x + correction.x,
          y : newPosition.y + correction.y
        };
      }
    };
  }
})();
