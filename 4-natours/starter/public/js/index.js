import '@babel/polyfill';
// import regeneratorRuntime from "regenerator-runtime";
const regeneratorRuntime = require("regenerator-runtime");

import {login,logout} from './login';
import {displayMap} from './mapbox';
// console.log('Hello from parcel');


const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');


if(mapBox){
const locations = JSON.parse(mapBox.dataset.locations);
displayMap(locations);
}


if(loginForm){

loginForm.addEventListener('submit', function(e){

const email = document.getElementById('email').value;
const password = document.getElementById('password').value;
    e.preventDefault();
    console.log(email,password);
    login(email,password);
})
}

if(logOutBtn){
    logOutBtn.addEventListener('click',logout);
}