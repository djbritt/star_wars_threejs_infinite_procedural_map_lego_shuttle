
/// seed perlin/simplex noise
noise.seed(Math.random());

/// stats
var stats = new Stats();
stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild( stats.dom );

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.9, 10000);
camera.position.y = 0.3;
camera.position.z = 2;


// TESTING GEMINI NEW SHIPS V1!!!!!!
const visibleRadius = 100; // Adjust this based on your requirements

let timeSinceLastSpawn = 0;

const clock = new THREE.Clock(true);


const fixedTimeStep = 1 / 60; // 60 FPS
let accumulator = 0;

const maxShipsInScene = 3;
// END ---------------- gemini v1



// scene.fog = new THREE.Fog(0x000000, 800, 1200);

var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// var controls = new THREE.OrbitControls( camera, renderer.domElement );
// controls.enableDamping = true;
// controls.dampingFactor = 0.25;
// controls.enableZoom = true;
// controls.enableKeys = false;


const lDrawLoader = new LDrawLoader();
const ldrawPath = './';
const shuttleModelFileName = './Procedural%20City_files/4494-1-Imperial Shuttle-Mini.mpd_Packed.mpd';

lDrawLoader.setPath(ldrawPath);
var lDrawGroup;
lDrawLoader.load(shuttleModelFileName, function(group) {
		scene.add(group);
		group.scale.set(0.1, 0.1, 0.1);

		// model.rotation.y = Math.PI;
		group.rotation.x = Math.PI;
		group.rotation.y = Math.PI;

		handleLoadedModel(group)

});



