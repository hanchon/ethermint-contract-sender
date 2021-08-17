
const { exec } = require("child_process");

var contractAddress = "0x578B4BDA193cA6b2AFFa1d16F9ce5521953766E0"
if (process.argv.length > 2) {
    contractAddress = process.argv[3]
}

exec("node --no-warnings index.js add " + contractAddress, async (error, stdout, stderr) =>  {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    var tx = stdout.trim();
    var splitted = tx.split('0x')
    exec("evmosd tx cron schedule-tx-time "+splitted[1]+" 1629206078 1s --from mykey -b block --yes --fees 20aphoton ",
    async (error, stdout, stderr) =>  {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    })
})
    