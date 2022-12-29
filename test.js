const file = require('./file');

async function main() {
    const dat = await file.readFile('J:\\Extracted\\settings\\MapList.tab');
    const tab = await file.parseTable(dat, { keepColumns: ['ID'], ignoreEmptyLines: true });
    for(const row of tab) {
        console.log(row);
    }
}

main();
