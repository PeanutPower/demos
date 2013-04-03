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

      if(!(typeof this.attributes.active !== 'undefined' && this.attributes.active !== null)) {
        this.attributes.active = true;
      }
      this.setActive(this.attributes.active);

      this.scale = this.attributes.physics.getScale();
      this.stage = this.attributes.stage;
      this.asteroidsApp = window.asteroids.get('asteroidsApp');
      this.coordinatesConversion = this.asteroidsApp.getPhysicsTo3DSpaceConverson();

      this.attributes.state = 'default';

      // create Box2D body object
      var bodyConfig = {
        shapeType: 'circle',
        bodyType: 'dynamic',
        position: this.attributes.position,
        angle: this.attributes.angle,
        radius: this.attributes.radius,
        angularDamping: this.attributes.angularDamping || 0,
        linearDamping: this.attributes.linearDamping || 0,
        active: this.attributes.active
      };

      var physElements = this.attributes.physics.createBody(bodyConfig);

      this.body = physElements.body;
      this.fixture = physElements.fixture;

      this.body.SetUserData(this);


      if(!!this.attributes.initialForce) {
        this.setLinearVelocityFromForce(this.attributes.initialForce);
      }

      if(!!this.attributes.angularVelocity) {
        this.setAngularVelocity(this.attributes.angularVelocity);
      }

      if(!!this.attributes.model) {
        this.setModel(this.attributes.model);
      }

      if(!!this.attributes.modelScale && this.hasModel()) {
        this.attributes.model.threeData.scale.multiplyScalar(this.attributes.modelScale);
      }

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
      this.attributes.model = model;
    },

    setStates : function(states) {
      this.attributes.states = states;
    },

    getStates : function() {
      return this.attributes.states;
    },

    destroy : function() {
      this.body.DestroyFixture(this.fixture);
      this.attributes.physics.getWorld().DestroyBody(this.body);
      this.attributes.stage.removeActor(this);
      if(!!this.attributes.model) {
        // TODO: this is not a true destroy. Ask Mike about how this is done again.
        this.attributes.model.getParentAsset().removeChildObject(this.attributes.model);
      }
    },

    setActive : function(active) {

      var delay = (active) ? 20 : 0;
      this.attributes.active = active;
      if(!!this.body) {
        this.body.SetActive(this.attributes.active);
      }

      setTimeout($.proxy(function() {
        this.visible(this.attributes.active);
      },this), delay);

    },

    isActive : function() {
      return this.attributes.active;
    },

    correctPosition : function() {
      var x = this.attributes.modelPosition.x,
          y = this.attributes.modelPosition.y,
          b = this.asteroidsApp.getOrthBounds();
      if(y > b.top) { this.setPosition3DCoords(x,-b.bottom); return; }
      if(x > b.right) { this.setPosition3DCoords(b.left,-y); return; }
      if(y < b.bottom) { this.setPosition3DCoords(x,-b.top); return; }
      if(x < b.left) { this.setPosition3DCoords(b.right,-y); return; }
    },

    setPosition3DCoords : function(x,y) {
      var nx = x * this.coordinatesConversion,
          ny = y * this.coordinatesConversion;
      this.body.SetPosition(this.attributes.physics.b2Vec2(nx,ny));
    },

    setPosition : function(position) {
      this.body.SetPosition(position);
    },

    setLinearVelocityFromForce : function(force) {
      var localVector = this.attributes.physics.b2Vec2(force,0),
          worldVector = this.body.GetWorldVector(localVector);
      this.body.SetLinearVelocity(worldVector,this.body.GetWorldCenter());
    },

    setAngularVelocity : function(angularVelocity) {
      this.body.SetAngularVelocity(util.tr(this.attributes.angularVelocity));
    },

    setAngle : function(angle) {
      this.body.SetAngle(angle);    
    },

    getType : function() {
      return this.attributes.actorType;
    },

    hasModel : function() {
      return !!this.attributes.model;
    },

    visible : function(bool) {
      if(!this.attributes.model) return;

      this.attributes.model.traverse(function(obj) {
        obj.threeData.visible = bool;
      });
    }

  });

  return Actor;

});
