if(sessionStorage.getItem('myPreciousToken') == null) {
    alert('No token');
    window.location.replace('http://diggio.ddns.net/login.html');
} else {
    console.log('You have the token :o');
}

let table = document.querySelector('.content-table');
let thead = document.createElement('thead');

table.appendChild(thead);
let tr = document.createElement('tr');
thead.appendChild(tr);
let th = document.createElement('th');
th.innerText = 'QR_Code';
let th2 = document.createElement('th');
th2.innerText = 'Fermata_Salita';
let th3 = document.createElement('th');
th3.innerText = 'Fermata_Discesa';
let th4 = document.createElement('th');
th4.innerText = 'Flag_Usufruito';
let th5 = document.createElement('th');
th5.innerText = 'Codice_Fiscale';
let th6 = document.createElement('th');
th6.innerText = 'Data';
let th7 = document.createElement('th');
th7.innerText = 'Id_Passaggio';

tr.appendChild(th);
tr.appendChild(th2);
tr.appendChild(th3);
tr.appendChild(th4);
tr.appendChild(th5);
tr.appendChild(th6);
tr.appendChild(th7);

let tbody = document.createElement('tbody');
table.appendChild(tbody);

let url = "http://diggio.ddns.net:3000/reservation";
let xhr = new XMLHttpRequest();
let token = 'Bearer ' + sessionStorage.getItem('myPreciousToken');
id = parseJwt(sessionStorage.getItem('myPreciousToken')).id;
if(id != 'admin') {
    url += '/' + id;
}
xhr.open("GET", url, true);

xhr.setRequestHeader('Content-Type', 'application/json');
xhr.setRequestHeader('Authorization', token);
xhr.send();
xhr.onreadystatechange = () => {
    if(xhr.readyState == 4 && xhr.status == 200) {
        try {
            var parse = JSON.parse(xhr.response);
        } catch (error) {
            return console.log(error);
        }
        for(let i=0; i<parse.Result.length; i++){
            let tr = document.createElement('tr');
            tbody.appendChild(tr);
            let td = document.createElement('td');
            td.innerText = parse.Result[i].QR_Code;
            let td2 = document.createElement('td');
            td2.innerText = parse.Result[i].Fermata_Salita;
            let td3 = document.createElement('td');
            td3.innerText = parse.Result[i].Fermata_Discesa;
            let td4 = document.createElement('td');
            let used = (parse.Result[i].Flag_Usufruito == null) ? 'Unknown' : parse.Result[i].Flag_Usufruito;
            if(used == 0) used = 'No';
            if(used == 1) used = 'Sì'; 
            td4.innerText = used;
            let td5 = document.createElement('td');
            td5.innerText = parse.Result[i].Codice_Fiscale;
            let td6 = document.createElement('td');
            let date = formatDate(parse.Result[i].Data);
            td6.innerText = date;
            let td7 = document.createElement('td');
            td7.innerText = parse.Result[i].Id_Passaggio;
            tr.appendChild(td);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);
            tr.appendChild(td6);
            tr.appendChild(td7);
        }
    }
    if(xhr.readyState == 4 && xhr.status == 401) {
        try {
            var parse = JSON.parse(xhr.response);
        } catch (err) {
            return console.log(err);
        }
        window.location.replace('http://diggio.ddns.net/login.html');
    }
    if(xhr.readyState == 4 && xhr.status != 200) {
        try {
            var parse = JSON.parse(xhr.response);
        } catch (err) {
            return console.log(err);
        }
    }
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('/');
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};