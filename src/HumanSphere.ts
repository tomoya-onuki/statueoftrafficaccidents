import * as THREE from "three";

export class HumanSphere {
    private mesh: THREE.Mesh = new THREE.Mesh();
    private velocity: THREE.Vector3;
    protected _radius: number;
    protected color: string;

    constructor() {
        this._radius = 1.0;
        this.color = '#000000'
        this.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            0,
            (Math.random() - 0.5) * 0.02,
        );
    }

    public makeMesh(position: THREE.Vector3, opacity: number) {
        const geometry = new THREE.SphereGeometry(this._radius, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: opacity,
            depthTest: false
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, position.y, position.z);
        return this.mesh
    }

    public updatePosition(isCollistion: boolean) {
        if (isCollistion) {
            this.velocity = this.velocity.multiplyScalar(-1);
        }
        this.mesh.position.add(this.velocity);
    }
  

    public get position(): THREE.Vector3 {
        return this.mesh.position;
    }

    public get radius(): number {
        return this._radius;
    }

    public isCollideTo(targetSphere: HumanSphere): boolean {
        let distanceCenter: number = this.position.distanceTo(targetSphere.position);
        let totalRadius: number = this.radius + targetSphere.radius;
        return distanceCenter <= totalRadius;
    }
}