/*global define:true */

define([
  'app/stage',
  'app/actorfactory',
  'app/util',
  'app/customevents',
  'app/userinterface',
  'app/explosion',
  'app/objectpool',
  'app/registry',
  'Box2D'
] , function(
  Stage,
  ActorFactory,
  util,
  CustomEvents,
  UserInterface,
  Explosion,
  ObjectPool,
  Registry
) {

  // shim for Date.now() for older browsers
  if (!Date.now) {
    Date.now = function now() {
      return +(new Date);
    };
  }

  var stage = new Stage(),
      gameActions,
      scale = stage.getScale(),
      explosionTemplate,
      explosionPool = new ObjectPool(Explosion);

  if(!window.asteroids) {
    window.asteroids = new Registry();
  }
  window.asteroids.set('events',new CustomEvents());
  window.asteroids.set('ui',new UserInterface());

  explosionTemplate = {
    hue: 38/360,
    saturation: 62.3/100,
    value: 67.84/100,
    valueRange: 20/100,
    opacityDelta: 0.01,
    opacityLowerBoundry: 0.7,
    frameDuration: 10
  };

  stage.setContactListeners({
    BeginContact : function(contact) {
      var a = contact.GetFixtureA().GetBody().GetUserData(),
          b = contact.GetFixtureB().GetBody().GetUserData(),
          target;
          
      if(a.attributes.actorType === 'ship' || b.attributes.actorType === 'ship') {
        window.asteroids.get('events').trigger('collision:ship');
      }

      if((a.attributes.actorType === 'projectile' && b.attributes.actorType === 'asteroid') ||
        (a.attributes.actorType === 'asteroid' && b.attributes.actorType === 'projectile')) {

        target = (a.attributes.actorType === 'asteroid') ? a : b;

        explosionTemplate.position = target.attributes.position;
        var exp = explosionPool.alloc(explosionTemplate);
        exp.explode(function() {
          explosionPool.free(exp);
        });

        setTimeout(function() {
          a.setActive(false);
          b.setActive(false);
        }, 0);
      }
    }
  });


  gameActions = {
    start : function(){

      var astApp = window.asteroids.get('asteroidsApp');

      explosionTemplate.coordsConversion = astApp.getPhysicsTo3DSpaceConverson();
      explosionTemplate.mainScene = astApp.mainScene;

      var i = 0, l = 5;
      for(i=0;i<l;i+=1) {
        explosionPool.alloc(explosionTemplate);
      }
      explosionPool.freeAll();

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

        window.asteroids.set('veroldApp',veroldApp);
        window.asteroids.set('asteroidsApp',asteroidsApp);

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
      var astApp = window.asteroids.get('asteroidsApp'),
          orthBnds = astApp.getOrthBounds(),
          coordsConversion = astApp.getPhysicsTo3DSpaceConverson(),
          position = {
            x: util.randRange(orthBnds.left,orthBnds.right)*scale*coordsConversion,
            y: util.randRange(orthBnds.top,orthBnds.bottom)*scale*coordsConversion
          },
          angularVelocity = 15;

      astApp.createAsteroidModel(function(model) {
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

      var astApp = window.asteroids.get('asteroidsApp');

      astApp.createProjectileModel(function(model) {
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
      var astApp = window.asteroids.get('asteroidsApp');

      stage.createActor({
        actorType: 'ship',
        position: new Box2D.Common.Math.b2Vec2(0,0),
        angle: 0,
        radius: 5,
        model: astApp.getShipModel(),
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
