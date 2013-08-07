/*
The MIT License (MIT)

Copyright (c) 2013 Verold Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/* globals $ */
window.AppUI = (function() {
  "use strict";
  
  var renderErrors = {
      webGLunsupported : '<p>This demo requires support for webGL.<br />Click <a href="http://verold.com/blog/2013/1/2/enabling-webgl-in-your-browser" target="_blank">here</a> to learn more.</p>',
      floatingPointTexturesUnavailable: '<p>This demo requires support for floating-point textures. Updating your video card drivers may resolve the issue.</p>',
      vertexTexturesUnavailable: '<p>This demo requires support for vertex textures. Updating your video card drivers may resolve the issue.</p>'
    },
    isMobileDevice = (/iphone|ipad|ipod|android|blackberry|bb10|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()));

  return {

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

    hideHeaders : function() {
      $('#headers').hide();
    },

    showMenus : function() {
      $('#menu').show();
    },

    hideMenus : function() {
      $('#menu').hide();
    },

    renderError : function(errorType) {
      errorType = errorType || '';
      this.hideLoadingProgress(); 
      var renderErrorDom = $('#render-errors');
      if(errorType in renderErrors) {
        renderErrorDom.html(renderErrors[errorType]);
      } else {
        renderErrorDom.html('<p>Unknown webGL render error encountered</p>');
      }
      renderErrorDom.show();
    },

    showControls : function() {
      $('#settings').click();
    },

    showUI : function() {
      this.hideHeaders();
      this.showMenus();
      this.initOverlayUI();
      this.showControls();
    },

    initOverlayUI : function() {

      var links = $('#menu a'),
          duration = (!!isMobileDevice) ? 0 : 200;

      links.each(function(index,link) {
        var panel = $('#'+link.id+'-panel'),
            panels = $('.panel'),
            close = panel.find('.close').get(0),
            togglePanel = function() {
              if(panel.is(':visible')) {
                panel.hide(duration);
              } else {
                panels.not(panel.selector).hide(duration);
                panel.show(duration);
              }
            };

        $([link,close]).click(togglePanel);
      });

    }

  };

})();
