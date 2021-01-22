import css from './styles.css';

import * as THREE from '../../../three.js/build/three.module.js';


import { OrbitControls} from '../../../three.js/examples/jsm/controls/OrbitControls.js';
//import { GLTFLoader} from '../../../three.js/examples/jsm/loaders/GLTFLoader.js';
import { VRButton} from '../../../three.js/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory} from '../../../three.js/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory} from '../../../three.js/examples/jsm/webxr/XRHandModelFactory.js';
import { BoxLineGeometry } from '../../../three.js/examples/jsm/geometries/BoxLineGeometry.js';

import ThreeMeshUI from 'three-mesh-ui'
import VRControl from 'three-mesh-ui/examples/utils/VRControl.js';

import Hls from 'hls.js'

let controls;
let container;

let vrControl

let w = window;
let camera, scene, renderer;
let objsToTest = [];

let controller1, controller2;
let controllerGrip1, controllerGrip2;

let buttons = {};

let currentVideoURL = ''


let video, videoImage, videoImageContext, videoTexture;

const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;

let selectState = false;


window.addEventListener( 'load', init );



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




function makeButtons() {

	// Container block, in which we put the two buttons.
	// We don't define width and height, it will be set automatically from the children's dimensions
	// Note that we set contentDirection: "row-reverse", in order to orient the buttons horizontally

	const container = new ThreeMeshUI.Block({
		justifyContent: 'center',
		alignContent: 'center',
		contentDirection: 'row-reverse',
		fontFamily: './assets/ui/fonts/MuseoSans-100-msdf.json',
		fontTexture: './assets/ui/fonts/MuseoSans-100.png',
		fontSize: 0.07,
		padding: 0.02,
		borderRadius: 0.11
	});

	container.position.set( 0, 0.6, -2 );
	container.rotation.x = -0.55;
	scene.add( container );

	// BUTTONS

	// We start by creating objects containing options that we will use with the two buttons,
	// in order to write less code.

	const buttonOptions = {
		width: 0.4,
		height: 0.15,
		justifyContent: 'center',
		alignContent: 'center',
		offset: 0.05,
		margin: 0.02,
		borderRadius: 0.075
	};

	// Options for component.setupState().
	// It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

	const hoveredStateAttributes = {
		state: "hovered",
		attributes: {
			offset: 0.035,
			backgroundColor: new THREE.Color( 0x999999 ),
			backgroundOpacity: 1,
			fontColor: new THREE.Color( 0xffffff )
		},
	};

	const idleStateAttributes = {
		state: "idle",
		attributes: {
			offset: 0.035,
			backgroundColor: new THREE.Color( 0x666666 ),
			backgroundOpacity: 0.3,
			fontColor: new THREE.Color( 0xffffff )
		},
	};

	// Buttons creation, with the options objects passed in parameters.
  
	const selectedAttributes = {
		offset: 0.02,
		backgroundColor: new THREE.Color( 0x777777 ),
		fontColor: new THREE.Color( 0xFF0000 )
	};  
  

    // My local RTMP test streams from iPhone and iPads
    // var videoSrc = 'https://stream.workwork.fun/hls/0k3g-dt3h-ees0-5u41-ehag.m3u8';
    // var videoSrc = 'https://stream.workwork.fun/hls/ipad1.m3u8';
    
    var urls = [
      {url:"https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",name:"Big Bug Bunny"},      
      {url:"https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8", name:"Santorini Parkour - Red Bull"},
      {url:"https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8", name: "Sentinel - Blender Foundation"}, 
      {url:"https://bitmovin-a.akamaihd.net/content/playhouse-vr/m3u8s/105560.m3u8",name:"360"},
      {url:"https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",name:"Bop"},
      {url:"https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8", name:"Live"}
      
    ]

    
    /* create buttons */
    
    for(var i=0; i < urls.length; i++) {
      
      buttons["bref_"+i] = new ThreeMeshUI.Block( buttonOptions );
      var bref = buttons["bref_"+i];
      bref.videoURL = urls[i].url;
      bref.name = "bref_"+i;
      
      bref.add(new ThreeMeshUI.Text({ content: urls[i].name }));
      
      var event = "bref_"+i;
      
      bref.setupState({
          state: "selected",
          attributes: selectedAttributes,
          onSet: ()=> {
              console.log('button selected')
              loadTV()        
          }
      }); 
      
      bref.setupState( hoveredStateAttributes );
      bref.setupState( idleStateAttributes );
      
      container.add( bref );
      objsToTest.push( bref );      
      
    }

};



function makeTV() {
  
  var movieMaterial = new THREE.MeshBasicMaterial( { color:0x000000, overdraw: true, side:THREE.DoubleSide } );
  // the geometry on which the movie will be displayed;
  //    movie image will be scaled to fit these dimensions.
  
  // 1.85 : 1
  // 1/78 : 1
  
  var movieGeometry = new THREE.PlaneGeometry( 1.78*2, 1*2, 4, 4 );
  var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
  movieScreen.position.set(0,1.8,-2.9);
  movieScreen.name = "tvset"
  scene.add(movieScreen);   
  
  
}




