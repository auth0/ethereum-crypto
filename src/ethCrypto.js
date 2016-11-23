/** 
* The MIT License (MIT) 
*  
* Copyright (c) 2016 Auth0, Inc. <support@auth0.com> (http://auth0.com) 
*  
* Permission is hereby granted, free of charge, to any person obtaining a copy 
* of this software and associated documentation files (the "Software"), to deal 
* in the Software without restriction, including without limitation the rights 
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
* copies of the Software, and to permit persons to whom the Software is 
* furnished to do so, subject to the following conditions: 
*  
* The above copyright notice and this permission notice shall be included in all 
* copies or substantial portions of the Software. 
*  
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
* SOFTWARE. 
*/
'use strict';

const ethUtil = require('ethereumjs-util');
const Q = require('q');
const keythereum = require('keythereum');
const ethWallet = require('ethereumjs-wallet');
const fs = require('fs');

module.exports = EthCrypto;

/**
 * EthCrypto - constructor for the EthCrypto object.
 *
 * @return Object          EthCrypto object
 */
function EthCrypto() {}

/**
 * createAccount - creates a new Ethereum account.
 *
 * @param  String          password used to encrypt the generated key
 * @return Promise<String> returning the key in V3 format of the created account.
 */
EthCrypto.prototype.createAccount = function createAccount(password) {
	return Q.fcall(function functionName() {
		return ethWallet.generate(false).toV3String(password);
	})
}

/**
 * createAccountSync - creates a new Ethereum account synchronously.
 *
 * @param  String          password used to encrypt the generated key
 * @return String          the key in V3 format of the created account.
 */
EthCrypto.prototype.createAccountSync = function createAccount(password) {
	return ethWallet.generate(false).toV3String(password);
}

/**
 * signMessage - decrypts the private key and signs the hahs of the provided message
 *
 * @param  String          message to be signed
 * @param  String          encryptedKeyPair the encrypted v3 format key pair
 * @param  String          password used to decrypt the private key
 * @return Promise<String> returning the the ec signature
 */
EthCrypto.prototype.signMessage = function signMessage(message, encryptedKeyPair, password) {
	return Q.all([toSha256Hash(message), obtainPrivateKey(encryptedKeyPair, password)])
	.spread(signHash);
}

/**
 * signMessageSync - decrypts the private key and signs the hahs of the provided message synchronously
 *
 * @param  String          message to be signed
 * @param  String          encryptedKeyPair the encrypted v3 format key pair
 * @param  String          password used to decrypt the private key
 * @return String	 	   returning the the ec signature
 */
EthCrypto.prototype.signMessageSync = function signMessage(message, encryptedKeyPair, password) {
	var digest = toSha256HashSync(message);
	var privateKey = obtainPrivateKeySync(encryptedKeyPair, password);
	return signHash(digest, privateKey);
}

/**
 * validateSignature - checks whether the signature was signed by a specific Ethereum account
 *
 * @param  String message   message that was signed
 * @param  String signature EC signature of the message
 * @param  String address   that is expected to have signed the message, format 0x[Aa-fF0-9]{40}
 * @return Promise<boolean> that returns true if signature is valid, false otherwise
 */
EthCrypto.prototype.validateSignature = function validateSignature(message, signature, address) {
	return toSha256Hash(message)
	.then(function getSignerAddressPromise(hash) {
		return getSignerAddress(hash, signature);
	})
	.then(function compareAddresses(computedAddress) {
		return computedAddress === address;
	})
}

/**
 * validateSignatureSync - checks whether the signature was signed by a specific Ethereum account
 *
 * @param  String message   message that was signed
 * @param  String signature EC signature of the message
 * @param  String address   that is expected to have signed the message, format 0x[Aa-fF0-9]{40}
 * @return boolean		    that returns true if signature is valid, false otherwise
 */
EthCrypto.prototype.validateSignatureSync = function validateSignature(message, signature, address) {
	var hash = toSha256HashSync(message);
	var computedAddress = getSignerAddress(hash, signature);
	return computedAddress === address;
}

/**
 * obtainPrivateKey - retrieves and decrypts the private key from the keystore.
 *
 * @param  String address  account that is the private key owner, format 0x[Aa-fF0-9]{40}
 * @param  String encryptedKeyString encrypted v3 key pair in string format
 * @return Promise<Object> that returns the private key
 */
function obtainPrivateKey(encryptedKeyString, password) {
	return Q.fcall(function obtainPrivateKeyPromise() {
		return obtainPrivateKeySync(encryptedKeyString, password);
	})
}

/**
 * obtainPrivateKeySync - retrieves and decrypts the private key from the keystore synchronously.
 *
 * @param  String address  account that is the private key owner, format 0x[Aa-fF0-9]{40}
 * @param  String encryptedKeyString encrypted v3 key pair in string format
 * @return Object the private key
 */
function obtainPrivateKeySync(encryptedKeyString, password) {
	var keyObject = JSON.parse(encryptedKeyString);
	return keythereum.recover(password, keyObject);
}

/**
 * signHash - signs the given hash with the supplied private key
 *
 * @param  String sha256 hash of the signed message
 * @param  Object private key used to sign the message
 * @return String ec signature of the hash
 */
function signHash(hash, privateKey) {
	var sig = ethUtil.ecsign(hash, privateKey);
	return ethUtil.bufferToHex(
		Buffer.concat([sig.r, sig.s, ethUtil.toBuffer(sig.v - 27)]));
}

/**
 * getSignerAddress - retrieves the Ethereum address used to sign the message
 *
 * @param  String hash sha256 hash of the message
 * @param  String ec signature of the said message hash
 * @return String Ethereum address of the account that signed the message
 */
function getSignerAddress(hash, sgn) {
	var sig = ethUtil.toBuffer(sgn);
	var v = sig[64];
	if (v < 27) {
		v += 27;
	}
	var r = sig.slice(0, 32);
	var s = sig.slice(32, 64);
	var pubKey = ethUtil.ecrecover(
			hash,
			ethUtil.toBuffer(parseInt(v)),
			ethUtil.toBuffer(r),
			ethUtil.toBuffer(s))
		return ethUtil.bufferToHex(ethUtil.publicToAddress(pubKey));
}

/**
 * toSha256Hash
 *
 * @param  String          message to hash
 * @return Promise<String> returning sha256 hash of the message
 */
function toSha256Hash(message) {
	return Q.fcall(function toSha256HashPromise() {
		return toSha256HashSync(message);
	});
}

/**
 * toSha256HashSync
 *
 * @param  String          message to hash
 * @return String 		   sha256 hash of the message
 */
function toSha256HashSync(message) {
	return ethUtil.sha256(message);
}