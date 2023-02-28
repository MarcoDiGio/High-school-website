let table = document.querySelector('.content-table');
let thead = document.createElement('thead');

table.appendChild(thead);
let tr = document.createElement('tr');
thead.appendChild(tr);
let th = document.createElement('th');
th.innerText = 'Codice_Fiscale';
let th2 = document.createElement('th');
th2.innerText = 'Nome';
let th3 = document.createElement('th');
th3.innerText = 'Cognome';
let th4 = document.createElement('th');
th4.innerText = 'Flag_Usufruito';

tr.appendChild(th);
tr.appendChild(th2);
tr.appendChild(th3);
tr.appendChild(th4);

let tbody = document.createElement('tbody');
table.appendChild(tbody);

let token = 'Bearer ' + sessionStorage.getItem('myPreciousToken');

let url = "http://diggio.ddns.net:3000/customer/notUsed";
let xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.setRequestHeader('Authorization', token);
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.send();

xhr.onreadystatechange = () => {
    if(xhr.readyState == 4 && xhr.status == 200) {
        try {
            var parse = JSON.parse(xhr.response);
        } catch (error) {
            alert('Error');
            return console.log(error);
        }
        alert(parse.Message);
        for(let i=0; i<parse.Result.length; i++){
            let tr = document.createElement('tr');
            tbody.appendChild(tr);
            let th = document.createElement('th');
            th.innerText = parse.Result[i].Codice_Fiscale;
            let th2 = document.createElement('th');
            th2.innerText = parse.Result[i].Nome;
            let th3 = document.createElement('th');
            th3.innerText = parse.Result[i].Cognome;
            let th4 = document.createElement('th');
            th4.innerText = parse.Result[i].Flag_Usufruito;
            tr.appendChild(th);
            tr.appendChild(th2);
            tr.appendChild(th3);
            tr.appendChild(th4);
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