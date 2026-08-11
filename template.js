const kernel = window.modOS.kernel;
const display = document.querySelector(".display");
function doSomething(){

}
function endSomething(){

}
export async function app(){
    doSomething()
}
export async function kill(){
    endSomething()
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