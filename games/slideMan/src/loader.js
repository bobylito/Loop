(function( m, loader ){
  var loading = function(resources){
    var text = "loading";
    return {
      resources : resources,
      loaded    : {},
      totalLoad : 0, 
      total     : 0,
      _init     : function(outputManagers, sys, ioState){
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
        if(ressources.sfx){
          if(!outputManagers.webaudio){
            console.log("Trying to load sfx without webaudio outputmanager");
            throw new error("No webaudio implementation");
          }
          this.total += resources.sfx.length;
          resources.sfx.forEach(function( path ){
            var xhr = new XMLHttpRequest();
            var self = this;
            xhr.addEventListener("load", function(){
              var context = outputManagers.webaudio.context;
              context.decodeAudioData(
                xhr.response,
                function(buffer) {
                  if (!buffer) {
                    console.log('error decoding file data: ' + path);
                    return;
                  }
                  var source = context.createBufferSource();
                  source.buffer = buffer;
                  source.connect(context.destination);
                  self.loaded[path] = source;
                  self.totalLoad++;
                },
                function(error) {
                  console.log('decodeAudioData error', error);
                }
              );
            });
            xhr.open("GET", path, true);
            xhr.responseType = "arraybuffer";
            xhr.send();
          }, this);

        }
      },
      animate : function(ioState){
        return this.total > this.totalLoad ;
      },
      render: function(ctx, w, h){
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
})(
    window.micromando = window.micromando || {},
    window.micromando.loader = window.micromando.loader || {}
  );
