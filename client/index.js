import "./index.scss";

const server = "http://localhost:3042";

//PKI Initiation
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
const ec = new EC('secp256k1');
console.log ("Runing verion 1");


document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  console.log("Transfer pressed");
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;
  //Read the privatekey
  const privateKey = document.getElementById("privateKey").value;
  const key = ec.keyFromPrivate(privateKey);

  const oldBody = JSON.stringify({
    sender, amount, recipient
  });
  console.log ("Body sans sig  =" + oldBody);

  //Sign body message
  const bodyHash = SHA256(oldBody);
  const signature = key.sign(bodyHash.toString());
  const body = JSON.stringify({
    sender, amount, recipient, signature
  });
  console.log ("Body with sig  =" + body);

  const request = new Request(`${server}/send`, { method: 'POST', body });
  console.log("Call transfer...")

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});
