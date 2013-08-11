(function(loop){
  loop.addIO(Loop.io.time);
 
  loop.registerAnimation( ground() ); 
  loop.registerAnimation( background() ); 
  loop.start();
 
  function ground(){
    return {
      animate : function(){
        return true;
      },
      render  : function(ctx, w, h){
      }
    }
  }
  function background(){
    return {
      animate : function(){
        return true;
      },
      render  : function(ctx, w, h){}
    }
  }
})(
    window.loop
  );
