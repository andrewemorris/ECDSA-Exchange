const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

//Eliptic Library intiation
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');
// Create and initialize EC context
// (better do it once and reuse it)
const ec = new EC('secp256k1');
const key1 = ec.genKeyPair();
const key2 = ec.genKeyPair();
const key3 = ec.genKeyPair();

const  publicKey1 = key1.getPublic().encode('hex');
const  publicKey2 = key2.getPublic().encode('hex');
const  publicKey3 = key3.getPublic().encode('hex');

console.log({
  privateKey1: key1.getPrivate().toString(16),
  privateKey2: key2.getPrivate().toString(16),
  privateKey3: key3.getPrivate().toString(16),
  public1: publicKey1,
  public2: publicKey2,
  public3: publicKey3,
  publicX1: key1.getPublic().x.toString(16),
  publicX2: key2.getPublic().x.toString(16),
  publicX3: key3.getPublic().x.toString(16),
  publicY1: key1.getPublic().y.toString(16),
  publicY2: key2.getPublic().y.toString(16),
  publicY3: key3.getPublic().y.toString(16),
});



const balances = {
  [publicKey1]: 100,
  [publicKey2]: 100,
  [publicKey3]: 100,
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  console.log("Balance " + balance)
  res.send({ balance });
});

app.post('/send', (req, res) => {
  console.log("Send requested")
  const {sender, recipient, amount, signature} = req.body;
  console.log("req.body = " + req.body);
  console.log("sender "+ sender);
  console.log("recipient "+ recipient);
  console.log("amount "+ amount);
  console.log("signature "+ signature);
  console.log({
    sender: req.body.sender,
    recipient: req.body.recipient,
    amount: req.body.amount,
    signature: req.body.signature,
  });
  //Remove the signature form the message, to recareas the signed body
    // begin to construct independent message in the server
    const message = JSON.stringify({
      sender: sender,
      amount: amount,
      recipient: recipient,
    });
    // hash the independent message
    console.log ("Receinf body to hash  =" + message);
  const messageHash = SHA256(message).toString();
  let publicKeyMatch = true;

  // if recoverPublicKey() returns correct public key contained in db, else mark false
  if(!balances[sender]) {
    console.error("Public key does not match! Make sure you are passing in the correct values!");
    publicKeyMatch = false;
  }
  
  console.log(sender + " is attempting to send " + amount + " to " + recipient);
  //const isSigned = secp.verify(signature, messageHash, recoveredPublicKey);
  const key = ec.keyFromPublic(sender, 'hex');

  //Very that the signed body = signature
  const signed = (key.verify(messageHash, signature));
  console.log ("signed " + signed); 
  if (signed){ 

  balances[sender] -= amount;
  balances[recipient] = (balances[recipient] || 0) + +amount;
  res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
