/*global define:true, my:true */

define([
  'myclass',
  'app/util/util',
  'app/actor/actor',
  'app/actor/ship',
  'app/actor/asteroid',
  'app/actor/projectile'
], function(
  my,
  util,
  Actor,
  Ship,
  Asteroid,
  Projectile
) {

  var actorTypes = {
    'Ship':Ship
  , 'Asteroid':Asteroid
  , 'Projectile':Projectile
  },

  ActorFactory = my.Class({

    constructor : function(config) {
      if(!(this instanceof ActorFactory)) {
        return new ActorFactory(config);
      }

      this.attributes = _.extend({},config);
    },

    createActor : function(config) {
      var type = util.cap(config.actorType);
      
      if(!(type in actorTypes)) return null;

      // TODO: attach common default this.attributes to actors here for convenience

      var actor = actorTypes[type]();
      actor.initialize(config,true);
      return actor;
    }

  });

  return ActorFactory;

});
