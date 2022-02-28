"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BABYLON = require("babylonjs");
require("babylonjs-loaders");
function createScene(engine, canvas) {
    // Create a basic BJS Scene object
    var scene = new BABYLON.Scene(engine);
    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    var hemisphericLight = new BABYLON.HemisphericLight('HemisphericLight1', new BABYLON.Vector3(1, 1, 0.8), scene);
    hemisphericLight.intensity = 0.2;
    //var bounceLight = new BABYLON.HemisphericLight('bouncelight1', new BABYLON.Vector3(-1, -1, -0.8), scene);
    //bounceLight.intensity = 0.5;
    // Camera
    var camera = AddCamera(scene, canvas);
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
        //baseMaterial.sheen.isEnabled = true;
        //baseMaterial.albedoTexture = new BABYLON.Texture("models/Pants2/texture_pants.png", scene);
        pants.material = baseMaterial;
        UpdatePantsTexture(scene);
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
function UpdatePantsTexture(scene) {
    if (!window.BaseTexture || !window.PipingTexture1 || !window.PipingTexture2) {
        window.BaseTexture = new BABYLON.Texture("models/Pants2/texture_pants.png", scene, null, null, null, function () {
            window.PipingTexture1 = new BABYLON.Texture("models/Pants2/texture_fxxxer.png", scene, null, null, null, function () {
                window.PipingTexture2 = new BABYLON.Texture("models/Pants2/texture_indecator.png", scene, null, null, null, function () {
                    window.BaseTextureData = window.BaseTexture.readPixels();
                    window.PipingTexture1Data = window.PipingTexture1.readPixels();
                    window.PipingTexture2Data = window.PipingTexture2.readPixels();
                    window.SelectedPipingData = window.PipingTexture1Data;
                    UpdatePantsTexture_Private(scene, window.SelectedPipingData, window.SelectedPipingColor);
                });
            });
        });
    }
    else {
        UpdatePantsTexture_Private(scene, window.SelectedPipingData, window.SelectedPipingColor);
    }
}
function UpdatePantsTexture_Private(scene, featureTextureData, featureColor) {
    if (!window.PantsTexture) {
        var size = window.BaseTexture.getSize();
        window.PantsTextureDate = new Uint8Array(size.width * size.height * 4);
        window.PantsTexture = BABYLON.RawTexture.CreateRGBATexture(window.PantsTextureDate, size.width, size.height, scene, null, true);
        window.PantsTexture.wrapU = window.BaseTexture.wrapU;
        window.PantsTexture.wrapV = window.BaseTexture.wrapV;
        window.PantsTexture.wrapR = window.BaseTexture.wrapR;
        window.PantsTexture.invertZ = window.BaseTexture.invertZ;
        var baseMaterial = scene.getMaterialByName("pantsMaterial");
        baseMaterial.albedoTexture = window.PantsTexture;
    }
    var pantsTextureData = window.PantsTextureDate;
    var basePixels = window.BaseTextureData;
    for (var i = 0; i < pantsTextureData.length; i++) {
        pantsTextureData[i] = basePixels[i];
    }
    AddToTexture(featureTextureData, featureColor, pantsTextureData);
    window.PantsTexture.update(pantsTextureData);
}
function AddToTexture(pixels, color, dataArray) {
    var alfa = 0;
    for (var i = 0; i < dataArray.byteLength; i += 4) {
        alfa = pixels[i + 3] / 255;
        dataArray[i] = Math.min(255, dataArray[i] + color.r * 255 * alfa);
        dataArray[i + 1] = Math.min(255, dataArray[i + 1] + color.g * 255 * alfa);
        dataArray[i + 2] = Math.min(255, dataArray[i + 2] + color.b * 255 * alfa);
    }
}
function AddCamera(scene, canvas) {
    var pointTarget = new BABYLON.Vector3(0, 1.5, 0);
    var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2, 7, pointTarget.clone(), scene);
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
    scene.onBeforeRenderObservable.add(function () {
        var matrix = camera.computeWorldMatrix();
        var offset = new BABYLON.Vector3(3, 5, 0);
        var global_position = BABYLON.Vector3.TransformCoordinates(offset, matrix);
        cameraLight.position = global_position;
        cameraLight.setDirectionToTarget((new BABYLON.Vector3(0, 0, 0)).subtract(global_position));
        if (camera.target.x !== pointTarget.x ||
            camera.target.y !== pointTarget.y ||
            camera.target.z !== pointTarget.z) {
            camera.target = pointTarget.clone();
        }
    });
    // Add camera rim light
    var rimLight = new BABYLON.PointLight('rimLight1', camera.position.clone(), scene);
    rimLight.intensity = 200;
    rimLight.radius = 100;
    rimLight.range = 100;
    rimLight.position = new BABYLON.Vector3((-camera.position.x * 2) + 1.3, -(camera.position.y * 2) + 2.5, -(camera.position.z * 2));
    ;
    rimLight.parent = camera;
    return camera;
}
function AddSkyBox(scene) {
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
function AddTorusKnot(scene) {
    var torusKnot = BABYLON.Mesh.CreateTorusKnot('torusKnot', 2, 0.5, 128, 128, 2, 3, scene);
    var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    myMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1);
    myMaterial.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);
    torusKnot.material = myMaterial;
    torusKnot.position.y = 1;
    return torusKnot;
}
function AddUI(scene) {
    // GUI
    var advancedTexture = window.BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var colorPanel = new window.BABYLON.GUI.StackPanel();
    colorPanel.width = "250px";
    colorPanel.isVertical = true;
    colorPanel.horizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    colorPanel.verticalAlignment = window.BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    advancedTexture.addControl(colorPanel);
    AddMadeByLabels(advancedTexture);
    AddChooseColorRadioGroupGui(advancedTexture, scene);
    AddChoosePipingRadioButtonsGui(advancedTexture, scene);
}
function AddChoosePipingRadioButtonsGui(advancedTexture, scene) {
    var selectBox = new window.BABYLON.GUI.SelectionPanel("ChoosePipingSelectionPanel");
    selectBox.thickness = 1;
    selectBox.paddingBottom = 5;
    selectBox.paddingTop = 5;
    selectBox.paddingLeft = 5;
    selectBox.paddingRight = 5;
    selectBox.background = "#111111";
    selectBox.barColor = "#111111";
    selectBox.shadowColor = "#111111";
    selectBox.labelColor = "#DDDDDD";
    selectBox.headerColor = "#DDDDDD";
    selectBox.color = "#DDDDDD";
    selectBox.fontStyle = "Verdana";
    selectBox.widthInPixels = 150;
    selectBox.heightInPixels = 150;
    selectBox.horizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    selectBox.verticalAlignment = window.BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    var colorGroup = new window.BABYLON.GUI.RadioGroup("PipingGroup");
    colorGroup.header = "- Piping -";
    colorGroup.addRadio("Fxxxer", function (value) {
        window.SelectedPipingData = window.PipingTexture1Data;
        UpdatePantsTexture(scene);
    }, true);
    colorGroup.addRadio("Indicator", function (value) {
        window.SelectedPipingData = window.PipingTexture2Data;
        UpdatePantsTexture(scene);
    }, false);
    selectBox.addGroup(colorGroup);
    advancedTexture.addControl(selectBox);
}
function AddChooseColorRadioGroupGui(advancedTexture, scene) {
    var selectBox = new window.BABYLON.GUI.SelectionPanel("ChooseColorSelectionPanel");
    selectBox.thickness = 1;
    selectBox.paddingBottom = 5;
    selectBox.paddingTop = 5;
    selectBox.paddingLeft = 5;
    selectBox.paddingRight = 5;
    selectBox.fontSize = "35";
    selectBox.background = "#111111";
    selectBox.barColor = "#111111";
    selectBox.shadowColor = "#111111";
    selectBox.labelColor = "#DDDDDD";
    selectBox.headerColor = "#DDDDDD";
    selectBox.color = "#DDDDDD";
    selectBox.fontStyle = "Verdana";
    selectBox.heightInPixels = 200;
    selectBox.widthInPixels = 150;
    selectBox.horizontalAlignment = window.BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    selectBox.verticalAlignment = window.BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    var colorGroup = new window.BABYLON.GUI.RadioGroup("colorGroup");
    colorGroup.header = "- Color -";
    colorGroup.addRadio("None", function (value) {
        window.SelectedPipingColor = new BABYLON.Color3(0, 0, 0);
        UpdatePantsTexture(scene);
    }, false);
    colorGroup.addRadio("Blue", function (value) {
        window.SelectedPipingColor = new BABYLON.Color3(0.2, 0.4, 1);
        UpdatePantsTexture(scene);
    }, false);
    colorGroup.addRadio("Red", function (value) {
        window.SelectedPipingColor = new BABYLON.Color3(1, 0, 0);
        UpdatePantsTexture(scene);
    }, true);
    colorGroup.addRadio("Yellow", function (value) {
        window.SelectedPipingColor = new BABYLON.Color3(1, 1, 0);
        UpdatePantsTexture(scene);
    }, false);
    selectBox.addGroup(colorGroup);
    advancedTexture.addControl(selectBox);
}
function AddMadeByLabels(advancedTexture) {
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
//# sourceMappingURL=app.js.map