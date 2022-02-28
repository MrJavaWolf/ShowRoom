import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders'
import * as GUI from 'babylonjs-gui';

declare global {
    var BaseTexture: BABYLON.Texture;
    var BaseTextureData: ArrayBufferView;
    var PantsTexture: BABYLON.RawTexture;
    var PantsTextureDate: Uint8Array;

    var SelectedPipingColor: BABYLON.Color3;
    var SelectedPipingData: ArrayBufferView;
    var PipingTexture1: BABYLON.Texture;
    var PipingTexture1Data: ArrayBufferView;
    var PipingTexture2: BABYLON.Texture;
    var PipingTexture2Data: ArrayBufferView;
}

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
        let pants = scene.getMeshByName("pants_base_mesh");
        pants.scaling.x = 0.01;
        pants.scaling.y = 0.01;
        pants.scaling.z = 0.01;
        pants.rotation.x = 0;
        pants.rotation.y = Math.PI;
        pants.rotation.z = 0;

        let baseMaterial = new BABYLON.PBRMaterial("pantsMaterial", scene);
        baseMaterial.metallic = 0.26;
        baseMaterial.roughness = 0.15;
        //let bumpTexture = new BABYLON.Texture("models/Pants2/normal_piping.png", scene, null, true);
        //baseMaterial.bumpTexture = bumpTexture ;
        let detailMap = new BABYLON.Texture("models/Pants2/normal_skin.png", scene);
        detailMap.uScale = 75;
        detailMap.vScale = 75;
        baseMaterial.detailMap.texture = detailMap;
        baseMaterial.detailMap.isEnabled = true;
        baseMaterial.metallicF0Factor = 0;
        pants.material = baseMaterial;
        window.SelectedPipingColor = new BABYLON.Color3(1, 0, 0);
        UpdatePantsTexture(scene);
    });

    BABYLON.SceneLoader.Append("models/Pants2/", "pants_base_rivet_mesh.obj", scene, function (scene) {
        // do something with the scene
        let pantRivets = scene.getMeshByName("pants_base_rivet_mesh");
        pantRivets.scaling.x = 0.01;
        pantRivets.scaling.y = 0.01;
        pantRivets.scaling.z = 0.01;
        pantRivets.rotation.x = 0;
        pantRivets.rotation.y = Math.PI;
        pantRivets.rotation.z = 0;

        let baseMaterial = new BABYLON.PBRMaterial("pantsRivetMaterial", scene);
        baseMaterial.metallic = 0.9;
        baseMaterial.roughness = 0.29;
        baseMaterial.reflectionTexture = new BABYLON.Texture("models/Pants2/reflection_map.jpg", scene);
        baseMaterial.metallicTexture = new BABYLON.Texture("models/Pants2/reflection_map.jpg", scene);
        pantRivets.material = baseMaterial;
    });

    AddUI(scene);

    //// Show inspector.
    //scene.debugLayer.show({
    //    embedMode: true,
    //    enablePopup: true,
    //    overlay: true,
    //    showExplorer: true,
    //    showInspector: true
    //});

    return scene;
}

function UpdatePantsTexture(scene: BABYLON.Scene) {


    if (!window.BaseTexture || !window.PipingTexture1 || !window.PipingTexture2) {
        window.BaseTexture = new BABYLON.Texture("models/Pants2/texture_pants.png", scene, null, null, null, function () {
            window.PipingTexture1 = new BABYLON.Texture("models/Pants2/texture_fxxxer.png", scene, null, null, null, function () {
                window.PipingTexture2 = new BABYLON.Texture("models/Pants2/texture_indecator.png", scene, null, null, null, function () {
                    window.BaseTextureData = window.BaseTexture.readPixels();
                    window.PipingTexture1Data = window.PipingTexture1.readPixels();
                    window.PipingTexture2Data = window.PipingTexture2.readPixels();
                    window.SelectedPipingData = window.PipingTexture1Data;
                    UpdatePantsTexture_Private(scene, window.SelectedPipingData, window.SelectedPipingColor);
                })
            })
        });
    }
    else {
        UpdatePantsTexture_Private(scene, window.SelectedPipingData, window.SelectedPipingColor);
    }
}

