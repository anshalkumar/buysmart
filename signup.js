import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyB50oHXItUqhtr6og2SyA-YjNJh3vquQKM",
  authDomain: "news-38eff.firebaseapp.com",
  projectId: "news-38eff",
  storageBucket: "news-38eff.firebasestorage.app",
  messagingSenderId: "248358233838",
  appId: "1:248358233838:web:32c2deec6f37057907f5ff"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth();

let submit = document.getElementById("doit")
let inc = document.getElementById("inc")
submit.addEventListener('click',func)
function func(e){
    e.preventDefault()
    const email = document.getElementById("username").value;
    const password = document.getElementById("password").value
    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {

        const user = userCredential.user;
        window.location.href = 'login.html'

    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        inc.innerText = errorMessage

        // ..
    });
}