const { writeCsv } = require("../file");

async function main() {
    let data = [
        {
            name: "test",
            age: 18,
        },
        {
            name: "test2",
            age: 19,
        },
    ];
    await writeCsv("./tests/output/test.csv", data);
}

main();
