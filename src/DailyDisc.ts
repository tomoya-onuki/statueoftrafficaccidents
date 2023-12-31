import * as THREE from "three";
import { Data } from "./Data";
import { DeathHumanSphere } from "./DeathHumanSphere";
import { InjuryHumanSphere } from "./InjuryHumanSphere";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { HumanSphere } from "./HumanSphere";

export class DailyDisc {
    private humanSphereList: HumanSphere[] = [];
    private opacity: number;
    private radius: number;
    private position: THREE.Vector3;
    private mesh: THREE.Mesh;
    private labelElem: HTMLElement;

    constructor(data: Data, yOffset: number, camera: THREE.Camera, width: number, height: number) {
        const RADIUS_FACTOR: number = 0.1;
        const Y_FACTOR: number = -0.00000002;
        const BASE_OPACITY: number = 0.9;
        const OPACITY_DAMPING_FACTOR: number = 0.0000000002;

        const crntTimeStampEpoch: number = Date.now();
        const deathAndInjuryTotal: number = data.injury + data.death;
        this.radius = deathAndInjuryTotal * RADIUS_FACTOR;
        this.opacity = BASE_OPACITY - (crntTimeStampEpoch - data.timeStampEpoch) * OPACITY_DAMPING_FACTOR;

        const y = (crntTimeStampEpoch - data.timeStampEpoch) * Y_FACTOR + yOffset;
        this.position = new THREE.Vector3(0, y, 0);

        this.mesh = this.makeCircleMesh();

        // 時刻ラベルの作成
        const bodyElem = <HTMLElement>document.querySelector('#date-label');
        this.labelElem = this.initDateTimeLabelElem(data, camera, width, height);
        bodyElem.appendChild(this.labelElem);

        for (let i = 0; i < data.death; i++) {
            this.humanSphereList.push(new DeathHumanSphere());
        }

        for (let i = 0; i < data.injury; i++) {
            this.humanSphereList.push(new InjuryHumanSphere());
        }
    }

    private initDateTimeLabelElem(data: Data, camera: THREE.Camera, width: number, height: number): HTMLElement {
        let pos = this.getWindowPosition(camera, width, height);
        let labelElem = document.createElement('span');
        labelElem.textContent = data.dateString;
        labelElem.style.top = `${pos.y}px`
        return labelElem;
    }

    private makeCircleMesh() {
        const geometry = new THREE.CircleGeometry(this.radius, 64);
        const material = new THREE.MeshBasicMaterial({
            color: '#000000',
            transparent: true,
            opacity: this.opacity * 0.1,
            depthTest: false
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        mesh.rotateX(-Math.PI / 2);
        return mesh;
    }

    private calcRandomPosInCircle(offsetRadius: number): THREE.Vector3 {
        const theta = 2.0 * Math.PI * Math.random();
        const r = Math.sqrt(Math.random());
        return new THREE.Vector3(
            (this.radius - offsetRadius) * r * Math.cos(theta),
            this.position.y,
            (this.radius - offsetRadius) * r * Math.sin(theta)
        );
    }


    public draw(scene: THREE.Scene) {
        scene.add(this.mesh);

        this.humanSphereList.forEach(humanSphere => {
            let position = this.calcRandomPosInCircle(humanSphere.radius);
            let mesh = humanSphere.makeMesh(position, this.opacity);
            scene.add(mesh);
        });

        return scene;
    }


    public updateLabelPosition(camera: THREE.Camera, width: number, height: number, controls: OrbitControls) {
        const DATE_LABEL_POS_VARIABLE_THRESHOLD: number = 145;
        const LABEL_X: number = 100;
        let objDistance: number = controls.getDistance();

        // 拡大したときにある拡大率からは時刻ラベルのx座標を可変とする
        let labelX: number = LABEL_X;
        if (objDistance < DATE_LABEL_POS_VARIABLE_THRESHOLD) {
            labelX = Math.pow(DATE_LABEL_POS_VARIABLE_THRESHOLD - objDistance, 2) / 50 + LABEL_X;
        }

        let pos = this.getWindowPosition(camera, width, height);
        this.labelElem.style.top = `${pos.y}px`;
        this.labelElem.style.left = `calc(50vw + ${labelX}px)`;
    }

    public updateSpherePosition() {
        this.humanSphereList.forEach((humanSphere: HumanSphere) => {
            humanSphere.updatePosition(this.isCollideFromSphere(humanSphere));
        });
    }


    private isCollideFromSphere(targetSphere: HumanSphere): boolean {
        let distanceCenter = this.position.distanceTo(targetSphere.position);
        return distanceCenter + targetSphere.radius >= this.radius;
    }

    private getWindowPosition(camera: THREE.Camera, width: number, height: number) {
        // 3Dオブジェクトのワールド座標を取得する
        const worldPosition = this.mesh.getWorldPosition(new THREE.Vector3());
        // スクリーン座標を取得する
        const projection = worldPosition.project(camera);
        const sx = (width / 2) * (+projection.x + 1.0) * -1;
        const sy = (height / 2) * (-projection.y + 1.0);

        // スクリーン座標
        return { x: sx, y: sy }
    }
}