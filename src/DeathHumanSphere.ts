import { HumanSphere } from "./HumanSphere";
import { CollisionedAnimation } from "./CollisionedAnimation";

export class DeathHumanSphere extends HumanSphere {
    protected _radius: number = 1.5;
    protected color: string = '#D93A49';
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
}