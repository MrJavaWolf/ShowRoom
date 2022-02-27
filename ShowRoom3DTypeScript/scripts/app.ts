import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders'
import * as GUI from 'babylonjs-gui';


function createScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement) {
    // Create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);

    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    var hemisphericLight = new BABYLON.HemisphericLight('HemisphericLight1', new BABYLON.Vector3(1, 1, 0.8), scene);
    hemisphericLight.intensity = 0.2;
    //var bounceLight = new BABYLON.HemisphericLight('bouncelight1', new BABYLON.Vector3(-1, -1, -0.8), scene);
    //bounceLight.intensity = 0.5;

    // Camera
    const camera = AddCamera(scene, canvas);
    AddSkyBox(scene);


    BABYLON.SceneLoader.Append("models/Pants2/", "pants_base_mesh.obj", scene, function (scene) {
        // do something with the scene
        var pants = scene.getMeshByName("pants_base_mesh");
        pants.scaling.x = 0.01;
        pants.scaling.y = 0.01;
        pants.scaling.z = 0.01;
        pants.rotation.x = 0;
        pants.rotation.y = Math.PI;
        pants.rotation.z = 0;

        var baseMaterial = new BABYLON.PBRMaterial("pantsMaterial", scene);
        baseMaterial.metallic = 0.2;
        baseMaterial.roughness = 0.5;

        pants.material = baseMaterial;
        UpdatePantsTexture(scene, "models/Custom_pants/pants_body_texture_FXXXER.png", new BABYLON.Color3(1, 0, 0));
    });
    AddUI(scene);
    return scene;
}

function UpdatePantsTexture(scene: BABYLON.Scene, featureTexture: string, featureColor: BABYLON.Color3) {
    let baseMaterial = scene.getMaterialByName("pantsMaterial") as BABYLON.PBRMaterial;
    const baseTexture = new BABYLON.Texture("models/Custom_pants/pants_body_texture.png", scene, null, null, null, function () {
        const feature1Texture = new BABYLON.Texture(featureTexture, scene, null, null, null, function () {
            let size = baseTexture.getSize();
            let dataArray = new Uint8Array(size.width * size.height * 4);
            //AddToTexture(baseTexture.readPixels(), new BABYLON.Color3(1, 0, 0), dataArray);
            AddToTexture(feature1Texture.readPixels(), featureColor, dataArray);
            baseMaterial.albedoTexture = BABYLON.RawTexture.CreateRGBATexture(dataArray, size.width, size.height, scene);
        })
    });
}


function AddToTexture(pixels: ArrayBufferView, color: BABYLON.Color3, dataArray: Uint8Array) {
    for (let i = 0; i < dataArray.length; i += 4) {
        let alfa = pixels[i + 3] / 255;
        dataArray[i] += color.r * 255 * alfa;
        dataArray[i + 1] += color.g * 255 * alfa;
        dataArray[i + 2] += color.b * 255 * alfa;
        dataArray[i + 3] = 255;
    }
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
    cameraLight.intensity = 150;
    scene.onBeforeRenderObservable.add(() => {

        const matrix = camera.computeWorldMatrix();
        const offset = new BABYLON.Vector3(3, 5, 0);
        const global_position = BABYLON.Vector3.TransformCoordinates(offset, matrix);
        cameraLight.position = global_position;

        cameraLight.setDirectionToTarget((new BABYLON.Vector3(0, 0, 0)).subtract(global_position));
        if (camera.target.x !== pointTarget.x ||
            camera.target.y !== pointTarget.y ||
            camera.target.z !== pointTarget.z) {
            camera.target = pointTarget.clone();
        }
    })

    // Add camera rim light
    var rimLight = new BABYLON.PointLight('rimLight1', camera.position.clone(), scene);
    rimLight.intensity = 200;
    rimLight.radius = 100;
    rimLight.range = 100;
    rimLight.position = new BABYLON.Vector3((-camera.position.x * 2) + 1.3, -(camera.position.y * 2) + 2.5, - (camera.position.z * 2));;
    rimLight.parent = camera;

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

function AddUI(scene: BABYLON.Scene) {

    // GUI
   //var advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    
    //var panel = new GUI.StackPanel();
    //panel.width = "200px";
    //panel.isVertical = true;
    //panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    //panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    //advancedTexture.addControl(panel);

    //var textBlock = new GUI.TextBlock();
    //textBlock.text = "Diffuse color:";
    //textBlock.height = "30px";
    //panel.addControl(textBlock);

    //var picker = new GUI.ColorPicker();
    //picker.value = new BABYLON.Color3(1, 0, 0);
    //picker.height = "150px";
    //picker.width = "150px";
    //picker.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    //picker.onValueChangedObservable.add(function (value) { // value is a color3
    //    UpdatePantsTexture(scene, "models/Custom_pants/pants_body_texture_FXXXER.png", value);
    //});

    //panel.addControl(picker);
}