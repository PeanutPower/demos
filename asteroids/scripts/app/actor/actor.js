/*global define:true, my:true */

define([
  'myclass',
  'app/util/util'
] , function(
  my,
  util
) {

  Actor = my.Class({
    
    collisionEvents : {},

    constructor : function() {
      if(!(this instanceof Actor)) {
        return new Actor();
      }
    },

    buildComponents : function() {

      this.physics = window.asteroids.get('physics');
      this.scale = this.physics.getScale();
      this.stage = window.asteroids.get('stage');
      this.asteroidsApp = window.asteroids.get('asteroidsApp');
      this.coordinatesConversion = this.asteroidsApp.getPhysicsTo3DSpaceConverson();

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

      var physElements = this.physics.createBody(bodyConfig);

      this.body = physElements.body;
      this.fixture = physElements.fixture;

      this.body.SetUserData(this);

      this.rotationVector = new THREE.Vector3(0,0,1);
    },

    initialize : function(config) {
      this.attributes = _.extend({},config);

      var firstAlloc = util.isFirstAlloc(arguments);
      if(firstAlloc) { this.buildComponents(); }

      if(!(typeof this.attributes.active !== 'undefined' && this.attributes.active !== null)) {
        this.attributes.active = true;
      }
      this.setActive(this.attributes.active);

      if(!!this.attributes.initialForce) {
        this.setLinearVelocityFromForce(this.attributes.initialForce);
      }

      if(!!this.attributes.angularVelocity) {
        this.setAngularVelocity(this.attributes.angularVelocity);
      }

      if(this.hasModel()) {
        this.initModel();
        this.attributes.model.threeData.scale.multiplyScalar(this.attributes.modelScale || 0);
        this.attributes.model.threeData.position.x = 10000;
        this.attributes.model.threeData.position.y = 10000;
      }

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

    destroy : function() {
      this.body.DestroyFixture(this.fixture);
      this.physics.getWorld().DestroyBody(this.body);
      this.stage.removeActor(this);
      if(!!this.attributes.model) {
        // TODO: this is not a true destroy. Ask Mike about how this is done again.
        this.attributes.model.getParentAsset().removeChildObject(this.attributes.model);
      }
    },

    setActive : function(active) {

      this.attributes.active = active;
      this.addToStage(this.attributes.active);
      if(!!this.body) {
        this.body.SetActive(this.attributes.active);
      }

      if(!this.attributes.active && !!this.onInactiveCallback) {
        this.onInactiveCallback();
      }

      var delay = (active) ? 20 : 0;
      setTimeout($.proxy(function() {
        this.visible(this.attributes.active);
      },this), delay);

    },

    isActive : function() {
      return this.attributes.active;
    },

    addToStage : function(active) {
      if(active)
        this.stage.addActor(this);
      else
        this.stage.removeActor(this);
    },

    onInactive : function(callback) {
      this.onInactiveCallback = callback;
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
      this.body.SetPosition(this.physics.b2Vec2(nx,ny));
    },

    setPosition : function(position) {
      this.body.SetPosition(position);
    },

    setLinearVelocityFromForce : function(force) {
      var localVector = this.physics.b2Vec2(force,0),
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
    },

    collision : function(collider) {
      var at = collider.attributes.actorType,
          ce = this.collisionEvents;

      if(!(at in ce)) return;

      setTimeout($.proxy(function() {
        this[ce[at]](collider);
      },this),0);
    },

    initModel : function() {
      // override in inheriting objects    
    }

  });

  return Actor;

});
