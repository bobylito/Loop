(function(m, models){

  models.Player = Player;
  models.Pickup = Pickup;
  models.CapacityPickup = CapacityPickup;

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
    this.capacities = [];
  }

  Player.create = function createPlayer(mapData){
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
    },
    can: function( capacity ){
      return this.capacities.indexOf( capacity ) != -1;
    }
  };
  
  function Map( rawData ){
  
  }

  Map.create = function createMap(){}

  Map.prototype = {
  };

  function Pickup( x, y, w, h) {
    this.position = vec2.fromValues( x, y);
    this.size     = vec2.fromValues( w, h);
  }

  Pickup.knownPickups = {
    "scroll" : CapacityPickup 
  };
  Pickup.create = function( objectData ){ 
    if( !objectData ){
      throw new Error("Pickup invalid : ", objectData);
    }
    if( objectData.type && this.knownPickups[objectData.type] ){
      var t = this.knownPickups[objectData.type];
      return t.create.apply( t, arguments );
    }
    else {
      return new Pickup(
        objectData.x,  
        objectData.y,
        objectData.width, 
        objectData.height
      );
    }
  };
  Pickup.createAll = function(mapData){
    var pickupsL = mapData.layers.filter(function(l){ 
          return l.name === "pickups" 
        })[0];
    return pickupsL.objects.map(function(o){
      return models.Pickup.create(o, mapData.tilewidth, mapData.tileheight);
    });
  };

  Pickup.prototype = {
    collideWith: function( positionnableWithSize ){
                 
    }
  };

  function CapacityPickup(x, y, w, h, cap){
    Pickup.apply(this, arguments);
    this.capacity = cap;
  }

  CapacityPickup.create = function( objectData, txW, txH ){
    return new CapacityPickup(
      objectData.x / txW,
      objectData.y / txH,
      objectData.width / txW,
      objectData.height/ txH,
      objectData.properties.capability   
    );
  };

  CapacityPickup.prototype = new Pickup();
  CapacityPickup.prototype.enhancePlayer = function( player ){
    if(player.capacities.indexOf( this.capacity ) === -1){
      player.capacities.push(this.capacity);
    }
  };


})(
    window.micromando = window.micromando || {},
    window.micromando.models = window.micromando.models || {}
  )
