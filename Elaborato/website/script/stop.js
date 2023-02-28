let table = document.createElement('table');
let thead = document.createElement('thead');
table.classList.add('content-table');

document.body.appendChild(table);
table.appendChild(thead);
let tr = document.createElement('tr');
thead.appendChild(tr);
let th = document.createElement('th');
th.innerText = 'Id_Fermata';
let th2 = document.createElement('th');
th2.innerText = 'Nome_Fermata';

tr.appendChild(th);
tr.appendChild(th2);

let tbody = document.createElement('tbody');
table.appendChild(tbody);

let url = "http://diggio.ddns.net:3000/stop";
let xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.send();

xhr.onreadystatechange = () => {
    if(xhr.readyState == 4 && xhr.status == 200) {
        try {
            var parse = JSON.parse(xhr.response);
        } catch (error) {
            alert('Error');
            return console.log(error);
        }
        for(let i=0; i<parse.Result.length; i++){
            let tr = document.createElement('tr');
            tbody.appendChild(tr);
            let th = document.createElement('th');
            th.innerText = parse.Result[i].Id_Fermata;
            let th2 = document.createElement('th');
            th2.innerText = parse.Result[i].Nome_Fermata;
            tr.appendChild(th);
            tr.appendChild(th2);
        }
    } 
    if(xhr.readyState == 4 && xhr.status != 200) {
        try {
            var parse = JSON.parse(xhr.response);
        } catch (err) {
            alert('Error');
            return console.log(err);
        }
    }
}