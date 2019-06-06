const fs = require('fs');
const HookedWeb3Provider = require("hooked-web3-provider");
const EthJS = require('ethereumjs-tx')
const Web3 = require('web3');
const path = require('path');

/**
 * testcode:
 * */

let config = require('../config/dbconfig')
var testnet_ether = config.testnet.address.ether;
var testnet_mach = config.testnet.address.mach;
var testnet_mach_contract = config.testnet.contract.mach;
var testnet_private_key = config.testnet.privateKey.ether;
var ether_withdraw_url = config.testnet.url.withdraw_ether;

let ether_private_key = testnet_private_key;
let mach_token = testnet_mach_contract //mach contract token 고정
let send_address = testnet_ether //보내는 이
let receive_address = ''
let price = 0

const fileName = '../config/Token.json';
const file = path.join(__dirname, fileName)

function withDraw(jsonData) {
    return new Promise((resolve, reject) => {
        let web3_contract = new Web3();
        let type = jsonData.type
        price = jsonData.price
        receive_address = jsonData.address

        fs.readFile(file, "utf8", function (err, file) {

            let data = JSON.parse(file)
            // console.log('data=>', data.abi)
            if (err) {
                console.log('fs readFile err=>', err)
            }

            let contracts = web3_contract.eth.contract(data.abi).at(mach_token); //토큰
            let convertMachPrice = price * 1e8;
            let ABI = contracts.transfer.getData(receive_address, convertMachPrice, {from: send_address});

            let provider = new HookedWeb3Provider({
                host: ether_withdraw_url + "/v3/6af612dd49de4665a68e47deb98075a6", // 테스트넷 API키
                transaction_signer: {
                    hasAddress: function (address, callback) {
                        callback(null, true);
                    },
                    signTransaction: function (tx_params, callback) {
                        var rawTx = {
                            gasPrice: web3_contract.toHex(tx_params.gasPrice),
                            gasLimit: web3_contract.toHex(tx_params.gas),
                            value: web3_contract.toHex(tx_params.value),
                            from: tx_params.from,
                            to: tx_params.to,
                            nonce: web3_contract.toHex(tx_params.nonce),
                            data: web3_contract.toHex(tx_params.data)
                        };

                        var privateKey = Buffer.from(ether_private_key, 'hex');
                        var tx = new EthJS(rawTx);
                        tx.sign(privateKey);
                        callback(null, '0x' + tx.serialize().toString('hex'));
                    }
                }
            });

            resolve(sendEtherTransaction(type, provider, ABI));
        })
    })
}

function sendEtherTransaction(type, provider, ABI) {
    return new Promise((resolve, reject) => {
        let web3 = new Web3(provider);
        // console.log('web3->', web3)
        //
        var from = send_address //비트웹 지갑 (이더인경우))

        var value = "0x0"

        if (type == "ether") {

            value = web3.toWei(price, "ether")
            let to = receive_address // 받을사람 지갑 (이더인 경우))
            web3.eth.getTransactionCount(from, function (err, nonce) {
                web3.eth.sendTransaction({
                    from: from,
                    to: to,
                    value: value, //보낼 이더가격
                    gasPrice: web3.toWei(1, 'Gwei'),
                    gas: "300000",
                    nonce: web3.toHex(nonce),
                }, function (error, transaction) {
                    if (error) {
                        console.log('web err =>', err);
                    }
                    console.log('transaction=>', transaction)
                    resolve(transaction);
                })
            })
        } else if (type == "mach") {

            value = web3.toWei("0", "ether")
            let to = mach_token // 받을사람 지갑 (이더인 경우)) , 마하 일경우 토큰 주소
            web3.eth.getTransactionCount(from, function (err, nonce) {
                web3.eth.sendTransaction({
                    from: from,
                    to: to,
                    value: value, //보낼 이더가격
                    gasPrice: web3.toWei(1, 'Gwei'),
                    gas: "300000",
                    nonce: web3.toHex(nonce),
                    data: ABI //마하토큰 일때, 이더일경우 빈칸
                }, function (error, transaction) {
                    if (error) {
                        console.log('web err =>', err);
                    }
                    console.log('transaction=>', transaction)
                    resolve(transaction);
                })
            })
        }
    })
}

exports.withDraw = withDraw
