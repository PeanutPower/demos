/*global define:true */

define([
  'app/stage',
  'app/actorfactory',
  'app/util',
  'app/customevents',
  'app/userinterface',
  'app/explosion',
  'Box2D'
] , function(
  Stage,
  ActorFactory,
  util,
  CustomEvents,
  UserInterface,
  Explosion
) {


  var stage = new Stage(),
      gameActions,
      veroldApps,
      ui = new UserInterface(),
      scale = stage.getScale(),
      coordsConversion;

  if(!window.asteroids) {
    window.asteroids = {};
  }
  window.asteroids.events = new CustomEvents();
  window.asteroids.ui = ui;

  stage.setContactListeners({
    BeginContact : function(contact) {
      var a = contact.GetFixtureA().GetBody().GetUserData(),
          b = contact.GetFixtureB().GetBody().GetUserData(),
          target;
          
      if(a.attributes.actorType === 'ship' || b.attributes.actorType === 'ship') {
        target = (a.attributes.actorType === 'ship') ? a : b;
        window.asteroids.events.trigger('collision:ship',target);
      }

      if((a.attributes.actorType === 'projectile' && b.attributes.actorType === 'asteroid') ||
        (a.attributes.actorType === 'asteroid' && b.attributes.actorType === 'projectile')) {

        target = (a.attributes.actorType === 'asteroid') ? a : b;

        var exp = new Explosion({
          veroldApps: veroldApps,
          position: target.attributes.position
        });

        exp.explode();

        setTimeout(function() {
          a.setActive(false);
          b.setActive(false);
        }, 0);
      }
    }
  });


  gameActions = {
    start : function(){
      coordsConversion = veroldApps.asteroids.getPhysicsTo3DSpaceConverson();

      stage.setVeroldApps(veroldApps);

      var that = this;

      this.addShip();

      // adding asteroids
      _.times(15,function() { that.addAsteroid(); });

      // adding projectiles
      _.times(4,function() { that.addProjectile(); });

      stage.initAnim();
    },

    initVAPI : function() {

      var that = this;
    
      VAPI.onReady(function(){

        var veroldApp = new VeroldApp(),
            asteroidsApp = new AsteroidsApp(veroldApp);

        veroldApps = {
          verold: veroldApp,
          asteroids: asteroidsApp
        };

        veroldApp.initialize({
          container: null,
          projectId: '514219ce0b4e5d0200000344',
          enablePostProcess: false,
          enablePicking: false,
          handleInput: false,
          clearColor: 0xff0000,
          success: function() {
            asteroidsApp.startup(function() {
              that.start();
            });
          }
        });

      });
    },

    addAsteroid : function() {
      var orthBnds = veroldApps.asteroids.getOrthBounds(),
          position = {
            x: util.randRange(orthBnds.left,orthBnds.right)*scale*coordsConversion,
            y: util.randRange(orthBnds.top,orthBnds.bottom)*scale*coordsConversion
          },
          angularVelocity = 15;

      veroldApps.asteroids.createAsteroidModel(function(model) {
        stage.createActor({
          actorType: 'asteroid',
          position: position,
          angle: util.randRange(0,360),
          initialForce: util.randRange(10,20),
          angularVelocity: util.randRange(-angularVelocity,angularVelocity),
          radius: 4,
          model: model,
          modelScale: 5
        });
      });
    },

    addProjectile : function() {

      veroldApps.asteroids.createProjectileModel(function(model) {
        stage.createActor({
          actorType: 'projectile',
          position: new Box2D.Common.Math.b2Vec2(0,0),
          angle: 0,
          radius: 0.5,
          active: false,
          model: model
        });
      });
    },

    addShip : function() {
      stage.createActor({
        actorType: 'ship',
        position: new Box2D.Common.Math.b2Vec2(0,0),
        angle: 0,
        radius: 5,
        model: veroldApps.asteroids.getShipModel(),
        modelScale: 5
      });
    }
  };

  return {
    start : function() {
      gameActions.initVAPI();
    }
  };

});
