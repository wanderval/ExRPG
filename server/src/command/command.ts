
import { ATTRIBUTES, isAttribId } from "../player/attrib";
import { Player } from "../player/player";
import { formatStrings } from "../util";
import { playerHandler, itemDataHandler, commandHandler, weatherHandler } from "../world";

function onMeTo(player: Player, args: string[]) {
    if(args.length == 0) {
        player.sendMessage("Correct usage: '/meto player_name'")
        return
    }

    const other = playerHandler.getName(args[0])
    if(other == null) {
        player.sendMessage(`Could not find player: ${args[0]}`)
        return
    }

    player.goToMap(other.map, other.x, other.y)
}

function onToMe(player: Player, args: string[]) {
    if(args.length == 0) {
        player.sendMessage("Correct usage: '/tome player_name'")
        return
    }

    const other = playerHandler.getName(args[0])
    if(other == null) {
        player.sendMessage(`Could not find player: ${args[0]}`)
        return
    }

    other.goToMap(player.map, player.x, player.y)
}

function onItem(player: Player, args: string[]) {
    if(args.length == 0) {
        player.sendMessage("Correct usage: '/item [player_name] item_id [amount]'")
        return
    }

    let toPlayer = player
    let itemArg = args[0]
    let amountArg = "1"

    if(args.length == 2) {
        amountArg = args[1]
    } else if(args.length > 2) {
        toPlayer = playerHandler.getName(args[0])
        if(toPlayer == null) {
            player.sendMessage(`Could not find player: ${args[0]}`)
            return
        }

        itemArg = args[1]
        amountArg = args[2]
    }

    const item = itemDataHandler.get(itemArg)
    if(item == null) {
        player.sendMessage(`Could not find item: ${itemArg}`)
        return
    }

    const amount = parseInt(amountArg, 10)
    if(isNaN(amount)) {
        player.sendMessage(`Amount '${amountArg}' is not a valid integer`)
        return
    }

    if(toPlayer != player) {
        player.sendMessage(`Gave ${toPlayer.name} ${amount}x ${item.name}`)
        toPlayer.sendMessage(`${player.name} gives you ${amount}x ${item.name}`)
    } else {
        player.sendMessage(`Added ${amount}x ${item.name}`)
    }

    toPlayer.inventory.addData(item, amount)
}

function onEmpty(player: Player, _: any) {
    player.inventory.empty()
    player.sendMessage("Emptied inventory")
}

function onPos(player: Player, _: string[]) {
    player.sendMessage(`Current pos: (${player.x}, ${player.y}) @ ${player.map.id}`)
}

function onSet(player: Player, args: string[]) {
    if(args.length < 2) {
        player.sendMessage("Correct usage: /set attrib_id value")
        player.sendMessage(`attrib_ids: ${formatStrings(ATTRIBUTES, "[", ", ", "]")}`)
        return
    }

    const attribId = args[0]
    const value = parseInt(args[1])

    if(!isAttribId(attribId)) {
        player.sendMessage(`attrib_id '${attribId}' is invalid`)
        player.sendMessage(`attrib_ids: ${formatStrings(ATTRIBUTES, "[", ", ", "]")}`)
        return
    }

    if(isNaN(value)) {
        player.sendMessage(`value '${value}' is not a valid integer`)
        return
    }

    player.attributes.setBase(attribId, value)
    player.sendMessage(`Set ${attribId} to ${value}`)
}

function onBrightness(player: Player, args: string[]) {
    let brightness: number

    if(args.length < 1 || isNaN(brightness = parseFloat(args[0]))) {
        player.sendMessage("Correct usage: /brightness value")
        return
    }

    player.sendMessage(`Brightness set to ${brightness}`)
    weatherHandler.brightness = brightness

    weatherHandler.enableClock = false
}

function onClock(player: Player, _: any) {
    weatherHandler.enableClock = !weatherHandler.enableClock
    player.sendMessage(`Weather clock ${weatherHandler.enableClock ? "enabled" : "disabled"}`)
}

function onSwingItem(player: Player, args: string[]) {
    if(args.length < 1) {
        player.sendMessage("Correct usage: /swing item_id")
        return
    }

    const itemArg = args[0]
    if(itemDataHandler.get(itemArg) == null) {
        player.sendMessage(`Could not find item: ${itemArg}`)
        return
    }

    player.swingItem(itemArg, 0, 1, 400)
}

export function initCommands() {
    const ch = commandHandler
    ch.on("item", onItem)
    ch.on("empty", onEmpty)
    ch.on("pos", onPos)
    ch.on("set", onSet)
    ch.on("meto", onMeTo)
    ch.on("tome", onToMe)
    ch.on("brightness", onBrightness)
    ch.on("clock", onClock)
    ch.on("swing", onSwingItem)
}