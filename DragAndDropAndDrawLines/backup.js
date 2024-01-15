import * as THREE from "./three.module.js";
 
let MainScene, MainCamera, MainRenderer, Canvas;

var World;  // An Object3D that contains all the mesh objects in the scene.
// Rotation of the scene is done by rotating the world about its
// y-axis.  (I couldn't rotate the MainCamera about the scene since
// the Raycaster wouldn't work with a MainCamera that was a child
// of a rotated object.)
var ground;

var TargetForDragging;  // An invisible object that is used as the target for raycasting while
// dragging a Sphere.  I use it to find the new location of the
// Sphere.  I tried using the ground for this purpose, but to get
// the motion right, I needed a target that is at the same height
// above the ground as the point where the user clicked the Sphere.

var Sphere; // Dots for plotting the map
var Line;
var Index = 0;

var ROTATE = 1, DRAG = 2, ADD = 3, DELETE = 4, DRAWLINE = 5;  // Possible mouse actions
var MouseAction;  // currently selected mouse action
var DragItem;  // the Sphere that is being dragged, during a drag operation
var Intersects= new THREE.Vector3(); //the objects intersected
var Raycaster = new THREE.Raycaster();  // A THREE.Raycaster for user mouse input.
var Mouse = new THREE.Vector2();
var PlaneNormal = new THREE.Vector3();
var Plane = new THREE.Plane();

function Init()
{
    try
    {
        Canvas = $("#maincanvas").get(0);
        MainRenderer = new THREE.WebGLRenderer({
            canvas: Canvas,
            antialias: true
        });
    }
    catch(e) 
    {
        $("#canvas-holder").html("<p><b>Sorry, an error occurred:<br>" + e + "</b></p>");
        return;
    }

    $("#MouseAdd").prop("checked", true);
    MouseAction = DRAG;
    $("#MouseRotate, #MouseDrag, #MouseAdd, #MouseDelete, #MouseDrawLine").on("change", doChangeMouseAction);

    CreateWorld();
    setUpMouseHander(Canvas, doMouseDown, doMouseMove);
    Render();
}

function doChangeMouseAction() 
{
    if (document.getElementById("MouseRotate").checked) 
    {
        MouseAction = ROTATE;
        console.log(`Changed Mouse Action ${MouseAction}`);
    }
    else if (document.getElementById("MouseDrag").checked) 
    {
        MouseAction = DRAG;
        console.log(`Changed Mouse Action ${MouseAction}`);
    }
    else if (document.getElementById("MouseAdd").checked) 
    {
        MouseAction = ADD;
        console.log(`Changed Mouse Action ${MouseAction}`);
    }
    else if (document.getElementById("MouseDrawLine").checked) 
    {
        MouseAction = DRAWLINE;
        console.log(`Changed Mouse Action ${MouseAction}`);
    }
    else 
    {
        MouseAction = DELETE;
        console.log(`Mouse Action ${MouseAction}`);
    }
}

function doMouseMove(x,y,evt,prevX,prevY) 
{
    if (MouseAction == ROTATE) 
    {
        console.log(`On doMouseMove fn. MouseAction: ${MouseAction}`);
        var dx = x - prevX;
        World.rotateY( dx/50 );
        Render();
    }
    else if (MouseAction == DRAWLINE) 
    {
        console.log(`On doMouseMove fn. MouseAction: ${MouseAction}`);
        var coords = new THREE.Vector3();
        coords.x = (evt.clientX / Canvas.width) * 2 - 1;
        coords.y = -(evt.clientY / Canvas.height) * 2 + 1;
        coords.z = (MainCamera.near + MainCamera.far) / (MainCamera.near - MainCamera.far);
        coords.unproject(MainCamera);
    
        // Add the point to the line here
        AddPoint(x, y, coords.z);
        UpdatePoint(x, y, coords.z)
        
        Mouse.x = (evt.clientX / Canvas.width) * 2 - 1;
        Mouse.y = -(evt.clientY / Canvas.height) * 2 + 1;
        
        PlaneNormal.copy(MainCamera.position).normalize();
        Plane.setFromNormalAndCoplanarPoint(PlaneNormal, MainScene.position);
        Raycaster.setFromCamera(Mouse, MainCamera);
        Raycaster.ray.intersectPlane(Plane, Intersects);

        // Render the scene to update the view
        Render();
    }
    else 
    {  // drag
        var a = 2*x/Canvas.width - 1;
        var b = 1 - 2*y/Canvas.height;
        Raycaster.setFromCamera( new THREE.Vector2(a,b), MainCamera );
        Intersects = Raycaster.intersectObject( TargetForDragging ); 
        if (Intersects.length == 0) 
        {
            return;
        }
        var locationX = Intersects[0].point.x;
        var locationZ = Intersects[0].point.z;
        var coords = new THREE.Vector3(locationX, 0, locationZ);
        World.worldToLocal(coords);
        a = Math.min(19,Math.max(-19,coords.x));  // clamp coords to the range -19 to 19, so object stays on ground
        b = Math.min(19,Math.max(-19,coords.z));
        DragItem.position.set(a,3,b);
        Render();
    }
}

