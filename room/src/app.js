import css from './styles.css';

import * as THREE from '../../../three.js/build/three.module.js';


import { OrbitControls} from '../../../three.js/examples/jsm/controls/OrbitControls.js';
//import { GLTFLoader} from '../../../three.js/examples/jsm/loaders/GLTFLoader.js';
import { VRButton} from '../../../three.js/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory} from '../../../three.js/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory} from '../../../three.js/examples/jsm/webxr/XRHandModelFactory.js';
import { BoxLineGeometry } from '../../../three.js/examples/jsm/geometries/BoxLineGeometry.js';

//import ThreeMeshUI from 'three-mesh-ui'

import Hls from 'hls.js'

let controls;
let container;

let w = window;
let camera, scene, renderer;
let objsToTest = [];

let controller1, controller2;
let controllerGrip1, controllerGrip2;

window.addEventListener( 'load', init );

let video, videoImage, videoImageContext, videoTexture;

let raycaster

const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;

let selectState = false;


window.addEventListener( 'pointermove', ( event )=>{
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
});

window.addEventListener( 'pointerdown', ()=> { selectState = true });

window.addEventListener( 'pointerup', ()=> { selectState = false });

window.addEventListener( 'touchstart', ( event )=> {
	selectState = true;
	mouse.x = ( event.touches[0].clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.touches[0].clientY / window.innerHeight ) * 2 + 1;
});

window.addEventListener( 'touchend', ()=> {
	selectState = false;
	mouse.x = null;
	mouse.y = null;
});


function addTV(r) {
  
  var d = new THREE.VideoTexture(r);
  d.minFilter = THREE.LinearFilter
  d.magFilter = THREE.LinearFilter
  d.format = THREE.RGBFormat
  d.crossOrigin = "anonymous"  
  
  var movieMaterial = new THREE.MeshBasicMaterial( { map: d, overdraw: true, side:THREE.DoubleSide } );
  // the geometry on which the movie will be displayed;
  //    movie image will be scaled to fit these dimensions.
  var movieGeometry = new THREE.PlaneGeometry( 3.5, 2, 4, 4 );
  var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
  movieScreen.position.set(0,2,-2.9);
  scene.add(movieScreen);  
  
  
}



function setVideo() {
  
  video = document.getElementById('video');
  // 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  //var videoSrc = 'https://stream.workwork.fun/hls/0k3g-dt3h-ees0-5u41-ehag.m3u8';
  var videoSrc = 'https://stream.workwork.fun/hls/ipad2.m3u8';
  
  
  console.log('Hls.isSupported(): ',Hls.isSupported());
  
  if (Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
    
    hls.on(Hls.Events.MANIFEST_PARSED, function() {
      video.play();
    });
    
  }
  
  else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoSrc;
    video.addEventListener('loadedmetadata', function() {
      video.play();
    });
  }
  
  video.setAttribute("loop", ""),
  video.setAttribute("muted", ""),
  video.setAttribute("playsinline", ""),
  video.setAttribute("webkit-playsinline", ""),
  video.setAttribute("crossorigin", "anonymous");  
  
  
  var tap = document.getElementById("tapstart");
  
  tap.addEventListener("click", (function() {
    console.log('click')
    video.play();
    addTV(video)

        
  }));
  
  
  
}









  function controllerConnected( evt ) {
      controllers.push( {
          gamepad: evt.data.gamepad,
          grip: evt.target,
          colliding: false,
          playing: false
      } );
  }

  function controllerDisconnected( evt ) {
      const index = controllers.findIndex( o => o.controller === evt.target );
      if ( index !== - 1 ) {
          controllers.splice( index, 1 );
      }
  }

  function onSelectStart( event ) {
      const controller = event.target;
      const intersections = getIntersections( controller );
      if ( intersections.length > 0 ) {
          const intersection = intersections[ 0 ];
          const object = intersection.object;
          object.material.emissive.b = 1;
          controller.attach( object );
          controller.userData.selected = object;
      }
  }

  function onSelectEnd( event ) {
      const controller = event.target;
      if ( controller.userData.selected !== undefined ) {
          const object = controller.userData.selected;
          object.material.emissive.b = 0;
          group.attach( object );
          controller.userData.selected = undefined;
      }
  }










function init() {
  
  
  container = document.createElement('div');
  document.body.appendChild(container);

  // camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  camera.position.set(0, 0, 0);

  // scene

  scene = new THREE.Scene();
  w.scene = scene;
  
  scene.background = new THREE.Color(0x130e0b);
  
  //scene.fog = new THREE.Fog(0xcce0ff, 10, 1000);
  
  
  /////////
  // Room
  /////////

  const room = new THREE.LineSegments(
      new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ).translate( 0, 3, 0 ),
      new THREE.LineBasicMaterial( { color: 0x808080 } )
  );

  const roomMesh = new THREE.Mesh(
      new THREE.BoxGeometry( 6, 6, 6, 10, 10, 10 ).translate( 0, 3, 0 ),
      new THREE.MeshBasicMaterial({ side: THREE.BackSide }),
  );

  scene.add( room );
  objsToTest.push(roomMesh);  
  

  // light

  const light = new THREE.DirectionalLight(0xffffff);
  light.position.set(0, 0, 1);
  scene.add(light);
  
  
  const light2 = new THREE.DirectionalLight(0xff0000);
  light2.position.set(0, 2, -1);
  scene.add(light2);    


  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  
  container.appendChild(renderer.domElement);
  
  
  // VR
  document.body.appendChild(VRButton.createButton(renderer));
  
  
  
  
  // controllers

  controller1 = renderer.xr.getController( 0 );
  controller1.addEventListener( 'selectstart', onSelectStart );
  controller1.addEventListener( 'selectend', onSelectEnd );
  scene.add( controller1 );

  controller2 = renderer.xr.getController( 1 );
  controller2.addEventListener( 'selectstart', onSelectStart );
  controller2.addEventListener( 'selectend', onSelectEnd );
  scene.add( controller2 );

  const controllerModelFactory = new XRControllerModelFactory();

  controllerGrip1 = renderer.xr.getControllerGrip( 0 );
  controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
  scene.add( controllerGrip1 );

  controllerGrip2 = renderer.xr.getControllerGrip( 1 );
  controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
  scene.add( controllerGrip2 );

  //  
  
  
  const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

  const line = new THREE.Line( geometry );
  line.name = 'line';
  line.scale.z = 5;

  controller1.add( line.clone() );
  controller2.add( line.clone() );

  raycaster = new THREE.Raycaster();  
  
  // Orbit controls for no-vr

  controls = new OrbitControls( camera, renderer.domElement );
  camera.position.set( 0, 1.6, 0 );
  controls.target = new THREE.Vector3( 0, 1, -1.8 );  
  
  

  setVideo();

  animate();

  
  window.addEventListener('resize', onWindowResize, false);

  

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}


function animate() {

  renderer.setAnimationLoop(render)

}


function render() {
  
  controls.update();
  renderer.render(scene, camera);
  
}




