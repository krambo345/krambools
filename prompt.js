const kernel = window.modOS.kernel;
const wer = window.modOS.wer;
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
    kernel.system.log(`Failed to inject prompt CSS: ${error}`, "error");
  }
}
export async function app(title){
    await injectCSS();
    const window = await wer.win("com.krambo345.template");
    window.querySelector(".wer.closewin").remove();
    window.querySelector(".wer-content").innerHTML = `
        <h1>${title}</h1>
        <inp type="text" id="prompt-response" class="prompt-input"></inp>
        <button class="prompt-submit">Submit</button>
    `;
    window.querySelector(".prompt-submit").addEventListener("click", () => {
        return(document.getElementById("prompt-response").value, kill());
      });
}
export async function kill(){
    document.querySelectorAll('.wer-win[data-pckg="com.krambo345.prompt"]').forEach((el) => {
    window.closewin(el);
    });
}
export async function commands(){
    return{
        template:{
            args:"<arg>",
            description:"Demonstrate commands",
            sub:{
                prompt:{
                    arg:"<string>",
                    description:"Get a prompt",
                    run: async([text]) =>
                        wer.win("")
                }
            }
        }
    }
}