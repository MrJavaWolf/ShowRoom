import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders'

function createScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    // Create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);

    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(1, 1, 0.8), scene);
    var bounceLight = new BABYLON.HemisphericLight('bouncelight1', new BABYLON.Vector3(-1, -1, -0.8), scene);
    bounceLight.intensity = 0.5;

    // Camera
    const camera = AddCamera(scene, canvas);
    AddSkyBox(scene);


    BABYLON.SceneLoader.Append("models/", "Pants_sculpt.obj", scene, function (scene) {
        // do something with the scene
        var pants = scene.getMeshByName("pasted__pasted__pasted__Body_mesh1");
        pants.scaling.x = 0.01;
        pants.scaling.y = 0.01;
        pants.scaling.z = 0.01;
        pants.rotation.x = 0;
        pants.rotation.y = Math.PI;
        pants.rotation.z = 0;
    });


    return scene;
}

function AddCamera(scene: BABYLON.Scene, canvas: HTMLCanvasElement) {
    let pointTarget = new BABYLON.Vector3(0, 1.3, 0)
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2, 7, pointTarget.clone(), scene);
    camera.attachControl(canvas, true);
    // Target the camera to scene origin
    camera.lockedTarget = pointTarget.clone();
    camera.allowUpsideDown = false;
    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 7;
    camera.radius = 4;
    camera.wheelPrecision = 65;
    camera.pinchPrecision = 150;
    camera.target = pointTarget.clone();
    camera.angularSensibilityX = 3000;
    camera.angularSensibilityY = 3000;
    
    
    // Attach the camera to the canvas
    camera.attachControl(canvas, false);

    // Add camera light
    var cameraLight = new BABYLON.SpotLight('cameraLight1', new BABYLON.Vector3(0.5, 0.5, 0), new BABYLON.Vector3(0, 0, 0), 1, 40, scene);
    scene.onBeforeRenderObservable.add(() => {

        const matrix = camera.computeWorldMatrix();
        const local_position = new BABYLON.Vector3(3, 5, 0);
        const global_position = BABYLON.Vector3.TransformCoordinates(local_position, matrix);
        cameraLight.position = global_position;

        cameraLight.setDirectionToTarget((new BABYLON.Vector3(0, 0, 0)).subtract(global_position));
        if (camera.target.x !== pointTarget.x ||
            camera.target.y !== pointTarget.y ||
            camera.target.z !== pointTarget.z) {
            camera.target = pointTarget.clone();
        }
        console.log("camera.targetScreenOffset: " + camera.targetScreenOffset);
    })

    return camera;
}

function AddSkyBox(scene: BABYLON.Scene) {
    // Skybox
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 200.0 }, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("backgrounds/Vasa/", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;
}

function AddTorusKnot(scene: BABYLON.Scene) {
    // Create a built-in "sphere" shape; its constructor takes 6 params: name, segment, diameter, scene, updatable, sideOrientation
    //var box = BABYLON.Mesh.CreateSphere('box1', 10, 3, scene);
    var torusKnot = BABYLON.Mesh.CreateTorusKnot('torusKnot', 2, 0.5, 128, 128, 2, 3, scene);
    var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    myMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1);
    myMaterial.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);
    torusKnot.material = myMaterial;
    torusKnot.position.y = 1;
    return torusKnot;
}

function changeColor(scene: BABYLON.Scene, color: string) {
    var myMaterial = <BABYLON.StandardMaterial>scene.getMaterialByName("myMaterial");
    myMaterial.diffuseColor = BABYLON.Color3.FromHexString(color);
}
