// Template or Example Package
const kernel = window.modOS.kernel;
const wer = window.modOS.wer; // Part of the com.krambo345.wer package
const display = document.querySelector(".display");
async function injectCSS() {
  if (document.querySelector('style[data-krambools]')) return;

  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/krambo345/krambools/refs/heads/master/krambools.css"
    );
    const css = await response.text();
    const style = document.createElement("style");
    style.dataset.krambools = "true";
    style.textContent = css;
    document.head.appendChild(style);
  } catch (error) {
    kernel.system.log(`Failed to inject CSS: ${error}`, "error");
  }
}
export async function app(){
    injectCSS();
    const window = await wer.win("com.krambo345.template") // Part of the com.krambo345.wer package
    window.querySelector(".wer-content").innerHTML = `
        <h1>This is an example application running in a window</h1>
    `
}
export async function kill(){
}
export async function commands(){
    return{
        template:{
            args:"<arg>",
            description:"Demonstrate commands",
            sub:{
                test:{
                    arg:"<string>",
                    description:"Log text to system",
                    run: async([text]) =>
                        kernel.system.log(text, "warn")
                }
            }
        }
    }
}