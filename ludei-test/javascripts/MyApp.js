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

/* global AppUI, VAPI  */
(function() {
  "use strict";

  window.MyApp = VAPI.VeroldApp.extend({
    initialize: function() {
      this.mainScene = undefined;
    },

    engineReady: function() {
      var that = this;

      this.loadScene(this.defaultSceneID, {
        load: function(scene) {
          that.defaultSceneLoaded(scene);

          that.defaultScene = scene;
        },

        load_progress: function(sceneObj) {
          that.defaultSceneProgress(sceneObj);
        }
      });
    },

    defaultSceneLoaded: function( scene ) {
      this.veroldEngine.Renderer.stats.domElement.hidden = true;

      this.mainScene = scene;

      // hide progress indicator
      AppUI.hideLoadingProgress();
      AppUI.showUI();

      this.inputHandler = this.getInputHandler();
      this.renderer = this.getRenderer();
      this.picker = this.getPicker();

      //Bind to input events to control the camera
      this.veroldEngine.on("keyDown", this.onKeyPress, this);
      this.veroldEngine.on("mouseUp", this.onMouseUp, this);
      this.veroldEngine.on("fixedUpdate", this.fixedUpdate, this );
      this.veroldEngine.on("update", this.update, this );

      //Store a pointer to the scene
      this.mainScene = scene;

      var models = this.mainScene.getAllObjects( { "filter" :{ "model" : true }});
      var model = models[ Object.keys( models )[0] ].threeData;

      //Create the camera
      this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000 );
      this.camera.up.set( 0, 1, 0 );
      this.camera.position.set( 0, 0.5, 1 );

      var lookAt = new THREE.Vector3();
      if ( model.center ) {
        lookAt.add( model.center );
      }
      lookAt.multiply( model.scale );
      lookAt.applyQuaternion( model.quaternion );
      lookAt.add( model.position );

      this.camera.lookAt( lookAt );

      this.controls = new THREE.OrbitControls(this.camera);
      this.controls.userPanSpeed = 0.1;

      //Tell the engine to use this camera when rendering the scene.
      this.setActiveCamera( this.camera );
    },

    defaultSceneProgress: function (sceneObj) {
      var percent = Math.floor((sceneObj.loadingProgress.loaded_hierarchy / sceneObj.loadingProgress.total_hierarchy)*100);
      AppUI.setLoadingProgress(percent);
    },

    update: function( delta ) {
      if (this.controls) {
        this.controls.update();
      }
    },

    onMouseUp: function( event ) {
      if ( event.button === this.inputHandler.mouseButtons.left &&
          !this.inputHandler.mouseDragStatePrevious[ event.button ] ) {
        var mouseX = event.sceneX / this.getRenderWidth();
        var mouseY = event.sceneY / this.getRenderHeight();
        var pickData = this.picker.pick( this.mainScene.threeData, this.camera, mouseX, mouseY );
        if ( pickData ) {
          /*
          if ( pickData.meshID === "51125eb50a4925020000000f") {
            //Do stuff
          }
          */
        }
      }
    },

    onKeyPress: function( event ) {
      var keyCodes = this.inputHandler.keyCodes;

      if ( event.keyCode === keyCodes.B ) {
        var that = this;
        this.boundingBoxesOn = !this.boundingBoxesOn;
        var scene = this.getActiveScene();

        scene.traverse( function( obj ) {
          if ( obj.isBB ) {
            obj.visible = that.boundingBoxesOn;
          }
        });
      }
    },

    remove: function() {
      this.veroldEngine.off("keyDown", this.onKeyPress, this);
      this.veroldEngine.off("mouseUp", this.onMouseUp, this);
      this.veroldEngine.off("update", this.update, this);

      this.stopListening();
    }
  });
})();
