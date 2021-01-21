import css from './styles.css';

import * as THREE from '../../../three.js/build/three.module.js';

import Stats from '../../../three.js/examples/jsm/libs/stats.module.js';

import { GUI} from '../../../three.js/examples/jsm/libs/dat.gui.module.js';
import { Curves} from '../../../three.js/examples/jsm/curves/CurveExtras.js';
import { OrbitControls} from '../../../three.js/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader} from '../../../three.js/examples/jsm/loaders/GLTFLoader.js';
import { VRButton} from '../../../three.js/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory} from '../../../three.js/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory} from '../../../three.js/examples/jsm/webxr/XRHandModelFactory.js';
import { BoxLineGeometry } from '../../../three.js/examples/jsm/geometries/BoxLineGeometry.js';

import ThreeMeshUI from 'three-mesh-ui'

import Hls from 'hls.js'

/* video.js */
import videojs from 'video.js'
let videoplayer;
//import videojscss from 'videojs/themes/dist/city/index.css';

//import * as HLS from 'videojs-contrib-hls';


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



function addVideoJS() {
  
  //videoplayer = VideoPlayer
  
  
}



function makePanel() {

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

	container.position.set( 0, 0.6, -1.5 );
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

	const buttonNext = new ThreeMeshUI.Block( buttonOptions );
	const buttonPrevious = new ThreeMeshUI.Block( buttonOptions );

	// Add text to buttons

	buttonNext.add(
		new ThreeMeshUI.Text({ content: "next" })
	);

	buttonPrevious.add(
		new ThreeMeshUI.Text({ content: "previous" })
	);

	// Create states for the buttons.
	// In the loop, we will call component.setState( 'state-name' ) when mouse hover or click

	const selectedAttributes = {
		offset: 0.02,
		backgroundColor: new THREE.Color( 0x777777 ),
		fontColor: new THREE.Color( 0x222222 )
	};

	buttonNext.setupState({
		state: "selected",
		attributes: selectedAttributes,
		onSet: ()=> {
			currentMesh = (currentMesh + 1) % 3 ;
			showMesh( currentMesh );
		}
	});
	buttonNext.setupState( hoveredStateAttributes );
	buttonNext.setupState( idleStateAttributes );

	//

	buttonPrevious.setupState({
		state: "selected",
		attributes: selectedAttributes,
		onSet: ()=> {
			currentMesh -= 1;
			if ( currentMesh < 0 ) currentMesh = 2;
			showMesh( currentMesh );
		}
	});
	buttonPrevious.setupState( hoveredStateAttributes );
	buttonPrevious.setupState( idleStateAttributes );

	//

	container.add( buttonNext, buttonPrevious );
	objsToTest.push( buttonNext, buttonPrevious );

};

//addVideoJS




/*


, function(e, t, n) {
    "use strict";
    
    n.r(t);
    n(2);
    var r, o, i = n(0);
    
    console.log("Three.js version: ".concat(THREE.REVISION)),
    
    document.body.insertAdjacentHTML("beforeend", i);
    
    var a = new THREE.Scene;
    
    a.background = new THREE.Color(16777215);
    
    var s = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,.1,1e3)
      , u = new THREE.WebGLRenderer;
    u.setSize(window.innerWidth, window.innerHeight),
    
    document.body.appendChild(u.domElement),
    
    s.position.z = 3;
    
    var c = document.getElementById("video")
      , l = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
      
    if (Hls.isSupported()) {
        var f = new Hls;
        f.loadSource(l),
        f.attachMedia(c)
    } else
        c.canPlayType("application/vnd.apple.mpegurl") && (c.src = l);
    var p = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
    (r = document.createElement("video")).setAttribute("loop", ""),
    
    r.setAttribute("muted", ""),
    r.setAttribute("playsinline", ""),
    r.setAttribute("webkit-playsinline", ""),
    r.setAttribute("crossorigin", "anonymous");
    var d = new THREE.VideoTexture(r);
    
    if (d.minFilter = THREE.LinearFilter,
    d.magFilter = THREE.LinearFilter,
    d.format = THREE.RGBFormat,
    d.crossOrigin = "anonymous",
    o = new THREE.Mesh(new THREE.BoxGeometry,new THREE.MeshBasicMaterial({
        map: d
    })),
    a.add(o),
    Hls.isSupported()) {
        var v = new Hls;
        v.loadSource(p),
        v.attachMedia(r)
    } else
        r.canPlayType("application/vnd.apple.mpegurl") && (r.src = p,
        console.log("canPlayType: application/vnd.apple.mpegurl"));
    document.addEventListener("click", (function() {
        c.play(),
        r.play(),
        document.getElementById("tapstart").style.display = "none"
    }
    ));
    !function e() {
        requestAnimationFrame(e),
        o.rotation.x += .01,
        o.rotation.y += .01,
        u.render(a, s)
    }()
    
    
    
    */



