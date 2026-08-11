const kernel = window.modOS.kernel;
const wer = window.modOS.wer;
const display = document.querySelector(".display");
export async function app(){
    const window = await wer.win("com.krambo345.terminal")
    kernel.terminal.launch(window.querySelector(".wer-content"))
    
}
export async function kill(){
}
export async function commands(){
}