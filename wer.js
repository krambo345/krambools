
export function app() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://github.com/krambo345/krambools/raw/refs/heads/master/krambools.css";
    document.head.appendChild(link);
    let zlast = 1;
    function insertFunctions(win) {
        const header = win.querySelector(".header");
        header.insertAdjacentHTML("beforeend", `<div class="winl"><img src="/icons/${win.dataset.windowicon}.png" class="windowicon"></img><span>${win.dataset.windowname}</span></div><div class="winr"><button class="minimwin"></button><button class="closewin"></button></div>`);
        document.querySelectorAll(".minimwin").forEach((button) => {
            button.addEventListener("click", () => {
                minimwin(button.closest(".win"));
            });
        });
        document.querySelectorAll(".closewin").forEach((button) => {
            button.addEventListener("click", () => {
                closewin(button.closest(".win"));
            });
        });
    }

    function windowz(e) {
        zlast++;
        e.style.zIndex = zlast;
    }

    function minimwin(e) {
        e.style.display = "none";
    }

    function closewin(e) {
        e.remove();
    }

    function dragElement(element) {
        windowz(element);
        const header = element.querySelector(".winheader");
        let initialX = 0;
        let initialY = 0;

        function startDragging(e) {
            windowz(element);
            e = e || window.event;
            e.preventDefault();
            initialX = e.clientX;
            initialY = e.clientY;
            document.onmouseup = stopDragging;
            document.onmousemove = onDrag;
        }

        function onDrag(e) {
            e = e || window.event;
            e.preventDefault();
            const currentX = initialX - e.clientX;
            const currentY = initialY - e.clientY;
            initialX = e.clientX;
            initialY = e.clientY;
            element.style.top = element.offsetTop - currentY + "px";
            element.style.left = element.offsetLeft - currentX + "px";
        }

        function stopDragging() {
            document.onmouseup = null;
            document.onmousemove = null;
        }

        if (header) {
            header.onmousedown = startDragging;
        } else {
            element.onmousedown = startDragging;
        }
    }
}
