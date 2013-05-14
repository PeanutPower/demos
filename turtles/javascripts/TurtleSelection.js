TurtleSelection = function( veroldApp ) {

  this.veroldApp = veroldApp;  
  this.mainScene;
  this.camera;
  this.cameraOffset = new THREE.Vector3(0,0.2,0);
  this.tempVector1 = new THREE.Vector3();
  this.tempQuaternion = new THREE.Quaternion();
  this.rotation = 0;
  this.targetRotation = undefined;
  this.rotationSpeed = 1.0;

  this.defaultLocations = [ 
    {x: 1, y: 0, z: 1}, 
    {x: 1, y: 0, z: -1},
    {x: -1, y: 0, z: -1},
    {x: -1, y: 0, z: 1},
  ];

  this.defaultRotations = [ 
    0, 
    Math.PI / 2.0,
    Math.PI,
    3.0 * Math.PI / 2.0,
  ];
}

TurtleSelection.prototype.initialize = function( sceneAsset ) {

  this.mainScene = sceneAsset;
  //Create the camera
  this.camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 10000 );
  this.camera.up.set( 0, 1, 0 );
  this.camera.position.set( 1.5, 0.5, 1.5 );
  this.targetPos = new THREE.Vector3();

}

TurtleSelection.prototype.initPositions = function() {
	
  for ( var x in turtles ) {
    var model = turtles[x].model.threeData.position.set( this.defaultLocations[x].x, this.defaultLocations[x].y, this.defaultLocations[x].z )
  }

}

  

TurtleSelection.prototype.update = function( delta ) {
  //if ()
  this.rotation += delta;
  this.tempVector1.set( 0, this.rotation, 0);
  this.tempQuaternion.setFromEuler( this.tempVector1 );
  for ( var x in turtles ) {
    this.tempVector1.set( this.defaultLocations[x].x, this.defaultLocations[x].y, this.defaultLocations[x].z );
    this.tempVector1.applyQuaternion( this.tempQuaternion );
    var model = turtles[x].model.threeData.position.copy( this.tempVector1 );
  }
}

TurtleSelection.prototype.select = function( turtle ) {
  if ( turtles[turtle].model.threeData.center ) {

    this.veroldApp.on("update", this.update, this );
    // this.targetRotation = this.defaultRotations[ turtle ];
    this.targetPos.copy( turtles[turtle].model.threeData.center );
    this.targetPos.multiply( turtles[turtle].model.threeData.scale )
    this.targetPos.add( turtles[turtle].model.threeData.position );
    this.targetPos.add( this.cameraOffset );
    this.camera.lookAt( this.targetPos );
  }
  else {
    this.camera.lookAt( turtles[turtle].model.threeData.position );
  }
}
