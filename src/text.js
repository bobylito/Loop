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
})(
    window.Loop = window.Loop || {},
    window.Loop.text = window.Loop.text || {}
  );
