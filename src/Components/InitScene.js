import { VRButton } from 'three/addons/webxr/VRButton.js';
import { useEffect } from 'react';
import * as THREE from 'three';

function InitScene() {
useEffect(() => {
            const onWindowResize = () => {
              camera.aspect = window.innerWidth / window.innerHeight;
              camera.updateProjectionMatrix();
              renderer.setSize(window.innerWidth, window.innerHeight);
            }
            
            const render = (time) => {
              // Rotate the cube
              cube.rotation.y = time / 1000;
              // Draw everything
              renderer.render(scene, camera);
            }

            // Make a new scene
            let scene = new THREE.Scene();
            // Set background color of the scene to gray
            scene.background = new THREE.Color(0x505050);
    
            // Make a camera. note that far is set to 100, which is better for realworld sized environments
            let camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
            camera.position.set(0, 1.6, 3);
            scene.add(camera);
    
            // Add some lights
            var light = new THREE.DirectionalLight(0xffffff,0.5);
            light.position.set(1, 1, 1).normalize();
            scene.add(light);
            scene.add(new THREE.AmbientLight(0xffffff,0.5))
    
            // Make a red cube
            let cube = new THREE.Mesh(
                new THREE.BoxGeometry(1,1,1),
                new THREE.MeshLambertMaterial({color:'red'})
            );
            cube.position.set(0, 1.5, -10);
            scene.add(cube);
    
            // Make a renderer that fills the screen
            let renderer = new THREE.WebGLRenderer({antialias: true});
            console.log(renderer);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            // Turn on VR support
            renderer.xr.enabled = true;
            // Set animation loop
            renderer.setAnimationLoop(render);
            // Add canvas to the page
            document.body.appendChild(renderer.domElement);
    
            // Add a button to enter/exit vr to the page
            document.body.appendChild(VRButton.createButton(renderer));
    
    
            // Handle browser resize
            window.addEventListener('resize', onWindowResize, false);


}, []);



  return (
    <div className="App">
    </div>
  );
}

export default InitScene;
