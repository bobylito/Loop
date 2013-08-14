(function(){
  /*
   * Provides an efficient way to log stuff about what is happening in the animation
   */
  var debug = function(){
    var outDom = document.createElement("div");
    document.body.appendChild(outDom);
    return { 
      _out : outDom,
      _messages : [],
      _init     : function(w, h, animationSystem){
        var logger = this;
        animationSystem.debug = function( key, value ){
          logger._messages.push([key, value]);
        };
      },
      animate   : function(){ return true},
      render    : function(){
        var orderedMessages = this._messages.sort( function(m1, m2){ return m1[0].localeCompare(m2[0]); });
        this._out.innerHTML = orderedMessages.reduce( function(msg, m){
          return msg + m[0] + " : " + m[1] + "<br/>"
        }, "");
        this._messages=[];
      }
    };
  };

  Loop.tools = {
    debug : debug
  };
})();