function UpdatePantsTexture_Private(scene: BABYLON.Scene, featureTextureData: ArrayBufferView, featureColor: BABYLON.Color3) {

    if (!window.PantsTexture) {
        let size = window.BaseTexture.getSize();
        window.PantsTextureDate = new Uint8Array(size.width * size.height * 4);
        window.PantsTexture = BABYLON.RawTexture.CreateRGBATexture(window.PantsTextureDate, size.width, size.height, scene, null, true);
        window.PantsTexture.wrapU = window.BaseTexture.wrapU;
        window.PantsTexture.wrapV = window.BaseTexture.wrapV;
        window.PantsTexture.wrapR = window.BaseTexture.wrapR;
        window.PantsTexture.invertZ = window.BaseTexture.invertZ;
        let baseMaterial = scene.getMaterialByName("pantsMaterial") as BABYLON.PBRMaterial;
        baseMaterial.albedoTexture = window.PantsTexture;
    }

    let pantsTextureData = window.PantsTextureDate;
    let basePixels = window.BaseTextureData;
    for (let i = 0; i < pantsTextureData.length; i++) {
        pantsTextureData[i] = basePixels[i];
    }
    AddToTexture(featureTextureData, featureColor, pantsTextureData);
    window.PantsTexture.update(pantsTextureData);
}

function AddToTexture(pixels: ArrayBufferView, color: BABYLON.Color3, dataArray: ArrayBufferView) {
    let alfa = 0;
    for (let i = 0; i < dataArray.byteLength; i += 4) {
        alfa = pixels[i + 3] / 255;
        dataArray[i] = Math.min(255, dataArray[i] + color.r * 255 * alfa);
        dataArray[i + 1] = Math.min(255, dataArray[i + 1] + color.g * 255 * alfa);
        dataArray[i + 2] = Math.min(255, dataArray[i + 2] + color.b * 255 * alfa);
    }
}

function AddCamera(scene: BABYLON.Scene, canvas: HTMLCanvasElement) {
    let pointTarget = new BABYLON.Vector3(0, 1.75, 0)
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
    var advancedTexture = window.BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    AddMadeByLabels(advancedTexture);
    let pipingButtonsPanel = AddChoosePipingButtonsGui(scene);
    let colorButtonsPanel = AddChooseColorButtonsGui(scene);

    //let uiPanel = new window.BABYLON.GUI.StackPanel("uiPanel");
    //uiPanel.isVertical = false;
    //uiPanel.addControl(pipingButtonsPanel);
    //uiPanel.addControl(colorButtonsPanel);
    //advancedTexture.addControl(uiPanel);
    advancedTexture.addControl(colorButtonsPanel);
    advancedTexture.addControl(pipingButtonsPanel);
}


