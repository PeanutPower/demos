/*global define:true, my:true */
define([
    'myclass',
    'app/actor/actor',
    'app/util/util'
] , function(
    my,
    Actor,
    util
) {
    
  Projectile = my.Class(Actor,{

    collisionEvents : {
      'asteroid' : 'asteroidCollision'
    },

    constructor : function(config) {
      if(!(this instanceof Projectile)) {
          return new Projectile(config);
      }

      this.attributes = _.extend({},config);

      Projectile.Super.call(this,this.attributes);

    },

    setActive : function(active) {
      Projectile.Super.prototype.setActive.call(this,active);

      if(active) {
        // specify lifespan for projectile
        setTimeout($.proxy(function() {
          this.setActive(false);
        },this), 500);
      }
    },

    asteroidCollision : function(collider) {
      this.setActive(false);
    }

  });

  return Projectile;

});
