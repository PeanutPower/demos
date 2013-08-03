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

  window.BullRunApp = VAPI.VeroldApp.extend({
    initialize: function() {
      this.mainScene = undefined;
      this.camera;
      this.numDrivers = 5;
      this.numHumanPlayers = 1;
      this.physicsDebugOn = true;
      this.debug = true;
      this.usePhysicsWorker = true;

      this.cameraMode = -1;
      this.physicsDebugRenderScale = 40;
    },

    engineReady: function() {
      var that = this;

      this.loadScene( this.defaultSceneID, {

        init_hierarchy: function( scene ) {
          // hide progress indicator
          AppUI.hideLoadingProgress();
          AppUI.showUI();

          that.inputHandler = that.getInputHandler();
          that.renderer = that.getRenderer();
          that.picker = that.getPicker();

          //Bind to input events to control the camera
          that.veroldEngine.on("keyDown", that.onKeyPress, that);
          //that.veroldEngine.on("mouseUp", that.onMouseUp, that);
          //that.veroldEngine.on("fixedUpdate", that.fixedUpdate, that );
          that.veroldEngine.on("update", that.update, that );

          //Store a pointer to the scene
          that.mainScene = scene;

          //Initialize the debug camera
          that.setupDebugCamera();
          that.setupCollisionDebugCamera();

          if ( that.usePhysicsWorker ) {
            that.setupPhysicsWorker();
          }
          else {
            that.physicsSim = new PhysicsController( that, that.physicsDebugRenderScale );
            that.physicsSim.initialize( );
          }
          that.setupTrack();
          that.setupFlockController( that.track );

          that.setupDriverCamera( that.flock.getHumanDriver() );
          //that.setupHumanDriver( that.flock.getHumanDriver() );
          var lights = that.mainScene.getAllObjects( { filter: { "light" : true }});
          for ( var x in lights ) {
            if ( lights[x].threeData instanceof THREE.DirectionalLight && lights[x].threeData.parent ) {
              that.mainLight = lights[x];
              that.mainLight.threeData.shadowCameraLeft = -5.0;
              that.mainLight.threeData.shadowCameraRight = 5.0;
              that.mainLight.threeData.shadowCameraTop = 5.0;
              that.mainLight.threeData.shadowCameraBottom = -5.0;
            }
          }

          that.cycleCamera();
        },

        load_progress: function(sceneObj) {
          that.defaultSceneProgress(sceneObj);
        }
      });
    },

    defaultSceneProgress: function (sceneObj) {
      var percent = Math.floor((sceneObj.loadingProgress.loaded_hierarchy / sceneObj.loadingProgress.total_hierarchy)*100);
      AppUI.setLoadingProgress(percent);
    },

    update: function( delta ) {
      if ( !this.updateRequested ) {
        this.physicsSim.postMessage( { name : "updateRequest", data: this.flock.physicsData } );
        this.updateRequested = true;
      }

      this.flock.update( delta );

      if ( this.debugCameraController ) this.debugCameraController.update( delta );
      if ( this.driverCameraController ) this.driverCameraController.update( delta );

      //Move the main light with the player's vehicle so that the shadow map stays in range.
      if ( this.mainLight ) {
        var vehicle = this.flock.getHumanDriver().vehicle;
        if ( vehicle ) {
          var position = vehicle.getPosition();
          this.mainLight.threeData.target.position.set( position.x, position.y, position.z);
          this.mainLight.threeData.position.set( position.x + 2, 5, position.z + 2 );// updateMatrix();
          //this.mainLight.threeData.shadowCameraVisible = true;
        }
      }
    },

    setupPhysicsWorker : function() {
      var that = this;
      this.physicsSim = new Worker( "javascripts/workerPhysics.js" );
      this.physicsSim.onmessage = function (event) {
        //Received update from physics worker
        that.updateRequested = false;
        for ( var x in event.data ) {
          that.track.vehicles[x].setPosition2D( event.data[x].position );
          that.track.vehicles[x].setAngle( event.data[x].angle );
          that.track.vehicles[x].setVelocity2D( event.data[x].velocity );
          that.track.vehicles[x].setAngularVelocity( event.data[x].angularVelocity );
          that.track.vehicles[x].driver.localFlockIDs = event.data[x].nearbyVehicles;
          that.track.vehicles[x].driver.localStaticCollision = event.data[x].nearbyObjects;
        }
      };
      //Execute the worker but don't start its update loop.
      this.physicsSim.postMessage("");
    },

    cycleCamera : function( ) {
      this.cameraMode = (this.cameraMode + 1) % 3;
      switch ( this.cameraMode ) {
        case 0: {
          this.debugCameraController.enableUpdates = false;
          this.driverCameraController.enableUpdates = true;
          this.veroldEngine.setActiveCamera( this.driverCamera );
          break;
        }
        case 1: {
          this.debugCameraController.enableUpdates = true;
          this.driverCameraController.enableUpdates = false;
          this.veroldEngine.setActiveCamera( this.debugCamera );
          break;
        }
        case 2: {
          this.debugCameraController.enableUpdates = false;
          this.driverCameraController.enableUpdates = false;
          this.veroldEngine.setActiveCamera( this.collisionDebugCamera );
          break;
        }
      }
      window.camera = this.veroldEngine.getActiveCamera();
    },

    setupDebugCamera : function() {

      //Create the camera
      this.debugCamera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000 );
            
      //Tell the engine to use this camera when rendering the scene.
      this.veroldEngine.setActiveCamera( this.debugCamera );

      this.debugCameraController = new DebugCameraController();
      var debugCameraParams =  {
        "camera": this.debugCamera, 
        "veroldEngine": this.veroldEngine,
        "initialXAngle" : Math.PI / 6.0,
        "initialYAngle" : -Math.PI / 11.0,
        "lookSpeed" : 1.5,
        "position" : { x: 0.5, y: 0.3, z: 0.9}
      };
      
      this.debugCameraController.initialize( debugCameraParams );
      
    },

    setupCollisionDebugCamera : function() {

      var aspect = this.getRenderAspect();
      var lookAtPoint = new THREE.Vector3();
      var size = this.getRenderHeight() / this.physicsDebugRenderScale;
      this.collisionDebugCamera = new THREE.OrthographicCamera( 0, size * aspect, 0, -size, 1, 1000);
      this.collisionDebugCamera.up.set( 0, 0, -1);
      this.collisionDebugCamera.position.set( 0, 5, 0);
      this.collisionDebugCamera.lookAt( lookAtPoint );
      //this.collisionDebugCamera.updateProjectionMatrix();
    },

    setupDriverCamera : function( humanDriver ) {

      //Create the camera
      this.driverCamera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000 );
      
      this.driverCameraController = new DriverCameraController();
      var driverCameraParams =  {
        "name": "DriverCamera1",
        "camera": this.driverCamera, 
        "veroldEngine": this.veroldEngine,
        "interpSpeed" : 1.5,
        "offset" : { x: -1.5, y: 1.0, z: 0.0 },
        "targetDriver" : humanDriver,
      };
      
      this.driverCameraController.initialize( driverCameraParams );
      
    },

    setupTrack : function( ) {
      this.track = new Track( this, this.debug );
      //if ( this.usePhysicsWorker ) {
        this.track.initialize( this.physicsSim, this.mainScene );
      //}
    },

    setupFlockController : function( track ) {
      this.flock = new FlockController( this, this.debug );
      this.flock.initialize( this.physicsSim, track, this.numDrivers, this.numHumanPlayers );
    },

    onKeyPress: function( event ) {
      
      var keyCodes = this.inputHandler.keyCodes;
      if ( event.keyCode === keyCodes.B ) {
        this.cycleCamera();
      }
      else if ( event.keyCode === keyCodes.Z ) {
        this.physicsDebugOn = !this.physicsDebugOn;
        this.flock.physicsSim.toggleDebugDraw( this.physicsDebugOn );
      }
      else if ( event.keyCode === keyCodes['1'] ) {
        this.flock.toggleRule(0);
      }
      else if ( event.keyCode === keyCodes['2'] ) {
        this.flock.toggleRule(1);
      }
      else if ( event.keyCode === keyCodes['3'] ) {
        this.flock.toggleRule(2);
      }
      else if ( event.keyCode === keyCodes['4'] ) {
        this.flock.toggleRule(3);
      }
        
    },

    remove: function() {
      this.veroldEngine.off("keyDown", this.onKeyPress, this);
      //this.veroldEngine.off("mouseUp", this.onMouseUp, this);
      this.veroldEngine.off("update", this.update, this);

      this.stopListening();
    }
  });
})();
