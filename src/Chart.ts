import * as THREE from "three";
import { Data } from "./Data";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class Chart {
    private dataList: Data[] = [];
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private controls: OrbitControls;
    private width: number;
    private height: number;
    private yOffset: number = 20;
    private baseList: { mesh: THREE.Mesh, elem: HTMLElement }[] = [];

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
        this.controls.minDistance = 150;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 2.0;
        this.controls.enablePan = false;
        // console.log(this.controls.getDistance())
    }

    public entryData(dataList: string[][]) {
        dataList.shift();
        this.dataList = dataList.map(data => {
            return {
                timeStampEpoch: Date.parse(data[0]),
                dateString: data[0],
                death: Number(data[1]),
                injury: Number(data[2])
            };
        }).reverse();
    }

    private genSphere(position: THREE.Vector3, opacity: number, radius: number, color: THREE.Color) {
        const geometry = new THREE.SphereGeometry(radius, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity,
            depthTest: false
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        return mesh;
    }

    private genCircle(position: THREE.Vector3, opacity: number, radius: number, color: THREE.Color) {
        const geometry = new THREE.CircleGeometry(radius, 32);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: opacity
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        mesh.rotateX(-Math.PI / 2);
        return mesh;
    }


    private calcRandomPosInCircle() {
        const theta = 2.0 * Math.PI * Math.random();
        const radius = Math.sqrt(Math.random());
        return { x: radius * Math.cos(theta), y: radius * Math.sin(theta) };
    }

    private draw() {
        const radiusFactor = 0.1;
        const yFactor = -0.00000005;
        const crntTimeStampEpoch = Date.now();
        let opacity = 0.9;
        const opacityDamingFactor = 0.9;

        this.dataList.map((data, idx) => {
            const deathAndInjuryTotal = data.injury + data.death;
            const radius = deathAndInjuryTotal * radiusFactor;
            const y = (crntTimeStampEpoch - data.timeStampEpoch) * yFactor + this.yOffset;

            // ベースのサークル
            let position = new THREE.Vector3(0, y, 0);
            let mesh = this.genCircle(position, opacity * 0.1, radius, new THREE.Color('#000000'));
            // mesh.name = `base-${idx}`;
            this.scene.add(mesh);

            const bodyElem = <HTMLElement>document.querySelector('#date-label');
            let pos = this.getWindowPosition(mesh);
            let labelElem = document.createElement('span');
            labelElem.textContent = `${data.dateString.replace(' ', 'T')}+09:00 `;
            labelElem.style.top = `${pos.y}px`
            // labelElem.style.left = `300px`
            bodyElem.appendChild(labelElem);

            this.baseList.push({
                mesh: mesh,
                elem: labelElem
            });

            // 個々のサークル
            for (let i = 0; i < data.death; i++) {
                let randomPos = this.calcRandomPosInCircle();
                let x = randomPos.x * radius;
                let z = randomPos.y * radius;

                position = new THREE.Vector3(x, y, z);
                let mesh = this.genSphere(position, opacity, 2.0, new THREE.Color('#D93A49'));
                // mesh.name = `death-${idx}`;
                this.scene.add(mesh);
            }
            for (let i = 0; i < data.injury; i++) {
                let randomPos = this.calcRandomPosInCircle();
                let x = randomPos.x * radius;
                let z = randomPos.y * radius;

                position = new THREE.Vector3(x, y, z);
                let mesh = this.genSphere(position, opacity, 0.5, new THREE.Color('#555555'));
                // mesh.name = `injury-${idx}`;
                this.scene.add(mesh);
            }

            opacity *= opacityDamingFactor;
        });
    }

    private update() {
        this.baseList.forEach(base => {
            let pos = this.getWindowPosition(base.mesh);
            base.elem.style.top = `${pos.y}px`
            // base.elem.style.left = `${pos.x}px`
        });
    }

    public animation() {
        this.draw();

        const tick = () => {
            this.controls.update();
            this.update();
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(tick);
        }
        tick();
    }

    public dump() {
        console.table(this.dataList);
    }


    private getWindowPosition(mesh: THREE.Mesh) {
        // 3Dオブジェクトのワールド座標を取得する
        const worldPosition = mesh.getWorldPosition(new THREE.Vector3());
        // スクリーン座標を取得する
        const projection = worldPosition.project(this.camera);
        const sx = (this.width / 2) * (+projection.x + 1.0) * -1;
        const sy = (this.height / 2) * (-projection.y + 1.0);

        // スクリーン座標
        return { x: sx, y: sy }
    }

    public onResize() {
        // サイズを取得
        const width = window.innerWidth;
        const height = window.innerHeight;

        // レンダラーのサイズを調整する
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(width, height);

        // カメラのアスペクト比を正す
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}