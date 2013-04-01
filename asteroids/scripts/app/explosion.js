/*global define:true */

define([
  'myclass',
  'app/util',
  'app/customevents'
  // 'Box2D'
] , function(
  my,
  util,
  CustomEvents
) {
  
  Explosion = my.Class({

    constructor : function(config) {
      if(!(this instanceof Explosion)) {
        return new Explosion(config);
      }

      this.attributes = {},
      this.attributes = _.extend(this.attributes,config);
      this.initialize();
    },

    initialize : function() {
      
      this.geometry = new THREE.Geometry();

      var i = 0, l = 200;
      for(i=0;i<l;i+=1) {
        var vertex = new THREE.Vector3();
        vertex.x = 0;
        vertex.y = 0;
        vertex.z = 5;

        this.geometry.vertices.push(vertex);
      }

      this.material = new THREE.ParticleBasicMaterial({
        size: 0.1,
        color: new THREE.Color(0xfff0d4)
      });

      this.particleSystem = new THREE.ParticleSystem(this.geometry,this.material);

      this.mainScene = this.attributes.veroldApps.asteroids.mainScene;
      this.coordsConversion = this.attributes.veroldApps.asteroids.getPhysicsTo3DSpaceConverson();
    },

    explode : function(position) {

      var i = 0,
          l = this.geometry.vertices.length,
          vertex = null;
      for(i=0;i<l;i+=1) {
        vertex = this.geometry.vertices[i];
        vertex.x = position.x / this.coordsConversion;
        vertex.y = -(position.y / this.coordsConversion);
      }

      this.mainScene.threeData.add(this.particleSystem);

      var animation = util.initTimingLoop(60,this.animate,this);
      var interval = setInterval(animation,0);
      
      setTimeout($.proxy(function() {
        clearInterval(interval);
        this.mainScene.threeData.remove(this.particleSystem);
      },this),500);

    },

    animate : function() {
      
      var i = 0,
          l = this.particleSystem.geometry.vertices.length;
      for(i=0;i<l;i+=1) {
        this.particleSystem.geometry.vertices[i].x += (((Math.random() * 10)-5)/this.coordsConversion);
        this.particleSystem.geometry.vertices[i].y += -(((Math.random() * 10)-5)/this.coordsConversion);
      }
      this.geometry.verticesNeedUpdate = true;

    }

  });

  return Explosion;
});