function doMouseDown(x,y,evt) 
{
    if (MouseAction == ROTATE) 
    {
        return true;
    } 
    else if (MouseAction == DRAWLINE) 
    {
        return true;
    }
    if (TargetForDragging.parent == World) 
    {
        World.remove(TargetForDragging);  // I don't want to check for hits on TargetForDragging
    }
    var a = 2*x/Canvas.width - 1;
    var b = 1 - 2*y/Canvas.height;
    Raycaster.setFromCamera( new THREE.Vector2(a,b), MainCamera );
    Intersects = Raycaster.intersectObjects( World.children );  // no need for recusion since all objects are top-level
    if (Intersects.length == 0) 
    {
        return false;
    }
    var item = Intersects[0];
    var objectHit = item.object;
    switch (MouseAction) 
    {
        case DRAG:
            if (objectHit == ground) 
            {
                return false;
            }
            else 
            {
                DragItem = objectHit;
                World.add(TargetForDragging);
                TargetForDragging.position.set(0,item.point.y,0);
                Render();
                return true;
            }
        case ADD:
            if (objectHit == ground) 
            {
                var locationX = item.point.x;  // Gives the point of intersection in World coords
                var locationZ = item.point.z;
                var coords = new THREE.Vector3(locationX, 0, locationZ);
                World.worldToLocal(coords);  // to add cylider in correct position, neew local coords for the World object
                AddSphere(coords.x, coords.z);
                Render();
            }
            return false;
        case DRAWLINE:
            if (objectHit == ground)
            {
                var coords = new THREE.Vector3();
                coords.x =  (evt.clientX / window.innerWidth) * 2 - 1;
                coords.y = -(evt.clientY / window.innerHeight) * 2 + 1;
                coords.z =  (MainCamera.near + MainCamera.far) / (MainCamera.near - MainCamera.far);
                coords.unproject(MainCamera);
                AddPoint(coords.x, coords.y, coords.z);
                Render();
            }
            return false;
        default: // DELETE
            if (objectHit != ground) 
            {
                World.remove(objectHit);
                Render();
            }
            return false;
    }
}

function CreateWorld() 
{
    MainScene = new THREE.Scene();
    MainCamera = new THREE.PerspectiveCamera(27,Canvas.width/Canvas.height,10,100);
    MainCamera.position.z = 60;
    MainCamera.position.y = 30;
    MainCamera.lookAt( new THREE.Vector3(0,0,0) );
    MainCamera.add(new THREE.PointLight(0xffffff,0.7)); // point light at MainCamera position
    MainScene.add(MainCamera);
    MainScene.add(new THREE.DirectionalLight(0xffffff,0.5)); // light shining from above.

    World = new THREE.Object3D();
    MainScene.add(World);

    ground = new THREE.Mesh(
        new THREE.BoxGeometry(38,1,38),
        new THREE.MeshLambertMaterial( {color:"gray"})
    );
    ground.position.y = -0.5;  // top of base lies in the plane y = -5;
    World.add(ground);

    TargetForDragging = new THREE.Mesh(
        new THREE.BoxGeometry(100,0.01,100),
        new THREE.MeshBasicMaterial()
    );
    TargetForDragging.material.visible = false;

    //TargetForDragging.material.transparent = true;  // This was used for debugging
    //TargetForDragging.material.opacity = 0.1;
    //world.add(TargetForDragging);

    // Dot
    Sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32), 
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    Sphere.position.y = 3;  // places base at y = 0;

    Line = new THREE.Mesh(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({ color: 0xFF0000, linewidth: 5 })
    );

    const positions = new Float32Array(1000 * 3);
    const PositionAttribute = new THREE.BufferAttribute(positions, 3);
    PositionAttribute.setUsage(THREE.DynamicDrawUsage);
    Line.geometry.setAttribute('position', PositionAttribute);

    World.add(Line);

    AddSphere(10,10);
    AddSphere(0,15);
    AddSphere(-15,-7);
    AddSphere(-8,5);
    AddSphere(5,-12);
}

