TurtleSelectorApp = function( veroldApp ) {

  this.veroldApp = veroldApp;  
  this.mainScene;
  this.camera;
  this.controls;
}

TurtleSelectorApp.prototype.startup = function( ) {

  var that = this;

  turtles = [
    { name: "Leo", modelID: "5178389039b8e9623d00006c"},
    { name: "Mikey", modelID: "51791caaf8a4f80200000294"},
    { name: "Raph", modelID: "51791c91f8a4f80200000238"},
    { name: "Donny", modelID: "517839e8f8a4f8020000003b"},
  ]

  this.veroldApp.veroldEngine.Renderer.stats.domElement.hidden = true;

  this.veroldApp.loadScene( null, {
    
    init_hierarchy: function( scene ) {

      // hide progress indicator
      AppUI.hideLoadingProgress();
      AppUI.showUI();

      that.inputHandler = that.veroldApp.getInputHandler();
      that.renderer = that.veroldApp.getRenderer();
      that.picker = that.veroldApp.getPicker();
      
      //Bind to input events to control the camera
      that.veroldApp.on("keyDown", that.onKeyPress, that);
      that.veroldApp.on("mouseUp", that.onMouseUp, that);
      //that.veroldApp.on("update", that.update, that );

      //Store a pointer to the scene
      that.mainScene = scene;

      var count = 0;
      for ( var x in turtles ) {
        turtles[x].model = that.mainScene.getObject( turtles[x].modelID );
        turtles[x].model.load( {
          success: function( modObj ) {
            count++;
            if ( count == turtles.length ) {
              that.turtleSelection.initPositions();
            }
          }
        })
      }
      
      that.turtleSelection = new TurtleSelection( that.veroldApp );
      that.turtleSelection.initialize( that.mainScene );
      
      //Tell the engine to use this camera when rendering the scene.
      that.veroldApp.setActiveCamera( that.turtleSelection.camera );

    },

    progress: function(sceneObj) {
      var percent = Math.floor((sceneObj.loadingProgress.loaded_hierarchy / sceneObj.loadingProgress.total_hierarchy)*100);
      AppUI.setLoadingProgress(percent); 
    }
  });
}

TurtleSelectorApp.prototype.shutdown = function() {
	
  this.veroldApp.off("keyDown", this.onKeyPress, this);
  this.veroldApp.off("mouseUp", this.onMouseUp, this);

  //this.veroldApp.off("update", this.update, this );
}

  

// TurtleSelectorApp.prototype.update = function( delta ) {
//   if (this.turtleSelection) this.turtleSelection.update();
// }

TurtleSelectorApp.prototype.onMouseUp = function( event ) {
  
  if ( event.button == this.inputHandler.mouseButtons[ "left" ] && 
    !this.inputHandler.mouseDragStatePrevious[ event.button ] ) {
    
    var mouseX = event.sceneX / this.veroldApp.getRenderWidth();
    var mouseY = event.sceneY / this.veroldApp.getRenderHeight();
    var pickData = this.picker.pick( this.mainScene.threeData, this.turtleSelection.camera, mouseX, mouseY );
    if ( pickData ) {
      for ( var x in turtles ) {
        //Bind 'pick' event to an asset or just let user do this how they want?
        if ( pickData.modelID == turtles[x].modelID ) {
          //Do stuff
          this.turtleSelection.select(x);
        }
      }
    }
  }
}

TurtleSelectorApp.prototype.onKeyPress = function( event ) {
	
	var keyCodes = this.inputHandler.keyCodes;
  if ( event.keyCode === keyCodes['B'] ) {
    var that = this;
    this.boundingBoxesOn = !this.boundingBoxesOn;
    var scene = veroldApp.getActiveScene();
    
    scene.traverse( function( obj ) {
      if ( obj.isBB ) {
        obj.visible = that.boundingBoxesOn;
      }
    });
  
  }
    
}
