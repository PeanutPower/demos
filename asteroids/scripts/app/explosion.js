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
      
      this.particleSize = 0.1;
      this.particleColor = 0x7a542e;
      this.numOfParticles = 200;
      this.animationDuration = 2000; // milliseconds
      this.frameDuration = 30; // milliseconds
      this.elapsedTime = 0;
      this.coordsConversion = this.attributes.veroldApps.asteroids.getPhysicsTo3DSpaceConverson();
      this.geometry = new THREE.Geometry();
      this.trajectories = [];

      var i = 0, l = this.numOfParticles;
      for(i=0;i<l;i+=1) {
        var vertex = new THREE.Vector3();
        vertex.x = 0;
        vertex.y = 0;
        vertex.z = 5;

        this.geometry.vertices.push(vertex);
        this.trajectories.push(util.toPolar(this.randomPointWithinRadius(9)));
      }

      this.material = new THREE.ParticleBasicMaterial({
        size: this.particleSize,
        color: new THREE.Color(this.particleColor)
      });

      this.particleSystem = new THREE.ParticleSystem(this.geometry,this.material);

      this.mainScene = this.attributes.veroldApps.asteroids.mainScene;

    },

    trajectoryComponent : function(radius) {
      return ((Math.random()*radius*2)-radius);
    },

    randomPointWithinRadius : function(radius) {
      function inRadius(p,r) {
        return (Math.pow(p.x,2) + Math.pow(p.y,2)) < Math.pow(r,2);
      }

      do {
        point = this.randomPoint(radius);
      } while(!inRadius(point,radius)); 

      return point;
    },

    randomPoint : function(radius) {
      return {x:this.trajectoryComponent(radius),y:this.trajectoryComponent(radius)};
    },

    explode : function(position) {

      var i = 0,
          verts = this.particleSystem.geometry.vertices,
          l = verts.length;
      for(i=0;i<l;i+=1) {
        verts[i].x = (this.attributes.position.x)/this.coordsConversion;
        verts[i].y = -((this.attributes.position.y)/this.coordsConversion);
      }

      this.mainScene.threeData.add(this.particleSystem);

      var animation = util.initTimingLoop(this.frameDuration,this.animate,this);
      var interval = setInterval(animation,0);
      
      setTimeout($.proxy(function() {
        clearInterval(interval);
        this.mainScene.threeData.remove(this.particleSystem);
      },this),this.animationDuration);

    },

    animate : function(time,delta) {

      var i = 0,
          verts = this.particleSystem.geometry.vertices,
          l = verts.length,
          point,
          temp = {x:null, y:null},
          elTime = this.elapsedTime * 0.008;
      for(i=0;i<l;i+=1) {
        temp.mag = this.trajectories[i].mag * elTime;
        temp.dir = this.trajectories[i].dir;
        point = util.toCartesian(temp);
        verts[i].x = (point.x + this.attributes.position.x)/this.coordsConversion;
        verts[i].y = (point.y + -this.attributes.position.y)/this.coordsConversion;
      }
      this.geometry.verticesNeedUpdate = true;
      this.elapsedTime += delta;

    }

  });

  return Explosion;
});