function handleLoadedModel(obj) {

		lDrawGroup = obj;
		console.log("RECEIVED OBJ")
		console.log(lDrawGroup)

		var ambientLight = new THREE.AmbientLight(0xffffff, 1); // High intensity
		scene.add(ambientLight);


		var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
		directionalLight.position.set( 3, 3, 3 );
		scene.add(directionalLight);

		var directionalLight2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
		directionalLight2.position.set( -3, 10, 5 );
		scene.add(directionalLight2);

		var ground = new THREE.Object3D();
		ground.rotation.x = Math.PI/2;
		// ground.position.y = -3;
		scene.add(ground);


		var landGeo = new THREE.PlaneGeometry(2500, 2500);
		var landMat = new THREE.MeshPhongMaterial({color:0x222222, side:THREE.DoubleSide});
		var land = new THREE.Mesh(landGeo, landMat);
		ground.add(land);


		/// camera target
		var cameraTarget = new THREE.Object3D();
		scene.add(cameraTarget);
		cameraTarget.position.y = 200;
		// cameraTarget.rotateY(Math.PI/4);
		cameraTarget.add(camera);

		/// ship
		// var ship = new THREE.Object3D();
		var ship = lDrawGroup;
		console.log("SHIP IS!!!!")
		console.log(ship)
		cameraTarget.add(ship);



		/// camera target motion
		var isAccel = false;
		var isDecel = false;
		var isRollRight = false;
		var isRollLeft = false;
		var isPitchUp = false;
		var isPitchDown = false;
		var isYawLeft = false;
		var isYawRight = false;

		var speed = 1;
		var pitchVel = 0;
		var rollVel = 0;
		var yawVel = 0;
		var isPaused = false;
		var shouldCaptureScreenshot = false;


		// ___________NEW CODE

		// Define the initial grid size and visible area
		const buildingSize = 10; // Assuming buildings are 10x10 units for simplicity

		// Initialize the grid based on the initial visible radius
		let gridSize = Math.ceil((2 * visibleRadius) / buildingSize);
		let grid = new Array(gridSize).fill(0).map(() => new Array(gridSize).fill(false));
		let gridOriginX = 0;
		let gridOriginY = 0;



		/// setup building grid
		var cellSize = 60;
		// var gridSize = 40;
		var allBuildings = [];
		var count = 0;
		let ships = []; // Declare and initialize ships as an empty array


		for (var i=0; i<gridSize; i++) {
			for (var j=0; j<gridSize; j++) {
		    var building = new Building(i*cellSize, j*cellSize, false);
		    allBuildings[count] = building;
				console.log("BUILDING IS!!!")
				console.log(building)
		    // if (!building.isStreet) {
				if (building && !building.isStreet) {

		        ground.add(building.object);
		    }
		    count++;
			}
		}


		cameraTarget.position.x = cellSize * gridSize * 0.5;
		cameraTarget.position.z = cellSize * gridSize * 0.5;




		// ----------------------------------WORKING!!!!!!!!!
		function updateGrid() {
		  var building, dx, dy, newX, newY, buffer;
		  buffer = cellSize * gridSize / 2;

		  for (var i = 0; i < allBuildings.length; i++) {
		    building = allBuildings[i];

		    if (!building.isDead) {
		      dy = building.y - cameraTarget.position.z;
		      dx = building.x - cameraTarget.position.x;
		      newX = building.x;
		      newY = building.y;

		      if (dx > buffer) {
		        newX -= buffer * 2;
		        building.isDead = true; // Update the isDead property here
		      } else if (dx < -buffer) {
		        newX += buffer * 2;
		        building.isDead = true; // Update the isDead property here
		      }

		      if (dy > buffer) {
		        newY -= buffer * 2;
		        building.isDead = true; // Update the isDead property here
		      } else if (dy < -buffer) {
		        newY += buffer * 2;
		        building.isDead = true; // Update the isDead property here
		      }

		      if (building.isDead) {
		        setTimeout(addNewBuilding.bind(this, newX, newY, i), Math.random() * 200);
		      }
		    }
		  }
		}
		var addNewBuilding = function(x, y, index) {
		    if (allBuildings[index]) {
		        ground.remove(allBuildings[index].object);
		        if (typeof allBuildings[index].destroy === 'function') {
		            allBuildings[index].destroy();  // Make sure this method exists and cleans up properly
		        }
		    }

		    // Instantly replace the old building with a new one
		    var newBuilding = new Building(x, y, false);
		    allBuildings[index] = newBuilding;

		    if (!newBuilding.isStreet) {
		        ground.add(newBuilding.object);
		    }
		}

		// --------------------------------------------- END WORKING




		function updateFlight() {

			var maxSpeed = 3.0;

			// var minSpeed = 0.5;
			var minSpeed = 0;

			var accel = 0.03;

			if (isAccel) {

				speed += accel;

			} else if (isDecel) {

				speed -= accel;

			}

			// Clamping speed to stay within limits

			if (speed > maxSpeed) speed = maxSpeed;

			if (speed < minSpeed) speed = minSpeed;

			// Move the camera target forward

			cameraTarget.translateZ(-speed);

			// Adjust rotations based on input

			var pitchAccel = 0.001;

			if (isPitchUp) pitchVel += pitchAccel;

			if (isPitchDown) pitchVel -= pitchAccel;

			pitchVel *= 0.95;

			cameraTarget.rotateX(pitchVel);

			var rollAccel = 0.002;

			if (isRollRight) rollVel -= rollAccel;

			if (isRollLeft) rollVel += rollAccel;

			rollVel *= 0.95;

			cameraTarget.rotateZ(rollVel);

			var yawAccel = 0.001;

			if (isYawRight) yawVel -= yawAccel;

			if (isYawLeft) yawVel += yawAccel;

			yawVel *= 0.95;

			cameraTarget.rotateY(yawVel);

			// Maintain camera's relative position by setting it relative to the cameraTarget

			//Manages camera position compared to flight object
			camera.position.set(0, 20, 50); // Relative position to cameraTarget, adjust as needed

			camera.lookAt(cameraTarget.position);

		}
		let lastTime = performance.now();
		const targetFPS = 60;
		const targetDelay = 1000 / targetFPS;



// ORIGINAL WORKING
		function render() {
			// throw new Error();
		  stats.begin();

			requestAnimationFrame(render);
		  // controls.update();
		  update();
		  renderer.render(scene, camera);

		  if (shouldCaptureScreenshot == true){
		      takeScreenshot();
		      shouldCaptureScreenshot = false;
		  }

		  stats.end();
		}
		render();
// END ORIGINAL WORKING!!!!!

// Initialize the game loop


// function gameLoop(currentTime) {
//   const elapsedTime = currentTime - lastTime;
//   if (elapsedTime >= targetDelay) {
//     lastTime = currentTime;
//     update(elapsedTime);
//     render();
// 		renderer.render(scene, camera);
//   }
//   requestAnimationFrame(gameLoop);
// }



var num = 1;
function update() {
// console.log("INSIDE UPDATE!!!!")
	const delta = clock.getDelta();
  accumulator += delta;

  while (accumulator >= fixedTimeStep) {
    if (!isPaused) {
      // Update flight controls and camera position (existing logic)

      updateFlight(fixedTimeStep);

      // Update the grid (existing logic)
      updateGrid(fixedTimeStep);

      // Update land position (existing logic)
      land.position.x = cameraTarget.position.x;
      land.position.y = cameraTarget.position.z;


			if (num == 1) {
				console.log("NUM IS ONE!!!!!!!!")
				addNewShip();
				num++
			}

      // Add new ships every 3 seconds
      timeSinceLastSpawn += fixedTimeStep;
			// console.log("TIME SINCE LAST SPAWN!!!!")
			// console.log(timeSinceLastSpawn)
      if (timeSinceLastSpawn >= 3) {
        timeSinceLastSpawn = 0;
        addNewShip();
      }

      // Update and manage ships (existing code)
      updateShips(ships, fixedTimeStep); // Pass the 'ships' array and delta as arguments
    }

    accumulator -= fixedTimeStep;
  }

  requestAnimationFrame(update);
}




		//need to fix the pausing command
		//ORIGINAL WORKING!!!!!!
		// function update() {
		// 	if (!isPaused) {
		// 		updateFlight();
		// 		updateGrid();
		// 		land.position.x = cameraTarget.position.x;
		// 	  land.position.y = cameraTarget.position.z;
		// 	}
		// }
		// END ORIGINAL WORKING!!!!!!!!!

		// GEMINI V1!!!!!




		// function addNewShip() {
		// 	console.log("INSIDE ADD NEW SHIP!!!!!!")
		//   // Clone the original ship model (lDrawGroup) to create a new instance
		//   const newShip = lDrawGroup.clone();
		//
		//   // Get the player's current position and direction
		//   const playerPosition = cameraTarget.position;
		//   const playerDirection = new THREE.Vector3();
		//   camera.getWorldDirection(playerDirection);
		//
		// 	console.log("CAMERA WORLD DIRECTION!!")
		// 	console.log(camera.getWorldDirection(playerDirection))
		//
		//   // Calculate the forward position where the new ship should be placed
		//   const distanceInFrontOfPlayer = 600; // Distance in front of the player to place the new ship
		//   const shipPosition = new THREE.Vector3(
		//     playerPosition.x + playerDirection.x * distanceInFrontOfPlayer,
		//     playerPosition.y + playerDirection.y * distanceInFrontOfPlayer,
		//     playerPosition.z + playerDirection.z * distanceInFrontOfPlayer
		//   );
		//
		// 	console.log("NEW SHIP POSITIONG!!!")
		// 	console.log(shipPosition)
		//
		// 	newShip.position.x = shipPosition.x+ Math.random()*100-50; // Random x-position within 50 units of the player
		// 	newShip.position.y = shipPosition.y+ 200; // Random y-position within 50 units of the player
		// 	newShip.position.z = shipPosition.z+500; // 200 units in front of the player
		//
		// 	console.log("SHIP POSITION X")
		// 	console.log(shipPosition.x+ Math.random()*100-50)
		// 	console.log("SHIP POSITION Y")
		// 	console.log(shipPosition.y+ 200)
		// 	console.log("SHIP POSITION z")
		// 	console.log(shipPosition.z+300)
		//
		// 	// newShip.position.x = playerShipPosition.x+ Math.random()*100-50; // Random x-position within 50 units of the player
		// 	// newShip.position.y = playerShipPosition.y+ Math.random()*100-50; // Random y-position within 50 units of the player
		// 	// newShip.position.z = playerShipPosition.z-200; // 200 units in front of the player
		//
		//   // Set the new ship's position
		//   newShip.position.copy(shipPosition);
		//
		//   // Align the ship to face the same direction as the player
		//   newShip.quaternion.copy(camera.quaternion);
		//
		//   // Set a random velocity for the new ship
		//   const minVelocity = 1;
		//   const maxVelocity = 3;
		//   newShip.velocity = {
		//     x: (Math.random() * 2 - 1) * maxVelocity, // Random x-velocity between -maxVelocity and maxVelocity
		//     y: (Math.random() * 2 - 1) * maxVelocity, // Random y-velocity between -maxVelocity and maxVelocity
		//     z: minVelocity + Math.random() * (maxVelocity - minVelocity) // Random positive z-velocity between minVelocity and maxVelocity
		//   };
		//
		//   // Add the new ship to the scene and ships array
		//   scene.add(newShip);
		//   ships.push(newShip);
		//
		//   // Manage the number of ships in the scene
		//   if (ships.length > maxShipsInScene) {
		//     const oldestShip = ships.shift(); // Remove the first (oldest) ship from the array
		//     scene.remove(oldestShip); // Remove the oldest ship from the scene
		//   }
		// }


// WORKING!!!!!-----------

			function updateShipFlight(ship, delta) {
				ship.position.x += ship.velocity.x * delta;
				ship.position.y += ship.velocity.y * delta;
				ship.position.z += 1;
			}




			function addNewShip() {
			  // Clone the original ship model (lDrawGroup) to create a new instance
			  const newShip = lDrawGroup.clone();
				// const playerDirection = new THREE.Vector3();
			  const playerShipPosition = cameraTarget.position;

				// Initialize the bounding box
			  const boundingBox = new THREE.Box3();

			  // Traverse the newShip object and calculate the bounding box
			  newShip.traverse((child) => {
			    if (child instanceof THREE.Mesh) {
			      // Calculate the local bounding box
			      child.geometry.computeBoundingBox();
			      const localBBox = new THREE.Box3().copy(child.geometry.boundingBox);

			      // Transform the local bounding box to the global coordinate system
			      localBBox.applyMatrix4(child.matrixWorld);

			      // Expand the overall bounding box
			      boundingBox.union(localBBox);
			    }
			  });

			  console.log("BOUNDING BOX!!!!");
			  console.log(boundingBox);


				// Calculate the forward direction of the player's ship
			   const playerForwardDirection = new THREE.Vector3();
			   cameraTarget.getWorldDirection(playerForwardDirection);

				 // Rotate the forward direction vector to be parallel to the player's ship orientation
				  const playerQuaternion = cameraTarget.quaternion.clone();
					const rotatedForwardDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(playerQuaternion);

				  // const rotatedForwardDirection = new THREE.Vector3();
				  // rotatedForwardDirection.copy(playerForwardDirection).applyQuaternion(playerShipQuaternion);


				// Calculate the forward position where the new ship should be placed
				const distanceInFrontOfPlayer = 500; // Distance in front of the player to place the new ship


				// Calculate the bounding box of the new ship
					const newShipBoundingBox = new THREE.Box3();
					newShip.traverse((child) => {
						if (child instanceof THREE.Mesh) {
							child.geometry.computeBoundingBox();
							newShipBoundingBox.expandByObject(child);
						}
					});

					// Calculate the bounding box of the player's ship
					const playerShipBoundingBox = boundingBox;

					// Calculate a safe position for the new ship
					const safeDistance = 50; // Minimum distance between the new ship and the player's ship
					let newShipPosition;
					do {
						// const newShipPosition = new THREE.Vector3(
						// 	playerShipPosition.x + playerForwardDirection.x * distanceInFrontOfPlayer + (Math.random() * 2 - 1) * 100,
						// 	playerShipPosition.y + playerForwardDirection.y * distanceInFrontOfPlayer + (Math.random() * 2 - 1) * 100,
						// 	playerShipPosition.z + playerForwardDirection.z * distanceInFrontOfPlayer
						// );

						const newShipPosition = new THREE.Vector3(
					    playerShipPosition.x + rotatedForwardDirection.x * distanceInFrontOfPlayer+ (Math.random() * 2 - 1) * 100,
					    playerShipPosition.y + rotatedForwardDirection.y * distanceInFrontOfPlayer+ (Math.random() * 2 - 1) * 100,
					    playerShipPosition.z + rotatedForwardDirection.z * distanceInFrontOfPlayer
					  );
						console.log("TESTING SHIP POSITION!!!!----------------------")

						console.log(newShipPosition)
						console.log(newShipPosition.z-(distanceInFrontOfPlayer*2))

						console.log("------------------------------------------------")
						const workingShipPosition = new THREE.Vector3(
							playerShipPosition.x+ Math.random()*100-50,
							playerShipPosition.y+ Math.random()*100-50,
							playerShipPosition.z-distanceInFrontOfPlayer
						);

						newShip.position.x = newShipPosition.x; // Random x-position within 50 units of the player
						newShip.position.y = newShipPosition.y; // Random y-position within 50 units of the player
						newShip.position.z = newShipPosition.z-(distanceInFrontOfPlayer*2); // 200 units in front of the player

						console.log("ACTUAL SPAWNED SHIP POSITION!!!!----------------")
						console.log(workingShipPosition)
						console.log("------------------------------------------------")



						// Check if the new ship's bounding box overlaps with the player's ship's bounding box
						newShipBoundingBox.copy(newShipBoundingBox).translate(newShipPosition.sub(newShip.position));
					} while (
						newShipBoundingBox.min.x < playerShipBoundingBox.max.x + safeDistance &&
						newShipBoundingBox.max.x > playerShipBoundingBox.min.x - safeDistance &&
						newShipBoundingBox.min.y < playerShipBoundingBox.max.y + safeDistance &&
						newShipBoundingBox.max.y > playerShipBoundingBox.min.y - safeDistance &&
						newShipBoundingBox.min.z < playerShipBoundingBox.max.z + safeDistance &&
						newShipBoundingBox.max.z > playerShipBoundingBox.min.z - safeDistance
					);


				//
			  // // Set a random velocity for the new ship
			  const minVelocity = 1;
			  const maxVelocity = 3;
			  newShip.velocity = {
			    x: (Math.random() * 2 - 1) * maxVelocity, // Random x-velocity between -maxVelocity and maxVelocity
			    y: (Math.random() * 2 - 1) * maxVelocity, // Random y-velocity between -maxVelocity and maxVelocity
			  	z: minVelocity + Math.random() * (maxVelocity - minVelocity) // Random positive z-velocity between minVelocity and maxVelocity
			  };




				// newShip.rotation.x = Math.PI;
				newShip.rotation.y = Math.PI;
				// newShip.rotation.z = Math.PI;

				newShip.rotation.copy(playerShipPosition);


			  // Add the new ship to the scene
			  scene.add(newShip);
			  console.log("NEW SHIP ADDED!!!!");

			  // Add the new ship to the ships array
			  ships.push(newShip);

			  if (ships.length > maxShipsInScene) {
			    const oldestShip = ships.shift(); // Remove the first (oldest) ship from the array
			    scene.remove(oldestShip); // Remove the oldest ship from the scene
			    console.log("SHIP REMOVED FROM SCENE")

			  }
			}

// END WORKING----------

function updateShips(ships, delta) {
	if (!isPaused) {
		for (let i = 0; i < ships.length; i++) {for (let i = ships.length - 1; i >= 0; i--) {
				const ship = ships[i];

				updateShipFlight(ship, delta);

				// Check if the ship has left the visible grid area
				// if (
				//   Math.abs(ship.position.x) > (gridSize * gridSize) / 2 + visibleRadius * buildingSize ||
				//   Math.abs(ship.position.z) > (gridSize * gridSize) / 2 + visibleRadius * buildingSize
				// ) {
				//   // Remove the ship from the scene and the ships array
				//   scene.remove(ship);
				//   ships.splice(i, 1);
				// }
			}

		// Add new ships every 3 seconds

		// timeSinceLastSpawn += fixedTimeStep;
		// if (timeSinceLastSpawn >= 3) {
		//   timeSinceLastSpawn = 0;
		//   addNewShip();
		// }
	}
}
}



		function takeScreenshot() {
		  var w = window.open('', '');
		  w.document.title = "screenshot";
		  w.document.body.style.backgroundColor = "black";
		  w.document.body.style.margin = "0px";

		  var img = new Image();
		  img.src = renderer.domElement.toDataURL();
		  img.width = window.innerWidth;
		  img.height = window.innerHeight;
		  w.document.body.appendChild(img);
		}

		window.addEventListener('resize', function()
		{
			var WIDTH = window.innerWidth,
			HEIGHT = window.innerHeight;
			renderer.setSize(WIDTH, HEIGHT);
			camera.aspect = WIDTH / HEIGHT;
			camera.updateProjectionMatrix();
		});

		document.onkeydown = function(e) {
		    e = e || window.event;

		    console.log(e.keyCode);
		    if (e.keyCode == '72') {
		      var brandTag = document.getElementById("brandTag");
		      var keyControls = document.getElementById("controls");
		      if (brandTag.style.visibility == "hidden") {
		        brandTag.style.visibility = "visible";
		        keyControls.style.visibility = "visible";
		      } else {
		        brandTag.style.visibility = "hidden";
		        keyControls.style.visibility = "hidden";
		      }
		    }

		    if (e.keyCode == '32') {
		      isPaused = !isPaused;
		    }

		    if (e.keyCode == '67') {
		      shouldCaptureScreenshot = true;
		    }

		    if (e.keyCode == '82') {
		      controls.reset();
		    }

		    if (e.keyCode == '87') // w
		    {
		    	isAccel = true;
		    }
		    if (e.keyCode == '83') // s
		    {
		    	isDecel = true;
		    }
		    if (e.keyCode == '65') // a
		    {
		    	isYawLeft = true;
		    }
		    if (e.keyCode == '68') // d
		    {
		    	isYawRight = true;
		    }

		    if (e.keyCode == '38') // up
		    {
		    	isPitchDown = true;
		    }
		    if (e.keyCode == '40') // down
		    {
		    	isPitchUp = true;
		    }
		    if (e.keyCode == '37') // left
		    {
		    	isRollLeft = true;
		    }
		    if (e.keyCode == '39') // right
		    {
		    	isRollRight = true;
		    }
		}

		document.onkeyup = function(e)
		{
		    e = e || window.event;

		    // console.log(e.keyCode);

		    if (e.keyCode == '87') // w
		    {
		    	isAccel = false;
		    }
		    if (e.keyCode == '83') // s
		    {
		    	isDecel = false;
		    }
		    if (e.keyCode == '65') // a
		    {
		    	isYawLeft = false;
		    }
		    if (e.keyCode == '68') // d
		    {
		    	isYawRight = false;
		    }

		    if (e.keyCode == '38') // up
		    {
		    	isPitchDown = false;
		    }
		    if (e.keyCode == '40') // down
		    {
		    	isPitchUp = false;
		    }
		    if (e.keyCode == '37') // left
		    {
		    	isRollLeft = false;
		    }
		    if (e.keyCode == '39') // right
		    {
		    	isRollRight = false;
		    }
		}

}
