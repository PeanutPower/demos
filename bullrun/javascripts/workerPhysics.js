importScripts("physics/Box2D.js");

var b2Vec2 = Box2D.Common.Math.b2Vec2
        ,       b2BodyDef = Box2D.Dynamics.b2BodyDef
        ,       b2Body = Box2D.Dynamics.b2Body
        ,       b2FixtureDef = Box2D.Dynamics.b2FixtureDef
        ,       b2Fixture = Box2D.Dynamics.b2Fixture
        ,       b2World = Box2D.Dynamics.b2World
        ,       b2MassData = Box2D.Collision.Shapes.b2MassData
        ,       b2AABB = Box2D.Collision.b2AABB
        ,       b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
        ,       b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
        ,       b2DebugDraw = Box2D.Dynamics.b2DebugDraw
    ;

//Records when an update has been requested
var updateRequested = false;
//Records most recent input force data from client
var updateData;
var aabbQueryStarted = false;

self.onmessage = function (event) {
    //Received a message from the application.
    if ( event.data.name == "updateRequest") {
      
      //Record that an update was requested
      updateRequested = true;
      updateData = event.data.data;
    }
    else if ( event.data.name == "createVehicle") {
        createVehicle( event.data.data );
    }
    else if ( event.data.name == "createTrackObject") {
        createTrackObject( event.data.data );
    }
    else if ( event.data == "start" ) {
        update();
    }
};

var timeoutID;

//Create the physics world and initialize it.
var world = new b2World( 
  new b2Vec2(0, 0) //gravity
  , true //allow sleep
);

var vehicleData = [];
var vehicleBodies = [];
var vehicleFixtures = [];
var trackBodies = [];
var trackFixtures = [];
var trackBodyPositions = [];
var localBB = [];
var localFlockRange = 2;

function update() {
    timeoutID = setTimeout( update, 16  ); //Rounds timeout value to integer...

    //Apply forces set by the application
    applyVehicleForces();
      //Calculate vehicle physics
      //calculateVehiclePhysics();
    //}

    world.Step(
         0.016    //frame-rate
      ,  10       //velocity iterations
      ,  10       //position iterations
    );
    //world.DrawDebugData();
    world.ClearForces();

    if ( updateRequested ) {
      updateVehicleData();
      //Send updated data to the main application
      self.postMessage( this.vehicleData )
      updateRequested = false;
      
    }
    
}

function applyVehicleForces() {
  if ( updateData && vehicleBodies.length == updateData.length ) {
    for ( var x in updateData ) {
      vehicleBodies[x].ApplyForce( updateData[x].forceVector, vehicleBodies[x].GetWorldCenter() );
      vehicleBodies[x].ApplyTorque( updateData[x].torque );

      //Temporarily wiping the input data to see if this stops some of the occilation.
      updateData[x].forceVector.x = 0;
      updateData[x].forceVector.y = 0;
      updateData[x].torque = 0;
    }
  }
}

function updateVehicleData() {
  for ( var x in vehicleBodies ) {

    checkForNearbyObjects( x );
    
    var body = vehicleBodies[ x ];
    //Write the current body data to the structure for sending to the application
    vehicleData[x].angle = body.GetAngle();
    vehicleData[x].position = body.GetPosition();
    vehicleData[x].velocity = body.GetLinearVelocity();
    vehicleData[x].angularVelocity = body.GetAngularVelocity();
  }
}

