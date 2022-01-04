
window.addEventListener('DOMContentLoaded', init);

var v = 0; // 速度

const KEYCODE_UP = 38;
const KEYCODE_DN = 40;

const RAIL_UNIT_LENGTH = 1000; // 線路１単位あたりの長さ（z座標）
const RAIL_EXTEND_TIMES = 20; // 線路延長1回あたりの延長回数


window.addEventListener("keydown", event => {
  //console.log("keyCode= " + event.keyCode + "¥n");
  if (event.keyCode === KEYCODE_DN) {
    v += 1;
  }
  if (event.keyCode === KEYCODE_UP) {
    v -= 1;
  }
  //console.log("速度= " + v + "¥n");
});

// リサイズイベント発生時に実行
window.addEventListener('resize', onResize);

// レンダラーを作成
var renderer = null;
var camera = null;
const initLen = 100;

function init() {
  const width = 960;
  const height = 540;

  // const fbx = new FBXLoader();

  // レンダラーを作成
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#myCanvas')
  });

  // renderer.setPixelRatio(window.devicePixelRatio);
  // renderer.setSize(width, height);

  // シーンを作成
  const scene = new THREE.Scene();

  scene.background = new THREE.TextureLoader().load('img/sora.jpg');

  // カメラを作成
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
  camera.position.set(0, 0, 0);
  //camera.far = 10000;

  // スプライト（運転席）
  const sppUnten = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.TextureLoader().load('img/unten.svg'),
    //      map: new THREE.TextureLoader().load('img/syasyou.png'),
  }));
  sppUnten.scale.set(500 * 0.8, 180 * 0.8);
  sppUnten.position.set(-200, 130, 700);
  scene.add(sppUnten);

  var x = 0;
  var z = 0;
  var rot = 0;

  ({ rot, x, z } = extendRail(scene, rot, x, z));

  //const hemiLight = new THREE.HemisphereLight(0x888888, 0x0000FF, 1.0);
  const hemiLight = new THREE.HemisphereLight(0xFFFFFF, 0xCCCCCC, 1.0);
  //scene.add(hemiLight);

  const ambLight = new THREE.AmbientLight(0x777777);
  ambLight.intensity = 0.5;
  scene.add(ambLight);

  const light = new THREE.DirectionalLight(0xFFFFFF);
  //const light = new THREE.AmbientLight(0xFFFFFF);
  light.intensity = 0.8; // 光の強さ
  light.position.set(0, 100000, 100000);
  // シーンに追加
  scene.add(light);

  // // 建物
  // fbx.load('img/buildings/building.fbx', (obj)=>{
  //   scene.add(obj);
  // });

  // フォグを設定
  // new THREE.Fog(色, 開始距離, 終点距離);
  scene.fog = new THREE.Fog(0xFFFFFF, 100, 15000);

  // 初期化のために実行
  onResize();


  // 初期化
  var len = 0;
  v = 0;
  var maxLen = - RAIL_EXTEND_TIMES * RAIL_UNIT_LENGTH;
  // 初回実行
  tick();

  function tick() {
    requestAnimationFrame(tick);

    var x = 0.0;
    var cx = 0.0;
    var cz = 0.0;
    var rot = 0.0;

    len -= v;

    //camera.position.z -= v;
    //rail.rotation.x -=  (Math.PI / 90.8);

    // 角度から位置計算
    baseLen = Math.floor(Math.abs(len / RAIL_UNIT_LENGTH));

    var i = 0;
    for (i = 0; i < baseLen; i++) {
      //rot = Math.PI * (0.001 * i) * 5;
      rot = 0;
      cx -= Math.sin(rot) * RAIL_UNIT_LENGTH;
      cz -= Math.cos(rot) * RAIL_UNIT_LENGTH;
    }
    //rot = Math.PI * (0.001 * baseLen) * 5;
    cx -= Math.sin(rot) * (Math.abs(len) % RAIL_UNIT_LENGTH);
    cz -= Math.cos(rot) * (Math.abs(len) % RAIL_UNIT_LENGTH);

    document.getElementById("dbg").innerText = '速度=' + Math.abs(v) + ', 距離=' + len;

    camera.rotation.y = rot;
    camera.position.x = cx;
    camera.position.y = 0;
    camera.position.z = cz;

    sppUnten.position.x = cx - 100;
    sppUnten.position.y = -100;
    sppUnten.position.z = cz - 300;


    // 線路の残りが少なくなってきたら追加する
    if (Math.abs(maxLen) - Math.abs(RAIL_UNIT_LENGTH * 10) < Math.abs(len)) {
      console.debug('★線路延長：' + maxLen);
      console.log('maxLen：' + maxLen + ', len:' + len);
      maxLen = extendRail(scene, rot, x, maxLen);
    }

    // レンダリング
    renderer.render(scene, camera);
  }
}

const geoGrand = new THREE.BoxGeometry(10000, 1, RAIL_UNIT_LENGTH);
const matGrand = new THREE.MeshStandardMaterial({ color: (0x888888) });
const geoRail = new THREE.BoxGeometry(800, 10, RAIL_UNIT_LENGTH);
const matRail = new THREE.MeshStandardMaterial({
  map: new THREE.TextureLoader().load('img/rail.jpg'),
  side: THREE.FrontSide,
});

const objMng = {};

// 線路を伸ばしていく
function extendRail(scene, rot, x, z) {

  for (var i = 0; i < RAIL_EXTEND_TIMES; i++) {
    // 地面
    const ground = new THREE.Mesh(geoGrand, matGrand);
    scene.add(ground);

    // 線路を作成
    const rail = new THREE.Mesh(geoRail, matRail);
    scene.add(rail);
    //rot = Math.PI * (0.001 * i) * 5;
    rot = 0;
    x -= Math.sin(rot) * RAIL_UNIT_LENGTH;
    z -= Math.cos(rot) * RAIL_UNIT_LENGTH;
    rail.position.set(x, -300, z);
    rail.rotation.y = rot;
    //x += 1;
    //z -= 1000;
    ground.position.set(x, -300, z);

    var bdAry = [];

    // 建物を作成
    for (var j = 0; j < 3; j++) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(150 + (Math.random() * 300), (300 + (Math.random() * RAIL_UNIT_LENGTH)), (150 + (Math.random() * 300)))
        , new THREE.MeshStandardMaterial({ color: (0x000000 + (Math.random() * 0xFFFFFF)) }));
      scene.add(box);
      box.position.set((Math.floor(Math.random() * 2) > 0 ? 1 : -1) * (600 + (Math.random() * 2000)), -300, z - ((j * RAIL_UNIT_LENGTH / 3) + (Math.random() * 200) - 100));
      bdAry.push(box);
    }
    objMng[z] = { rail: rail, ground: ground, bdAry: bdAry };

  }
  var cleanNum = 0;
  // 過去に過ぎ去った場所は消す
  for (var l in objMng) {
    if (l > z + RAIL_UNIT_LENGTH * 50) {
      scene.remove(objMng[l].rail);
      scene.remove(objMng[l].ground);
      for (var b in objMng[l].bdAry) {
        objMng[l].bdAry[b].geometry.dispose();
        objMng[l].bdAry[b].material.dispose();
        scene.remove(objMng[l].bdAry[b]);
      }
      delete objMng[l];
      cleanNum ++;
    }
  }
  console.log('削除データNum＝' + cleanNum)
  
  return z;
}

function onResize() {
  // サイズを取得
  const width = window.innerWidth;
  const height = window.innerHeight;

  // レンダラーのサイズを調整する
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  // カメラのアスペクト比を正す
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