function createVideo() {

    video = document.createElement('video');

/*    video.src = './assets/video/research1.mp4';*/
    video.src = './assets/video/research1.webm';
/*
    video.src = './assets/video/vid.ogv';
    video.src = './assets/video/vid.webm';
*/
  
    video.loop = true;
    video.muted = false;
    video.playsinline = true;
    video.autoplay = false;
    video.crossOrigin = "anonymous";
    video.id = "myvideo";
  
    document.body.appendChild( video );
    document.getElementById("myvideo").style.display = "none";  
   
}


function setVideo() {
  
  video = document.getElementById('video');
  var videoSrc = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  
  console.log('Hls.isSupported(): ',Hls.isSupported());
  
  if (Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
    
//    hls.on(Hls.Events.MANIFEST_PARSED, function() {
//      video.play();
//    });
    
  }  
  
  
}





function getVideo() {

//    //video = document.createElement('video');
//    video = document.getElementById("my-video")
//  
//
///*    video.src = './assets/video/research1.mp4';*/
////    video.src = './assets/video/research1.webm';
///*
//    video.src = './assets/video/vid.ogv';
//    video.src = './assets/video/vid.webm';
//*/
//  
//    video.loop = true;
//    video.muted = false;
//    video.playsinline = true;
//    video.autoplay = true;
//    video.crossOrigin = "anonymous";
////    video.id = "myvideo";
//  
////    document.body.appendChild( video );
//    document.getElementById("my-video").style.display = "none";  
//  
//    //console.log('video',video)
  
//var gPlayer = videojs('gVideo');
//gPlayer.src = "http://localhost:1935/vod/sample/playlist.m3u8";
//gPlayer.play();  
  
  
//  videoplayer = new videojs('example-video');
//  w.videoplayer = videoplayer;
//  
//console.log('videoplayer log: ', videoplayer)
  
  //videoplayer.play();
  //document.getElementById("my-video").style.display = "none";
  
  video = document.getElementById( 'example-video' );
  var player = videojs('example-video');
  w.player = player;
  player.play();  
  
  console.log('Hls?', player.Hls.isSupported())
  
  
  videoImage = document.createElement( 'canvas' );
  videoImage.width = 960;
  videoImage.height = 540;
  
  videoImageContext = videoImage.getContext( '2d' );
  // background color if no video present
  videoImageContext.fillStyle = '#FF0000';
  videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );
  
  videoTexture = new THREE.Texture( videoImage );
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;

  var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
  // the geometry on which the movie will be displayed;
  //    movie image will be scaled to fit these dimensions.
  var movieGeometry = new THREE.PlaneGeometry( 3.5, 2, 4, 4 );
  var movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
  movieScreen.position.set(0,2,-2.9);
  scene.add(movieScreen);

  //camera.position.set(0,150,300);
  //camera.lookAt(movieScreen.position);
  
  
  
//  let ground = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2), videomaterial);
//  ground.rotation.y = 0;
//  ground.rotation.x = 0;
//  
//  ground.position.x = 0;
//  ground.position.y = 2;
//  ground.position.z = -2.9;
//  
//  ground.receiveShadow = true;
//  ground.name = "ground";
//  //ground.castShadow = true; //default is false
//  scene.add(ground)   
        
  
  
   
}

w.getVideo = getVideo;



function addGround() {
  
  //let video = document.getElementById("my-video")
  
//  let txf = 10;
//  
//  // ground
//  let groundTx = new THREE.TextureLoader().load("./assets/planes/m.png");
//  groundTx.wrapS = THREE.RepeatWrapping;
//  groundTx.wrapT = THREE.RepeatWrapping;
//  //groundTx.repeat.set( 25,25 );
//  groundTx.anisotropy = 4;
//  groundTx.repeat.set(txf,txf);
//  groundTx.encoding = THREE.sRGBEncoding;
//  
//  let groundM = new THREE.MeshStandardMaterial({
//    roughness: 0.8,
//    color: 0xffffff,
//    metalness: 0.2,
//    bumpScale: 0.0005,
//    map: groundTx
//  });
  
  let videotexture = new THREE.VideoTexture( videoplayer );
  const videomaterial = new THREE.MeshBasicMaterial( { map: videotexture } );  
  
  //    const plane = new THREE.Mesh( geometry, material );  
  
  let ground = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 2), videomaterial);
  ground.rotation.y = 0;
  ground.rotation.x = 0;
  
  ground.position.x = 0;
  ground.position.y = 2;
  ground.position.z = -2.9;
  
  ground.receiveShadow = true;
  ground.name = "ground";
  //ground.castShadow = true; //default is false
  scene.add(ground) 
  
  

}

