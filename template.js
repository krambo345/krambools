// Template or Example Package
const kernel = window.modOS.kernel;
const wer = window.modOS.wer; // Part of the com.krambo345.wer package
const display = document.querySelector(".display");
export async function app(){
    const window = await wer.win("com.krambo345.template") // Part of the com.krambo345.wer package
    window.innerHTML = `
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
                    run: async(text) =>
                        kernel.system.log(text, "warn")
                }
            }
        }
    }
}