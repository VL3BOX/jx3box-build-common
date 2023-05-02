const main = async () => {
    const { parseTable } = require('../file');
    const content = "a\tb\r\n1\t2\r\n3\t4\r\n";
    try {
        console.log(await parseTable(content));
    }
    catch (ex) {
        console.log(ex);
    }
};

main();