function checkForNearbyObjects( vehicleID ) {
  
  var body = vehicleBodies[ vehicleID ];
  vehicleData[ vehicleID ].nearbyVehicles = [];
  vehicleData[ vehicleID ].nearbyObjects = [];
  //Do a AABB test to find adjacent bodies
  var position = body.GetPosition();
  //if ( !aabbQueryStarted ) {
  var aabb = localBB[vehicleID];
  aabb.lowerBound.Set( position.x - localFlockRange, position.y - localFlockRange);
  aabb.upperBound.Set( position.x + localFlockRange, position.y + localFlockRange);

  for ( var x in vehicleFixtures ) {
    if ( x !== vehicleID ) {
      var aabb2 = vehicleFixtures[x].m_aabb;
      if ( aabb.lowerBound.x < aabb2.upperBound.x && aabb.upperBound.x > aabb2.lowerBound.x ) {
        if ( aabb.lowerBound.y < aabb2.upperBound.y && aabb.upperBound.y > aabb2.lowerBound.y ) {
          vehicleData[ vehicleID ].nearbyVehicles.push( vehicleFixtures[x].driverID );
        }
      }
    }
  }

  for ( var x in trackFixtures ) {
    //if ( x !== vehicleID ) {
      var fixture = trackFixtures[x];
      var aabb2 = fixture.m_aabb;
      if ( aabb.lowerBound.x < aabb2.upperBound.x && aabb.upperBound.x > aabb2.lowerBound.x ) {
        if ( aabb.lowerBound.y < aabb2.upperBound.y && aabb.upperBound.y > aabb2.lowerBound.y ) {
          vehicleData[ vehicleID ].nearbyObjects.push( { position: trackBodyPositions[ fixture.trackObjID ], trackPos: fixture.trackPos } );
        }
      }
    //}
  }
  // m_aabb
  // world.QueryAABB( function( fixture ) {
  //   //console.log("Fixture ", fixture, " is near driver # " + driverID );
  //   if ( fixture.driverID !== undefined ) {
  //     //if ( fixture.driverID != driverID ) {
  //     vehicleData[ vehicleID ].nearbyVehicles.push( fixture.driverID );
  //     //}
  //   }
  //   else {
  //     vehicleData[ vehicleID ].nearbyObjects.push( { position: trackBodyPositions[ fixture.trackObjID ], trackPos: fixture.trackPos });
  //   }
  // }, localBB[ vehicleID ] );

}

function createVehicle( vehicle ) {
  //console.log( "Creating vehicle object ", vehicle);
  var fixDef = new b2FixtureDef;
  fixDef.density = vehicle.density ? vehicle.density : 1.0;
  fixDef.friction = vehicle.friction !== undefined ? vehicle.friction : 0.01;
  fixDef.restitution = vehicle.restitution !== undefined ? vehicle.restitution : 0.4;
  var width = vehicle.width !== undefined ? vehicle.width : 0.2;
  var height = vehicle.height !== undefined ? vehicle.height : 0.50;
     
  var bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_dynamicBody;
    
   fixDef.shape = new b2PolygonShape;
   fixDef.shape.SetAsBox(
         height / 2
      ,  width / 2
   );
  
  var body = world.CreateBody(bodyDef)
  vehicleBodies.push( body );
  var fixture = body.CreateFixture(fixDef);
  fixture.driverID = vehicle.driverID;
  vehicleFixtures.push( fixture );
  body.SetPosition( vehicle.position );
  body.SetAngle( vehicle.angle );
  vehicleData.push( { position: body.GetPosition(), angle: body.GetAngle(), nearbyVehicles: [], nearbyObjects: [], velocity: body.GetLinearVelocity(), angularVelocity: body.GetAngularVelocity() })
  localBB.push( new b2AABB() );
}

function createTrackObject( object ) {
  //console.log( "Creating track object ", object);
  var fixDef = new b2FixtureDef;
  fixDef.density = object.density ? object.density : 1.0;
  fixDef.friction = object.friction !== undefined ? object.friction : 0.01;
  fixDef.restitution = object.restitution !== undefined ? object.restitution : 0.4;
  var width = object.width !== undefined ? object.width : 0.2;
  var length = object.length !== undefined ? object.length : 0.50;
  var angle = object.angle !== undefined ? object.angle : 0;
  var position = object.position !== undefined ? object.position : new b2Vec2();
     
  var bodyDef = new b2BodyDef;
  bodyDef.type = b2Body.b2_staticBody;
    
  fixDef.shape = new b2PolygonShape;
  fixDef.shape.SetAsBox(
       length / 2
    ,  width / 2
  );
  
  var body = world.CreateBody(bodyDef)
  trackBodies.push( body );
  var fixture = body.CreateFixture(fixDef);
  trackFixtures.push( fixture );
  
  fixture.trackObjID = trackBodyPositions.length;

  body.SetPosition( position );
  body.SetAngle( angle );

  trackBodyPositions.push( body.GetPosition() );
  //This will be used later to determine a driver's track progress
  fixture.trackPos = object.trackPos;
}
