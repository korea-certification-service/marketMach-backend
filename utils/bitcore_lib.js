const bitcoin = require('bitcoinjs-lib')
const request = require('request');
const P2WSH_over_P2SH = "P2WSH-over-P2SH";
const NETWORK = bitcoin.networks.testnet; //bitcoin.networks.bitcoin
var NETWORK_EXPLORER = ""
let config = require('../config/dbconfig');
const url = config.testnet.url.btc + "/unspent?active=";
const broadcastURL = config.testnet.url.btc + "/pushtx";
var privateKeys = config.testnet.privateKey.btc;

function btcToSatoshi(btc) {
    return btc * 1e8;
}

////https://test-insight.bitpay.com
function sendBtcTransaction(body) {
    return new Promise((resolve, reject) => {


        var AddressType = P2WSH_over_P2SH;
        if (NETWORK == bitcoin.networks.testnet) {
            NETWORK_EXPLORER = "testnet";
        } else {
            NETWORK_EXPLORER = "livenet";
        }

        var toAddress = body.address;
        var amount = btcToSatoshi(body.price);
        var fee = btcToSatoshi(0.000055);
        var Address = "";

        switch (AddressType){
            case P2WSH_over_P2SH :
                var PrivKeys = privateKeys.map(function (wif)
                { return bitcoin.ECPair.fromWIF(wif, NETWORK) });

                const pubkeys = PrivKeys.map(function (x) { return x.publicKey });

                const p2ms = bitcoin.payments.p2ms({ m: 2, pubkeys, network: NETWORK });
                const p2wsh = bitcoin.payments.p2wsh({ redeem: p2ms, network: NETWORK });
                const p2sh = bitcoin.payments.p2sh({ redeem: p2wsh,  network: NETWORK });

                Address = p2sh.address

                console.log("Address : " , Address)

                if (validate(Address)){



                    request(url+Address, function(error, response, body) {
                        if (error) {
                            console.log(error);
                        }
                        if (response.statusCode !== 200) {
                            console.log(response.statusCode);
                        }
                        unspent = JSON.parse(body);


                        var balance = 0;
                        const txb = new bitcoin.TransactionBuilder(NETWORK, btcToSatoshi(0.0002))

                        for (var i = 0; i < unspent.unspent_outputs.length; i++)
                        {

                            console.log('tx==>', unspent.unspent_outputs[i].tx_hash_big_endian)
                            txb.addInput(unspent.unspent_outputs[i].tx_hash_big_endian, unspent.unspent_outputs[i].tx_output_n,null, bitcoin.script.fromASM(unspent.unspent_outputs[i].script));
                            balance += unspent.unspent_outputs[i].value;

                            if (balance >= amount + fee) {
                                break;
                            }
                            fee += btcToSatoshi(0.0000002);
                        }

                        console.log("balance : " + balance);
                        console.log("amount : " + amount);
                        console.log("fee : " + fee);

                        if ((balance - amount - fee) > 0) {

                            txb.addOutput(toAddress, amount);
                            txb.addOutput(Address, balance - amount - fee);
                            for(var j=0; j < txb.__inputs.length; j++) {
                                for (var i = 0; i < PrivKeys.length; i++) {
                                    txb.sign(j, PrivKeys[i], p2sh.redeem.output, null, unspent.unspent_outputs[j].value, p2wsh.redeem.output);
                                }
                            }

                            const tx = txb.build();

                            console.log('tx=>', broadcastURL.toString()+"?tx="+ tx.toHex())
                            console.log("txid : ",tx.getId())
                            request.post(broadcastURL.toString()+"?tx="+ tx.toHex(),function(error, response, body) {
                                console.log(response.statusCode);
                                if (error) {
                                    console.log(error);
                                    reject(error)
                                }
                                if (response.statusCode !== 200) {
                                    console.log(response.statusCode);
                                    reject('response.statusCode is not 200!')
                                }
                                console.log(body);
                                resolve(tx.getId())
                            });


                        } else {
                            console.log("not enough balance");
                            return
                        }

                    });


                } else {
                    console.log("not correct");
                }

                break;
            case HDWallet :
                /*
                  const pubKey = bitcoin.HDNode.fromBase58('ypub6XMTwf6NSvfzYYgVgdNWRNfMTiQt4rSjZbEk8qoCnBGhUD2rsgZ2A8pexgzaGLKgySZxqxrctDpAVU8QtfxqfX8QUAhtFmGFUFx9B51TVg8')
                */
                break;
            case MNEMONIC:
                /*
                  var seed = bip39.mnemonicToSeed(mnemonic)
                  var root = bitcoin.HDNode.fromSeedBuffer(seed, NETWORK)
                  var child = root.derivePath("m/44'/1'/0'/0/0");
                */
                break;
            default :
                console.log("not found")


        }

    })
}

function validate (address) {
    try {
        bitcoin.address.toOutputScript(address, NETWORK);
        return true;
    } catch (e) {
        return false;
    }
}

exports.sendBtcTransaction = sendBtcTransaction;
