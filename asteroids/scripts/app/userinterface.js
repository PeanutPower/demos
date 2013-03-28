/*global define:true, my:true */

define(['myclass'],
function(my) {

  var UserInterface = my.Class({

    constructor : function(canvas) {
      if(!(this instanceof UserInterface)) {
        return new UserInterface(canvas);
      }
      
      this.canvas = canvas;
      this.initialize();
    },

    initialize : function() {
      this.shieldStrength = $('#shield-strength');
    },

    setLoadingProgress : function(percent) {
      if(!this.loadingProgress) {
        this.createLoadingProgress();
      }
      this.loadingProgress.setProgress(percent); 
    },

    animateLoadingProgress : function(duration, callback) {
      if(!this.loadingProgress) {
        this.createLoadingProgress();
      }
      this.loadingProgress.animate(duration, callback);
    },

    hideLoadingProgress : function() {
      if(!this.loadingProgress) {
        this.createLoadingProgress();
      }
      this.loadingProgress.hide();
      this.showUI();
    },

    createLoadingProgress: function() {
      var LoadingProgress = function() {
        this.progressContainer = $('#loading-progress-container');
        this.progressIndicator = this.progressContainer.find('.loading-progress div');
      };

      LoadingProgress.prototype.setProgress = function(percent) {
        this.progressIndicator.css({width:percent+'%'});
      };

      LoadingProgress.prototype.animate = function(duration,callback) {
        this.progressIndicator.animate({width:'100%'},duration,callback);
      };

      LoadingProgress.prototype.hide = function() {
        this.progressContainer.hide();
      };

      this.loadingProgress = new LoadingProgress();
    },

    showUI : function() {
      this.shieldStrength.show();
    },

    setShieldsStrength : function(shields) {
      this.shieldStrength.find('.mask').css('width',shields+'%');
    }

  });

  return UserInterface;

});
