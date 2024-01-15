import * as THREE from '../build/three.module.js'; 


function createTalkingObjects(scene, talkingObjects) {

    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const cubeColors = [0xff0000, 0xffffff, 0x0000ff];
    const cubeNames = ["red", "white", "blue"];

    for(let i=0; i<3; i++) {
        createCube(cubeColors[i], cubeNames[i], i);
    }

    function createCube(colour, name, i) {
        const cube = new THREE.Mesh(cubeGeo, new THREE.MeshStandardMaterial({ color: colour }));
        cube.name = name;
        cube.position.set( i*3 - 3, 0.5, 0 );
        cube.castShadow = true;
        talkingObjects.add(cube);
    }
    scene.add(talkingObjects);
}

export { createTalkingObjects };