/*global define:true */

define([],function() {
  
  function Explosion(config) {
    if(!(this instanceof Explosion)) {
      return new Explosion(config);
    }

    this.attributes = {};
    
    // all of these values are defaults and can be overriden
    // by a configuration object passed to constructor

    // color and alpha settings
    this.attributes.hue = 1;
    this.attributes.saturation = 1;
    this.attributes.value = 1;
    this.attributes.valueRange = 0;
    this.attributes.opacity = 1;
    this.attributes.opacityDelta = 0;
    this.attributes.opacityLowerBoundry = 0.6;
    
    // particle settings
    this.attributes.particleSize = 0.1;
    this.attributes.numOfParticles = 1000;
    this.attributes.animationDuration = 10000; // milliseconds
    this.attributes.frameDuration = 24; // milliseconds
    this.attributes.coordsConversion = 1;

    this.attributes = this.extend(this.attributes,config);

    this.initialize();
  }

  Explosion.prototype = { 

    constructor: Explosion,

    extend : function(destination,source) {
      var objProp = null;
      for(objProp in source) {
        if(source.hasOwnProperty(objProp)) {
          destination[objProp] = source[objProp];
        }
      }

      return destination;
    },

    initialize : function() {
      this.elapsedTime = 0;
      this.geometry = new THREE.Geometry();
      this.velocityVectors = [];
      this.colors = [];

      var i = 0,
          l = this.attributes.numOfParticles,
          vertex,
          value,
          valDiff;

      for(i=0;i<l;i+=1) {
        vertex = new THREE.Vector3();
        vertex.x = 0;
        vertex.y = 0;
        vertex.z = 5;

        valDiff = this.attributes.value - this.attributes.valueRange;
        value = this.attributes.value + (Math.random() * valDiff) - (Math.random() * valDiff);

        this.colors[i] = new THREE.Color();
        this.colors[i].setHSV(this.attributes.hue,this.attributes.saturation,value);

        this.geometry.vertices.push(vertex);
        this.velocityVectors.push(this.toPolar(this.randomPointWithinRadius(9)));
      }

      this.geometry.colors = this.colors;

      this.material = new THREE.ParticleBasicMaterial({
        size: this.attributes.particleSize,
        transparent: true,
        opacity: this.attributes.opacity,
        vertexColors: true,
        depthTest: false,
        depthWrite: false
      });

      this.particleSystem = new THREE.ParticleSystem(this.geometry,this.material);

    },

    explode : function() {

      var i = 0,
          verts = this.particleSystem.geometry.vertices,
          l = verts.length;
      for(i=0;i<l;i+=1) {
        verts[i].x = (this.attributes.position.x)/this.attributes.coordsConversion;
        verts[i].y = -((this.attributes.position.y)/this.attributes.coordsConversion);
      }

      this.attributes.mainScene.threeData.add(this.particleSystem);

      var animation = this.initTimingLoop(this.attributes.frameDuration,this.animate,this);
      var interval = setInterval(animation,0);
      
      setTimeout($.proxy(function() {
        clearInterval(interval);
        this.attributes.mainScene.threeData.remove(this.particleSystem);
      },this),this.attributes.animationDuration);

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
        point = this.toCartesian(temp);
        verts[i].x = (point.x + this.attributes.position.x)/this.attributes.coordsConversion;
        verts[i].y = (point.y + -this.attributes.position.y)/this.attributes.coordsConversion;
      }

      if(this.material.opacity > this.attributes.opacityLowerBoundry) {
        this.material.opacity -= this.attributes.opacityDelta;
      }

      this.geometry.verticesNeedUpdate = true;
      this.elapsedTime += delta;

    },

    generateVectorComponent : function(radius) {
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
      return {
        x:this.generateVectorComponent(radius),
        y:this.generateVectorComponent(radius)
      };
    },

    /**
    * randRange returns either a number 
    * from 0 to supplied positive integer
    * (single argument), or return a rand num
    * from "floor" first arg, to "ceiling" second arg
    *
    * result will never excede the high number - 1
    *
    * @method:randRange
    * @param:highOrLow high is only arg
    * @param:highOnly
    */
    randRange : function() {
      var args = Array.prototype.slice.call(arguments),
          multiplyer, floor;

      if(args.length > 1) {
        multiplyer = args[1]-args[0];
        floor = args[0] + 1;
      } else {
        multiplyer = args[0];
        floor = 0;
      }
      return floor + Math.floor(Math.random() * multiplyer);
    },

    calcMagnitude : function(p) {
      return this.round(Math.sqrt(Math.pow(p.x,2)+Math.pow(p.y,2)),5);
    },

    calcAngle : function(p) {
      return this.round(Math.atan2(p.y,p.x),5);
    },

    toPolar : function(p){
      return {'mag':this.calcMagnitude(p),'dir':this.calcAngle(p)};
    },

    initTimingLoop : function(timing,callback,context) {
      var time = +new Date();
      return function() {
        var now = (+new Date());
        if(now-time > timing) {
          callback.call(context,time,now-time);
          time = +new Date();
        }
      };
    },

    toCartesianX : function(mag,dir){
      return this.round(mag * Math.cos(dir),5);
    },

    toCartesianY : function(mag,dir){
      return this.round(mag * Math.sin(dir),5);
    },

    toCartesian : function (vec) {
      return {
        'x':this.toCartesianX(vec.mag,vec.dir),
        'y':this.toCartesianY(vec.mag,vec.dir)
      };
    },

    round : function(num,decimals) {
      var base10 = Math.pow(10,decimals);
      return Math.round(num*base10)/base10;
    }

  };

  return Explosion;
});

