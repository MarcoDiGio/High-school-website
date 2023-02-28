document.getElementById("ciao").innerHTML = "Ciao JavaScript";
let b = document.createElement("p");
let rickroll = new Audio('rickroll.mp3');
document.getElementById("btn").onclick = function() {
    if(b.innerHTML === "")
    {
        rickroll.play();
        let today = new Date();
        b.setAttribute("id", "green-gradient")
        b.innerHTML = "Sei down, come cazzo fai a non sapere l'ora nel 2021, sono le " + today.getHours() + ":" + (today.getMinutes()<10 ? '0' : '') + today.getMinutes();
        if(!document.getElementById("green-gradient"))
        {
            document.body.appendChild(b);
        }
    } else {
        b.innerHTML = "";
        rickroll.pause();
        rickroll.currentTime = 0;
    }
}

document.getElementById("manipulable").onclick = () => {
    let name = document.getElementById("manipulable1").value 
    let surname = document.getElementById("manipulable2").value
    if(name === '' || surname === '')
    {
        alert('Che cazzo fai brutto down inserisci dei valori nei campi')
    } else {
        alert('Il coglione che ha inserito i dati si chiama ' + name + ' ' + surname + ' ahahah adesso ti traccio')
    }
}

let counter = document.getElementById("count");
counter.innerHTML = UpdateVisitCount();

function UpdateVisitCount() {
    let xmlhttp;
    if(window.XMLHttpRequest)
    {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            return xmlhttp.responseText;
        }
    }
    xmlhttp.open("GET", "http://diggio.ddns.net/update/marco.php?amount=1", false);
    xmlhttp.send();
    return xmlhttp.responseText;
}

const text = document.querySelector('.gradient');
const strText = text.textContent;
const splitText = strText.split("");

text.textContent = "";

for(let i=0; i<splitText.length; i++) {
    text.innerHTML += "<span>" + splitText[i] + "</span>";
}

let char = 0;
let timer = setInterval(onTick, 100);

function onTick() {
    const span = document.querySelectorAll("span")[char];
    span.classList.add('fade');
    char++;
    if (char === splitText.length) {
        char = 0;
        clearInterval(timer);
        timer = null;
        timer = setInterval(reset, 100);
    }
}

function reset() {
    const span = document.querySelectorAll("span")[char];
    span.classList.remove('fade');
    char++;
    if (char === splitText.length) {
        char = 0;
        clearInterval(timer);
        timer = null;
        timer = setInterval(onTick, 100);
    }
}