w.addGround = addGround;



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
  
  
  
  
  
  
  
  //createVideo()
  //getVideo()
  setVideo();
  
  //addGround();
    
  //makePanel();
  
  animate();
  
  
  // Orbit controls for no-vr

  controls = new OrbitControls( camera, renderer.domElement );
  camera.position.set( 0, 1.6, 0 );
  controls.target = new THREE.Vector3( 0, 1, -1.8 );  
  
  
  window.addEventListener('resize', onWindowResize, false);
  
  //video.play()
  
  w.video = video
  

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
  
  //ThreeMeshUI.update();
  controls.update();
  
  
//  if ( video.readyState === video.HAVE_ENOUGH_DATA ) 
//  {
//    videoImageContext.drawImage( video, 0, 0 );
//    if ( videoTexture ) 
//      videoTexture.needsUpdate = true;
//  }  
  
  
  
  renderer.render(scene, camera);
  
  //updateButtons();
  
}

function updateButtons() {

	// Find closest intersecting object

	let intersect;

	if ( renderer.xr.isPresenting ) {

		vrControl.setFromController( 0, raycaster.ray );

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







//import { EffectComposer } from '../../../three.js/examples/jsm/postprocessing/EffectComposer.js';
//import { RenderPass } from '../../../three.js/examples/jsm/postprocessing/RenderPass.js';
//import { ShaderPass } from '../../../three.js/examples/jsm/postprocessing/ShaderPass.js';
//import { BloomPass } from '../../../three.js/examples/jsm/postprocessing/BloomPass.js';
//import { CopyShader } from '../../../three.js/examples/jsm/shaders/CopyShader.js';

//const tvgroup = new THREE.Group();
//
//let container;
//
//let camera, scene, renderer;
//
//let video, texture, material, mesh;
//
//let composer;
//
//let mouseX = 0;
//let mouseY = 0;
//
//let windowHalfX = window.innerWidth / 2;
//let windowHalfY = window.innerHeight / 2;
//
//let cube_count;
//
//let h, counter = 1;
//
//const meshes = [],
//    materials = [],
//
//    xgrid = 20,
//    ygrid = 10;
//
//var w = window;
//
//
////const startButton = document.getElementById( 'startButton' );
////
////startButton.addEventListener( 'click', function () {
////
////    init();
////    animate();
////
////}, false );
//
//
//
////		<video id="video" loop muted crossOrigin="anonymous" playsinline style="display:none">
////			<source src="textures/MaryOculus.webm">
////			<source src="textures/MaryOculus.mp4">
////		</video>
//
//
//init();
//animate();
//
//function init() {
//  
//  
//    video = document.createElement('video');
//
//    video.src = './assets/video/vid.mp4';
//    video.src = './assets/video/vid.ogv';
//    video.src = './assets/video/vid.webm';
//  
//    video.loop = true;
//    video.muted = true;
//    video.playsinline = true;
//    video.autoplay = true;
//    video.crossOrigin = "anonymous";
//    video.id = "myvideo";
//    document.body.appendChild( video );
//    document.getElementById("myvideo").style.display = "none";
//  
//
//    container = document.createElement( 'div' );
//    document.body.appendChild( container );
//
//    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
//    camera.position.z = 50;
//
//    scene = new THREE.Scene();
//
//    const light = new THREE.DirectionalLight( 0xffffff );
//    light.position.set( 0.5, 1, 1 ).normalize();
//    scene.add( light );
//
//    renderer = new THREE.WebGLRenderer();
//    renderer.setPixelRatio( window.devicePixelRatio );
//    renderer.setSize( window.innerWidth, window.innerHeight );
//    container.appendChild( renderer.domElement );
//    renderer.xr.enabled = true;
//    renderer.xr.setReferenceSpaceType( 'local' );
//
//    //video = document.getElementById( 'video' );
//    video.play();
//  
//    video.addEventListener( 'play', function () {
//
//        this.currentTime = 3;
//
//    }, false );
//
//    texture = new THREE.VideoTexture( video );
//  
//    const material = new THREE.MeshBasicMaterial( { map: texture } );
//  
//  
//    const geometry = new THREE.PlaneGeometry( 192, 108, 32 );
//    //const material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
//    const plane = new THREE.Mesh( geometry, material );
//  
//    plane.position.z = -10
//  
//  
//    scene.add( plane );  
//  
//
//    //
//
////    let i, j, ox, oy, geometry;
////
////    const ux = 1 / xgrid;
////    const uy = 1 / ygrid;
////
////    const xsize = 480 / xgrid;
////    const ysize = 204 / ygrid;
////
////    const parameters = { color: 0xffffff, map: texture };
////
////    cube_count = 0;
////
////    for ( i = 0; i < xgrid; i ++ ) {
////
////        for ( j = 0; j < ygrid; j ++ ) {
////
////            ox = i;
////            oy = j;
////
////            geometry = new THREE.BoxBufferGeometry( xsize, ysize, xsize );
////
////            change_uvs( geometry, ux, uy, ox, oy );
////
////            materials[ cube_count ] = new THREE.MeshLambertMaterial( parameters );
////
////            material = materials[ cube_count ];
////
////            material.hue = i / xgrid;
////            material.saturation = 1 - j / ygrid;
////
////            material.color.setHSL( material.hue, material.saturation, 0.5 );
////
////            mesh = new THREE.Mesh( geometry, material );
////
////            mesh.position.x = ( i - xgrid / 2 ) * xsize;
////            mesh.position.y = ( j - ygrid / 2 ) * ysize;
////            mesh.position.z = 0;
////
////            mesh.scale.x = mesh.scale.y = mesh.scale.z = 1;
////
////            tvgroup.add( mesh );
////
////            mesh.dx = 0.001 * ( 0.5 - Math.random() );
////            mesh.dy = 0.001 * ( 0.5 - Math.random() );
////
////            meshes[ cube_count ] = mesh;
////
////            cube_count += 1;
////
////        }
////
////    }
////  
////    scene.add(tvgroup);
////    tvgroup.name = "tvgroup"
////    tvgroup.position.x = 0;
////    tvgroup.position.y = 10;
////    tvgroup.position.z = -30;
////  
////    w.scene = scene;
////  
////
////    renderer.autoClear = false;
////
////    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
////
////    // postprocessing
////
////    const renderModel = new RenderPass( scene, camera );
////    const effectBloom = new BloomPass( 1.3 );
////    const effectCopy = new ShaderPass( CopyShader );
////
////    composer = new EffectComposer( renderer );
////
////    composer.addPass( renderModel );
////    composer.addPass( effectBloom );
////    composer.addPass( effectCopy );
//
//    //
//  
//    // VR
//    document.body.appendChild(VRButton.createButton(renderer));  
//
//    window.addEventListener( 'resize', onWindowResize, false );
//
//}
//
//function onWindowResize() {
//
//    windowHalfX = window.innerWidth / 2;
//    windowHalfY = window.innerHeight / 2;
//
//    camera.aspect = window.innerWidth / window.innerHeight;
//    camera.updateProjectionMatrix();
//
//    renderer.setSize( window.innerWidth, window.innerHeight );
//    //composer.setSize( window.innerWidth, window.innerHeight );
//
//}
//
//function change_uvs( geometry, unitx, unity, offsetx, offsety ) {
//
//    const uvs = geometry.attributes.uv.array;
//
//    for ( let i = 0; i < uvs.length; i += 2 ) {
//
//        uvs[ i ] = ( uvs[ i ] + offsetx ) * unitx;
//        uvs[ i + 1 ] = ( uvs[ i + 1 ] + offsety ) * unity;
//
//    }
//
//}
//
//
//function onDocumentMouseMove( event ) {
//
//    mouseX = ( event.clientX - windowHalfX );
//    mouseY = ( event.clientY - windowHalfY ) * 0.3;
//
//}
//
////
//
//function animate() {
//
//  renderer.setAnimationLoop(render);
//  //stats.update();
//
//}
//
//
//function render() {
//  
//  
//    
//
////    const time = Date.now() * 0.00005;
////
////    camera.position.x += ( mouseX - camera.position.x ) * 0.05;
////    camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
////
////    camera.lookAt( scene.position );
////
////    for ( let i = 0; i < cube_count; i ++ ) {
////
////        material = materials[ i ];
////
////        h = ( 360 * ( material.hue + time ) % 360 ) / 360;
////      
////        material.color.setHSL( h, material.saturation, 0.5 );
////
////    }
////
////    if ( counter % 1000 > 200 ) {
////
////        for ( let i = 0; i < cube_count; i ++ ) {
////
////            mesh = meshes[ i ];
////
////            mesh.rotation.x += 10 * mesh.dx;
////            mesh.rotation.y += 10 * mesh.dy;
////
////            mesh.position.x -= 150 * mesh.dx;
////            mesh.position.y += 150 * mesh.dy;
////            mesh.position.z += 300 * mesh.dx;
////
////        }
////
////    }
////
////    if ( counter % 1000 === 0 ) {
////
////        for ( let i = 0; i < cube_count; i ++ ) {
////
////            mesh = meshes[ i ];
////
////            mesh.dx *= - 1;
////            mesh.dy *= - 1;
////
////        }
////
////    }
////
////    counter ++;
//
//    renderer.render();
//    //composer.render();
//
//}