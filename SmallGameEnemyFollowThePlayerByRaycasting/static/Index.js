import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import Stats from '../build/stats.module.js'
import { GUI } from '../build/dat.gui.module.js'
import { DragControls } from './jsm/controls/DragControls.js';

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(
    60, // fiels of view in vertical degree
    window.innerWidth / window.innerHeight, // aspect ratio: ratio of image width to height
    0.1, // near distance from camera object starts to appear
    20000 // far: distance from camera objects stops appearing
);
camera.position.set(3, 5, 3); // change position of camera on z axis
const gui = new GUI();
const cameraFolder = gui.addFolder('Camera')
cameraFolder.add(camera.position, 'x', 0, 10)
cameraFolder.add(camera.position, 'y', 0, 10)
cameraFolder.add(camera.position, 'z', 0, 10)
cameraFolder.open()
camera.lookAt(new THREE.Vector3(0, 0, 0)); // point camera to this x,y,z position

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; 
document.body.appendChild(renderer.domElement);

// LIGHT
const ambient = new THREE.HemisphereLight(0xffffbb, 1); // no shadows
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.3); // shadows
dirLight.position.set(1, 2, -1);
scene.add(dirLight);
dirLight.castShadow = true;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // adds deceleration effects
controls.dampingFactor = 0.05;

// Enemy cube - grey
const enemyCube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshPhongMaterial({ color:0x333333 })
);
enemyCube.position.set(0, 0, 0);
scene.add(enemyCube);

// Player Cube - yellow
const playerCube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshPhongMaterial({ color: 0xffff00 })
);
playerCube.position.set(23, 0, 23);
scene.add(playerCube);

playerCube.name = "player";

// Ground
const plane1 = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: "darkgreen" })
);
plane1.position.set(0, -0.5, 0);
plane1.rotateX(-Math.PI / 2);
plane1.receiveShadow = true;
scene.add(plane1);

const raycaster = new THREE.Raycaster();

const search = []; // direction of all raycaster rays
const lag = 0.02; // enemy speed lag

for(let i = 180; i<360; i+=3) {  // raycaster is every 3 degrees
    search[i] = new THREE.Vector3(Math.cos(i), 0, Math.sin(i));

}


window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = new Stats()
document.body.appendChild(stats.dom)

function animate() {
    
    checkForTarget(); // enemy uses raycasting to check for player 

    stats.update();
    render();
    requestAnimationFrame(animate);

}


function render() {
    renderer.render(scene, camera)
}

animate()

const loaderReadyEvent = new Event('GLTFLoaderReady');
document.dispatchEvent(loaderReadyEvent);


// Helping Functions
function handleKeyDownEvent(e, cube) {
    if (e.keyCode === 37) {
        cube.position.x -= 1; // change x by -1 LEFT 
        // console.log("left Key");
    } else if (e.keyCode === 39) { 
        // if right arrow Key pressed
        cube.position.x += 1; // change x by +1 RIGHT 
    } else if (e.keyCode === 38) {
        // if up arrow key pressed
        cube.position.z -= 1; // change z by -1 FORWARD 
    } else if (e.keyCode === 40) {
        // if down arrow key pressed
        cube.position.z += 1; // change z by +1 BACKWARD 
    }
}

function checkForTarget() {

    search.forEach((direction) => {
        // direction is a Vector3(x,y,z)

        // ray starts here, direction, near, far
        raycaster.set(enemyCube.position, direction, 0, 50);

        // ENEMY ONLY DETECTS FIRST OBJECT HIT BY RAYCASTER - PLAYER CAN HIDE BEHIND OBJECT
        // Check if ray intersects any object in scene
        // Check if ray intersects any object in scene
        const intersects = raycaster.intersectObjects(scene.children, false);

        // Check if there are intersections and the first intersection has an object
        if (intersects.length > 0 && intersects[0].object) {
            // Check if the object has a name (player)
            if (intersects[0].object.name) {
                // Move towards the player
                enemyCube.position.x += (direction.x * lag);
                enemyCube.position.z += (direction.z * lag);
            }
        }

    });
}

document.onkeydown = function (e) {
    handleKeyDownEvent(e, playerCube);
};
