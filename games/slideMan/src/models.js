(function(m, models){

  models.Player = Player;
  models.Pickup = Pickup;
  models.CapacityPickup = CapacityPickup;

  function Player (x, y, w, h){
    this.position = [x,y];
    this.motion = [0,0];
    this.size = [w,h];
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
      0.28,
      0.74
    );
  };

  Player.prototype = {
    getBoundingBoxAt : function( position ){
      return [
        [position[0]                , position[1]],
        [position[0] + this.size[0] , position[1]],
        [position[0] + this.size[0] , position[1] + this.size[1]],
        [position[0]                , position[1] + this.size[1]]
      ];
    },
    direction : function(){
      if(this.motion[0]===0  && this.motion[1]<0)   { return 0;}
      if(this.motion[0]>0    && this.motion[1]<0)   { return 1;}
      if(this.motion[0]>0    && this.motion[1]===0) { return 2;}
      if(this.motion[0]>0    && this.motion[1]>0)   { return 3;}
      if(this.motion[0]===0  && this.motion[1]>0)   { return 4;}
      if(this.motion[0]<0    && this.motion[1]>0)   { return 5;}
      if(this.motion[0]<0    && this.motion[1]===0) { return 6;}
      if(this.motion[0]<0    && this.motion[1]<0)   { return 7;}
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
    updateCollidingStateWithMap : function(box, ){

      this.colliding=[false, false, false, false];
      this.colliding[3]=true; 
    },
    getCollisioningFaces : function(collidingPts, indices, direction){
      var faces = [];
      var pIdx;
      var p = collidingPts;
      if( collidingPts.length === 1){
        console.log("bip");
        if( ( (pIdx = indices.indexOf(2))!=-1 || (pIdx = indices.indexOf(3))!=-1 ) && (direction === 3 || direction === 4 || direction === 5) ){
          faces.push( [2, p[pIdx][1]] ); 
        }
        else if( ( (pIdx = indices.indexOf(0))!=-1 || (pIdx = indices.indexOf(1))!=-1 ) && (direction === 7 || direction === 0 || direction === 1) ){
          faces.push( [0, p[pIdx][1]] ); 
        }
      }
      else if(collidingPts.length >= 2){
        if( (pIdx = indices.indexOf(0))!=-1 &&  indices.indexOf(1)!=-1 ) { 
          faces.push( [0, p[pIdx][1]] ); 
        }
        if( (pIdx = indices.indexOf(1))!=-1 &&  indices.indexOf(2)!=-1 ) { 
          faces.push( [1, p[pIdx][0]] ); 
        }
        if( (pIdx = indices.indexOf(2))!=-1 &&  indices.indexOf(3)!=-1 ) { 
          faces.push( [2, p[pIdx][1]] ); 
        }
        if( (pIdx = indices.indexOf(3))!=-1 &&  indices.indexOf(0)!=-1 ) { 
          faces.push( [3, p[pIdx][0]] ); 
        }
      }
      this.colliding.forEach( function(c,i){
        loop.debug("character["+i+"]", c);
      });
      return faces;
    },
    correctionVector : function(bBox, collidingPts, direction, correctingVectorFromFace){
      var motion  = this.motion;
      var indices = this.indicesOfPoints(bBox, collidingPts);
      var faces   = this.getCollisioningFaces( collidingPts, indices, direction );

      return faces.map( correctingVectorFromFace ).reduce(function(vectorSum, v){
        return vec2.add(vectorSum, vectorSum, v)
      }, [0,0]);
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
