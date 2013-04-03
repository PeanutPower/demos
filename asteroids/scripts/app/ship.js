/*global define:true, my:true  */

define([
  'myclass',
  'app/actor',
  'app/util',
  'app/point'
] , function(
  my,
  Actor,
  util,
  Point
) {

  Ship = my.Class(Actor,{

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

      window.asteroids.get('events').on('collision:ship',function(e) {
        this.depleteShields();
      },this);
  
    },

    update : function() {

      var keys = this.attributes.stage.getKeys(),
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

    adjustDirection : function(angle,step) {
      var d = angle + step;
      if(Math.abs(d) > Math.PI) { d = -(d - (d % Math.PI)); }
      return d;
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

      projectile = this.attributes.stage.getInactiveActor('projectile');
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
    }

  });

  return Ship;

});
