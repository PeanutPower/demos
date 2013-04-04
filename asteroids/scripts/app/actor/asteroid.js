/*global define:true, my:true  */

define([
  'myclass',
  'app/actor/actor',
  'app/util/util'
] , function(
  my,
  Actor,
  util
) {

  Asteroid = my.Class(Actor,{

    collisionEvents : {
      'projectile' : 'projectileCollision'
    },

    constructor : function(config) {
      if(!(this instanceof Asteroid)) {
          return new Asteroid(config);
      }

      this.attributes = _.extend({},config);

      Asteroid.Super.call(this,this.attributes);
    },

    projectileCollision : function(collider) {
      var pos = {x:this.attributes.position.x,y:this.attributes.position.y};
      window.asteroids.get('events').trigger('game:collision:asteroid-projectile',pos);
      this.setActive(false);
    }

  });

  return Asteroid;

});

