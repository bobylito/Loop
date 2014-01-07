(function(micromando, sfxUtils){
  sfxUtils.playBuffer = function(ctx, buffer){
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = function(){
      source.disconnect();
    };
    source.start(0);
  };
})(
    window.micromando         = window.micromando || {},
    window.micromando.sfxUtils= window.micromando.sfxUtils || {}
  );
