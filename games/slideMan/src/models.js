(function(m, models){

   models.Player = Player;

  function Player (x, y, w, h){
    this.position = {
      x : x,
      y : y
    };
    this.motion = {
      x : 0,
      y : 0
    };
    this.size = {
      h : h,
      w : w       
    };
    this.isAlive = true;
    this.colliding = [false, false, false, false];
  }

  Player.create = function(mapData){
    var charLayer = mapData.layers.filter(function(l){ return l.name === "character" });
    var start     = charLayer[0].objects.filter( function(o){ return o.name === "start" } )[0];
    return new Player(
            start.x / mapData.tilewidth,
            start.y / mapData.tileheight,
            0.4,
            0.4
          );
  };

  Player.prototype = {
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
  
  function createMap(){}

})(
    window.micromando = window.micromando || {},
    window.micromando.models = window.micromando.models || {}
  )
