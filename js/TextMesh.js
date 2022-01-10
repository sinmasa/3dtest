/**
 * メッシュを作る
 * @see https://qiita.com/mtoutside/items/b1e6adb8ca60c14a8ee4
 */
class TextMesh {


    constructor() {
        const segment = 1;

        this.texture = null;

        this.geometry = new THREE.PlaneGeometry(75, 40);

        // テクスチャの作成 前述の「テクスチャを作る.js」を参照
        this.texture = this.createTexture({
            text: '000',
            fontSize: 100, // フォントサイズ
        });

        //this.material = mew THREE.MeshStandardMaterial({ map:  this.texture  });
        this.material = new THREE.MeshStandardMaterial({
            map: this.texture,
            side: THREE.FrontSide,
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    getMesh() { return this.mesh; }

      /**
   * 2D Canvasからテクスチャを作成する
   * @param {Object} options
   * @param {stirng} options.text 描画したい文字列
   * @param {number} options.fontSize フォントサイズ
   * @return {Object} テクスチャを返す。
   * @memberof Canvas
   * @see https://qiita.com/mtoutside/items/b1e6adb8ca60c14a8ee4
   */
  createTexture(options) {
    // Canvas要素を作成
    const canvas = document.createElement('canvas');
    this.ctx = canvas.getContext('2d');

    const ctx = this.ctx;

    // measureTextするためいったん設定
    const fontFamily = 'monospace';
    ctx.font = `bold ${options.fontSize * Config.dpr}px '${fontFamily}'`;
    const textWidth = ctx.measureText(options.text); // 文字の横幅を取得

    // dprに対応したサイズを計算
    this.width = textWidth.width;
    this.height = options.fontSize * Config.dpr * 0.9; // 文字に合わせて高さを調整。ここの高さは任意で
    // 幅を指定
    canvas.width = this.width;
    canvas.height = this.height;

    // 中央にテキストを描画
    ctx.font = `bold ${options.fontSize * Config.dpr}px '${fontFamily}'`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'hanging';
    this.drawText('0 0 0');

    // ↓canvasの文字を確認したいとき。テキストを描画したcanvasをbodyに追加しているだけです。
    // document.body.appendChild(canvas);
    // canvas.style.backgroundColor = '#933';
    // canvas.style.position = 'relative';

    // テクスチャを作成
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = false;
    // ↓ここら辺の設定をしておかないとthree.jsでエラーが出る時がある
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;

    return texture;
  }

  drawText(txt) {
    this.ctx.fillStyle = 'rgba(0, 160, 255, 1)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
    this.ctx.fillText(txt, -5, 0); // 文字が途切れないように調整。数値はよしなに
  }

  dispose() {

  }

}