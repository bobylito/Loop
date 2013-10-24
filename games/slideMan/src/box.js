(function(m, box){
  /**
   * Utility to do handle collision checking.
   * Boxes are arrays of points/vec2
   * Points are vec2(x,y)
   * Positions and sizes are vec2(x,y) and vec2(w,h)
   */

  box.TOP     = 0;
  box.RIGHT   = 1;
  box.BOTTOM  = 2;
  box.LEFT    = 3;

  box.fromBox = function makeBoxFromBox(bbox){
    return vec4.copy([], bbox);
  };

  box.expand = function expandBox(bbox, value){
    bbox[box.TOP]     -= value;
    bbox[box.RIGHT]   += value;
    bbox[box.BOTTOM]  += value;
    bbox[box.LEFT]    -= value;
    return bbox;
  };

  box.merge = function mergeBox(box1, box2){
    if( !box1 && !box2) throw new Error("At least one box is expected");
    if( !box2 ) return box1;
    if( !box1 ) return box2;
    return [
      Math.min( box1[box.TOP],    box2[box.TOP] ),
      Math.max( box1[box.RIGHT],  box2[box.RIGHT] ),
      Math.max( box1[box.BOTTOM], box2[box.BOTTOM] ),
      Math.min( box1[box.LEFT],   box2[box.LEFT] )
    ];
  }

  box.getBoundingBoxTopLeft = function getBoundingBox( position, size ){
    return [
      position[1],
      position[0] + size[0],
      position[1] + size[1],
      position[0]
    ];
  };

  box.getBoundingBoxCenter = function getBoundingBox( position, size ){
    var half = vec2.scale(vec2.create(), size, 0.5);
    return [
      position[1] - half[1],
      position[0] + half[0],
      position[1] + half[1],
      position[0] - half[0]
    ];
  };

  box.collide = function collide(box1, box2){
    return  box1[box.RIGHT] >= box2[box.LEFT] && 
            box1[box.LEFT]  <= box2[box.RIGHT] &&
            box1[box.BOTTOM]>= box2[box.TOP] &&
            box1[box.TOP]   <= box2[box.BOTTOM];
  }

  function isPointInBox(b, point){
    return b[box.BOTTOM] > point[1] &&
           b[box.TOP]    < point[1] &&
           b[box.RIGHT]  > point[0] &&
           b[box.LEFT]   < point[0];
  }

})(
    window.micromando = window.micromando || {},
    window.micromando.box = window.micromando.box || {}
  )
