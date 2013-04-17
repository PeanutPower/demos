/*global define:true, my:true */

define([
  'myclass',
  'app/actor/asteroid',
  'app/util/objectpool',
  'app/util/util'
] , function(
  my,
  Asteroid,
  ObjectPool,
  util
) {

  var astApp = window.asteroids.get('asteroidsApp'),
      coordsConvert = astApp.getPhysicsTo3DSpaceConverson(),
      events = window.asteroids.get('events'),
      scale = astApp.get('physics').getScale(),
      orthBnds = astApp.getOrthBounds(),
      angularVelocity = 15;

  var AsteroidController = my.Class({

    pool : new ObjectPool(Asteroid),

    template : {
      actorType: 'asteroid',
      angle: util.randRange(0,360),
      initialForce: util.randRange(10,20),
      angularVelocity: util.randRange(-angularVelocity,angularVelocity),
      radius: 4,
      modelScale: 5
    },

    constructor : function() {
      if(!(this instanceof AsteroidController)) {
        return new AsteroidController();
      }

      this.initialize();
    },

    initialize : function() {

      _.times(15, $.proxy(function() {
        this.template.position = this.newPosition();
        this.pool.alloc(this.template);
      },this));

      this.pool.freeAll();
    },

    sendInAsteroid : function() {
    
      
    },

    newPosition : function() {
      return {
        x: util.randRange(orthBnds.left,orthBnds.right)*scale*coordsConvert,
        y: util.randRange(orthBnds.top,orthBnds.bottom)*scale*coordsConvert
      };
    }
  });

  return AsteroidController;

});
