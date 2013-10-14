(function(m, box){
  /**
   * Utility to do handle collision checking.
   * Boxes are arrays of points/vec2
   * Points are vec2(x,y)
   * Positions and sizes are vec2(x,y) and vec2(w,h)
   */

  box.TOPLEFT     = 0;
  box.TOPRIGHT    = 1;
  box.BOTTOMRIGHT = 2;
  box.BOTTOMLEFT  = 3;

  box.getBoundingBoxAt = function getBoundingBox( position, size ){
    return [
      vec2.fromValues(position[0],            position[1]),
      vec2.fromValues(position[0] + size[0],  position[1]),
      vec2.fromValues(position[0] + size[0],  position[1] + size[1]),
      vec2.fromValues(position[0],            position[1] + size[1])
    ];
  };

  box.collide = function collide(box1, box2){
    return box1.some( isPointInBox.bind(window, box2) );
  }

  function isPointInBox(b, point){
    return b[box.BOTTOMLEFT][1] > point[1] &&
           b[box.TOPLEFT][1]    < point[1] &&
           b[box.TOPRIGHT][0]   > point[0] &&
           b[box.TOPLEFT][0]    < point[0];
  }
})(
    window.micromando = window.micromando || {},
    window.micromando.box = window.micromando.box || {}
  )