function loadTV(videoSrc) {
  
  if(!videoSrc) {
    videoSrc = currentVideoURL;
  }

  
  
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
  
  
  
  var videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter
  videoTexture.magFilter = THREE.LinearFilter
  videoTexture.format = THREE.RGBFormat
  videoTexture.crossOrigin = "anonymous"  
  
  var tvset = scene.getObjectByName("tvset");
  
  var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
  
  tvset.material  = movieMaterial;

  
  
}



function setVideo() {
  
  video = document.getElementById('video');
  // 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  //var videoSrc = 'https://stream.workwork.fun/hls/0k3g-dt3h-ees0-5u41-ehag.m3u8';
  var videoSrc = 'https://stream.workwork.fun/hls/ipad1.m3u8';
  
  
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
  
  
  
  
//  // controllers
//
//  controller1 = renderer.xr.getController( 0 );
//  controller1.addEventListener( 'selectstart', onSelectStart );
//  controller1.addEventListener( 'selectend', onSelectEnd );
//  scene.add( controller1 );
//
//  controller2 = renderer.xr.getController( 1 );
//  controller2.addEventListener( 'selectstart', onSelectStart );
//  controller2.addEventListener( 'selectend', onSelectEnd );
//  scene.add( controller2 );
//
//  const controllerModelFactory = new XRControllerModelFactory();
//
//  controllerGrip1 = renderer.xr.getControllerGrip( 0 );
//  controllerGrip1.add( controllerModelFactory.createControllerModel( controllerGrip1 ) );
//  scene.add( controllerGrip1 );
//
//  controllerGrip2 = renderer.xr.getControllerGrip( 1 );
//  controllerGrip2.add( controllerModelFactory.createControllerModel( controllerGrip2 ) );
//  scene.add( controllerGrip2 );

  //  
  
  
//  const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );
//
//  const line = new THREE.Line( geometry );
//  line.name = 'line';
//  line.scale.z = 5;
//
//  controller1.add( line.clone() );
//  controller2.add( line.clone() );
  
  
  ////////////////
  // Controllers
  ////////////////

  vrControl = VRControl( renderer, camera, scene );

  scene.add( vrControl.controllerGrips[ 0 ], vrControl.controllers[ 0 ] );

  vrControl.controllers[ 0 ].addEventListener( 'selectstart', ()=> { selectState = true } );
  vrControl.controllers[ 0 ].addEventListener( 'selectend', ()=> { selectState = false } );

  scene.add( vrControl.controllerGrips[ 1 ], vrControl.controllers[ 1 ] );

  vrControl.controllers[ 1 ].addEventListener( 'selectstart', ()=> { selectState = true } );
  vrControl.controllers[ 1 ].addEventListener( 'selectend', ()=> { selectState = false } );
  


  controls = new OrbitControls( camera, renderer.domElement );
  camera.position.set( 0, 1.6, 0 );
  controls.target = new THREE.Vector3( 0, 1, -1.8 );  
  
  video = document.getElementById('video');  

  makeButtons();  
  makeTV()  
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
  
  ThreeMeshUI.update();
  
  controls.update();
  renderer.render(scene, camera);
  
  
  updateButtons();
  
}




function updateButtons() {

	// Find closest intersecting object

	let intersect;

	if ( renderer.xr.isPresenting ) {

		vrControl.setFromController( 0, raycaster.ray );
        vrControl.setFromController( 1, raycaster.ray );

		intersect = raycast();

		// Position the little white dot at the end of the controller pointing ray
		if ( intersect ) vrControl.setPointerAt( 0, intersect.point );

	} else if ( mouse.x !== null && mouse.y !== null ) {

		raycaster.setFromCamera( mouse, camera );

		intersect = raycast();

	};

	// Update targeted button state (if any)

	if ( intersect && intersect.object.isUI ) {

		if ( selectState ) {

			// Component.setState internally call component.set with the options you defined in component.setupState
          
            // update videoURL from buttons
            currentVideoURL = intersect.object.videoURL;
            //console.log(intersect.object.videoURL)          
			intersect.object.setState( 'selected' );


		} else {

			// Component.setState internally call component.set with the options you defined in component.setupState
			intersect.object.setState( 'hovered' );

		};

	};

	// Update non-targeted buttons state

	objsToTest.forEach( (obj)=> {

		if ( (!intersect || obj !== intersect.object) && obj.isUI ) {

			// Component.setState internally call component.set with the options you defined in component.setupState
			obj.setState( 'idle' );

		};

	});

};


function raycast() {

	return objsToTest.reduce( (closestIntersection, obj)=> {

		const intersection = raycaster.intersectObject( obj, true );

		if ( !intersection[0] ) return closestIntersection

		if ( !closestIntersection || intersection[0].distance < closestIntersection.distance ) {

			intersection[0].object = obj;

			return intersection[0]

		} else {

			return closestIntersection

		};

	}, null );

};

