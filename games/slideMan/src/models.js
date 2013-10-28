(function(m, models, box){

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
    updateCollidingStateWithMap : function(bbox, map ){
      var xpBox = box.expand( box.fromBox( bbox ), 0.01);
      var surroundings = map.surroundingTiles( xpBox, bbox );
      var collideWithXpBox = box.collide.bind( window, xpBox);
      
      this.colliding = surroundings.map( function mix(listOfBloc){
          return listOfBloc.filter( function isCollidible(blocWithType){ return blocWithType[1] != 0; } )
                           .map(    function removeType(  blocWithType){ return blocWithType[0]; } )
                           .reduce( box.merge, undefined );
        })
        .map( function(b){ return Array.isArray(b)  ? b : [0,0,0,0]; } )
        .map( collideWithXpBox );
    },
    collisionBoxesMap : function(box1, box2, map ){
      var xpBox = box2;
      var bbox  = box1;
      var surroundings = map.surroundingTiles( xpBox, bbox );
      var collideWithXpBox = box.collide.bind( window, xpBox);
      
      return surroundings.map( function mix(listOfBloc){
          return listOfBloc.filter( function isCollidible(blocWithType){ return blocWithType[1] != 0; } )
                           .map(    function removeType(  blocWithType){ return blocWithType[0]; } )
                           .reduce( box.merge, undefined );
        })
        .map( function(b){ return Array.isArray(b)  ? b : [0,0,0,0]; } )
        .map( collideWithXpBox );
    },
    correctionVector2 : function( collidingFaces, positionnableBox ){
      var nbFaces = collidingFaces.reduce( function(m, v){return m+v?1:0;}, 0 );
      if(nbFaces > 2) throw new Error("Too much colliding faces!");
      return collidingFaces.reduce(function(m, v, i){
        var p = positionnableBox[i];
        if(v){
          if(i === box.TOP)     return [ m[0],              Math.ceil( p ) - p  ];
          if(i === box.RIGHT)   return [ Math.floor(p) - p, m[1] ];
          if(i === box.BOTTOM)  return [ m[0],              Math.floor(p) - p ];
          if(i === box.LEFT)    return [ Math.ceil(p)  - p, m[1]  ];
        }
        else return m;
      }, [0,0] );
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
    window.micromando.models = window.micromando.models || {},
    window.micromando.box = window.micromando.box || {}
  )
