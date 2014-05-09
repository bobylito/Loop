(function( Loop, text ){
  var simple = function(text, duration){
    return {
      _init   : function(outputs, sys, ioState){
        console.log(ioState.time);
        this.startTime = ioState.time;
      },
      animate : function(ioState){
        return ioState.time < this.startTime + duration ;
      },
      render: function(outputManagers){
          var ctx = outputManagers.canvas2d.context;
          var w = outputManagers.canvas2d.parameters.width;
          var h = outputManagers.canvas2d.parameters.height;
          var m = ctx.measureText(text);
          ctx.fillStyle="white";
          ctx.fillText(text, w/2-m.width/2, h/2);
      }
    };
  };

  /**
   *
   */
  var loading = function(resources){
    var text = "loading";
    return {
      resources : resources,
      loaded    : {},
      totalLoad : 0,
      total     : 0,
      _init     : function(outputs, sys, ioState){
        if(resources.data){
          this.total += resources.data.length;
          resources.data.forEach(function( path ){
            var xhr = new XMLHttpRequest();
            var self = this;
            xhr.addEventListener("load", function(){
              self.loaded[path] = JSON.parse(this.response);
              self.totalLoad++;
            });
            xhr.open("GET", path, true);
            xhr.send();
          }, this);
        }
        if(resources.atlas){
          this.total += resources.atlas.length;
          resources.data.forEach(function(path){
            var atlas = new Atlas();
            var xhr = new XMLHttpRequest();
            var img = new Image();
            var self = this;

            xhr.addEventListener("load", function(){
              atlas.setupFile(this.response);
            });
            xhr.open("GET", path, true);
            xhr.send();

            img.addEventListener("load", function(){
              atlas.setupImg(img);
            });
          }, this);
        }
        if(resources.img){
          this.total += resources.img.length;
          resources.img.forEach(function( imgPath ){
            var img = document.createElement("img");
            var self = this;
            img.addEventListener("load", function(){
              self.loaded[imgPath] = img;
              self.totalLoad++;
            });
            img.src = imgPath;
          }, this);
        }
        if(resources.sfx){
          var context = outputs.webaudio.context;
          var self = this;
          this.total += resources.sfx.length;
          resources.sfx.forEach(function( soundPath ){
            var xhr = new XMLHttpRequest();
            xhr.addEventListener("load", function(){
              context.decodeAudioData(
                xhr.response,
                function(buffer){
                  self.loaded[soundPath] = buffer;
                  self.totalLoad++;
                }
              );
            });
            xhr.open("GET", soundPath, true);
            xhr.responseType = "arraybuffer";
            xhr.send();
          });
        }
      },
      animate : function(ioState){
        return this.total > this.totalLoad ;
      },
      render: function(outputManagers){
        var ctx = outputManagers.canvas2d.context;
        var w = outputManagers.canvas2d.parameters.width;
        var h = outputManagers.canvas2d.parameters.height;
        var m = ctx.measureText(text);
        ctx.fillStyle="white";
        ctx.fillText(text, w/2-m.width/2, h/2);
      },
      result : function(){
        return this.loaded;
      }
    };
  };

  text.simple   = simple;
  text.loading  = loading;

  function Atlas(){
    this.items = {};
    this.img = null;
  }
  Atlas.parseLine = function( line ){
    var data = line.match(Atlas.REGEX);
    return data !== null ?
      new AtlasItem( data[1],
          [data[4], data[5]],
          [data[2], data[3]]
      ) : null;
  };
  Atlas.REGEX =
    /([a-zA-Z0-9_]+) ([0-9]+) ([0-9]+) ([0-9]+\.[0-9]+) ([0-9]+\.[0-9]+) ([0-9]+\.[0-9]+) ([0-9]+\.[0-9]+)/;
  Atlas.prototype = {
    drawItem: function(name){},
    setupFile:function(atlasFile){
      var lines = atlasFile.split("\n");
      lines.map(Atlas.parseLine)
           .forEach( function(item){
             if(item !== null) this.items[item.name] = item;
           });
      this.setupFile = null;
    },
    setupImg : function(img){
      this.img = img;
      this.setupImg = null;
    }
  };

  function AtlasItem( name, position, size ){
    this.name = name;
    this.position = position;
    this.size = size;
  }
})(
    window.Loop = window.Loop || {},
    window.Loop.text = window.Loop.text || {}
  );
