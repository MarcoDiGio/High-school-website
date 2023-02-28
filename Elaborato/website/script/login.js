let mail = document.getElementById('mail');
let password = document.getElementById('pass');
let signInBtn = document.querySelector(".btn");

signInBtn.addEventListener('click', () => {
    login()
});

document.addEventListener("keyup", function(event) {
    if (event.key === 'Enter') {
        login();
    }
});

function login() {
    let url = "http://diggio.ddns.net:3000/customer/login";
    if(mail.value == '') return alert('Insert a mail!');
    if(password.value == '') return alert('Insert a password!');
    let data = {
        mail: mail.value,
        password: password.value,
    }

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

    xhr.onreadystatechange = () => {
        if(xhr.readyState == 4 && xhr.status == 200) {
            try {
                var parse = JSON.parse(xhr.response);
                var token = parse.token;
            } catch (err) {
                console.log(err);
            }
            if(sessionStorage.getItem('myPreciousToken')) {
                sessionStorage.clear();
            }
            sessionStorage.setItem('myPreciousToken', token);
            console.log(sessionStorage.getItem('myPreciousToken'));
            window.location.replace('http://diggio.ddns.net/');
        }
        if(xhr.readyState == 4 && xhr.status != 200) {
            try {
                var parse = JSON.parse(xhr.response);
            } catch (error) {
                console.log(err);
            }
            alert(parse.Message);
        }
    }
}