function AddChoosePipingButtonsGui(scene: BABYLON.Scene) {

    let pipingButtonsPanel = new window.BABYLON.GUI.StackPanel("PipingButtonsPanel");
    pipingButtonsPanel.isVertical = true;
    pipingButtonsPanel.width = "200px";
    pipingButtonsPanel.paddingBottom = 5;
    pipingButtonsPanel.paddingTop = 5;
    pipingButtonsPanel.paddingLeft = 5;
    pipingButtonsPanel.paddingRight = 5;
    pipingButtonsPanel.horizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    pipingButtonsPanel.verticalAlignment = window.BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    let selectedColor = "#555555";
    let nonSelectedColor = "#222222";

    var fxxxerButton = window.BABYLON.GUI.Button.CreateSimpleButton("FxxxerButton", "Fxxxer");
    fxxxerButton.paddingBottom = 5;
    fxxxerButton.width = "150px";
    fxxxerButton.height = "75px";
    fxxxerButton.cornerRadius = 5;
    fxxxerButton.color = "#DDDDDD";
    fxxxerButton.fontFamily = "Verdana";
    fxxxerButton.fontSize = 27;
    fxxxerButton.background = selectedColor;
    fxxxerButton.thickness = 0;
    fxxxerButton.onPointerDownObservable.add(() => {
        fxxxerButton.background = selectedColor;
        indicatorButton.background = nonSelectedColor;
        window.SelectedPipingData = window.PipingTexture1Data;
        UpdatePantsTexture(scene);
    });
    fxxxerButton.horizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    pipingButtonsPanel.addControl(fxxxerButton);

    var indicatorButton = window.BABYLON.GUI.Button.CreateSimpleButton("IndicatorButton", "Indicator");
    indicatorButton.width = "150px";
    indicatorButton.height = "75px";
    indicatorButton.cornerRadius = 5;
    indicatorButton.color = "#DDDDDD";
    indicatorButton.fontFamily = "Verdana";
    indicatorButton.fontSize = 27;
    indicatorButton.background = nonSelectedColor;
    indicatorButton.thickness = 0;
    indicatorButton.onPointerDownObservable.add(() => {
        indicatorButton.background = selectedColor;
        fxxxerButton.background = nonSelectedColor;
        window.SelectedPipingData = window.PipingTexture2Data;
        UpdatePantsTexture(scene);
    });
    indicatorButton.horizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    pipingButtonsPanel.addControl(indicatorButton);

    return pipingButtonsPanel;
}


function AddChooseColorButtonsGui(scene: BABYLON.Scene) {

    let colorButtonsPanel = new window.BABYLON.GUI.StackPanel("ColorButtonsPanel");
    colorButtonsPanel.isVertical = true;
    colorButtonsPanel.width = "200px";
    colorButtonsPanel.paddingBottom = 5;
    colorButtonsPanel.paddingTop = 5;
    colorButtonsPanel.paddingLeft = 5;
    colorButtonsPanel.paddingRight = 5;
    colorButtonsPanel.horizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    colorButtonsPanel.verticalAlignment = window.BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    let selectedColor = "#555555";
    let nonSelectedColor = "#222222";

    var noneButton = window.BABYLON.GUI.Button.CreateSimpleButton("NoneColorButton", "None");
    noneButton.paddingBottom = 5;
    noneButton.width = "150px";
    noneButton.height = "75px";
    noneButton.cornerRadius = 5;
    noneButton.color = "#DDDDDD";
    noneButton.fontFamily = "Verdana";
    noneButton.fontSize = 27;
    noneButton.background = nonSelectedColor;
    noneButton.thickness = 0;
    noneButton.onPointerDownObservable.add(() => {
        noneButton.background = selectedColor;
        blueButton.background = nonSelectedColor;
        redButton.background = nonSelectedColor;
        yellowButton.background = nonSelectedColor;

        window.SelectedPipingColor = new BABYLON.Color3(0, 0, 0);
        UpdatePantsTexture(scene);
    });
    noneButton.horizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    colorButtonsPanel.addControl(noneButton);

    var blueButton = window.BABYLON.GUI.Button.CreateSimpleButton("BlueButton", "Blue");
    blueButton.paddingBottom = 5;
    blueButton.width = "150px";
    blueButton.height = "75px";
    blueButton.cornerRadius = 5;
    blueButton.color = "#DDDDDD";
    blueButton.fontFamily = "Verdana";
    blueButton.fontSize = 27;
    blueButton.background = nonSelectedColor;
    blueButton.thickness = 0;
    blueButton.onPointerDownObservable.add(() => {
        noneButton.background = nonSelectedColor;
        blueButton.background = selectedColor;
        redButton.background = nonSelectedColor;
        yellowButton.background = nonSelectedColor;
        window.SelectedPipingColor = new BABYLON.Color3(0.2, 0.4, 1);
        UpdatePantsTexture(scene);
    });
    blueButton.horizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    colorButtonsPanel.addControl(blueButton);


    var redButton = window.BABYLON.GUI.Button.CreateSimpleButton("RedButton", "Red");
    redButton.paddingBottom = 5;
    redButton.width = "150px";
    redButton.height = "75px";
    redButton.cornerRadius = 5;
    redButton.color = "#DDDDDD";
    redButton.fontFamily = "Verdana";
    redButton.fontSize = 27;
    redButton.background = selectedColor;
    redButton.thickness = 0;
    redButton.onPointerDownObservable.add(() => {
        noneButton.background = nonSelectedColor;
        blueButton.background = nonSelectedColor;
        redButton.background = selectedColor;
        yellowButton.background = nonSelectedColor;
        window.SelectedPipingColor = new BABYLON.Color3(1, 0, 0);
        UpdatePantsTexture(scene);
    });
    redButton.horizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    colorButtonsPanel.addControl(redButton);


    var yellowButton = window.BABYLON.GUI.Button.CreateSimpleButton("YellowButton", "Yellow");
    yellowButton.width = "150px";
    yellowButton.height = "75px";
    yellowButton.cornerRadius = 5;
    yellowButton.color = "#DDDDDD";
    yellowButton.fontFamily = "Verdana";
    yellowButton.fontSize = 27;
    yellowButton.background = nonSelectedColor;
    yellowButton.thickness = 0;
    yellowButton.onPointerDownObservable.add(() => {
        noneButton.background = nonSelectedColor;
        blueButton.background = nonSelectedColor;
        redButton.background = nonSelectedColor;
        yellowButton.background = selectedColor;
        window.SelectedPipingColor = new BABYLON.Color3(1, 1, 0);
        UpdatePantsTexture(scene);
    });
    yellowButton.horizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    colorButtonsPanel.addControl(yellowButton);

    return colorButtonsPanel;
}



