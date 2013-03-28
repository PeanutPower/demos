/*global define:true, my:true */

define([
  'myclass',
  'app/util'
] , function(
  my,
  util
) {

  Actor = my.Class({

    constructor : function(config) {
      if(!(this instanceof Actor)) {
        return new Actor(config);
      }

      this.attributes = {},
      this.attributes = _.extend(this.attributes,config);
      this.initialize();
    },

    initialize : function() {

      this.scale = this.attributes.physics.getScale();
      this.stage = this.attributes.stage;
      this.asteroidsApp = this.stage.getVeroldApps().asteroids;
      this.coordinatesConversion = this.stage.getVeroldApps().asteroids.getPhysicsTo3DSpaceConverson();

      this.attributes.state = 'default';

      // create Box2D body object
      var bodyConfig = {
        shapeType: 'circle',
        bodyType: 'dynamic',
        position: this.attributes.position,
        angle: this.attributes.angle,
        radius: this.attributes.radius,
        angularDamping: this.attributes.angularDamping || 0,
        linearDamping: this.attributes.linearDamping || 0
      };

      var physElements = this.attributes.physics.createBody(bodyConfig);

      this.body = physElements.body;
      this.fixture = physElements.fixture;

      this.body.SetUserData(this);

      // can only be called after body is created
      this.setActive(this.attributes.active || true);

      if(!!this.attributes.initialForce) {
        var localVector = this.attributes.physics.b2Vec2(this.attributes.initialForce,0),
            worldVector = this.body.GetWorldVector(localVector);
        this.body.SetLinearVelocity(worldVector,this.body.GetWorldCenter());
      }

      if(!!this.attributes.angularVelocity) {
        this.body.SetAngularVelocity(util.tr(this.attributes.angularVelocity));
      }

      if(!!this.attributes.model) {
        this.setModel(this.attributes.model);
      }


      // create vector graphic
      // if(!this.attributes.states) {
      //   this.attributes.states = {
      //     'default':{
      //       'points':util.generateCircPoints(8,this.attributes.radius*this.scale),
      //       'scale':this.attributes.drawScale || 1,
      //       'drawStyles':{
      //         'lineWidth':3.0,
      //         'lineCap':'round',
      //         'lineJoin':'round',
      //         'strokeStyle':'#111',
      //         'fillStyle':'#666666'
      //       }
      //     }
      //   };
      // }
      //
      this.rotationVector = new THREE.Vector3(0,0,1);

    },

    update : function() {

      // position based on b2 body
      this.attributes.position = this.body.GetPosition();
      this.attributes.angle = this.body.GetAngle();

      if(!!this.attributes.model) {
        var model = this.attributes.model.threeData;
        model.position.x = this.attributes.position.x / this.coordinatesConversion;
        model.position.y = -this.attributes.position.y / this.coordinatesConversion;

        model.quaternion.setFromAxisAngle(this.rotationVector,-this.attributes.angle);

        this.attributes.modelPosition = model.position;        

        this.correctPosition();
      }
    },

    getModelPosition : function() {
      return (!!this.attributes.modelPosition) ? this.attributes.modelPosition : null;
    },

    setModel : function(model) {
      model.threeData.scale.multiplyScalar(5);
      this.attributes.model = model;
    },

    setStates : function(states) {
      this.attributes.states = states;
    },

    getStates : function() {
      return this.attributes.states;
    },

    render : function() {
      // var canvas = this.attributes.stage.getCanvas();
      // canvas.drawShape(_.extend({
      //   direction: this.attributes.angle,
      //   position: this.attributes.position
      // },this.attributes.states[this.attributes.state]));
    },

    destroy : function() {
      this.body.DestroyFixture(this.fixture);
      this.attributes.physics.getWorld().DestroyBody(this.body);
      this.attributes.stage.removeActor(this);
      if(!!this.attributes.model) {
        this.attributes.model.getParentAsset().removeChildObject(this.attributes.model);
      }
    },

    setActive : function(active) {

      var m = this.attributes.model;

      this.active = active;
      this.body.SetActive(this.active);

      if(!m) return;

      if(this.active) {
        m.getParentAsset().addChildObject(m);
      } else {
        m.getParentAsset().removeChildObject(m);
      }
    },

    isActive : function() {
      return this.active;
    },

    correctPosition : function() {
      var x = this.attributes.modelPosition.x,
          y = this.attributes.modelPosition.y,
          b = this.asteroidsApp.getOrthBounds();
      if(y > b.top) { this.setWorldPosition(x,-b.bottom); return; }
      if(x > b.right) { this.setWorldPosition(b.left,-y); return; }
      if(y < b.bottom) { this.setWorldPosition(x,-b.top); return; }
      if(x < b.left) { this.setWorldPosition(b.right,-y); return; }
    },

    setWorldPosition : function(x,y) {
      var nx = x * this.coordinatesConversion,
          ny = y * this.coordinatesConversion;
      this.body.SetPosition(this.attributes.physics.b2Vec2(nx,ny));
    }

  });

  return Actor;

});
