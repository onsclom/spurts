// Import the functions you need from the SDKs you need
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import {
    getAnalytics
} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-analytics.js";
import {
    query,
    getDocs,
    collection,
    getFirestore,
    serverTimestamp,
    addDoc,
    orderBy,
    startAfter,
    limit
} from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDUXxFKPdAccv0cs0FjgGES0TKaMxipkNk",
    authDomain: "spurts-3cf53.firebaseapp.com",
    projectId: "spurts-3cf53",
    storageBucket: "spurts-3cf53.appspot.com",
    messagingSenderId: "314491601147",
    appId: "1:314491601147:web:7b6d4ecdbfd86a42ce305e",
    measurementId: "G-9V5NGWDB9E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore();

let spurtTextarea = document.getElementById("spurtTextarea");
let sendButton = document.getElementById("sendButton");
let remainingP = document.getElementById("remainingP");
let spurtArea = document.getElementById("spurtArea");
let loadButton = document.getElementById("loadButton");

let spurtLimit = 140
let spurtPaginationAmount = 10
remainingP.innerHTML = `0/${spurtLimit}`
sendButton.disabled = true

spurtTextarea.oninput = () => {
    remainingP.innerHTML = `${spurtTextarea.value.length}/${spurtLimit}`
    sendButton.disabled = false
    if (spurtTextarea.value.length > spurtLimit || spurtTextarea.value.length == 0) {
        sendButton.disabled = true
    }
}

sendButton.onclick = async () => {
    addDoc(collection(db, "spurts"), {
        message: spurtTextarea.value,
        timestamp: serverTimestamp()
    })

    spurtArea.insertAdjacentHTML('afterbegin', generateSpurtHTML(spurtTextarea.value, new Date(Date.now())))
    sendButton.disabled = true
    spurtTextarea.value = ""
    remainingP.innerHTML = `0/${spurtLimit}`

}

function generateSpurtHTML(spurtText, spurtDate) {
    return `<div class="spurtDiv">
        <pre>${spurtText}</pre>
        <p><i>${spurtDate.toLocaleString()}<i></p>
    </div>`
}

let lastDoc = null

async function loadMessages() {
    console.log("TRIGGERed")
    let q=null;
    if (lastDoc != null)
        q = query(collection(db, "spurts"), orderBy("timestamp", "desc"), startAfter(lastDoc), limit(spurtPaginationAmount));
    else
        q = query(collection(db, "spurts"), orderBy("timestamp", "desc"), limit(spurtPaginationAmount));
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        
        spurtArea.insertAdjacentHTML('beforeend', generateSpurtHTML(doc.data().message, new Date(doc.data().timestamp.seconds*1000)))
        lastDoc = doc
    });

    if (querySnapshot.size < spurtPaginationAmount) {
        loadButton.style.display = "none"
    }
    else {
        loadButton.style.display = "block"
    }
} 

loadMessages()

loadButton.onclick = async () => {
    loadButton.style.display = "none"
    await loadMessages()
}