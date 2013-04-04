/*global define:true, my:true  */

define([
  'myclass',
  'app/actor/actor',
  'app/util/util',
  'app/util/point',
  'Sparks'
] , function(
  my,
  Actor,
  util,
  Point
) {

  Ship = my.Class(Actor,{

    collisionEvents : {
      'asteroid' : 'depleteShields'
    },

    constructor : function(config) {
      if(!(this instanceof Ship)) {
        return new Ship(config);
      }

      this.attributes = {},
      this.attributes = _.extend(this.attributes,config);

      this.nose = new Point(10,0); 

      this.attributes.shields = 100;
      this.attributes.force = 4000;
      this.attributes.torque = (!!this.attributes.torque) ?
        this.attributes.torque : 8000;

      this.attributes.angularDamping = 1;
      this.attributes.linearDamping = 0.4;

      Ship.Super.call(this,this.attributes);

    },

    update : function() {

      var keys = this.stage.getKeys(),
          localVector,
          worldVector,
          angle;

      if(keys.up) {
        localVector = this.attributes.physics.b2Vec2(this.attributes.force,0);
        worldVector = this.body.GetWorldVector(localVector);
        this.body.ApplyForce(worldVector,this.body.GetWorldCenter());
      }

      if(keys.left) {
        this.body.ApplyTorque(-this.attributes.torque);
      }

      if(keys.right) {
        this.body.ApplyTorque(this.attributes.torque);
      }

      if(keys.space) {
        this.propelProjectile();
      }

      Ship.Super.prototype.update.call(this);

      // console.info(this.attributes.modelPosition);

    },

    propelProjectile : _.throttle(function() {
    
      var localNoseVector,
          worldNoseVector,
          bodyPosition,
          nosePosition,
          localVector,
          worldVector,
          force,
          projectile;

      localNoseVector = this.attributes.physics.b2Vec2(this.nose.x,this.nose.y);
      worldNoseVector = this.body.GetWorldVector(localNoseVector);
      bodyPosition = this.attributes.physics.getBodyPositionCopy(this.body);
      nosePosition = this.attributes.physics.addVector2(worldNoseVector,bodyPosition);

      localVector = this.attributes.physics.b2Vec2(10000,0);
      worldVector = this.body.GetWorldVector(localVector);
      force = this.attributes.physics.addVector2(this.body.GetLinearVelocity(),worldVector);

      projectile = this.stage.getInactiveActor('projectile');
      projectile.setPosition(nosePosition);
      projectile.setAngle(this.body.GetAngle());
      projectile.setLinearVelocityFromForce(force.Length());
      projectile.setActive(true);
      
    },175),

    depleteShields : function() {
      this.attributes.shields -= 5;

      window.asteroids.get('ui').setShieldsStrength(this.attributes.shields);
      if(this.attributes.shields <= 0)
        window.asteroids.get('events').trigger('game:gameover');
    },

    getShields : function() {
      return this.attributes.shields;
    },

    reset : function() {
      this.attributes.shields = 100;
    },

    initEmitter : function() {

      var group = new THREE.Object3D();
      window.asteroids.get('asteroidsApp').mainScene.threeData.add(group);

      var callback = function () {}

      var counter = new SPARKS.SteadyCounter(200); 
      this.emitter = new SPARKS.Emitter(counter);

      var position = new THREE.Vector3( 0, 0, 0 );
      this.emitter.addInitializer(new SPARKS.Position(new SPARKS.PointZone(position)));
      this.emitter.addInitializer(new SPARKS.Lifetime(1,15));
      var vector = new THREE.Vector3( -5, 0, 0 );
      this.emitter.addInitializer( new SPARKS.Velocity( new SPARKS.PointZone( vector ) ) );

      this.emitter.addAction(new SPARKS.Age(TWEEN.Easing.Linear.None));
      this.emitter.addAction(new SPARKS.Accelerate(1,0,0));
      this.emitter.addAction(new SPARKS.Move());
      this.emitter.addAction(new SPARKS.RandomDrift(90,100,1000));

      this.emitter.start();
    }

  });

  return Ship;

});
