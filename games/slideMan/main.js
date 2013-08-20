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
  loop.registerAnimation( Loop.tools.debugGraph() );
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

        if( ioState.keys.SPACE && this.player.colliding[2] ) this.player.motion.y = -10;
        if( ioState.keys.SPACE && this.player.colliding[1] ) {
          this.player.motion.y = -8;
          this.player.motion.x = -5;
        }
        if( ioState.keys.SPACE && this.player.colliding[3] ) {
          this.player.motion.y = -8;
          this.player.motion.x = 5;
        }
        /*if( ioState.keys.UP )   this.player.motion.y -= 0.3;
        if( ioState.keys.DOWN ) this.player.motion.y += 0.3;
        if(!ioState.keys.UP && !ioState.keys.DOWN) {
          var newYMotion = this.player.motion.y / 2;
          this.player.motion.y = Math.max(Math.abs(newYMotion) < 0.001 ? 0 : newYMotion, 0);
        }*/

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
            h : 0.4,
            w : 0.4       
          },
          colliding : [false, false, false, false],
          getBoundingBoxAt : function( position ){
            return [
              { x : position.x              , y : position.y},
              { x : position.x + this.size.w, y : position.y},
              { x : position.x + this.size.w, y : position.y + this.size.h},
              { x : position.x              , y : position.y + this.size.h}
            ];                 
          },
          direction : function(){
            if(this.motion.x===0  && this.motion.y<0)   { return 0;}
            if(this.motion.x>0    && this.motion.y<0)   { return 1;}
            if(this.motion.x>0    && this.motion.y===0) { return 2;}
            if(this.motion.x>0    && this.motion.y>0)   { return 3;}
            if(this.motion.x===0  && this.motion.y>0)   { return 4;}
            if(this.motion.x<0    && this.motion.y>0)   { return 5;}
            if(this.motion.x<0    && this.motion.y===0) { return 6;}
            if(this.motion.x<0    && this.motion.y<0)   { return 7;}
          },
          meaningfulPoints : function(direction, destinationPoints){
            var firstPointIdx   = Math.floor(direction / 2); 
            var secondPointIdx  = (firstPointIdx + (direction % 2) + 1) % 4;

            return [ destinationPoints[firstPointIdx], destinationPoints[secondPointIdx] ];
          },
          collidingPoints  : function(meaningfulPoints, tileAt){
            var res = meaningfulPoints.filter(function(p){ 
              return tileAt(p) != 0; 
            });
            return res;
          },
          indicesOfPoints : function( points, pointsSubset ){
            return pointsSubset.map(function(p){ return points.indexOf(p); }); 
          },
          getCollisioningFaces : function(collidingPts, indices, direction){
            var faces = [];
            var pIdx;
            var p = collidingPts;
            this.colliding=[false, false, false, false];
            if( collidingPts.length === 1){
              console.log("bip");
              if( ( (pIdx = indices.indexOf(2))!=-1 || (pIdx = indices.indexOf(3))!=-1 ) && (direction === 3 || direction === 4 || direction === 5) ){
                this.colliding[2]=true; 
                faces.push( [2, p[pIdx].y] ); 
              }
              else if( ( (pIdx = indices.indexOf(0))!=-1 || (pIdx = indices.indexOf(1))!=-1 ) && (direction === 7 || direction === 0 || direction === 1) ){
                this.colliding[0]=true; 
                faces.push( [0, p[pIdx].y] ); 
              }
            }
            else if(collidingPts.length >= 2){
              if( (pIdx = indices.indexOf(0))!=-1 &&  indices.indexOf(1)!=-1 ) { 
                this.colliding[0]=true; 
                faces.push( [0, p[pIdx].y] ); 
              }
              if( (pIdx = indices.indexOf(1))!=-1 &&  indices.indexOf(2)!=-1 ) { 
                this.colliding[1]=true; 
                faces.push( [1, p[pIdx].x] ); 
              }
              if( (pIdx = indices.indexOf(2))!=-1 &&  indices.indexOf(3)!=-1 ) { 
                this.colliding[2]=true; 
                faces.push( [2, p[pIdx].y] ); 
              }
              if( (pIdx = indices.indexOf(3))!=-1 &&  indices.indexOf(0)!=-1 ) { 
                this.colliding[3]=true; 
                faces.push( [3, p[pIdx].x] ); 
              }
            }
            return faces;
          },
          correctionVector : function(bBox, collidingPts, direction, correctingVectorFromFace){
            var motion  = this.motion;
            var indices = this.indicesOfPoints(bBox, collidingPts);
            var faces   = this.getCollisioningFaces( collidingPts, indices, direction );

            return faces.map( correctingVectorFromFace ).reduce(function(vectorSum, v){
                  return {
                    x : v.x + vectorSum.x,
                    y : v.y + vectorSum.y
                  }
                }, {x : 0, y : 0});
          }
        };
      },
      logPlayer : function( p ){
        loop.debug( "position.x", p.position.x.toFixed(4) );
        loop.debug( "position.y", p.position.y.toFixed(4) );
        loop.debug( "motion.x"  , p.motion.x.toFixed(4) );
        loop.debug( "motion.y"  , p.motion.y.toFixed(4) );
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
        if(position.y <= 0) return 10;
        if(position.x <= 0) return 10;
        if(position.x > map.width) return 10;

        var mapX = Math.floor(position.x);
        var mapY = Math.floor(position.y);
        return map.data[ mapX + mapY * map.width];
      },
      correctFace : function( face ){
        if( face[0] === 0 ) 
          return { x: 0, y : Math.ceil( face[1]) - face[1] }
        if( face[0] === 1 ) return { y: 0, x : Math.floor(face[1]) - face[1] }
        if( face[0] === 2 ) 
          return { x: 0, y : (Math.floor(face[1]) - face[1]) }
        if( face[0] === 3 ) return { y: 0, x : Math.ceil( face[1]) - face[1]}
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
})();
