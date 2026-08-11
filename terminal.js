const kernel = window.modOS.kernel;
const wer = window.modOS.wer;
const display = document.querySelector(".display");
export async function app(){
    await kill();
    const window = await wer.win("com.krambo345.terminal")
    kernel.terminal.launch(window.querySelector(".wer-content"))
    
}
export async function kill(){
    document.querySelectorAll('.wer-win[data-pckg="com.krambo345.terminal"]').forEach((el) => {
    window.closewin(el);
    });
    await kernel.terminal.kill();

}
export async function commands(){
}