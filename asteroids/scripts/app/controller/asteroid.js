/*global define:true, my:true */

define([
  'myclass',
  'app/actor/asteroid',
  'app/util/objectpool'
] , function(
  my,
  Asteroid,
  ObjectPool
) {

  var AsteroidController = my.Class({

    constructor : function() {
      if(!(this instanceof AsteroidController)) {
        return new AsteroidController();
      }

      this.initialize();
    },

    initialize : function() {
      this.asteroidsApp = window.asteroids.get('asteroidsApp');
      this.events = window.asteroids.get('events');
    },

    sendInAsteroid : function() {
    
      
    }
  });

  return AsteroidController;

});
