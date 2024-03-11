import * as THREE from "three";
import { HumanSphere } from "./HumanSphere";
import { CollisionedAnimation } from "./CollisionedAnimation";

export class DeathHumanSphere extends HumanSphere {
    protected _radius: number = 0.5;
    protected color: string = '#BB0013';
    private collisionAnimation: CollisionedAnimation;
    

    constructor() {
        super();
        this.collisionAnimation = new CollisionedAnimation(this.color, 100, 2, 3);
    }

    public updateColor(isCollistion: boolean) {
        if (isCollistion) {
            this.collisionAnimation.start();
        }

        if(!this.collisionAnimation.isFinished()){
            this.material.color.set(this.collisionAnimation.color);
            this.collisionAnimation.loop();
        } else {
            this.material.color.set(this.color);
            this.collisionAnimation.stop();
        }
    }

    public makeMesh(position: THREE.Vector3, opacity: number) {
        opacity *= 4;
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
}