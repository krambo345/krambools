export function app() {
    const body = document.body
const desktop = document.querySelector(".desktop")
const interface = document.querySelector(".interface")
makeDesktop()
async function makeDesktop() {
    desktop.replaceChildren("")
    const apps = await loadapps()
    Object.entries(apps).forEach(([name, app]) => {
        if (app.visible || visibility) {
            desktop.insertAdjacentHTML("beforeend", `
        <div class="desktop-icon" ondblclick="exec('${name}')">
            <img src="/modOS/base/system/icons/${app.icon}.png">
            <span>${name}</span>
        </div>
    `);
        }

    });
}
async function exec(name, icon) {
    interface.insertAdjacentHTML("beforeend",
        `<div class='win' data-windowname='${name}' data-windowicon='${await identifyicon(name, icon)}'>
        <div class='winheader'>
        </div>
        <div class='content'>${await identifycontent(name, icon)}
        </div>
        </div>`)
    insertScript(apps[name].script)
    eval(apps[name].command)
    const win = interface.lastElementChild
    initwindow(win)
}
async function loadapps() {
    try {
        const jsonraw = await fetch("base/system/apps.json")
        if (!jsonraw.ok) {
            throw new Error(`Response status: ${jsonraw.status}`)
        }
        const apps = await jsonraw.json()
        return apps
    } catch (error) {
        console.error(error.message)
    }
}
async function identifyicon(n, i) {
    const apps = await loadapps()
    if (apps[n]) {
        return apps[n].icon
    } else {
        return i
    }
}
async function identifycontent(n) {
    const apps = await loadapps()
    if (apps[n]) {
        return apps[n].content
    } else {
        return ""
    }
}
let visibility = false
function showhidden() {
    visibility = true
    makeDesktop()
    return "showing hidden"
}
function hidehidden() {
    visibility = false
    makeDesktop()
    return "hiding hidden"
}
function insertScript(s) {
    const script = document.createElement("script")
    script.textContent = s
    document.body.appendChild(script)
}
}