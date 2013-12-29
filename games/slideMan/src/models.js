(function(m, models, box){

  models.Player = Player;
  models.Pickup = Pickup;
  models.CapacityPickup = CapacityPickup;
  models.Ennemy     = Ennemy;
  models.Activable  = Activable;

  function Player (x, y, w, h){
    this.position = [x,y];
    this.motion = [0,0];
    this.size = [w,h];
    this.isAlive = true;
    this.missionComplete = false;
    this.colliding = [false, false, false, false];
    this.capacities = ["jump"];
    this.actions = {
      jump:false
    }
  }

  Player.create = function createPlayer(mapData){
    var charLayer = mapData.layers.filter(function(l){ return l.name === "character" });
    var start     = charLayer[0].objects.filter( function(o){ return o.name === "start" } )[0];
    return new Player(
      start.x / mapData.tilewidth,
      start.y / mapData.tileheight,
      0.56,
      1.48
    );
  };

  Player.prototype = {
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
    correctionVector : function( collidingFaces, positionnableBox ){
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
    },
    resetActions : function(){
      for(action in this.actions){
        if(this.actions.hasOwnProperty(action)){
          this.actions[action] = false;
        }
      }
    }
  };
  
  function Map( rawData ){
  
  }

  Map.create = function createMap(){}

  Map.prototype = {
  };

  function Activable(x, y, w, h, type, properties){
    this.position = vec2.fromValues(x,y);
    this.size     = vec2.fromValues(w,h);
    this.type     = type;
    this.box      = box.getBoundingBoxTopLeft(this.position, this.size);
    this.properties = properties;
  }

  Activable.create = function( objectData, tileSize ){
    return new Activable(
          objectData.x / tileSize[0],
          objectData.y / tileSize[1],
          objectData.width / tileSize[0],
          objectData.height/ tileSize[1],
          objectData.type,
          objectData.properties
        );
  };

  Activable.createAll = function(mapData){
    var activableL = mapData.layers.filter(function(l){ 
          return l.name === "activable" 
        })[0];
    var tileSize = [mapData.tilewidth, mapData.tileheight];
    return activableL.objects.map(function(o){
      return models.Activable.create(o, tileSize);
    });
  };

  Activable.prototype = {
    setPosition : function(p){
      if(p[0] != this.position[0] || p[1] != this.position[1]){
        this.position = p;
        this.box = box.getBoundingBoxTopLeft(this.position, this.size);
      }
      return this.box;
    },
    activate : function( character ){
      if(this.properties.position){
        var pos = JSON.parse(this.properties.position);
        character.position = pos;
      }
      if(this.properties.requiredProperty){
        var requiredProperty = this.properties.requiredProperty;
        if(character[requiredProperty]){
          character.missionComplete = true;
        }
      }
    }
  };

  function Ennemy( x, y, w, h, type ){
    var config = Ennemy.config[type];
    this.position = vec2.fromValues(x, y);
    this.size     = vec2.fromValues(w, h);
    this.box      = box.getBoundingBoxTopLeft(this.position, this.size);
    this.motion   = config.motion;
    this.type     = type;
    this.pixPos   = config.pixPosition;
  }

  Ennemy.config = {
    "roomba" : {
      "pixPosition" : [4,0],
      "motion" :[-0.1, 0.1] 
    },
    "fireblock" : {
      "pixPosition" : [3,1],
      "motion" :[0, 0] 
    }
  }

  Ennemy.create = function( objectData, tileSize ){
    if( !Ennemy.config[objectData.type] ){
      throw new Error("Can't create ennemy : type ["+ objectData.type + "] undefined");
    }
    return new Ennemy(
          objectData.x / tileSize[0],
          objectData.y / tileSize[1],
          objectData.width / tileSize[0],
          objectData.height/ tileSize[1],
          objectData.type
        );
  };

  Ennemy.createAll = function(mapData){
    var baddiesL = mapData.layers.filter(function(l){ 
          return l.name === "badies" 
        })[0];
    var tileSize = [mapData.tilewidth, mapData.tileheight];
    return baddiesL.objects.map(function(o){
      return models.Ennemy.create(o, tileSize);
    });
  };

  Ennemy.prototype = {
    setPosition : function(p){
      if(p[0] != this.position[0] || p[1] != this.position[1]){
        this.position = p;
        this.box = box.getBoundingBoxTopLeft(this.position, this.size);
      }
      return this.box;
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
    correctionVector : function( collidingFaces, positionnableBox ){
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
    hurt : function( player ){
      player.isAlive = false;
    }
  };

  function Pickup( x, y, w, h ) {
    this.position = vec2.fromValues( x, y);
    this.size     = vec2.fromValues( w, h);
  }

  Pickup.knownPickups = {
    "scroll" : ObjectPickup
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
  CapacityPickup.prototype.activate = function( player ){
    if(player.capacities.indexOf( this.capacity ) === -1){
      player.capacities.push(this.capacity);
    }
  };

  function ObjectPickup(x, y, w, h, cap){
    Pickup.apply(this, arguments);
    this.Object = cap;
  }

  ObjectPickup.create = function( objectData, txW, txH ){
    return new ObjectPickup(
      objectData.x / txW,
      objectData.y / txH,
      objectData.width / txW,
      objectData.height/ txH,
      objectData.properties.capability   
    );
  };

  ObjectPickup.prototype = new Pickup();
  ObjectPickup.prototype.activate = function( player ){
    player.scroll = true;
  };


})(
    window.micromando = window.micromando || {},
    window.micromando.models = window.micromando.models || {},
    window.micromando.box = window.micromando.box || {}
  )
