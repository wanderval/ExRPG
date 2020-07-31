
import { Scene } from "../scene/scene"
import { Walking } from "./walking"
import { sceneHandler } from "../world"
import { TaskHandler } from "./task"
import { WALK_DELAY } from "../util"

export abstract class Character {

    public readonly taskHandler = new TaskHandler()
    protected readonly walking = new Walking(this)

    private followers = [] as Character[]
    protected following = null as Character

    /*
    The last tile the character moved away from
    (or their current position, after a placement)
    Useful to get behind the character
    */
    private lastX: number
    private lastY: number

    private _x: number
    private _y: number

    private _map: Scene

    private _walkSpeed: number
    private _walkDelay: number

    constructor(walkSpeed = 1, map = null as Scene, x = 0, y = 0) {
        this._map = map
        this._x = x
        this._y = y
        this.lastX = x
        this.lastY = y
        this.walkSpeed = walkSpeed
    }

    public get walkSpeed() {
        return this._walkSpeed
    }

    public set walkSpeed(value: number) {
        value = Math.max(0.05, value)

        this._walkSpeed = value
        this._walkDelay = Math.trunc(WALK_DELAY / value)
    }

    public get walkDelay() {
        return this._walkDelay
    }

    public reaches(other: Character) {
        const distX = Math.abs(other.x - this.x)
        const distY = Math.abs(other.y - this.y)

        return this.map == other.map && distX <= 1 && distY <= 1
    }

    public get still() {
        return this.following == null && this.walking.still
    }

    private addFollower(character: Character) {
        this.followers.push(character)
    }

    private removeFollower(character: Character) {
        this.followers = this.followers.filter(c => c != character)
    }

    private getBehind(other: Character) {
        const distX = Math.abs(other.x - this.walking.goalX)
        const distY = Math.abs(other.y - this.walking.goalY)

        if((distX == 0 && distY == 0) || distX > 1 || distY > 1) {
            this.walking.followStep(other.lastX, other.lastY)
        }
    }

    public follow(character: Character) {
        if(this.following != null) {
            this.unfollow()
        }

        this.following = character
        character.addFollower(this)

        this.getBehind(character)
    }

    public unfollow() {
        if(this.following == null) {
            return
        }

        this.following.removeFollower(this)
        this.following = null
    }

    public get x() {
        return this._x
    }

    public get y() {
        return this._y
    }

    public get map() {
        return this._map
    }

    public goTo(mapId: string, x: number, y: number) {
        const map = sceneHandler.get(mapId)
        this.clearSteps()

        for(let f of this.followers) {
            f.unfollow()
        }

        if(this._map != map) {
            if(this._map != null) {
                this.leaveMap()
            }

            this._x = x
            this._y = y
            this.lastX = x
            this.lastY = y

            this._map = map
            this.enterMap()
        } else {
            this.move(x, y)
        }
    }

    protected abstract enterMap(): void
    protected abstract leaveMap(): void

    public walk(x: number, y: number) {
        this.move(x, y, true)
    }

    public walkable(x: number, y: number) {
        return !this._map.isBlocked(x, y)
    }

    public clearSteps() {
        this.walking.clear()
        this.unfollow()
    }

    public addSteps(goalX: number, goalY: number) {
        this.walking.addSteps(goalX, goalY)
    }

    protected abstract onMove(animate: boolean): void

    public move(x: number, y: number, animate = false) {
        this.lastX = this._x
        this.lastY = this._y

        this.followers.forEach(f => {
            f.walking.followStep(this._x, this._y)
        })

        this._x = x
        this._y = y
        this.onMove(animate)
    }

    public remove() {
        if(this._map != null) {
            this.leaveMap()
        }

        this.taskHandler.stopTask()
    }

}