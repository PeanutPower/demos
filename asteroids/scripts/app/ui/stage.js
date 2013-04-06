/*global define:true, my:true */

define([
  'myclass',
  'app/util/util',
  'app/util/point',
  'app/ui/canvaswrapper',
  'Stats'
], function(
  my,
  util,
  Point,
  CanvasWrapper
){

  var Stage = my.Class((function () {

    // tracks key status
    var keys = {
            right:false,
            left:false,
            up:false,
            down:false,
            space:false
        },

        keymap = {
            k37:'left',
            k39:'right',
            k38:'up',
            k40:'down',
            k32:'space'
        },

        // Box2D physics object
        physics,

        // stores a list of motion objects
        actors = [],

        // actors that will be removed outside of a time step.
        // List is cleared after all actors removed.
        actorsPendingRemoval = [],

        actorTypes = {},

        // speed for logic loop which runs 
        // independently of animation loop
        frameRate = 1/65,

        // info obj for output
        consoleData = {infoItems:[]},
        
        // output template
        infoPanelTemplate = Handlebars.compile(util.cleanTemplate('#info-panel-template')),
        
        // DOM node for information output
        infoPanel = $('#info-panel'),

        veroldApp;

    // set up key event listeners
    $(document).keydown(function(e) {
      try {
        keys[keymap['k'+e.which]]=true;
      } catch(ex) {}
    });
    
    $(document).keyup(function(e) {
      try {
        keys[keymap['k'+e.which]]=false;
      } catch(ex) {}
    });

    return {

      constructor : function() {
        if(!(this instanceof Stage)) {
            return new Stage();
        }

        physics = window.asteroids.get('physics');

        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.left = '0px';
        this.stats.domElement.style.bottom = '0px';

        document.body.appendChild(this.stats.domElement);
      },

      startAnimation : function() {
        veroldApp = (!veroldApp) ? window.asteroids.get('veroldApp') : veroldApp;
        veroldApp.on('update',this.update,this);
      },

      endAnimation : function() {
        veroldApp.off('update',this.update,this);
      },

      getKeys : function() {
        return keys;
      },

      update : function(delta) {
        this.stats.begin();
        this.updateActors(delta);
        var world = physics.getWorld();

        // run physics simulation
        world.Step(
          frameRate,
          8, // velocity iterations
          3  // position iterations
        );

        // world.DrawDebugData();
        world.ClearForces();

        // perform any actions on waiting actors
        // this.purgeDeadActors();

        // this.updateInfoPanel();
        this.stats.end();
      },

      updateActors : function(delta) {
        var i = actors.length;
        while(i--) {
          if(!!actors[i] && actors[i].isActive()) {
            actors[i].update(delta);
          }
        }
      },

      addActor : function(actor) {
        actors.push(actor);
      },

      removeActor : function(actor) {
        var i = actors.length;

        while(i--) {
          if(actors[i] === actor) {
            actors.splice(i,1); 
            break;
          }
        }
        
      },

      getNumOfActors : function() {
        return actors.length;
      },

      createActor : function(config) {
        var actorFactory = window.asteroids.get('actorfactory'),
            actor = actorFactory.createActor(config);
        this.addActor(actor);
        return actor;
      },

      scheduleActorForRemoval : function(actor) {
        actorsPendingRemoval.push(actor);
      },

      purgeDeadActors : function() {
        if(!actorsPendingRemoval.length) return;
        var i = 0, l = actorsPendingRemoval.length;
        if(!l) return;
        for(i=0;i<l;i+=1) {
          actorsPendingRemoval[i].destroy();
        }
        actorsPendingRemoval.length = 0;
      },

      getInactiveActor : function(type) {
        if(!(type in actorTypes)) {
          actorTypes[type] = _.filter(actors,function(actor) {
            return actor.getType() === type;
          });
        }
        return _(actorTypes[type]).chain().filter(function(actor) {
          return !actor.isActive();
        }).sort().first().value();
      },

      updateInfoPanel : function() {
        consoleData.infoItems = [];
        var numOfActors = actors.length;
        var activeActors = _.filter(actors,function(actor){
          return actor.isActive();
        }).length;
        var ship = actors[0];
        
        consoleData.infoItems.push({label:'Actors on Stage',value:numOfActors});
        consoleData.infoItems.push({label:'Active Actors',value:activeActors});
        // consoleData.infoItems.push({label:'fps',value:this.getFps()});
        infoPanel.html(infoPanelTemplate(consoleData));
      }

    };

  }()));

  return Stage;
});
