
window.addEventListener('DOMContentLoaded', init);

var v = 0; // 速度

const KEYCODE_UP = 38;
const KEYCODE_DN = 40;

const RAIL_UNIT_LENGTH = 1000; // 線路１単位あたりの長さ（z座標）
const RAIL_EXTEND_TIMES = 20; // 線路延長1回あたりの延長回数

// マウス座標管理用のベクトルを作成
const mouse = new THREE.Vector2();

this.Config = {
  dpr: 1,
};

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

var sppMascon = null;
//var isMasconOpe = false; // マスコン操作中

var ac = 0; // 加速度

function init() {
  const width = 960;
  const height = 540;

  ac = 0;

  // const fbx = new FBXLoader();

  const canvas = document.querySelector('#myCanvas');

  // レンダラーを作成
  renderer = new THREE.WebGLRenderer({
    canvas: canvas
  });
  var xy = '';

  var isMouseDown = false;

  // マウスかタッチかイベント判定
  const supportTouch = 'ontouchend' in document;
  const EVENTNAME_TOUCHSTART = supportTouch ? 'touchstart' : 'mousedown';
  const EVENTNAME_TOUCHMOVE = supportTouch ? 'touchmove' : 'mousemove';
  const EVENTNAME_TOUCHEND = supportTouch ? 'touchend' : 'mouseup';

  // マウスイベントを登録
  canvas.addEventListener(EVENTNAME_TOUCHSTART, event => {

    //if (event.button != 0) { return; } // 左クリック以外は無視

    isMouseDown = true;
  });
  // マウスイベントを登録
  window.addEventListener(EVENTNAME_TOUCHEND, event => {

    //if (event.button != 0) { return; } // 左クリック以外は無視

    isMouseDown = false;
  });

  // マウスイベントを登録
  canvas.addEventListener(EVENTNAME_TOUCHMOVE, event => {

    if (!isMouseDown) { return; }

    const element = event.currentTarget;
    // canvas要素上のXY座標
    const x = event.clientX - element.offsetLeft;
    const y = event.clientY - element.offsetTop;
    xy = x + ', ' + y;
    // canvas要素の幅・高さ
    const w = element.offsetWidth;
    const h = element.offsetHeight;

    // -1〜+1の範囲で現在のマウス座標を登録する
    mouse.x = (x / w) * 2 - 1;
    mouse.y = -(y / h) * 2 + 1;

    sppMascon.position.y = mouse.y * 100;
    ac = - mouse.y / 10;

    // スクロールなどのイベントを起こさない
    event.preventDefault();
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
  const sppUnten = new THREE.Mesh(
    new THREE.PlaneGeometry(600 * 0.8, 180 * 0.8),
    new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load('img/unten.svg'),
      side: THREE.FrontSide,
      transparent: true,
      opacity: 1,
    })
  );
  sppUnten.position.set(-40, 130, 700);
  //sppUnten.position.set(-0, 0, -100);
  scene.add(sppUnten);
  //camera.add(sppUnten);

  // スプライト（車掌さん）
  const sppSyasyou = new THREE.Mesh(
    new THREE.PlaneGeometry(558 * 0.3, 720 * 0.3),
    new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load('img/syasyou.png'),
      side: THREE.FrontSide,
      alphaTest:0.2,
    })
  );
  sppSyasyou.position.set(200, 0, 100);
  scene.add(sppSyasyou);

  // スプライト（マスコンのレバー）
  const sppMascon = new THREE.Mesh(
    new THREE.PlaneGeometry(152 * 0.6, 42 * 0.6),
    new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load('img/mascon.svg'),
      side: THREE.FrontSide,
      transparent: true,
      opacity: 1,
    })
  );
  sppMascon.position.set(-200, 0, 680);
  scene.add(sppMascon);

  // メーター
  const geoSpeed = new THREE.PlaneGeometry(160, 200);
  const matSpeed = new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load('img/speed.svg'),
    side: THREE.FrontSide,
    transparent: true,
    opacity: 0,
  });
  const mSpeed = new THREE.Mesh(geoSpeed, matSpeed);
  scene.add(mSpeed);

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

  var txt = null;
  //scene.add(txt.getMesh());

  // // 建物
  // fbx.load('img/buildings/building.fbx', (obj)=>{
  //   scene.add(obj);
  // });

  // フォグを設定
  // new THREE.Fog(色, 開始距離, 終点距離);
  scene.fog = new THREE.Fog(0xFFFFFF, 100, 15000);

  // 初期化のために実行
  onResize();

  // レイキャストを作成
  //const raycaster = new THREE.Raycaster();

  // 初期化
  var len = 0;
  v = 0;
  var pre_v = 0;
  var maxLen = - RAIL_EXTEND_TIMES * RAIL_UNIT_LENGTH;
  // 初回実行
  tick();

  const audioContext = new AudioContext();

  const aud_start = document.getElementById('snd_start');
  const track_start = audioContext.createMediaElementSource(aud_start);
  track_start.connect(audioContext.destination);

  const aud_end = document.getElementById('snd_end');
  const track_end = audioContext.createMediaElementSource(aud_end);
  track_end.connect(audioContext.destination);

  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);

  var isPlay = false;
  var audioBuffer_goto = null;

  // 音声ファイルのダウンロード要求
  const request = new XMLHttpRequest();
  var bufferSourceNode = null;
  request.open('GET', 'sound/gotogoto.mp3', true);
  request.responseType = 'arraybuffer';
  request.onload = function () {
    // ダウンロード完了後に、取得した音声ファイルを波形データへデコード
    audioContext.decodeAudioData(request.response, function (buffer) {

      audioBuffer_goto = buffer;

      // ---------- イベント ----------

      // // ピッチ変更
      // document.querySelector('.pitch-range').onchange = function (event) {
      //   bufferSourceNode.playbackRate.value = event.target.value;
      //   document.querySelector('.pitch-span').textContent = event.target.value;
      // };
    }, function (error) {
    });
  };
  request.send();

  function tick() {
    requestAnimationFrame(tick);

    var x = 0.0;
    var cx = 0.0;
    var cz = 0.0;
    var rot = 0.0;

    // 速度に応じて加速補正をする
    if ((ac > 0) && (v < 20)) {
      v += ac * (0.2 + (v * 0.01));
    } else if ((ac > 0) && (v > 90)) {
      v += ac * (0.05 + (100 / v * 0.1));
    } else {
      v += ac * 0.5;
    }

    if (v < 0) { // 逆走はしない
      v = 0;
    }

    if ((v > 0) && (pre_v == 0)) {

      aud_start.play();
      if (audioBuffer_goto != null) {
        if (isPlay == false) {
          // ノード作成
          bufferSourceNode = audioContext.createBufferSource();

          // デコード済み波形データのバッファ登録とループ再生設定
          bufferSourceNode.buffer = audioBuffer_goto;
          bufferSourceNode.loop = true;

          // ノード接続
          bufferSourceNode.connect(gainNode);

          bufferSourceNode.start();
          isPlay = true;
        }
      }
    } else if ((pre_v > 0) && (v == 0)) {
      if (bufferSourceNode != null) {
        if (isPlay == true) {
          bufferSourceNode.stop();
          bufferSourceNode = null;
          isPlay = false;
        }
      }
      aud_end.play();
    }
    if (isPlay) {
      bufferSourceNode.playbackRate.value = 0.1 + (v * 0.01);
    }
    pre_v = v;

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

    document.getElementById("dbg").innerText = '加速度=' + Math.floor(ac * 100) / 100 + ', 速度=' + Math.floor(Math.abs(v)) + ', 距離=' + Math.floor(-len / 100) + ',(m) xy=' + xy;

    camera.rotation.y = rot;
    camera.position.x = cx;
    camera.position.y = 0;
    camera.position.z = cz;

    //sppUnten.position.set(cx - (40 * Math.sin(rot)), -100, cz - (310 * Math.cos(rot)));
    sppUnten.position.set(cx - 40, -100, cz - 310);
    sppUnten.rotation.y = rot;

    mSpeed.position.x = cx - 205;
    mSpeed.position.y = -5;
    mSpeed.position.z = cz - 305;
    mSpeed.rotation.y = rot;

    if (txt != null) {
      txt.geometry.dispose();
      txt.material.dispose();
      scene.remove(txt.getMesh());
    }

    var speed = Math.floor(Math.abs(v));
    var spped_len = 3 - ('' + speed).length;
    for (var i = 0; i < spped_len; i++) {
      speed = '  ' + speed;
    }
    txt = new TextMesh();
    txt.drawText(speed);
    scene.add(txt.getMesh());

    const mNumber = txt.getMesh();
    mNumber.position.x = cx - 80
    mNumber.position.y = -57;
    mNumber.position.z = cz - 285;
    mNumber.rotation.y = rot;

    sppSyasyou.position.set(cx + 150, -100, cz - 300);
    sppSyasyou.rotation.y = rot;

    if (isMouseDown) {
      if (matSpeed.opacity < 1) {
        matSpeed.opacity += 0.05;
      }
    } else {
      if (matSpeed.opacity > 0) {
        matSpeed.opacity -= 0.05;
      }
    }


    if (isMouseDown) {
      if (sppMascon.material.opacity < 1) {
        sppMascon.material.opacity += 0.01;
      }
    } else {
      if (sppMascon.material.opacity > 0.5) {
        sppMascon.material.opacity -= 0.01;
      }
    }

    //sppMascon.position.y = -40;
    sppMascon.position.x = cx - 200;
    sppMascon.position.z = cz - 300;

    /*
    // レイキャスト = マウス位置からまっすぐに伸びる光線ベクトルを生成
    raycaster.setFromCamera(mouse, camera);

    // その光線とぶつかったオブジェクトを得る
    const intersects = raycaster.intersectObjects(scene.children);

    var isTouch = false;
    if (intersects.length > 0) {
      // ぶつかったオブジェクトに対してなんかする
      for (var i = 0; i < intersects.length; i++) {
        if (sppMascon == intersects[i].object) {
          console.log('マスコン触った？');
          isTouch = true;
        }
      }
    }
    isMasconOpe = isTouch;
    */
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
      cleanNum++;
    }
  }
  console.log('削除データNum＝' + cleanNum)

  return z;
}

function onResize() {

  //this.setConfig();

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
