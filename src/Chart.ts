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
    private yOffset: number = 20;
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
        this.camera.position.set(100, 30 + this.yOffset, 100);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.2;
        // 垂直方向の回転の制限
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.minPolarAngle = -Math.PI / 2;
        // ズームの制限
        this.controls.maxDistance = 500;
        this.controls.minDistance = 50;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
        this.controls.enablePan = false;
        // console.log(this.controls.getDistance())
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
        // this.dataList = [this.dataList[0]];
        this.dataList.map((data, idx) => {
            let dailyDisc = new DailyDisc(data, this.yOffset, this.camera, this.width, this.height);
            this.dailyDiscList.push(dailyDisc);

            this.scene = dailyDisc.draw(this.scene);
        });
    }



    private updateDescriptionOpacity() {
        const DESCRIPTION_OPACITY_VARIABLE_THRESHOLD: number = 85;
        let objDistance: number = this.controls.getDistance();

        // 拡大したときにある拡大率からは説明文を不透明にする
        const descriptionElem: HTMLElement = <HTMLElement>document.querySelector('#desc');
        let descOpacity: number = 1.0;
        if (objDistance < DESCRIPTION_OPACITY_VARIABLE_THRESHOLD) {
            descOpacity = (objDistance - this.controls.minDistance) / (DESCRIPTION_OPACITY_VARIABLE_THRESHOLD - this.controls.minDistance);
        }
        descriptionElem.style.opacity = String(descOpacity);
    }

    public animation() {
        this.draw();

        const tick = () => {
            this.controls.update();

            this.updateDescriptionOpacity();

            this.dailyDiscList.forEach((dailyDisc: DailyDisc) => {
                dailyDisc.updateLabelPosition(this.camera, this.width, this.height, this.controls);
                dailyDisc.updateSpherePosition();
            });

            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(tick);
        }
        tick();
    }

    public dump() {
        console.table(this.dataList);
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