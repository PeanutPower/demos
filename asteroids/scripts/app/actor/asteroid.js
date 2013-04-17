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

    constructor : function() {
      if(!(this instanceof Asteroid)) {
          return new Asteroid();
      }
    },

    initialize : function() {
      var args = arguments;
      var that = this;
      this.asteroidsApp = window.asteroids.get('asteroidsApp');
      this.asteroidsApp.cloneObjectFromTemplate('asteroid',function(model) {
        args[0].model = model;
        Asteroid.Super.prototype.initialize.apply(that,args);
      });

      this.materials = [];
      // this.initMaterials();
    },

    initMaterials : function() {
      _.times(5,$.proxy(function(){
        var mat = this.asteroidsApp.cloneAssetFromTemplate('asteroidMaterial');
        this.materials.push(mat);
      },this)); 
      console.info(this.materials);
    },

    initModel : function() {

      var angles = [],
          that = this;
      _.times(3,function() { angles.push(Math.random()*(2*Math.PI)); });

      this.attributes.model.traverse(function(obj) {
        if(obj.entityModel.get('name').match(/^default.*/) && obj.type === "mesh") {
          var vec3 = new THREE.Vector3(angles[0],angles[1],angles[2])
          obj.threeData.quaternion.setFromEuler(vec3);
          // assigning a random material from list to each asteroid
          if(this.materials.length) {
            obj.set({
              'payload.material' : that.materials[Math.floor(Math.random()*that.materials.length)]
            });
          }
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

