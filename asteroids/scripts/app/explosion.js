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
      
      this.hue = 38/360;
      this.saturation = 62.3/100;
      this.baseValue = 67.84;
      this.valueRange = 20;
      
      this.particleSize = 0.1;
      this.particleColor1 = 0x7a542e;
      this.numOfParticles = 1000;
      this.animationDuration = 10000; // milliseconds
      this.frameDuration = 24; // milliseconds
      this.elapsedTime = 0;
      this.coordsConversion = this.attributes.veroldApps.asteroids.getPhysicsTo3DSpaceConverson();
      this.geometry = new THREE.Geometry();
      this.velocityVectors = [];
      this.colors = [];

      var i = 0,
          l = this.numOfParticles,
          vertex,
          value;
      for(i=0;i<l;i+=1) {
        vertex = new THREE.Vector3();
        vertex.x = 0;
        vertex.y = 0;
        vertex.z = 5;

        value = util.randRange(this.baseValue-this.valueRange,this.baseValue+this.valueRange)/100;

        this.colors[i] = new THREE.Color();
        this.colors[i].setHSV(this.hue,this.saturation,value);

        this.geometry.vertices.push(vertex);
        this.velocityVectors.push(util.toPolar(this.randomPointWithinRadius(9)));
      }

      this.geometry.colors = this.colors;

      this.material = new THREE.ParticleBasicMaterial({
        size: this.particleSize,
        transparent: true,
        opacity: 1,
        vertexColors: true,
        depthTest: false,
        depthWrite: false
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
          verts = this.geometry.vertices,
          l = verts.length,
          point,
          temp = {x:null, y:null},
          elTime = this.elapsedTime * 0.008;

      for(i=0;i<l;i+=1) {
        temp.mag = this.velocityVectors[i].mag * elTime;
        temp.dir = this.velocityVectors[i].dir;
        point = util.toCartesian(temp);
        verts[i].x = (point.x + this.attributes.position.x)/this.coordsConversion;
        verts[i].y = (point.y + -this.attributes.position.y)/this.coordsConversion;
      }

      if(this.material.opacity > 0.6) {
        this.material.opacity -= 0.01;
      }

      this.geometry.verticesNeedUpdate = true;
      this.elapsedTime += delta;

    }

  });

  return Explosion;
});

