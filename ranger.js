const kernel = window.modOS.kernel;
const wer = window.modOS.wer;
const display = document.querySelector(".display");
export async function app(){
    const window = await wer.win("com.krambo345.template")
    window.querySelector(".wer-content").innerHTML = `
        <div>
        </div>
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