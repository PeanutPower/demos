/*global define:true */

define(function() {

  var aSlice = Array.prototype.slice,
      oToString = Object.prototype.toString,
      oType = function(o) {
        return oToString.call(o,0).slice(8,-1).toLowerCase();
      };
  
  function Explosion() {
    if(!(this instanceof Explosion)) {
      return new Explosion();
    }
  }

  Explosion.prototype = { 

    constructor: Explosion,

    vector : {mag:0,dir:0},
    point : {x:0,y:0},

    buildComponents : function() {

      this.asteroidsApp = window.asteroids.get('asteroidsApp');
      this.veroldApp = window.asteroids.get('veroldApp');

      // geometry
      this.geometry = new THREE.Geometry();

      // random vectors for each particle
      this.velocityVectors = [];

      // vertex colors
      this.colors = [];

      var i = 0,
          l = this.attributes.numOfParticles,
          vertex;

      for(i=0;i<l;i+=1) {
        vertex = new THREE.Vector3();
        vertex.x = 0;
        vertex.y = 0;
        vertex.z = 5;
        this.geometry.vertices.push(vertex);

        this.colors[i] = new THREE.Color();
        this.setHSV(this.colors[i]);

        this.velocityVectors.push(this.generateVelocityVector());
      }

      this.geometry.colors = this.colors;

      this.material = new THREE.ParticleBasicMaterial();
      this.configureMaterial(this.material);

      this.particleSystem = new THREE.ParticleSystem(this.geometry,this.material);

    },

    initialize : function(config) {

      var firstAlloc = aSlice.call(arguments,0).pop();

      if(!(typeof firstAlloc !== 'undefined' && firstAlloc !== null) &&
          oType(firstAlloc) === 'boolean') {
        firstAlloc = true;
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
      this.attributes.animationDuration = 5; // seconds
      this.attributes.coordsConversion = 1;

      if(!!config) {
        this.attributes = this.extend(this.attributes,config);
      }

      if(firstAlloc) { this.buildComponents(); }

      this.configureMaterial(this.material);

      var i = 0,
          l = this.geometry.vertices.length,
          vert;
      for(i=0;i<l;i+=1) {
        this.setHSV(this.colors[i]);
      }

      this.elapsedTime = 0;

    },

    extend : function(destination,source) {
      var objProp = null;
      for(objProp in source) {
        if(source.hasOwnProperty(objProp)) {
          destination[objProp] = source[objProp];
        }
      }

      return destination;
    },

    generateVelocityVector : function() {
      return this.toPolar(this.randomPointWithinRadius(9));
    },

    configureMaterial : function(material) {
      this.extend(material,{
        size: this.attributes.particleSize,
        sizeAttenuation: true,
        transparent: true,
        opacity: this.attributes.opacity,
        vertexColors: true,
        depthTest: false,
        depthWrite: false
      });
    },

    setHSV : function(color) {
        var valDiff = this.attributes.value - this.attributes.valueRange,
            value = this.attributes.value + (Math.random() * valDiff) - (Math.random() * valDiff);

        color.setHSV(this.attributes.hue,this.attributes.saturation,value);
    },

    explode : function(callback) {

      var i = 0,
          verts = this.particleSystem.geometry.vertices,
          l = verts.length;
      for(i=0;i<l;i+=1) {
        verts[i].x = (this.attributes.position.x)/this.attributes.coordsConversion;
        verts[i].y = -((this.attributes.position.y)/this.attributes.coordsConversion);
      }

      this.attributes.mainScene.threeData.add(this.particleSystem);
      this.onAnimationEnd = callback;

      // binding handler to this instance
      this.animationUpdateHandler = _.bind(this.animate,this);
      this.veroldApp.on('update',this.animationUpdateHandler);
    },

    animate : function(delta) {

      var i = 0,
          l = this.geometry.vertices.length,
          point,
          elTime = this.elapsedTime * 6;

      for(i=0;i<l;i+=1) {
        this.vector.mag = this.velocityVectors[i].mag * elTime;
        this.vector.dir = this.velocityVectors[i].dir;
        point = this.toCartesian(this.vector);
        this.geometry.vertices[i].x = (point.x + this.attributes.position.x)/this.attributes.coordsConversion;
        this.geometry.vertices[i].y = (point.y + -this.attributes.position.y)/this.attributes.coordsConversion;
      }

      if(this.material.opacity > this.attributes.opacityLowerBoundry) {
        this.material.opacity -= this.attributes.opacityDelta;
      }

      this.geometry.verticesNeedUpdate = true;
      this.elapsedTime += delta;

      if(this.elapsedTime >= this.attributes.animationDuration) {
        this.animationEnd();
      }

    },

    animationEnd : function() {
      console.info('explosion animation end');
      this.veroldApp.off('update',this.animationUpdateHandler);
      if(!!this.onAnimationEnd) { this.onAnimationEnd(); }
      this.attributes.mainScene.threeData.remove(this.particleSystem);
    },

    generateVectorComponent : function(radius) {
      return ((Math.random()*radius*2)-radius);
    },

    randomPointWithinRadius : function(radius) {
      function inRadius(p,r) {
        return (Math.pow(p.x,2) + Math.pow(p.y,2)) < Math.pow(r,2);
      }

      var rpoint;
      do {
        rpoint = this.randomPoint(radius);
      } while(!inRadius(rpoint,radius)); 

      return rpoint;
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
      return Math.sqrt(Math.pow(p.x,2)+Math.pow(p.y,2));
    },

    calcAngle : function(p) {
      return Math.atan2(p.y,p.x);
    },

    toPolar : function(p){
      return {'mag':this.calcMagnitude(p),'dir':this.calcAngle(p)};
    },

    initTimingLoop : function(timing,callback,context) {
      var time = Date.now();
      return function() {
        var now = Date.now();
        if(now-time > timing) {
          callback.call(context,time,now-time);
          time = Date.now();
        }
      };
    },

    toCartesianX : function(mag,dir){
      return mag * Math.cos(dir);
    },

    toCartesianY : function(mag,dir){
      return mag * Math.sin(dir);
    },

    toCartesian : function (vec) {
      this.point.x = this.toCartesianX(vec.mag,vec.dir);
      this.point.y = this.toCartesianY(vec.mag,vec.dir);
      return this.point;
    },

    round : function(num,decimals) {
      var base10 = Math.pow(10,decimals);
      return Math.round(num*base10)/base10;
    }

  };

  return Explosion;
});