function AddSphere(x, z) 
{
    var obj = Sphere.clone();
    obj.position.x = x;
    obj.position.z = z;
    World.add(obj);
}

function UpdatePoint(x, y, z) 
{
    const PositionAttribute = Line.geometry.getAttribute('position');
    PositionAttribute.setXYZ(Index - 1, x, y, 0);
    PositionAttribute.needsUpdate = true;
}

function setUpMouseHander(element, mouseDownFunc, mouseDragFunc, mouseUpFunc) 
{
	/*
           element -- either the element itself or a string with the id of the element
           mouseDownFunc(x,y,evt) -- should return a boolean to indicate whether to start a drag operation
           mouseDragFunc(x,y,evt,prevX,prevY,startX,startY)
           mouseUpFunc(x,y,evt,prevX,prevY,startX,startY)
       */
	if (!element || !mouseDownFunc || !(typeof mouseDownFunc == "function")) 
    {
		throw "Illegal arguments in setUpMouseHander";
	}
	if (typeof element == "string") 
    {
		element = document.getElementById(element);
	}
	if (!element || !element.addEventListener) 
    {
		throw "first argument in setUpMouseHander is not a valid element";
	}
	var dragging = false;
	var startX, startY;
	var prevX, prevY;

	function doMouseDown(evt) 
    {
		if (dragging) 
        {
			return;
		}
		var r = element.getBoundingClientRect();
		var x = evt.clientX - r.left;
		var y = evt.clientY - r.top;
		prevX = startX = x;
		prevY = startY = y;
		dragging = mouseDownFunc(x, y, evt);
		if (dragging) 
        {
			document.addEventListener("mousemove", doMouseMove);
			document.addEventListener("mouseup", doMouseUp);
		}
	}

	function doMouseMove(evt) 
    {
		if (dragging) 
        {
			if (mouseDragFunc) 
            {
				var r = element.getBoundingClientRect();
				var x = evt.clientX - r.left;
				var y = evt.clientY - r.top;
				mouseDragFunc(x, y, evt, prevX, prevY, startX, startY);
			}
			prevX = x;
			prevY = y;
		}
	}

	function doMouseUp(evt) 
    {
		if (dragging) 
        {
			document.removeEventListener("mousemove", doMouseMove);
			document.removeEventListener("mouseup", doMouseUp);
			if (mouseUpFunc) 
            {
				var r = element.getBoundingClientRect();
				var x = evt.clientX - r.left;
				var y = evt.clientY - r.top;
				mouseUpFunc(x, y, evt, prevX, prevY, startX, startY);
			}
			dragging = false;
		}
	}
	element.addEventListener("mousedown", doMouseDown);
}

function AddPoint(x, y, z) 
{
    console.log("Adding point:", x, y, z);

    const PositionAttribute = Line.geometry.getAttribute('position');
    if (!PositionAttribute) 
    {
        console.error("PositionAttribute is undefined.");
        return;
    }

    PositionAttribute.setXYZ(Index, x, y, z);
    PositionAttribute.needsUpdate = true;
  
    Index++;
  
    Line.geometry.setDrawRange(0, Index);
}

function Render()
{
    MainRenderer.render(MainScene, MainCamera);
}

$(function()
{
    Init();
});