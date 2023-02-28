let fiscalCode = document.getElementById('cf');
let fname = document.getElementById('name');
let surname = document.getElementById('surname');
let mail = document.getElementById('mail');
let password = document.getElementById('pass');
let signUpBtn = document.querySelector(".btn");

document.addEventListener("keyup", function(event) {
    if (event.key === 'Enter') {
        signup();
    }
});

signUpBtn.addEventListener('click', () => {
    signup();
});

function signup() {
    if(fiscalCode.value == '') return alert('Insert your fiscal code');
    if(fname.value == '') return alert('Insert your first name');
    if(surname.value == '') return alert('Insert your second name');
    if(mail.value == '') return alert('Insert your mail');
    if(password.value == '') return alert('Insert a password');
    let url = "http://diggio.ddns.net:3000/customer/signup";
    let data = {
        cf: fiscalCode.value,
        firstname: fname.value,
        secondname: surname.value,
        mail: mail.value, 
        password: password.value,
    }
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

    xhr.onreadystatechange = () => {
        if(xhr.readyState == 4 && xhr.status == 201) {
            try {
                var parse = JSON.parse(xhr.response);
            } catch (err) {
                console.log(err);
            }
            alert(parse.Message);
            window.location.replace("http://diggio.ddns.net/login.html");
        }
        if(xhr.readyState == 4 && xhr.status != 201) {
            try {
                var parse = JSON.parse(xhr.response)
            } catch (err) {
                console.log(err);
            }
            alert(parse.Message);
        }
    }
}