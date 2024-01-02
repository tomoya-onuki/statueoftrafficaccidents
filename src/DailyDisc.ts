import * as THREE from "three";
import { Data } from "./Data";
import { DeathHumanSphere } from "./DeathHumanSphere";
import { InjuryHumanSphere } from "./InjuryHumanSphere";
import { HumanSphere } from "./HumanSphere";

export class DailyDisc {
    private humanSphereList: HumanSphere[] = [];
    private opacity: number;
    private radius: number;
    private position: THREE.Vector3;
    private mesh: THREE.Mesh;
    private labelElem: HTMLElement;

    constructor(data: Data, yOffset: number) {
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
        this.labelElem = document.createElement('span');
        this.labelElem.textContent = data.dateString;
        bodyElem.appendChild(this.labelElem);

        for (let i = 0; i < data.death; i++) {
            this.humanSphereList.push(new DeathHumanSphere());
        }

        for (let i = 0; i < data.injury; i++) {
            this.humanSphereList.push(new InjuryHumanSphere());
        }
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

    private calcRandomPosInDailyDisc(offsetRadius: number): THREE.Vector3 {
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
            let position = this.calcRandomPosInDailyDisc(humanSphere.radius);
            let mesh = humanSphere.makeMesh(position, this.opacity);
            scene.add(mesh);
        });

        return scene;
    }

    public initDateTimeLabelElemPosition(widowPosition: THREE.Vector2) {
        this.labelElem.style.top = `${widowPosition.y}px`
    }

    public updateDateTimeLabelElemPosition(windowPosition: THREE.Vector2, obj2cameraDistance: number) {
        const DATE_LABEL_POS_VARIABLE_THRESHOLD: number = 145;
        const LABEL_X: number = 100;

        // 拡大したときにある拡大率からは時刻ラベルのx座標を可変とする
        let labelX: number = LABEL_X;
        if (obj2cameraDistance < DATE_LABEL_POS_VARIABLE_THRESHOLD) {
            labelX = Math.pow(DATE_LABEL_POS_VARIABLE_THRESHOLD - obj2cameraDistance, 2) / 50 + LABEL_X;
        }

        this.labelElem.style.top = `${windowPosition.y}px`;
        this.labelElem.style.left = `calc(50vw + ${labelX}px)`;
    }

    public updateSpherePosition() {
        this.humanSphereList.forEach((humanSphere: HumanSphere) => {
            const isCollistion: boolean = this.isCollideFromSphere(humanSphere);
            humanSphere.updatePosition(isCollistion);
            humanSphere.updateColor(isCollistion);
        });
    }


    private isCollideFromSphere(targetSphere: HumanSphere): boolean {
        let distanceCenter = this.position.distanceTo(targetSphere.position);
        return distanceCenter + targetSphere.radius >= this.radius;
    }

    public get wordPosition(): THREE.Vector3 {
        return this.mesh.getWorldPosition(new THREE.Vector3());
    }
    
}