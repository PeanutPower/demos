/*global requirejs:true */

requirejs.config({
  baseUrl : './scripts/lib',
  paths : {
    app : '../app',
    jquery : 'jquery-1.8.1.min',
    underscore : 'underscore-min',
    handlebars : 'handlebars-1.0.0.beta.6',
    myclass : 'my.class',
    Box2D : 'Box2D.min',
    Tween : 'Tween',
    Sparks : 'Sparks',
    verold_api_v1 : 'http://assets.verold.com/verold_api/verold_api_v1_norequire',
    VeroldApp : '../vendor/VeroldApp',
    AsteroidsApp : '../vendor/AsteroidsApp'
  },
  shim : {
    underscore : {
      exports : '_' 
    },
    handlebars : {
      exports : 'Handlebars' 
    },
    myclass : {
      exports : 'my' 
    },
    Box2D : {
      exports : 'Box2D'
    },
    Tween : {
      exports : 'Tween'
    },
    Sparks : {
      exports : 'Sparks'
    },
    VeroldApp : {
      exports : 'VeroldApp'
    },
    AsteroidsApp : {
      exports : 'AsteroidsApp'
    }
  }
});

// shim for Date.now() for older browsers
if (!Date.now) {
  Date.now = function now() {
    return +(new Date);
  };
}


// load all dependencies here
requirejs([
  'app/controller/game',
  'verold_api_v1',
  'Tween',
  'Sparks',
  'jquery',
  'underscore',
  'handlebars',
  'VeroldApp',
  'AsteroidsApp'
],
function(GameController) {
  $(document).ready(function() {
    var gameController = new GameController();
    gameController.setup();
  });
});
