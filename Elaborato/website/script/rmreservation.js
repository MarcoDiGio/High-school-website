let button = document.getElementById('but');
let select = document.createElement('select');
let submit = document.createElement('button');

let time;
let MyDate = new Date();

let date = [];
let id_p = [];

button.addEventListener('click', () => {
    document.body.removeChild(button);
    document.body.appendChild(select);
    let option = document.createElement('option');
    option.defaultSelected = true;
    option.hidden = true;
    option.value = 'none';
    option.innerText = 'Select the QR_Code of the reservation to delete';
    select.appendChild(option);
    document.body.appendChild(submit);
    submit.innerText = 'Submit';
});

if(!button) button.removeEventListener('click');

let id = parseJwt(sessionStorage.getItem('myPreciousToken')).id;

getReservation('GET', 'http://diggio.ddns.net:3000/reservation/' + id, {});

select.addEventListener('change', () => {
    getTime('GET', 'http://diggio.ddns.net:3000/reservation/getTime/' + id_p[select.selectedIndex], {});
});

submit.addEventListener('click', () => {
    if(time === undefined) return alert('Select a reservation first!');
    if(select.options[select.selectedIndex].value == 'none') return alert('Select a reservation first!');
    let QR_C = select.options[select.selectedIndex].value;
    deleteReservation('DELETE', 'http://diggio.ddns.net:3000/reservation/' + id, { QR_Code : QR_C, time: time, date: date[select.selectedIndex] });
});

async function deleteReservation(method, url, data) {
    let result = await makeRequest(method, url, data);
    alert(result.Message);
    console.log(result);
}

async function getReservation(method, url, data) {
    let result = await makeRequest(method, url, data);
    for(let i=0; i<result.Result.length; i++) {
        date.push(formatDate(new Date(result.Result[i].Data)));
        console.log(date[i]);
        id_p.push(result.Result[i].Id_Passaggio);
        console.log(id_p[i]);
        let option = document.createElement('option');
        option.innerText = result.Result[i].QR_Code
        select.appendChild(option);
    }
}

async function getTime(method, url, data) {
    let result = await makeRequest(method, url, data);
    if(result.Result.length > 0) time = result.Result[0].Time;
    console.log(result.Result);
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
                    let res = JSON.parse(xhr.response)
                    reject(res);
                    alert(res.Message);
                } catch (err) {
                    console.log(err);
                }
            }
        }
    });
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