import * as THREE from "../three.module.js";
import { OrbitControls } from "../OrbitControls.js";
import { Pt } from "./Geometry.js"
import { EventHandlers } from "./EventHandler.js"

// Define Object Variables 
let MainScene;
let MainCamera;
let MainRenderer;
let MainControls;
let MainPlane;
let PointMaterial;
let LineMaterial;
let PlaneMaterial;

// Define Common Constants 
const AspectRatio = window.innerWidth * 0.7 / window.innerHeight;

export function Init() 
{
    $(".InverseKinematics").hide();
    const ContainerHeight = $("#Container").outerHeight();
    const ContainerWidth = $("#Container").outerWidth();
    
    // Create Camera
    MainCamera = new THREE.PerspectiveCamera(75, AspectRatio, 0.1, 1000);
    MainCamera.position.set(10, 15, -22);

    // Create the scene.
    MainScene = new THREE.Scene();
    
    // Create Renderer
    MainRenderer = new THREE.WebGLRenderer();
    MainRenderer.setSize(ContainerWidth, ContainerHeight);
    $("#Container").append(MainRenderer.domElement);

    // Create Controls
    MainControls = new OrbitControls(MainCamera, MainRenderer.domElement);

    // Draw Elements
    DrawAll();
    
    //Create Event Handlers
    EventHandlers();

    const Render = function ()
    {
        requestAnimationFrame(Render);

        MainControls.update();
        MainRenderer.render(MainScene, MainCamera);
    };
    Render();
}
  
export function DrawPoint(Point, Color, Radius) {
  const NewCircle = new THREE.Mesh(new THREE.SphereGeometry((Radius? Radius: 0.3), 32), new THREE.MeshBasicMaterial({color: (Color? Color: 0x0ff845)}));
  NewCircle.position.set(Point.X, Point.Y, Point.Z);
  Point.Circle = NewCircle;
  MainScene.add(NewCircle);
}

export function DrawLine(Point1, Point2, Color, Thickness) {
  const EndPoints = [new THREE.Vector3(Point1.X, Point1.Y, Point1.Z), new THREE.Vector3(Point2.X, Point2.Y, Point2.Z)];

  // Create Tube Geometry - CatmullRomCurve3 params (EndPoints, Path segments, THICKNESS, Roundness of Tube, Closed)
  const NewTubeGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(EndPoints), 512, (Thickness? Thickness: 0.1), 8, false);
  const NewLine = new THREE.Line(NewTubeGeometry, new THREE.LineBasicMaterial({color: (Color? Color: 0xffa500)}));
  MainScene.add(NewLine);
}

export function ClearAll() {
  for( let Index = MainScene.children.length - 1; Index >= 0; Index--) 
  { 
      const NextObject = MainScene.children[Index];
      MainScene.remove(NextObject); 
  }
}

export function DrawAll() {
  // Create Plane
  MainPlane = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({color: 0x5f5f5f}));
  MainPlane.rotateX(-Math.PI / 2);
  MainScene.add(MainPlane);   

  // Add Points to the scene
  for (var NextIndex in Pt)
  {
      DrawPoint(Pt[NextIndex]);
  }

  // Add Lines between the Points to the scene
  DrawLine(Pt.A1, Pt.A2);
  DrawLine(Pt.A2, Pt.A3);
  DrawLine(Pt.A3, Pt.A4);

  DrawLine(Pt.B1, Pt.B2);
  DrawLine(Pt.B2, Pt.B3);
  DrawLine(Pt.B3, Pt.B4);

  DrawLine(Pt.C1, Pt.C2);
  DrawLine(Pt.C2, Pt.C3);
  DrawLine(Pt.C3, Pt.C4);

  DrawLine(Pt.D1, Pt.D2);
  DrawLine(Pt.D2, Pt.D3);
  DrawLine(Pt.D3, Pt.D4);

  // Draw Body
  DrawLine(Pt.A1, Pt.B1, 0x00ffff);
  DrawLine(Pt.B1, Pt.C1, 0x00ffff);
  DrawLine(Pt.C1, Pt.D1, 0x00ffff);
  DrawLine(Pt.D1, Pt.A1, 0x00ffff);
}

export function RedrawPoint(Point, Value) {
  Point.X = Value;
  Point.Circle.position.set(Point.X, Point.Y, Point.Z);
}