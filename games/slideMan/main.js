(function(){
  var loading = Loop.text.loading({
    img : ["ouno.png", "textureMap.png"],
    data : ["map.json"]
  });

  var m = cameraMap();
  var c = character();
  var game = gameScreen( m, c ); 

  loop.addIO( Loop.io.keyboard( {"UP":38,"DOWN":40,"LEFT":37,"RIGHT":39,"SPACE":32} ) );
  loop.registerAnimation( Loop.meta.andThen(loading, game) );
  loop.start();

  function gameScreen(){
    var allAnimations   = Loop.meta.all.apply(window, arguments);
    var gameScreenAnim  = {
      _init   : function(w, h, sys, ioState, resources){
        var newArgs = Array.prototype.splice.call(arguments, 0);
        this.player = this.createPlayer(resources["map.json"]);
        newArgs.push( this.player );
        allAnimations._init.apply(allAnimations, newArgs);
      },
      render  : allAnimations.render.bind(allAnimations),
      animate : function(ioState, width, height){ 
        if(ioState.keys.LEFT)  this.player.position.x -= 0.1;
        if(ioState.keys.RIGHT) this.player.position.x += 0.1;
        if(ioState.keys.UP)    this.player.position.y -= 0.1;
        if(ioState.keys.DOWN)  this.player.position.y += 0.1;
        return allAnimations.animate.apply(allAnimations, arguments);
      },
      createPlayer : function(mapData){
        var charLayer = mapData.layers.filter(function(l){ return l.name === "character" });
        var start     = charLayer[0].objects.filter( function(o){ return o.name === "start" } )[0];
        return {
          position : {
            x : start.x / mapData.tilewidth,
            y : start.y / mapData.tileheight
          } 
        };
      }
    };
      
    return gameScreenAnim;
  }

  function character(){
    return {
      _init : function(w, h, sys, ioState, resources, character){
        this.sprite = resources["ouno.png"];
        this.model  = character;
      },
      render  : function(ctx, w, h){
        ctx.drawImage(this.sprite, w/2, h/2);
      },
      animate : function(ioState, w, h){
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
      }
    };
  }
})();
