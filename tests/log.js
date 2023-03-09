const file = require("../file");
const { initLogger } = require("../logger");

async function main() {
    let logger = initLogger("test");
    let sub = logger.job("sub");
    logger.info("test");
    sub.info("test");

    try {
        throw new Error("test");
    }
    catch (e) {
        logger.fail(e);
    }
}

main();
