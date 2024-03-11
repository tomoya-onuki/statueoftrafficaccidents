import * as THREE from "three";
import { Data } from "./Data";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DailyDisc } from "./DailyDisc";

export class Chart {
    private dataList: Data[] = [];
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private width: number;
    private height: number;
    private yOffset: number = 25;
    private dailyDiscList: DailyDisc[] = [];

    constructor() {
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });

        const canvasElem: HTMLElement = <HTMLElement>document.querySelector("#canvas");
        canvasElem.append(this.renderer.domElement);
        this.width = canvasElem.offsetWidth;
        this.height = canvasElem.offsetHeight;

        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 1, 5000);
        this.camera.position.set(160, 0, 0);
        // this.camera.position.set(100, 30 + this.yOffset, 100);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.2;
        // 垂直方向の回転の制限
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.minPolarAngle = -Math.PI / 2;
        // ズームの制限
        this.controls.maxDistance = 500;
        this.controls.minDistance = 0;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
        this.controls.enablePan = false;
    }

    public entryData(dataList: string[][]) {
        function zeroPadding(num: number, len: number): string {
            return (Array(len).join('0') + num).slice(-len);
        }

        dataList.shift();
        this.dataList = dataList.map(data => {
            let token0 = data[0].replace(/[:\s]/g, '/').split('/');
            let token1 = token0.map(t => t.length === 1 ? `0${t}` : t);
            let dateString = `${token1[0]}/${token1[1]}/${token1[2]}T${token1[3]}:${token1[4]}:${token1[5]}+09:00`;
            return {
                timeStampEpoch: Date.parse(data[0]),
                dateString: dateString,
                death: Number(data[1]),
                injury: Number(data[2])
            };
        }).reverse();
    }

    private draw() {
        this.dataList.map((data, idx) => {
            let opacity = (this.dataList.length - idx) / this.dataList.length * 0.7 + 0.2;
            let dailyDisc = new DailyDisc(data, this.yOffset, opacity);
            dailyDisc.initDateTimeLabelElemPosition(this.windowPositionFrom(dailyDisc.wordPosition));
            this.dailyDiscList.push(dailyDisc);
            this.scene = dailyDisc.draw(this.scene);
        });
    }



    private updateDescriptionOpacity() {
        const DESCRIPTION_OPACITY_VARIABLE_THRESHOLD: number = 150;
        let objDistance: number = this.controls.getDistance();

        // 拡大したときにある拡大率からは説明文を不透明にする
        const descriptionElem: HTMLElement = <HTMLElement>document.querySelector('#desc');
        let descOpacity: number = 1.0;
        if (objDistance < DESCRIPTION_OPACITY_VARIABLE_THRESHOLD) {
            descOpacity = (objDistance - 100) / (DESCRIPTION_OPACITY_VARIABLE_THRESHOLD - 100);
        }
        descriptionElem.style.opacity = String(descOpacity);
    }

    public animation() {
        this.draw();

        const tick = () => {
            this.controls.update();
            this.updateDescriptionOpacity();

            let obj2cameraDistance: number = this.controls.getDistance();
            this.dailyDiscList.forEach((dailyDisc: DailyDisc) => {
                dailyDisc.updateDateTimeLabelElemPosition(this.windowPositionFrom(dailyDisc.wordPosition), obj2cameraDistance);
                dailyDisc.updateSpherePosition();
                dailyDisc.rotateArc();
            });

            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(tick);
        }
        tick();
    }

    public dump() {
        console.table(this.dataList);
    }

    private windowPositionFrom(meshWorldPosition: THREE.Vector3): THREE.Vector2 {
        // スクリーン座標を取得する
        const projection = meshWorldPosition.project(this.camera);
        const sx = (this.width / 2) * (+projection.x + 1.0) * -1;
        const sy = (this.height / 2) * (-projection.y + 1.0);

        // スクリーン座標
        return new THREE.Vector2(sx, sy);
    }

    public onResize() {
        // サイズを取得
        this.width = window.innerWidth;
        // const height = window.innerHeight;

        // レンダラーのサイズを調整する
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);

        // カメラのアスペクト比を正す
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
    }
}