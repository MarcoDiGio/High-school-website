if(sessionStorage.getItem('myPreciousToken') == null) {
    alert('No token');
    window.location.replace('http://diggio.ddns.net/login.html');
} else {
    console.log('You have the token :o');
}

let dateButton = document.getElementById('date');
let chooseButton = document.getElementById('reservation');
let stopButton = document.getElementById('stop');
let submitButton = document.getElementById('submit');

let url = 'http://diggio.ddns.net:3000/reservation';

let token = 'Bearer ' + sessionStorage.getItem('myPreciousToken');

let id = parseJwt(sessionStorage.getItem('myPreciousToken')).id;

let qcode;

url += '/' + id;
/*xhr.open('POST', url, true);

xhr.setRequestHeader('Content-Type', 'application/json');
xhr.setRequestHeader('Authorization', token);
xhr.send();*/

let MyDate = new Date();
let time;
let today;
let tomorrow;

today = MyDate.getFullYear() + '/' 
        + ('0' + (MyDate.getMonth()+1)).slice(-2) + '/'
        + ('0' + (MyDate.getDate())).slice(-2);

MyDate.setDate(MyDate.getDate() + 1);

tomorrow = MyDate.getFullYear() + '/' 
            + ('0' + (MyDate.getMonth()+1)).slice(-2) + '/'
            + ('0' + (MyDate.getDate())).slice(-2);

for(let j=0; j<2; j++) {
    let option = document.createElement('option');
    if(j == 0) option.innerText = today;
    if(j == 1) option.innerText = tomorrow;
    dateButton.appendChild(option)
}

let datetime;
let transitId;
let stopId;
let stopName;
let count;
let value = dateButton.options[dateButton.selectedIndex].value;
let value2 = chooseButton.options[chooseButton.selectedIndex].value;
let value3 = stopButton.options[chooseButton.selectedIndex].value;

cnt('GET', 'http://diggio.ddns.net:3000/stop/scope/count', {});
handleRoute('POST', 'http://diggio.ddns.net:3000/route/' + id, { time: time, date: dateButton.options[dateButton.selectedIndex].value });

chooseButton.addEventListener('change', () => {
    value2 = chooseButton.options[chooseButton.selectedIndex].value;
    updateStop();
});

dateButton.addEventListener('change', () => {
    value = dateButton.options[dateButton.selectedIndex].value;
    if(value2 != 'none') clear();
    if(value == tomorrow) {
        time = ('0' + MyDate.getHours()).slice(-2) + ':' + ('0' + MyDate.getMinutes()).slice(-2);
    } else {
        time = ('0' + (MyDate.getHours() + 1)).slice(-2) + ':' + ('0' + MyDate.getMinutes()).slice(-2);
    }
    handleRoute('POST', 'http://diggio.ddns.net:3000/route/' + id, { time: time, date: value });
});

stopButton.addEventListener('change', () => {
    if(stopId === undefined) return alert('Select an hour first');
})

submitButton.addEventListener('click', () => {
    if(stopId === undefined) return alert('Select an hour first');
    if(stopButton.options[stopButton.selectedIndex].value == '') return alert('Select a stop first');
    if(stopId == count) return alert('You can\'t start a ride on a terminus!');
    qcode = makeid(10);
    console.log(datetime);
    let body = {
        QR_Code: qcode,
        fs: stopName,
        fd: stopButton.options[stopButton.selectedIndex].value,
        cf: id,
        id_p: transitId,
        time: datetime,
        date: value,
    }
    handleReservation('POST', 'http://diggio.ddns.net:3000/reservation/' + id, body);
});

function clear() {
    chooseButton.querySelectorAll('*').forEach(n => n.remove());
}

async function cnt(method, url, data) {
    let result = await makeRequest(method, url, data);
    count = result.Result[0].COUNT;
}

async function handleRoute(method, url, data) {
    let result = await makeRequest(method, url, data);
    for(let i=0; i<result.Result.length; i++) {
        let option = document.createElement('option');
        option.innerText = result.Result[i].Id_Passaggio + ',' + result.Result[i].Id_Fermata + ',' + result.Result[i].Orario_Passaggio_Previsto;
        chooseButton.appendChild(option);
    }
}

async function handleStop(method, url, data) {
    if(stopId === undefined) return alert('Select an hour first!');
    stopButton.querySelectorAll('*').forEach(n => n.remove());
    let result = await makeRequest(method, url, data);
    for(let i=0; i<result.Result.length; i++) {
        if(i != 0) {
            let option = document.createElement('option');
            option.innerText = result.Result[i].Nome_Fermata;
            stopButton.appendChild(option);
        } else {
            stopName = result.Result[i].Nome_Fermata;
        }
    }
    alert(result.Message);
}

async function handleReservation(method, url, data) {
    if(stopId === undefined) return alert('Select an hour first!');
    let result = await makeRequest(method, url, data);
    console.log(result.Message);
}

function updateStop(){
    if(value2 == 'none') return console.log('Not yet');
    stopId = value2.split(',')[1];
    transitId = value2.split(',')[0];
    datetime = value2.split(',')[2];
    alert('You are making a reservation for the bus of the hours ' + datetime);
    if(stopId == count) return alert('You can\'t start a ride on a terminus!');
    handleStop('GET', 'http://diggio.ddns.net:3000/stop/greaterStopId/' + stopId, {});
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
            if(xhr.readyState == 4 && xhr.status == 400) {
                try {
                    alert(JSON.parse(xhr.response).Message);
                    reject(JSON.parse(xhr.response));
                } catch (err) {
                    console.log(err);
                }
            }
        }
    });
}

function makeid(length) {
    var result           = [];
    var characters       = '0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
    }
    return result.join('');
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};