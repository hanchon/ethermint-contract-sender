// Usage node test.js deploy true. To deploy de contract.
// Usage node test.js add contractAddress. To generate tx
// Usage node test.js add contractAddress true. To create and send
// Usage node test.js get contractAddress. To call get.

const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const Wallet = require('ethereumjs-wallet')

const contractFile = require('./compile');
const { exec } = require("child_process");

const bytecode = contractFile.evm.bytecode.object;
const abi = contractFile.abi;


exec("evmosd keys unsafe-export-eth-key mykey --keyring-backend test", async (error, stdout, stderr) =>  {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    var privKey = stdout.trim();
    var address = Wallet['default'].fromPrivateKey(new Buffer(privKey, 'hex')).getAddressString();

    if (process.argv.length > 3) {
        if (process.argv[2] == "deploy") {
            await deploy(privKey, address);
        } else if (process.argv[2] == "add") {
            var contractAddress = process.argv[3]
            if (process.argv.length == 5) {
                // send transaction
                await add(privKey, address, contractAddress, true)
            } else {
                // only generate tx
                await add(privKey, address, contractAddress, false)
            }
            
        } else {
            var contractAddress = process.argv[3]
            await get(address, contractAddress)
        }
    }

});

// Deploy contract
const deploy = async (privKey, address) => {
   console.log('Attempting to deploy from account:', address);
    const incrementer = new web3.eth.Contract(abi);
    const incrementerTx = incrementer.deploy({
      data: bytecode,
      arguments: [5],
   });
    const createTransaction = await web3.eth.accounts.signTransaction(
      {
         from: address,
         data: incrementerTx.encodeABI(),
         gas: '4294967295',
      },
      privKey
   );
    const createReceipt = await web3.eth.sendSignedTransaction(
      createTransaction.rawTransaction
   );
   console.log('Contract deployed at address', createReceipt.contractAddress);
};

// Add
const add = async (privKey, address, contractAddress, send) => {
    const incrementer = new web3.eth.Contract(abi);
    const encoded = incrementer.methods.add().encodeABI();
    // console.log(
    //    `Calling the add function in contract at address ${contractAddress}`
    // );
    const createTransaction = await web3.eth.accounts.signTransaction(
       {
          from: address,
          to: contractAddress,
          data: encoded,
          gas: '4294967295',
       },
       privKey
    );
    if (send === false) {
        console.log(createTransaction.rawTransaction)
    } else {
        const createReceipt = await web3.eth.sendSignedTransaction(
        createTransaction.rawTransaction
        );
        console.log(`Tx successfull with hash: ${createReceipt.transactionHash}`);
    }
 };

 // GetCounter
const get = async (address, contractAddress) => {
    // Contract Call
    const incrementer = new web3.eth.Contract(abi, contractAddress);
    console.log(`Making a call to contract at address ${contractAddress}`);
    const data = await incrementer.methods
        .getCounter()
        .call({ from: address });
    console.log(`The current number stored is: ${data}`);
}

