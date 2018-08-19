import Big from 'big.js'

const apiBasePath = "https://devinitydev.drpitlazar.us/api/"
const apiPlayerPath = apiBasePath + 'player/'
const apiDevinityPath = apiBasePath + 'devinity/'

function formatNumber(num) {
    if (!num) return
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function isSteamId32(id) {
    return /^STEAM_.:[0-1]:\d+$/.test(id)
}

function steamId32toSteamId64(steamId) {
    if (!isSteamId32(steamId)) throw Error(`Expecting SteamID32, got '${steamId}'`)
    let base = new Big('76561197960265728'),
        result = steamId.match(/^STEAM_.:([0-1]):(\d+)$/),
        [, Y, Z] = result
    return base.plus(Y).plus(Z * 2).toString()
}

export {
    apiBasePath,
    apiPlayerPath,
    apiDevinityPath,
    formatNumber,
    steamId32toSteamId64
}