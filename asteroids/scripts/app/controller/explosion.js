/*global define:true, my:true */

define(['myclass','app/fx/explosion','app/util/objectpool'],
function(my,Explosion,ObjectPool) {

  var ExplosionController = my.Class({
    
    pool : new ObjectPool(Explosion),

    template : {
      hue: 38/360,
      saturation: 62.3/100,
      value: 67.84/100,
      valueRange: 20/100,
      opacityDelta: 0.005,
      opacityLowerBoundry: 0.5,
      frameDuration: 10
    },

    constructor : function() {
      if(!(this instanceof ExplosionController)) {
        return new ExplosionController();
      }

      this.initialize();

    },

    initialize : function() {
      var astApp = window.asteroids.get('asteroidsApp'),
          fn;

      this.template.coordsConversion = astApp.getPhysicsTo3DSpaceConverson();
      this.template.mainScene = astApp.mainScene;

      fn = $.proxy(function() {
        this.pool.alloc(this.template);
      },this);

      _.times(5,fn);

      this.pool.freeAll();
    },

    explode : function(config) {

      var template = _.extend(this.template,config),
          exp = this.pool.alloc(template);

      exp.explode($.proxy(function() {
        this.pool.free(exp);
      },this));

    }

  });

  return ExplosionController;

});
