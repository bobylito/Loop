
API 
===

when( "pickup" ).is( "taken" ).then( "player", function(){ } )

entities.take("pickup").is("colliding").with("player").then(
  function(pickup, player){
    pickup.deathPill();
    player.addPickup(pickup);
  }
);
