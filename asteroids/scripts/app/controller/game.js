/*global define:true */

define([
  'myclass',
  'app/ui/stage',
  'app/ui/userinterface',
  'app/actor/actorfactory',
  'app/util/util',
  'app/util/customevents',
  'app/util/objectpool',
  'app/util/physics',
  'app/util/registry',
  'Box2D'
] , function(
  my,
  Stage,
  UserInterface,
  ActorFactory,
  util,
  CustomEvents,
  ObjectPool,
  Physics,
  Registry
) {


  var GameController = my.Class({

    constructor : function() {
      if(!(this instanceof GameController)) {
        return new GameController();
      }

      this.initialize();

    },

    initialize : function() {
    
      // create global registry object
      if(!window.asteroids) {
        window.asteroids = new Registry();
      }

      this.events = window.asteroids.set('events', new CustomEvents());
      window.asteroids.set('ui', new UserInterface());

      window.asteroids.set('actorfactory', new ActorFactory());

      this.physics = window.asteroids.set('physics', new Physics({
        gravity: {x:0,y:0}
        , scale: 10
        // , debug: true
      }));

      this.stage = window.asteroids.set('stage', new Stage());

      this.events.on('game:setup',this.initVAPI,this);
      this.events.on('game:start',this.start,this);
      this.events.on('game:initVAPIComplete',this.initVAPIComplete,this);
      this.events.on('game:veroldAppStartupComplete',this.veroldAppStartupComplete,this);

    },

    setup : function() {
      this.events.trigger('game:setup');
    },

    initVAPIComplete : function() {

      this.asteroidsApp.startup();
    
    },

    veroldAppStartupComplete : function() {

      // var explosionTemplate,
      //     explosionPool = new ObjectPool(Explosion);

      // explosionTemplate = {
      //   hue: 38/360,
      //   saturation: 62.3/100,
      //   value: 67.84/100,
      //   valueRange: 20/100,
      //   opacityDelta: 0.01,
      //   opacityLowerBoundry: 0.7,
      //   frameDuration: 10
      // };
      
      this.events.trigger('game:start');
    
    },

    start : function(){

      var that = this;

      // explosionTemplate.coordsConversion = this.asteroidsApp.getPhysicsTo3DSpaceConverson();
      // explosionTemplate.mainScene = this.asteroidsApp.mainScene;

      // _.times(5,function() { explosionPool.alloc(explosionTemplate); });
      // explosionPool.freeAll();
      
      this.setContactListeners();

      this.addShip();

      // adding asteroids
      _.times(15,function() { that.addAsteroid(); });

      // adding projectiles
      _.times(4,function() { that.addProjectile(); });

      this.stage.initAnim();
    },

    setContactListeners : function() {

      this.physics.setContactListeners({
        BeginContact : function(contact) {
          var a = contact.GetFixtureA().GetBody().GetUserData(),
              b = contact.GetFixtureB().GetBody().GetUserData();
              
              a.collision(b);
              b.collision(a);
          // if(a.attributes.actorType === 'ship' || b.attributes.actorType === 'ship') {
          //   window.asteroids.get('events').trigger('collision:ship');
          // }

          // if((a.attributes.actorType === 'projectile' && b.attributes.actorType === 'asteroid') ||
          //   (a.attributes.actorType === 'asteroid' && b.attributes.actorType === 'projectile')) {

          //   target = (a.attributes.actorType === 'asteroid') ? a : b;

          //   explosionTemplate.position = target.attributes.position;
          //   var exp = explosionPool.alloc(explosionTemplate);
          //   exp.explode(function() {
          //     explosionPool.free(exp);
          //   });


          //   setTimeout(function() {
          //     // _.each([a,b], function(obj) { obj.setActive(false); });
          //     a.setActive(false);
          //     b.setActive(false);
          //   }, 0);
          // }
        }
      });
    },

    initVAPI : function() {

      var that = this;
    
      VAPI.onReady(function(){

        that.veroldApp = window.asteroids.set('veroldApp',new VeroldApp);
        that.asteroidsApp = window.asteroids.set('asteroidsApp',new AsteroidsApp(that.veroldApp));

        that.veroldApp.initialize({
          container: null,
          projectId: '514219ce0b4e5d0200000344',
          enablePostProcess: false,
          enablePicking: false,
          handleInput: false,
          clearColor: 0xff0000,
          success: function() {
            that.events.trigger('game:initVAPIComplete');
          }
        });

      });
    },

    addAsteroid : function() {
      var that = this,
          scale = this.physics.getScale(),
          orthBnds = this.asteroidsApp.getOrthBounds(),
          coordsConversion = this.asteroidsApp.getPhysicsTo3DSpaceConverson(),
          position = {
            x: util.randRange(orthBnds.left,orthBnds.right)*scale*coordsConversion,
            y: util.randRange(orthBnds.top,orthBnds.bottom)*scale*coordsConversion
          },
          angularVelocity = 15;

      this.asteroidsApp.createAsteroidModel(function(model) {
        that.stage.createActor({
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
      var that = this;
      this.asteroidsApp.createProjectileModel(function(model) {
        that.stage.createActor({
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
      this.stage.createActor({
        actorType: 'ship',
        position: new Box2D.Common.Math.b2Vec2(0,0),
        angle: 0,
        radius: 5,
        model: this.asteroidsApp.getShipModel(),
        modelScale: 5
      });
    }

  });

  return GameController;

});
