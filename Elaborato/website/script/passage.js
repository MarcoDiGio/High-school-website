if(sessionStorage.getItem('myPreciousToken') == null) {
    alert('No token');
    window.location.replace('http://diggio.ddns.net/login.html');
} else {
    console.log('You have the token :o');
}

let token = 'Bearer ' + sessionStorage.getItem('myPreciousToken');
let notDelay;

id = parseJwt(sessionStorage.getItem('myPreciousToken')).id;

let table = document.createElement('table');
let tr = document.createElement('tr');
let thead = document.createElement('thead');
table.classList.add('content-table');


document.body.appendChild(table);
table.appendChild(thead);
thead.appendChild(tr);
let th = document.createElement('th');
th.innerText = 'Id_Passaggio';
let th2 = document.createElement('th');
th2.innerText = 'Orario_Passaggio_Previsto';
let th3 = document.createElement('th');
th3.innerText = 'Orario_Passaggio_Reale';
let th4 = document.createElement('th');
th4.innerText = 'Ritardo (h:m:s)';
let th5 = document.createElement('th');
th5.innerText = 'Corsa_Progressivo';

tr.appendChild(th);
tr.appendChild(th2);
tr.appendChild(th3);
tr.appendChild(th4);
tr.appendChild(th5);

let tbody = document.createElement('tbody');
table.appendChild(tbody);

getReservations('GET', 'http://diggio.ddns.net:3000/reservation/' + id, {});

async function getReservations(method, url, data) {
    let result = await makeRequest(method, url, data);
    for(let i = 0; i < result.Result.length; i++) {
        getPassage('POST', 'http://diggio.ddns.net:3000/passage/getRoute/' + id, { id_p: result.Result[i].Id_Passaggio });
    }
}

async function getPassage(method, url, data) {
    let result = await makeRequest(method, url, data);
    for(let i = 0; i < result.Result.length; i++) {
        let a = result.Result[i].Orario_Passaggio_Reale;
        if (a == null) {
            let date = new Date();
            a = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + '00';
            console.log(a);
        }
        let delay = subtractDate(a, result.Result[i].Orario_Passaggio_Previsto);
        if(notDelay) delay = 'In anticipo di ' + delay;
        let tr = document.createElement('tr');
        tbody.appendChild(tr);
        let th = document.createElement('th');
        th.innerText = result.Result[i].Id_Passaggio;
        let th2 = document.createElement('th');
        th2.innerText = result.Result[i].Orario_Passaggio_Previsto;
        let th3 = document.createElement('th');
        th3.innerText = result.Result[i].Orario_Passaggio_Reale ?? 'Unknown';
        let th4 = document.createElement('th');
        th4.innerText = delay;
        let th5 = document.createElement('th');
        th5.innerText = result.Result[i].Corsa_Progressivo;
        tr.appendChild(th);
        tr.appendChild(th2);
        tr.appendChild(th3);
        tr.appendChild(th4);
        tr.appendChild(th5);
    }
}

function makeRequest(method, url, data) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Authorization', token);
        xhr.send(JSON.stringify(data));
        xhr.onreadystatechange = () => {
            if(xhr.readyState == 4 && xhr.status == 200 || xhr.status == 201) {
                try {
                    resolve(JSON.parse(xhr.response));
                } catch (err) {
                    console.log(err);
                }
                //alert(parse.Message);
            }
            if(xhr.readyState == 4 && xhr.status == 401) {
                try {
                    alert('Invalid token');
                    window.location.replace('http://diggio.ddns.net/login.html');
                    reject(JSON.parse(xhr.response));
                } catch (error) {
                    console.log(err);
                }
                //alert(parse.Message);
            }
            if(xhr.readyState == 4 && xhr.status != 200) {
                try {
                    reject(JSON.parse(xhr.response));
                } catch (err) {
                    console.log(err);
                }
            }
        }
    });
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

function subtractDate(date1, date2) {
    let time1 = parseInt(date1.split(':')[0]) * 60 * 60 + parseInt(date1.split(':')[1] * 60) + parseInt(date1.split(':')[2]);
    let time2 = parseInt(date2.split(':')[0]) * 60 * 60 + parseInt(date2.split(':')[1] * 60) + parseInt(date2.split(':')[2]);
    let delay = time1 - time2;
    if(delay < 0) 
    {
        delay = Math.abs(delay);
        notDelay = true;
    }
    let hmsdelay = secondsToHms(delay);
    return hmsdelay;
}

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = ('0' + h).slice(-2) + ':';
    var mDisplay = ('0' + m).slice(-2) + ':';
    var sDisplay = ('0' + s).slice(-2);
    return hDisplay + mDisplay + sDisplay; 
}