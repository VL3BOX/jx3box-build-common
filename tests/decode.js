const seasun = require("../seasun");

async function main() {
    let encoded = "EKABDGAKAFAHDLAHAOABGOFAFBBJGPECFGFFHDFCKDICIHLHNFNJJNKAKFODICKCLPMEOJLELHMBILKFMGJKJNMDMPMEJILBNFNJJOMJLJICIFLHMDMIJPKHLNPKJJJFMBLMOLJJMFJCIFILNFNJICIJLPOLIINCLLIMOFIDLJPCPGKKKEMOIDICNAJKGNECBABKDNAGEMAIHJFCEKFKCHBHAJENHB";

    let decoded = seasun.simpleDecodeString(encoded);
    console.log(decoded);
    
    let encodedAgain = seasun.simpleEncodeString(decoded);
    console.log(encodedAgain);
    
    console.assert(encoded === encodedAgain);
}

main();
