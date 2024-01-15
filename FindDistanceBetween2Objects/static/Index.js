import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import Stats from '../build/stats.module.js'
import { GUI } from '../build/dat.gui.module.js'
import { DragControls } from './jsm/controls/DragControls.js';


/* To find the distance b/w 2 objects three.js

.distanceToPoint ( point: Vector3 ): Float
returns the closest distance from the boundary of the sphere to the point. if the sphere contains the point,
the distance will be negative.

Remember we used to create a bounding box to the objects(cube or sphere) to detect the object collision

so to find the distance we create a object and its bounding box and place a point(dot) to the center of the 
bounding box and by referring that point(dot) to the other point we can get the distance.

    TO-DO List
1) Create bounding box for cube
2) Set target point as ball position
3) Update position of the bounding box
4) Measure distance
5) Update display with distance

*/

const span1 = document.getElementById("distance");
let distance;

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

// Cubes 1
const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial({ color: 0xff0000 })
);
cube1.position.set(0, 0, -10);
cube1.castShadow = true;
cube1.receiveShadow = true;
scene.add(cube1);

// cube 1 bounding box
let cube1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube1BB.setFromObject(cube1);
// console.log(cube1BB);

// Ball 1
const ball1 = new THREE.Mesh( // green cube
    new THREE.SphereGeometry(1),
    new THREE.MeshPhongMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 })
);
ball1.position.set(0, 0, 0);
let target = ball1.position.clone();  // set target for cubes to measure distance to another objects

ball1.castShadow = true;
ball1.receiveShadow = true;
scene.add(ball1);
console.log(ball1)

// ball bounding sphere
let ball1BB = new THREE.Sphere(ball1.position, 1);
console.log(ball1BB);

// Ground
const plane1 = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({ color: "darkgreen" })
);
plane1.position.set(0, -0.5, 0);
plane1.rotateX(-Math.PI / 2);
plane1.receiveShadow = true;
scene.add(plane1);

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
    controls.update(); // nedded when enableDamping = true

    // When moving the cube2 the bounding box need to move 
    cube1BB.copy( cube1.geometry.boundingBox ).applyMatrix4(cube1.matrixWorld);
    // console.log(cube2BB);

    // console.log(cube2BB.intersectsBox(cube1BB));
    // console.log(cube2BB.intersectsSphere(ball1BB));
    
    updateDistance(); 

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

function updateDistance() {

    // calculate distance to sphere for each cube to 1 decimal place
    // toFixed(n); return string; n = number of digits to appear after decimal point
    distance = (Math.round((cube1BB.distanceToPoint(target)*10)/10).toFixed(1));

    // console.log(3.523), Math.round(3.523), Math.round((3.523)*10), Math.round((3.523)*10 / 10);
    //            3.523,              4,                35,                       3.5

    span1.innerText = "Distance to sphere \n" + distance + " m"; 
}

document.onkeydown = function (e) {
    handleKeyDownEvent(e, cube1);
};