function AddMadeByLabels(advancedTexture: globalThis.BABYLON.GUI.AdvancedDynamicTexture) {
    var madeByPanel = new window.BABYLON.GUI.StackPanel();
    madeByPanel.width = "300px";
    madeByPanel.isVertical = true;
    madeByPanel.paddingBottom = 5;
    madeByPanel.paddingTop = 5;
    madeByPanel.paddingLeft = 5;
    madeByPanel.paddingRight = 5;
    madeByPanel.horizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    madeByPanel.verticalAlignment = window.BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
    var textBlock = new window.BABYLON.GUI.TextBlock();
    textBlock.text = "Jens Larsen & Ronnie Vilhelmsen 2022";
    textBlock.height = "15px";
    textBlock.color = "#DDDDDD";
    textBlock.fontSize = "15px";
    textBlock.textHorizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    madeByPanel.addControl(textBlock);

    var messagePanel = new window.BABYLON.GUI.StackPanel();
    messagePanel.paddingBottom = 5;
    messagePanel.paddingTop = 5;
    messagePanel.paddingLeft = 5;
    messagePanel.paddingRight = 5;
    messagePanel.width = "350px";
    messagePanel.isVertical = true;
    messagePanel.horizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    messagePanel.verticalAlignment = window.BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;

    var workInProgress = new window.BABYLON.GUI.TextBlock();
    workInProgress.text = "Proof of concept";
    workInProgress.height = "30px";
    workInProgress.color = "#FFFFFF";
    workInProgress.fontSize = "25px";
    workInProgress.textHorizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    messagePanel.addControl(workInProgress);
    var mayChange = new window.BABYLON.GUI.TextBlock();
    mayChange.text = "All elements are subject to change";
    mayChange.height = "15px";
    mayChange.color = "#FFFFFF";
    mayChange.fontSize = "15px";
    mayChange.textHorizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;

    messagePanel.addControl(mayChange);

    advancedTexture.addControl(madeByPanel);
    advancedTexture.addControl(messagePanel);
}
