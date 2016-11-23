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
'use strict'

var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var EthCrypto = require('../src/ethCrypto.js');

describe('EthCrypto', function () {
	it('When requested should create an account', function () {
		var password = "gft";
		var ethCrypto = new EthCrypto();
		ethCrypto.createAccount(password)
		.then(function verifyAddress(encryptedKeyPair) {
			var address = '0x' + JSON.parse(encryptedKeyPair).address;
			expect(address).to.match(/0x[Aa-fF0-9]{40}/)
		}).catch (function handleError(error) {
			console.log(error);
			expect.fail();
		})
	});
	it('A newly created account should produce valid signatures', function () {
		var message = "bla";
		var password = "gft";
		var ethCrypto = new EthCrypto();
		ethCrypto.createAccount(password)
		.then(function signTestMessage(encryptedKeyPair) {
			var address = '0x' + JSON.parse(encryptedKeyPair).address;
			return [address, ethCrypto.signMessage(message, encryptedKeyPair, password)]
		}).spread(function validateTestSignature(address, signature) {
			return ethCrypto.validateSignature(message, signature, address);
		}).then(function verifyResult(result) {
			expect(result).to.equal(true);
		}).catch (function handleError(error) {
			console.log(error);
			expect.fail();
		})
	});
});