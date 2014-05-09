(function(m, metaModels){
  function Positionnnable(){};
  Positionnable.prototype = {
    setPosition : function(x, y){
      if(x != this.position[0] || y != this.position[1]){
        this.position = vec2.fromValues(x, y);
        this.box = box.getBoundingBoxTopLeft(this.position, this.size);
      }
      return this.box;
    } 
  }
})(
    window.micromando = window.micromando || {},
    window.micromando.metaModels = window.micromando.metaModels || {}
  )
