function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');
    //Toggle Nav

    burger.addEventListener('click', () => {
        nav.classList.toggle('nav-active');
        //Animate Links
        navLinks.forEach((link, index) => {
            if(link.style.animation) {
                link.style.animation = ''
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.2}s`;
            }
        })
        //Burger Animation
        burger.classList.toggle('toggle');
    })
}

const animate = () => {
    const tl = new TimelineMax();
    const nav = document.getElementById('nav');
    const img = document.querySelector('.hero img');
    const slider = document.querySelector('.slider');

    tl.fromTo(nav, 1, {opacity: 0}, {opacity: 1, ease: Power2.easeInOut})
    .fromTo(img, 3, {width: "0%", height: "0%"}, {width: "50%", height: "100%", ease: Power2.easeInOut}, "-=1")
    .fromTo(slider, 1.3, {opacity: 0, x: -50}, {opacity: 1, x: 0, ease: Power2.easeInOut}, "-=1");
}

const appendPanel = () => {
    let id = parseJwt(sessionStorage.getItem('myPreciousToken')).id;
    console.log(id);
    if(id != 'admin') return;
    const append = document.getElementById('append');
    let li = document.createElement('li');
    let a = document.createElement('a');
    a.innerText = 'Admin Panel';
    a.href = './panel.html';
    li.append(a);
    append.appendChild(li);
}

const app = () => {
    navSlide();
    animate();
    appendPanel();
}

app();