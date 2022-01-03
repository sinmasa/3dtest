
  window.addEventListener('DOMContentLoaded', init);

  var v = 0; // 速度

  const KEYCODE_UP = 38;
  const KEYCODE_DN = 40;

  window.addEventListener("keydown", event => {
    console.log("keyCode= "+event.keyCode+"¥n");
    if (event.keyCode === KEYCODE_DN) {
      v += 1;
    }
    if (event.keyCode === KEYCODE_UP) {
      v -= 1;
    }
    console.log("速度= "+v+"¥n");
  });

  function init() {
    const width = 960;
    const height = 540;
  
    // const fbx = new FBXLoader();

    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector('#myCanvas')
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
  
    // シーンを作成
    const scene = new THREE.Scene();

    scene.background = new THREE.TextureLoader().load('img/sora.jpg');
  
    // カメラを作成
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.set(0, 0, 0);
    //camera.far = 10000;
  
    // スプライト（運転席）
    const sppUnten = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('img/unten.svg'),
//      map: new THREE.TextureLoader().load('img/syasyou.png'),
    }));
    sppUnten.scale.set(500, 180);
    sppUnten.position.set(0,130,700);
    scene.add(sppUnten);
    
    var x = 0;
    var z = 0;
    var rot = 0;

    for (var i = 0; i < 1000; i++) {
      // 地面
      const ground = new THREE.Mesh(new THREE.BoxGeometry(10000, 1, 1000),  new THREE.MeshStandardMaterial({color: (0x888888)}));
      scene.add(ground);

      // 線路を作成
      const rail = new THREE.Mesh(new THREE.BoxGeometry(800,10, 1000), new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load('img/rail.jpg'),
        side: THREE.DoubleSide,
      }));
      scene.add(rail);
      //rot = Math.PI * (0.001 * i) * 5;
      rot = 0;
      x -= Math.sin(rot) * 1000;
      z -= Math.cos(rot) * 1000;
      rail.position.set(x, -300, z);
      rail.rotation.y = rot;
      //x += 1;
      //z -= 1000;
      ground.position.set(x, -300, z);

      // 建物を作成
      for (var j = 0; j < 3; j++) {
        const box = new THREE.Mesh(new THREE.BoxGeometry((150 + (Math.random() * 300)), (300 + (Math.random() * 1000)), (150 + (Math.random() * 300))),  new THREE.MeshStandardMaterial({color: (0x000000 + (Math.random() * 0xFFFFFF))}));
        scene.add(box);
        box.position.set((Math.floor(Math.random() * 2) > 0 ? 1 : -1) * (600 + (Math.random() * 2000)), -300, z - ( (j * 1000 / 3) + (Math.random() * 200) - 100));
      }
    }

    // 平行光源
    const ambLight = new THREE.AmbientLight(0x777777);
    //ambLight.intensity = 0.3; 
    scene.add(ambLight);

    const light = new THREE.DirectionalLight(0xFFFFFF);
    //const light = new THREE.AmbientLight(0xFFFFFF);
    light.intensity = 0.1; // 光の強さを倍に
    light.position.set(0,50000,0);
    // シーンに追加
    scene.add(light);

    // // 建物
    // fbx.load('img/buildings/building.fbx', (obj)=>{
    //   scene.add(obj);
    // });

    // フォグを設定
    // new THREE.Fog(色, 開始距離, 終点距離);
    scene.fog = new THREE.Fog(0xFFFFFF, 100, 12000);

    // 初回実行
    tick();
  
    var len = 0;

    function tick() {
      requestAnimationFrame(tick);
  
      var cx = 0.0;
      var cz = 0.0;
      var rot = 0.0;

      len -= v;

      //camera.position.z -= v;
      //rail.rotation.x -=  (Math.PI / 90.8);

      // 角度から位置計算
      baseLen = Math.floor(Math.abs(len / 1000));

      var i = 0;
      for (i = 0; i < baseLen; i++) {
        //rot = Math.PI * (0.001 * i) * 5;
        rot = 0;
        cx -= Math.sin(rot) * 1000.0;
        cz -= Math.cos(rot) * 1000.0;
      }
      //rot = Math.PI * (0.001 * baseLen) * 5;
      cx -= Math.sin(rot) * (Math.abs(len) % 1000);
      cz -= Math.cos(rot) * (Math.abs(len) % 1000);

      document.getElementById("dbg").innerText = '速度=' + Math.abs(v) + ', 距離=' + len;

      camera.rotation.y = rot;
      camera.position.x = cx;
      camera.position.y = 0;
      camera.position.z = cz;

      sppUnten.position.x = cx;
      sppUnten.position.z = cz - 270;
      sppUnten.position.z = 100;

      // レンダリング
      renderer.render(scene, camera);
    }
  }
  
