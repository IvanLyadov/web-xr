import { VRButton } from "three/addons/webxr/VRButton.js";
import { useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import veniceSunset from "../assets/hdr/venice_sunset_1k.hdr";

function MarkerScene() {
  const assetsPath = "assets/ar-shop";
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  const reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial()
  );

  // const loader = new GLTFLoader( ).setPath(assetsPath);
  const loader = new GLTFLoader();

  useEffect(() => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    camera.position.set(0, 1.6, 0);

    const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    ambient.position.set(0.5, 1, 0.25);
    scene.add(ambient);

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    container.appendChild(renderer.domElement);
    setEnvironment();

    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    setupXR();

    window.startSession = startSession;
  });

  const setEnvironment = () => {
    const colorLoader = new RGBELoader();
    colorLoader.setDataType(THREE.HalfFloatType);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    colorLoader.load(
      veniceSunset,
      (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        pmremGenerator.dispose();

        scene.environment = envMap;
      },
      undefined,
      (err) => {
        console.error("An error occurred setting the environment");
      }
    );
  };
  let hitTestSourceRequested = false;
  let hitTestSource = null;
  const setupXR = () => {
    renderer.xr.enabled = true;

    if ("xr" in navigator) {
      navigator.xr.isSessionSupported("immersive-ar").then((supported) => {
        if (supported) {
          const collection = document.getElementsByClassName("ar-button");
          [...collection].forEach((el) => {
            el.style.display = "block";
          });
        }
      });
    }

    const onSelect = () => {
      if (sceneModel === undefined) return;

      if (reticle.visible) {
        sceneModel.position.setFromMatrixPosition(reticle.matrix);
        sceneModel.visible = true;
      }
    };

    const controller = renderer.xr.getController(0);
    controller.addEventListener("select", onSelect);

    scene.add(controller);
  };

  var sceneModel = undefined;

  const startSession = (id) => {
    initAR();

    // Load a glTF resource
    loader.load(
      // resource URL
      `./chair2.glb`,
      // called when the resource is loaded
      (gltf) => {
        scene.add(gltf.scene);
        sceneModel = gltf.scene;

        sceneModel.visible = false;

        renderer.setAnimationLoop(render);
        console.log("done");
      },

      (xhr) => {
        console.log("loading...");
      },

      // called when loading has errors
      (error) => {
        console.log("An error happened", error);
      }
    );
  };

  const initAR = () => {
    let currentSession = null;

    const sessionInit = { requiredFeatures: ["hit-test"] };

    const onSessionStarted = (session) => {
      session.addEventListener("end", onSessionEnded);

      renderer.xr.setReferenceSpaceType("local");
      renderer.xr.setSession(session);

      currentSession = session;
    };

    const onSessionEnded = () => {
      currentSession.removeEventListener("end", onSessionEnded);

      currentSession = null;

      if (sceneModel !== null) {
        scene.remove(sceneModel);
        sceneModel = null;
      }

      renderer.setAnimationLoop(null);
    };

    if (currentSession === null) {
      navigator.xr
        .requestSession("immersive-ar", { requiredFeatures: ["hit-test"] })
        .then(onSessionStarted);
    } else {
      currentSession.end();
    }
  };

  const requestHitTestSource = () => {
    const session = renderer.xr.getSession();

    session.requestReferenceSpace("viewer").then((referenceSpace) => {
      session.requestHitTestSource({ space: referenceSpace }).then((source) => {
        hitTestSource = source;
      });
    });

    session.addEventListener("end", () => {
      hitTestSourceRequested = false;
      hitTestSource = null;
      referenceSpace = null;
    });

    hitTestSourceRequested = true;
  };

  let referenceSpace = renderer.xr.getReferenceSpace();

  const getHitTestResults = (frame) => {
    const hitTestResults = frame.getHitTestResults(hitTestSource);

    if (hitTestResults.length) {
      referenceSpace = renderer.xr.getReferenceSpace();
      const hit = hitTestResults[0];
      const pose = hit.getPose(referenceSpace);

      reticle.visible = true;
      reticle.matrix.fromArray(pose.transform.matrix);
    } else {
      reticle.visible = false;
    }
  };

  const render = (timestamp, frame) => {
    if (frame) {
      if (hitTestSourceRequested === false) requestHitTestSource();

      if (hitTestSource) getHitTestResults(frame);
    }

    renderer.render(scene, camera);
  };

  return (
    <div id="scene">
      <button onClick={startSession}>Start session</button>
    </div>
  );
}

export default MarkerScene;
