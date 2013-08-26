(function( Loop, io, meta, textM, tools ){

  loop.addIO( io.time );
  loop.addIO( io.mouse());
  loop.addIO( Loop.io.keyboard( {"UP":38,"DOWN":40,"LEFT":37,"RIGHT":39,"SPACE":32} ) );

  var game = meta.andThen(
      textM.loading({
        img : ["title.png"],
        data : []
      }),
      introScreen(),
      gameScreen(),
      scoreScreen()
    );

  loop.registerAnimation(game);

  loop.start();

  function introScreen(){
    return {
      _init:function(w, h, sys, ioState, resources){
        this.img = resources["title.png"];
        this.start = ioState.time;
      },
      render:function(ctx, w, h){
        ctx.drawImage(this.img, 0, 0); 
      },
      animate:function(ioState){
        return (ioState.time - this.start) < 1000;
      }
    };
  };

  function scoreScreen(){
    return {
      _init : function(w, h, sys, ioState, result){
        var pt = this._points = result.positive ? parseFloat((1 - result.time).toFixed(3)) * 10000 : 0;
        if(pt < 3000) this._rank = "E";
        else if(pt < 4000) this._rank = "D";
        else if(pt < 6000) this._rank = "C";
        else if(pt < 8000) this._rank = "B";
        else if(pt < 9000) this._rank = "A";
        else this._rank = "S";
      },
      render:function(ctx, w, h){
        ctx.fillStyle = "#fff";
        ctx.font = "40px monospace";
        var scoreSize = ctx.measureText("SCORE").width;
        ctx.fillText("SCORE", w / 2 - scoreSize/2, h /2 - 100);

        var pt = ""+this._points;
        var ptSize = ctx.measureText(pt).width;
        ctx.fillText(pt, w / 2 - ptSize/2, h /2 - 20);

        var rank = "RANK : "+this._rank;
        var rankSize = ctx.measureText(rank).width;
        ctx.fillText(rank, w / 2 - rankSize/2, h /2 + 30);

        var spaceToRestart = "Press space to play again";
        var spaceSize = ctx.measureText(spaceToRestart).width;
        ctx.fillText( spaceToRestart, w/2 - spaceSize/2, h/2 + 200 );
      },
      animate:function(ioState){
        if(ioState.keys.SPACE) {
          window.location = window.location;
        }
        return true;
      }
    };
  }

  function gameScreen(){
    return meta.all(
      meta.andThen( 
        writeText("hey Shinji, it's good to have you on the phone"), 
        writeText("Unfornately, I'm on the rush righ now"),
        writeText("What did you want to tell me?"),
        meta.some( 
          timer(),
          quizz()
        ),
        writeText("Sorry, I must leave. Bye!"),
        scoreScreen()
        ));
  }

  function quizz(){
    var genƒ = function(){
      return meta.andThen(
        text([
          "How are you doing since... today?",
          "Your were glooming today, what has changed in you?",
          "Can you tell me where do you go for your yoga classes?",
          "What about we go to the basketball tomorrow night?",
          "I happen to have the last tickets for the Robbie Williams concert, wanna come?"
        ], {x: 10, y : 300}),
        answer()
      );
    }

    var untilƒ = function(res){
      return !!res.end;
    }

    return meta.until(genƒ, untilƒ);
  }

  function writeText( sentence, boundingBox ){
    return {
      _init : function(w, h, sys, ioState, lastRes){
        this._timeStart = ioState.time;
        this._charAt = 0;
        this._result = lastRes;
      },
      animate : function(ioState, w, h){
        var deltaT = ioState.time  - this._timeStart;
        this._chartAt = Math.floor(sentence.length * (deltaT / 800)), sentence.length;
        return deltaT < 1000 ;
      },
      render : function(ctx, w, h){
        var s = sentence.substring(0, this._chartAt);
        ctx.font = "15px monospace";
        ctx.fillStyle = "pink";
        ctx.fillText( s, 0, 100, w );
      },
      result : function(){
        return this._result;         
      }
    };
  };

  function answer( ){
    var answers = [
      {text : "... fine, and you? You seem anxious.", end : false},
      {text : "Thanks! I've changed shampoo brand since last week.", end:false},
      {text : "Sure. It's at Shinjuku, I'll give you the address tomorow.", end:false},
      {text : "Yeah! Sure! I love a good game with some beers!", end: true, positive:true},
      {text : "Really! I didn't you were this lame...", end : true, positive:false}
    ];
    return {
      _init : function(w, h, sys, ioState, question){
        this._timeStart = ioState.time;
        this.answer = answers[question];
        this._charAt = 0;
      },
      animate : function(ioState, w, h){
        var deltaT = ioState.time  - this._timeStart;
        this._chartAt = Math.floor(this.answer.text.length * (deltaT / 800));
        return (deltaT < (1000));
      },
      render : function(ctx, w, h){
        var s = this.answer.text.substring(0, this._chartAt);
        ctx.font = "15px monospace";
        ctx.fillStyle = "pink";
        ctx.fillText( s, 0, 100, w );
      },
      result : function(){
        return this.answer;
      }
    };
  };
  
  function timer(){
    var ttl = 10000;
    return {
      _init : function(w, h, sys, ioState){
        this._timeStart = ioState.time;
        this._used = 0;
        this._result = {end:false};
      },
      render  : function(ctx, w, h){
        ctx.fillStyle = "red";
        ctx.fillRect(0,0, w * this._used, 5);
      },
      animate : function(ioState, w, h){
        var continueAnim = true;
        var deltaT = ioState.time - this._timeStart;

        if(deltaT > ttl) continueAnim = false;
        else this._used = deltaT/ttl;

        this._result = {endTime:continueAnim};
        return continueAnim;
      },
      result:function(){
        return {time : this._used};
      }
    };
  }

  function text( lines, offset ){
    if(!lines && !lines.length) throw new Error("Lines must be a non empty array!");
    return {
      _selected : 0,
      _lines    : lines,
      _acc      : 0,
      _result   : -1,
      _init     : function(){},
      render    : function(ctx, w, h){
        this._lines.forEach(function(l, it){
          ctx.font = "15px monospace";
          ctx.fillStyle = it === this._selected ? "#fff": "#aaa";
          ctx.fillText( l,0 + offset.x, 15 * (it +1)+ offset.y, w - offset.x);
        }, this);
      },
      animate   : function(ioState){
        if(ioState.keys.UP){
          this._acc = this._acc > 0 ? -1 : this._acc-1;
        }
        if(ioState.keys.DOWN){
          this._acc = this._acc < 0 ? 1 : this._acc+1;
        }
        if(this._acc <= -3){
          this._acc = 0;
          this._selected = Math.max(0, this._selected - 1);
        }
        if(this._acc >= 3){
          this._acc = 0;
          this._selected = Math.min( this._lines.length - 1, this._selected + 1);
        }

        if(ioState.keys.SPACE){
          this._result = this._selected;
          return false;
        }

        return true;
      },
      result:function(){
        return this._result;       
      }
    };
  }
})(
  window.Loop, window.Loop.io, window.Loop.meta, window.Loop.text, window.Loop.tools
  );
