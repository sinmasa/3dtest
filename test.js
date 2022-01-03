
  window.addEventListener('DOMContentLoaded', init);


  function init() {
    const width = 960;
    const height = 540;
  
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
  
    // スプライト(遠景)
    const spSora = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('img/sora.jpg'),
    }));
    spSora.scale.set(1920*20, 1271*8);
    spSora.position.set(0,0,-9000);
    //scene.add(spSora);

    // スプライト（運転席）
    const sppUnten = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('img/unten.svg'),
//      map: new THREE.TextureLoader().load('img/syasyou.png'),
    }));
    sppUnten.scale.set(500, 180);
    sppUnten.position.set(0,-130,700);
    scene.add(sppUnten);

    // 箱を作成
    //const geometry = new THREE.BoxGeometry(500, 500, 500);
    const geometry = new THREE.BoxGeometry(200, 200, 200);
    const material = new THREE.MeshStandardMaterial({color: 0xFF00FF});
    const box = new THREE.Mesh(geometry, material);
    scene.add(box);

    box.position.set(500, 0, -5000);

    const box2 = new THREE.Mesh(new THREE.BoxGeometry(200, 200, 200),  new THREE.MeshStandardMaterial({color: 0xFF00FF}));
    scene.add(box2);

    box2.position.set(-500, 0, -2000);

    var x = 0;
    var z = 0;
    var rot = 0;
  // 線路を作成
    for (var i = 0; i < 500; i++) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(800,10, 1000), new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load('img/rail.jpg'),
        side: THREE.DoubleSide,
      }));
      //rot = Math.PI * (0.001 * i) * 5;
      rot = 0;
      x -= Math.sin(rot) * 1000;
      z -= Math.cos(rot) * 1000;
      rail.position.set(x, -300, z);
      rail.rotation.y = rot;
      scene.add(rail);
      //x += 1;
      //z -= 1000;
    }
    // 平行光源
    const ambLight = new THREE.AmbientLight(0x777777);
    //ambLight.intensity = 0.3; 
    scene.add(ambLight);

    const light = new THREE.DirectionalLight(0xFFFFFF);
    //const light = new THREE.AmbientLight(0xFFFFFF);
    light.intensity = 0.1; // 光の強さを倍に
    light.position.set(1,1000,-8000);
    // シーンに追加
    scene.add(light);

    // フォグを設定
    // new THREE.Fog(色, 開始距離, 終点距離);
    scene.fog = new THREE.Fog(0xFFFFFF, 100, 12000);

    // 初回実行
    tick();
  
    var len = 0;

    function tick() {
      requestAnimationFrame(tick);
  
      // // 箱を回転させる
      // box.rotation.x += 0.01;
      // box.rotation.y += 0.01;
      // box.rotation.z += 0.08;

      // if (! box.dir) {
      //   box.dir = 1;
      // } else if (box.position.x > 300) {
      //   box.dir = -1;
      // } else if (box.position.x < -300) {
      //   box.dir = 1;
      // }
      // box.position.x += box.dir * 10;

      const v = 200;

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

      //document.getElementById("dbg").innerText = 'len=' + len + ', x=' + cx + ', z=' + cz;

      camera.rotation.y = rot;
      camera.position.x = cx;
      camera.position.y = 0;
      camera.position.z = cz;

      spSora.position.x = cx;
      spSora.position.z = cz - 9000;

      sppUnten.position.x = cx;
      sppUnten.position.z = cz - 270;
      sppUnten.position.z = 100;

      // レンダリング
      renderer.render(scene, camera);
    }
  }
  
function test()
{
    var n = Math.floor(Math.random()*30);
    alert('test!' + n);
}