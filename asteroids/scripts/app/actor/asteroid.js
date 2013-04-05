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

    initModel : function() {

      var angles = [];
      _.times(3,function() { angles.push(Math.random()*(2*Math.PI)); });

      this.attributes.model.traverse(function(obj) {
        if(obj.entityModel.get('name').match(/^default.*/) && obj.type === "mesh") {
          var vec3 = new THREE.Vector3(angles[0],angles[1],angles[2])
          obj.threeData.quaternion.setFromEuler(vec3);
        }
      });

    },

    projectileCollision : function(collider) {
      var pos = {x:this.attributes.position.x,y:this.attributes.position.y};
      window.asteroids.get('events').trigger('game:collision:asteroid-projectile',pos);
      this.setActive(false);
    }

  });

  return Asteroid;

});

