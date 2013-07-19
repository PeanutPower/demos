FlockController = function( veroldApp, debug ) {
  this.debug = debug;
  this.veroldApp = veroldApp;
  this.localFlockRange = 2;
  this.centreOfFlockMultiplier = 0.25;

  //Controls the distance that drivers need to get to each other before they try to move away.
  this.flockSpread = 1;
  this.spreadStrength = 0.4;
  this.flockSpeed = 4;
  this.ruleToggles = [ true, false, false, false ];
  window.flock = this;
}

FlockController.prototype = {

  constructor: FlockController,

  initialize : function( physicsSim, track, numDrivers, numHumanDrivers ) {

    this.track = track;

    this.physicsSim = physicsSim;

    //Data array that will be sent to the physics worker every to update the forces being applied.
    this.physicsData = [];
    //this.physicsSim.createVehicleBodies( numDrivers );
    this.initDrivers( numDrivers );
    this.initVehicles( numDrivers );

    if ( numHumanDrivers ) {
      this.drivers[0].isHuman = true;
    }

    //Vector to record
    this.tempVector2D = new b2Vec2();
    
    this.physicsSim.postMessage("start");
    //Bind to main update loop
    //this.veroldApp.on("update", this.update, this );
  },

  uninitialize : function() {
	
    //this.veroldApp.off("update", this.update, this );
  },

  toggleRule: function( ruleNum, on ) {
    this.ruleToggles[ ruleNum ] = on !== undefined ? on : !this.ruleToggles[ ruleNum ];
    console.log("Flocking rule #" + (ruleNum + 1) + " is now " + (this.ruleToggles[ ruleNum ] ? "on" : "off") );
  },

  update : function( delta ) {
    //Run flocking rules for each boid
    //First, we'll update the local information for each driver
    for ( var x in this.drivers ) {
      
      this.drivers[x].updatePositionOnTrack( );

      if ( this.drivers[x].vehicle ) {
      
        this.tempVector2D.Set( 0, 0 );
        
        //this.tempVector2D.Add( this.drivers[x].tendToPaceRabbit() );
        //Get each boid to try to follow the track's direction at a certain speed
        if ( this.ruleToggles[0])
        this.tempVector2D.Add( this.drivers[x].tendToTrackDirection( this.flockSpeed ) );

        //For each boid, calculate the "centre of mass" of nearby boids and get a vector that represents the desired direction of travel
        if ( this.ruleToggles[1])
        this.tempVector2D.Add( this.drivers[x].tendToCentreOfFlock( this.centreOfFlockMultiplier ) );

        if ( this.ruleToggles[2])
        this.tempVector2D.Add( this.drivers[x].tendToMaintainDistance( this.flockSpread, this.spreadStrength ) );

        if ( this.ruleToggles[3])
        this.tempVector2D.Add( this.drivers[x].tendToMatchVelocity() );
      
        //Using the combined vector, tell the driver where to go (via the vector)
        this.drivers[x].driveTowards( this.tempVector2D );

        this.drivers[x].update( delta );
        this.drivers[x].vehicle.update();
        this.physicsData[x].forceVector.x = this.drivers[x].vehicle.forceVector.x;
        this.physicsData[x].forceVector.y = this.drivers[x].vehicle.forceVector.y;
        this.physicsData[x].torque = this.drivers[x].vehicle.torque;
        
      }

    }


  },

  fixedUpdate : function( delta ) {

  },

  initDrivers : function( numDrivers ) {
    this.numDrivers = numDrivers;
    this.drivers = [];
    for ( var x = 0; x < numDrivers; x++ ) {
      this.drivers.push( new Driver( this.veroldApp, this, this.debug ) );
      this.drivers[x].initialize( x, this.track );
    }
  },

  initVehicles : function( numDrivers ) {

    function _initVehicle( num ) {
      //Create the car and place it on the track
      //var physicsFixture = that.physicsSim.getVehicleFixture( num );
      //physicsFixture.driverID = num;
      //var physicsBody = that.physicsSim.getVehicleBody( num );
      var newCar = new Vehicle( that.veroldApp, that.drivers[num] );
      newCar.initialize( that.track, {
        success: function( newVehicle ) {
          that.drivers[ num ].setVehicle( newVehicle );
          that.vehicles.push( newVehicle );
          that.track.spawnVehicle( newVehicle );
        }
      } );
    };

    var that = this;
    this.vehicles = [];
    
    for ( var x = 0; x < numDrivers; x++ ) {
      
      _initVehicle( x );
      this.physicsData.push( { forceVector: {x: 0, y:0 }, torque: 0 });
    }
  },

  updateLocalFlockInfo: function( driverID ) {

    this.drivers[ driverID ].localFlockIDs = [];
    this.drivers[ driverID ].localStaticCollision = [];
    var that = this;
    var vehicle = this.drivers[ driverID ].vehicle;
    if ( vehicle ) {
      var position = vehicle.getPosition2D();
      this.drivers[ driverID ].localFlockBB.lowerBound.Set( position.x - this.localFlockRange, position.y - this.localFlockRange);
      this.drivers[ driverID ].localFlockBB.upperBound.Set( position.x + this.localFlockRange, position.y + this.localFlockRange);
      this.physicsSim.world.QueryAABB( function( fixture ) {
        //console.log("Fixture ", fixture, " is near driver # " + driverID );
        if ( fixture.driverID !== undefined ) {
          //if ( fixture.driverID != driverID ) {
            that.drivers[ driverID ].localFlockIDs.push( fixture.driverID );
          //}
        }
        else {
          that.drivers[ driverID ].localStaticCollision.push( fixture );
        }
      }, this.drivers[ driverID ].localFlockBB );
    }
  },

  getHumanDriver: function( playerNum ) {
    return this.drivers[0];
  }

}

