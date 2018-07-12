const apiBasePath = "https://devinitydev.drpitlazar.us/api/"
const apiPlayerPath = apiBasePath + 'player/'

function formatNumber(num) {
    if (!num) return
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export {
    apiBasePath,
    apiPlayerPath,
    formatNumber
}