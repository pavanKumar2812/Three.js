import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import Stats from '../build/stats.module.js'
import { GUI } from '../build/dat.gui.module.js'
import { DragControls } from './jsm/controls/DragControls.js';
import { createTalkingObjects } from "./CreateCubes.js"

let voices; // voices available for text to speech

const msg = new SpeechSynthesisUtterance(); // new instance of SpeechSynthesisUtterance

const talkingObjects = new THREE.Group(); // all talking objects

// Event listener for when voices are changed
window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    console.log(voices);
};

// If voices are already available, get them immediately
// if (window.speechSynthesis.onvoiceschanged !== undefined) {
//     voices = window.speechSynthesis.getVoices();
//     console.log(voices);
// }


const colorSpan = document.getElementById("color");

// SCENE
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

const dragControls = new DragControls(talkingObjects.children, camera, renderer.domElement);
dragControls.addEventListener('dragstart', function (event) {
    controls.enabled = false;

    // Change voice for each cube
    const cube = event.object;
    if (cube.name === "red") msg.voice = voices[0];
    if (cube.name === "white") msg.voice = voices[1];
    if (cube.name === "blue") msg.voice = voices[2];

    msg.text = cube.name;
    msg.rate = 0.65; // Speech speed (lower # = slower speech)
    msg.volume = 1.5;

    window.speechSynthesis.speak(msg);
});

// Ground
const plane1 = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: "darkgreen" })
);
plane1.position.set(0, -0.5, 0);
plane1.rotateX(-Math.PI / 2);
plane1.receiveShadow = true;
scene.add(plane1);

createTalkingObjects(scene, talkingObjects);


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = new Stats()
document.body.appendChild(stats.dom)

// Show question
const questions = [
    "Grab each cube and say the color."
];

// span element will display question text
const questionSpan = document.getElementById("question");
questionSpan.innerText = questions[0];

// Say question
msg.lang = "en-IN"; // Speech language
// other language: en-CA, en-US, de-DE, fr-FR, ja-JP, ko-KR, es-ES
//                 English, english, Dutch, French, Japanese, Korean, Spanish

msg.rate = 0.8; // speech speed ( lower # = slower speech )
msg.volume = 1; // speech volume
msg.text = questions[0]; // question to speak (first question in questions array)

window.speechSynthesis.speak(msg);

function animate() {
    controls.update(); // nedded when enableDamping = true

    stats.update();
    render();
    requestAnimationFrame(animate);

}

function render() {
    renderer.render(scene, camera)
}

animate()


window.addEventListener('resize', onWindowResize, false)