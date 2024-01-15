import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import Stats from '../build/stats.module.js'
import { GUI } from '../build/dat.gui.module.js'
import { DragControls } from './jsm/controls/DragControls.js';

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x87ceeb);
// scene.add(new THREE.AxesHelper(5))

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
const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 1); // no shadows
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.3, 50); // shadows
dirLight.position.set(1, 2, -1);
scene.add(dirLight);
dirLight.castShadow = true;

// Cubes 1
const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial({ color: 0xff0000 })
);
cube1.position.set(3, 0, 0);
cube1.castShadow = true;
cube1.receiveShadow = true;
scene.add(cube1);

// cube 1 bounding box
let cube1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube1BB.setFromObject(cube1);
// console.log(cube1BB);

// Cube 2
const cube2 = new THREE.Mesh(// Blue color
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial({ color: 0x0000ff })
);
cube2.position.set(-3, 0, 0);
cube2.castShadow = true;
cube2.receiveShadow = true;
scene.add(cube2);

// Cube 2 Bounding box
let cube2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube2BB.setFromObject(cube2);
console.log(cube2BB);

// Ball 1
const ball1 = new THREE.Mesh( // green cube
    new THREE.SphereGeometry(1),
    new THREE.MeshPhongMaterial({ color: 0xff1493 })
);
ball1.position.set(0, 0, 0);
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

const controls = new DragControls([cube1, cube2, ball1], camera, renderer.domElement);
// const orbitControls = new OrbitControls(camera, renderer.domElement)
const stats = new Stats()
document.body.appendChild(stats.dom)

// const gui = new GUI()
// const cube1Folder = gui.addFolder('Cube')
// cube1Folder.add(cubes[0].rotation, 'x', 0, Math.PI * 2)
// cube1Folder.add(cubes[0].rotation, 'y', 0, Math.PI * 2)
// cube1Folder.add(cubes[0].rotation, 'z', 0, Math.PI * 2)
// const cube2Folder = gui.addFolder('Cube2')
// cube2Folder.add(cubes[1].rotation, 'x', 0, Math.PI * 2)
// cube2Folder.add(cubes[1].rotation, 'y', 0, Math.PI * 2)
// cube2Folder.add(cubes[1].rotation, 'z', 0, Math.PI * 2)

function animate() {
    requestAnimationFrame(animate);

    // cubes[0].rotation.x += 0.01;
    // cubes[0].rotation.y += 0.011;
    // cubes[1].rotation.x += 0.012;
    // cubes[1].rotation.y += 0.013;
    // cubes[2].rotation.x += 0.014;
    // cubes[2].rotation.y += 0.015;

    // orbitControls.update();

    // When moving the cube2 the bounding box need to move 
    cube2BB.copy( cube2.geometry.boundingBox ).applyMatrix4(cube2.matrixWorld);
    // console.log(cube2BB);

    // console.log(cube2BB.intersectsBox(cube1BB));
    // console.log(cube2BB.intersectsSphere(ball1BB));
    
    checkCollisions();
    
    render();
    stats.update();
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
        cube2.position.z -= 1; // change z by -1 FORWARD 
    } else if (e.keyCode === 40) {
        // if down arrow key pressed
        cube2.position.z += 1; // change z by +1 BACKWARD 
    }
}

function checkCollisions() {

    // INTERSECTING (TOUCHING) TEST
    // does bounding box intersect with bounding sphere of another object

    if(cube2BB.intersectsBox(cube1BB)) {
        animate1(); // if true, call func. animation1 to change cube1 opacity & color
        console.log(`cube2 bounding box intersect with bounding box of cube1 bounding box `);
    } else {
        cube1.material.opacity = 1.0; // if false, restore cube1 opacity
    }

    if(cube2BB.intersectsSphere(ball1BB)) {
        animate2(); // if true, call func. animation2 to change ball1 opacity & color
        console.log(`cube2 bounding box intersect with bounding sphere of ball1 bounding box `);
    } else {
        ball1.material.opacity = 1.0; // if false, restore ball1 opacity
    }

    // CONTAINS TEST
    // does bounding box contain a bounding box of another object

    if (cube2BB.containsBox(cube1BB)) {
        cube2.scale.y = 3 // if true, change sclae on y axis of player cube
    } else {
        cube2.scale.y = 1; // if false, restore scale on y-axis of player cube
    }

}

function animate1() {
    cube1.material.transparent = true;
    cube1.material.opacity = 0.5;
    cube1.material.color = new THREE.Color(Math.random() * 0xffffff);
}

function animate2() {
    ball1.material.transparent = true;
    ball1.material.opacity = 0.5;
    ball1.material.color = new THREE.Color(Math.random() * 0xffffff);
}

document.onkeydown = function (e) {
    handleKeyDownEvent(e, cube2);
};
