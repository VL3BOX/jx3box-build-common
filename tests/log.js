const file = require("../filefile");
const { initLogger } = require("../loggergger");

async function main() {
    let logger = initLogger("test");
    let sub = logger.job("sub");
    logger.info("test");
    sub.info("test");
}

main();
