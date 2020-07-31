
import { ObjectData } from "./object-data"
import { BlockMap } from "../scene/block-map"

export class ObjectMap {

    private readonly blockMap: BlockMap
    private readonly grid: ObjectData[][] = []

    constructor(blockMap: BlockMap, width: number, height: number) {
        this.blockMap = blockMap

        for(let ri = 0; ri < height; ri++) {
            const row = new Array(width)
            for(let ci = 0; ci < width; ci++) {
                row.push(null)
            }

            this.grid.push(row)
        }
    }

    public set(x: number, y: number, objData: ObjectData) {
        let old = this.grid[y][x]
        this.grid[y][x] = objData

        if(old != null) {
            for(let i = 0; i < objData.width; i++) {
                this.blockMap.unBlock(x+i, y)
            }
        }

        if(objData == null) {
            return old
        }

        for(let i = 0; i < objData.width; i++) {
            this.blockMap.block(x+i, y)
        }

        return old
    }

    public reachable(fromX: number, fromY: number, x: number, y: number, objData: ObjectData) {
        if(this.grid[y][x] == null || this.grid[y][x] != objData) {
            return false
        }

        const distX = Math.abs(x + (objData.width - 1) / 2 - fromX)
        const distY = Math.abs(y - fromY)

        const reqX = objData.width / 2 + 1
        const reqY = 1.5

        return ((distX < reqX && distY < reqY - 1) || (distX < reqX - 1 && distY < reqY))
    }

}