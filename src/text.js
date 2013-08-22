Loop.text = (function( ){
  var simple = function(text, duration){
    return {
      _init   : function(w, h, sys, ioState){
        this.startTime = ioState.time;
      },
      animate : function(ioState){return ioState.time < this.startTime + duration ;},
      render: function(ctx, w, h){
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
      _init     : function(w, h, sys, ioState){
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

  return {
    simple: simple,
    loading : loading
  };
})();
