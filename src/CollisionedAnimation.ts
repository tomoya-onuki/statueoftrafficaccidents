import chroma from "chroma-js";

export class CollisionedAnimation {
    private collisionedColor: string;
    private colorSet: string[];
    private maxFrameNum: number = 100;
    private frameNum: number = 0;

    constructor(normalColor: string, frame?: number, brightenLevel?: number, saturateLevel?: number) {
        if (frame != undefined)
            this.maxFrameNum = frame;
        if (brightenLevel == undefined)
            brightenLevel = 0;
        if (saturateLevel == undefined)
            saturateLevel = 0

        this.collisionedColor = chroma.hex(normalColor)
            .brighten(brightenLevel)
            .saturate(saturateLevel)
            .hex();

        this.colorSet = chroma.scale([this.collisionedColor, normalColor]).colors(this.maxFrameNum);

        this.stop();
    }

    public get color(): string {
        return this.colorSet[this.frameNum];
    }

    public start() {
        this.frameNum = 0;
    }

    public loop() {
        this.frameNum++;
    }

    public stop() {
        this.frameNum = this.maxFrameNum;
    }

    public isFinished() {
        return this.frameNum >= this.maxFrameNum;
    }
}