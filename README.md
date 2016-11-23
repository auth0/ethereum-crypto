# Ethereum crypto module

## Installation

For the mobile device run (it requires Docker to work):

```sh
./browserify.sh
```

The resultant single js file will be saved in bundle.js file in the same directory

To install the module globally for node.js run:

```sh
npm install eth-crypto  -g
```

## Usage

```javascript
const EthCrypto = require('eth-crypto');
var ethCrypto = new EthCrypto();
```

Every method returns a promise with the result.

### Signing message

```javascript
ethCrypto.signMessage(message,encryptedV3KeyPair,password)
.then(function(signature) {
    //do something with the signature
}).catch(function handleError(error) {
    //your error handling goes here
});
```

### Creating a new account

```javascript
ethCrypto.ethCrypto.createAccount(password)
.then(function(encryptedV3KeyPair) {
  //do something with the key pair
}).catch(function handleError(error) {
    //your error handling goes here
});
```

### Validate signature

```javascript
ethCrypto.ethCrypto.validateSignature(message,signature,address);
.then(function(result) {
  if(result) {
    console.log("Bugger.");
  } else {
    console.log("Yupee!");
  }
}).catch(function handleError(error) {
    //your error handling goes here
});
```

### Dependencies

* [ethereumjs-wallet](https://github.com/ethereumjs/ethereumjs-wallet) `npm install ethereumjs-wallet --save`
* [ethereumjs-util](https://github.com/ethereumjs/ethereumjs-util) `npm install ethereumjs-util --save`
* [Q](https://github.com/kriskowal/q) `npm install q --save`
