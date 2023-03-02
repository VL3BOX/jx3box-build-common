const file = require("../file");
const { initLogger } = require("../logger");

async function main() {
    let logger = initLogger("test");
    let sub = logger.job("sub");
    logger.info("test");
    sub.info("test");
}

main();
