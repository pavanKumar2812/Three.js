import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.setClearColor( 0xE0EAF5, 1 );

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);

const loader = new GLTFLoader();
const text = document.querySelector(".Display");
const TIME_LIMIT = 10;
let gameStat = "loading"
let isLookingBackward = true;

//musics
const bgMusic = new Audio('./music/bg.mp3')
bgMusic.loop = true
const winMusic = new Audio('./music/win.mp3')
const loseMusic = new Audio('./music/lose.mp3')

const StartPosition = 3;
const EndPosition = -StartPosition;

class Doll
{
    constructor()
    {
        loader.load('./Models/SquidGameDoll.glb', (gltf) => {
            // Assuming that the loaded model is a single object (not a scene)
            const model = gltf.scene || gltf.scenes[0]; // Use gltf.scenes[0] if the model is in a separate scene
        
            if (model) {
                scene.add(model);
                model.scale.set(2, 2, 2);
                model.position.set(0, -3.5, 0);
                this.doll = gltf.scene;
            } else {
                console.error('Failed to load model:', gltf);
            }
        }, undefined, function (error) {
            console.error('Error loading GLB model', error);
        });
    }

    lookBackward()
    {
        // this.doll.rotation.y = -3.15;
        gsap.to(this.doll.rotation, {y: -3.15, duration: .45})
        setTimeout(() => isLookingBackward = true, 150)
    }

    lookForward()
    {
        gsap.to(this.doll.rotation, {y: 0, duration: .45})
        setTimeout(() => isLookingBackward = false, 450)
    }

    async start()
    {
        this.lookBackward();
        await delay((Math.random() * 1000) + 1000);
        this.lookForward();
        await delay((Math.random() * 730) + 730);
        this.start();
    }
};

class Player
{
    constructor()
    {
        loader.load('./Models/Player.glb', (gltf) => {
            // Assuming that the loaded model is a single object (not a scene)
            const model = gltf.scene || gltf.scenes[0]; // Use gltf.scenes[0] if the model is in a separate scene
        
            if (model) {
                scene.add(model);
                model.scale.set(.1, .1, .1);
                model.position.set(StartPosition + 0.5, -0.5, 0);
                model.rotation.y = -1.5
                this.player = model;
                this.playerInfo = {
                    positionX: StartPosition + 0.5,
                    velocity: 0
                }
            } else {
                console.error('Failed to load model:', gltf);
            }
        }, undefined, function (error) {
            console.error('Error loading GLB model', error);
        });
    }

    run()
    {
        this.playerInfo.velocity = .001;
    }

    stop()
    {
        // this.playerInfo.velocity = 0;
        gsap.to(this.playerInfo, {velocity: 0, duration: .05})
    }

    check()
    {
        if(this.playerInfo.velocity > 0 && !isLookingBackward) {
            // alert("you lost");
            text.innerText = "You Lose! :("
            gameStat = "over";
        }
        if(this.playerInfo.positionX < EndPosition - 0.4) {
            // alert("You win!")
            text.innerText = "You win!"
            gameStat = "over";
        }
    }

    update()
    {
        this.check()
        this.playerInfo.positionX -= this.playerInfo.velocity;
        this.player.position.x = this.playerInfo.positionX;

        requestAnimationFrame(() => this.update());
    }

}

function createCube(size, positionX, rotationY = 0, color = 0x213E60)
{
    const geometry = new THREE.BoxGeometry( size.width, size.height, size.depth );
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = positionX;
    cube.rotation.y = rotationY;
    scene.add( cube );
    return cube;
}

function createTrack()
{
    createCube({ width: StartPosition * 2 + .2, height: 1, depth: 1 }, 0, 0, 0x37516F).position.z = -.8;
    createCube({ width: .2, height: 1, depth: 1 }, StartPosition, -.35);
    createCube({ width: .2, height: 1, depth: 1 }, EndPosition, .35);
    
}

function delay(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

createTrack();

let doll = new Doll();
let player = new Player();

async function init() {
    await delay(500)
    text.innerText = "Starting in 3"
    await delay(500)
    text.innerText = "Starting in 2"
    await delay(500)
    text.innerText = "Starting in 1"
    await delay(500)
    text.innerText = "Go!!!"
    bgMusic.play()
    startGame()
}

function startGame()
{
    gameStat = "started";
    const progressBar = createCube({ width: 5, height: .1, depth: 1 }, 0, 0, 0x37516F);
    progressBar.position.y = 3.35
    gsap.to(progressBar.scale, {duration: TIME_LIMIT, x: 0, ease: "none"})
    doll.start()
    setTimeout(() => {
        if(gameStat != "over") {
            text.innerText = "Time Over! :("
            gameStat = "over"
        }
    }, TIME_LIMIT * 1000)
}

init();

// const controls = new OrbitControls(camera, renderer.domElement);

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
};

window.addEventListener('keydown', (e) => {
    // alert(e.key);
    if(gameStat != "started") return
    if(e.key == "ArrowLeft") {
        player.run();
    };
});

window.addEventListener('keyup', (e) => {
    if(e.key == "ArrowLeft") {
        player.stop();
    }
})

function animate() 
{
    if(gameStat == "over") return
    requestAnimationFrame(animate);
    // controls.update();
    render();
    player.update();
}

function render() 
{
    renderer.render(scene, camera);
}

animate();