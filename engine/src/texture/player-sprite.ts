
import { Engine, Sprite, MergeTexture, EquipmentData } from ".."

export class PlayerSprite {

    private engine: Engine

    private baseSprite: Sprite
    
    private readonly mergeTexture: MergeTexture
    public readonly sprite: Sprite 

    private appearanceValues: EquipmentData[]

    constructor(engine: Engine, baseSprite: Sprite, appearanceValues: EquipmentData[]) {
        this.engine = engine
        this.baseSprite = baseSprite

        this.mergeTexture = new MergeTexture(engine, baseSprite.width, baseSprite.height)
        this.sprite = new Sprite(engine, this.mergeTexture.texture)

        this.setAppearanceValues(appearanceValues)
    }

    public get width() {
        return this.baseSprite.width
    }

    public get height() {
        return this.baseSprite.height
    }

    public async setAppearanceValues(appearanceValues: EquipmentData[]) {
        this.appearanceValues = appearanceValues
        const spritePromises = appearanceValues.map(eq => eq.getSprite(this.engine))
        const sprites = await Promise.all(spritePromises)

        if(this.appearanceValues != appearanceValues) { //make sure the appearance values are still up to date
            return
        }

        this.mergeTexture.bind()

        this.baseSprite.draw(0, 0)
        sprites.forEach(s => {
            s.draw(0, 0)
        })

        this.mergeTexture.unbind()
    }
    
    public draw(x: number, y: number) {
        this.sprite.draw(x, y)
    }

}