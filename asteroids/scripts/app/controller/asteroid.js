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

  var AsteroidController = my.Class({

    constructor : function() {
      if(!(this instanceof AsteroidController)) {
        return new AsteroidController();
      }

      this.pool = new ObjectPool(Asteroid);
      this.initialize();
    },

    initialize : function() {
      this.astApp = window.asteroids.get('asteroidsApp'),
      this.coordsConvert = this.astApp.getPhysicsTo3DSpaceConverson(),
      this.scale = window.asteroids.get('physics').getScale(),
      this.orthBnds = this.astApp.getOrthBounds(),
      this.angularVelocity = 15;

      this.template = {
        actorType: 'asteroid',
        radius: 4,
        modelScale: 5,
        active: false
      };

      _.times(1, $.proxy(function() {
        this.randomizeTemplate();
        this.template.position = this.newPosition();
        this.pool.alloc(this.template);
      },this));

      this.pool.freeAll();

    },

    sendInAsteroid : function(config) {
      config = config || {};
      var template = _.extend(this.template,config),
          asteroid;

      this.randomizeTemplate();
      this.template.position = this.newPosition();
      this.template.active = true;
      asteroid = this.pool.alloc(template);

      asteroid.onInactive($.proxy(function(){
        this.pool.free(asteroid);
      },this));
    },

    newPosition : function() {
      return {
        x: util.randRange(this.orthBnds.left,this.orthBnds.right)*this.scale*this.coordsConvert,
        y: util.randRange(this.orthBnds.top,this.orthBnds.bottom)*this.scale*this.coordsConvert
      };
    },

    randomizeTemplate : function() {
      _.extend(this.template, {
        angle: util.randRange(0,360),
        initialForce: util.randRange(10,20),
        angularVelocity: util.randRange(-this.angularVelocity,this.angularVelocity)
      });
    }
  });

  return AsteroidController;

});
