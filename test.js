const file = require('./file');

async function main() {
    const dat = await file.readFile('J:\\Extracted\\settings\\MapList.tab');
    const tab = await file.parseTable(dat, file.TAB_FILE_DEFAULT_ROW.NO);
    console.log(tab[0]);
}

main();
