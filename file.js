const fs = require("fs").promises;
const papaparse = require("papaparse");
const iconv = require("iconv-lite");
const ini = require("ini");
const { parseJx3dat } = require("luat2json");
const parseLua = require("luaparse").parse;
const { isNullEmptyOrWhitespace } = require("./common");

/**
 * 判断指定路径的文件是否存在
 * @param {String} path 要判断的路径
 * @returns {Boolean} 是否存在
 */
const exists = async path => {
    return await fs
        .access(path, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
};

/**
 * 确保指定路径的文件夹存在，如不存在则创建
 * @param {String} path 要判断的路径
 */
const ensureDir = async path => {
    if (!await exists(path))
        await fs.mkdir(path, { recursive: true });
};

/**
 * 读取指定路径的文件，并以字符串的方式返回。
 * @param {String} filePath 文件路径
 * @param {String} encoding 文件编码，默认为 gbk
 * @returns {String} 文件内容
 */
const readFile = async (filePath, encoding = "gbk") => {
    const fileData = await fs.readFile(filePath);
    return iconv.decode(fileData, encoding);
};

/**
 * 把字符串写入到指定路径的文件内
 * @param {String} filePath 文件路径
 * @param {String} content 文件路径
 * @param {String} encoding 文件编码，默认为 utf8
 */
const writeFile = async (filePath, content, encoding = "utf8") => {
    const fileData = iconv.encode(content, encoding);
    await fs.writeFile(filePath, fileData);
};

/**
 * 对数据表默认值行（第二行）的处理方式
 */
const TABLE_DEFAULT_ROW_MODE = {
    // 没有默认值行
    NO: 0,
    // 使用默认值行
    USE: 1,
    // 忽略默认值行
    IGNORE: 2,
};

/**
 * 读取分隔符分隔的表格数据（自动检测分隔符），并以对象数组的方式返回。
 * @param {String} content 表格数据字符串
 * @param {Object} config 配置
 * @param {TABLE_DEFAULT_ROW_MODE} config.useDefaultRow 默认值行处理方式
 * @param {String} config.delimiter 分隔符
 * @param {Boolean} config.ignoreError 是否忽略解析错误
 * @param {String[]} config.keepColumns 要读取的列名，不指定则读取全部列
 * @returns {Promise<Object[]>} 表格数据
 */
const parseTable = (content, config) =>
    new Promise(async (resolve, reject) => {
        config = Object.assign(
            {
                useDefaultRow: TABLE_DEFAULT_ROW_MODE.NO,
                delimiter: "",
                ignoreError: false,
                keepColumns: [],
                newline: "\r\n"
            },
            config
        );
        papaparse.parse(
            content,
            {
                delimiter: config.delimiter,
                skipEmptyLines: "greedy",
                delimitersToGuess: [",", "\t"],
                newline: config.newline,

                complete: function (results) {
                    // 有任何出错且不忽略则炸
                    if (results.errors.length > 0 && !config.ignoreError) {
                        reject(results.errors);
                    }

                    let result = [];
                    let table = results.data;
                    let headerRow = table.shift();
                    let defaultRow = null;

                    // 处理默认值行
                    if (
                        config.useDefaultRow === TABLE_DEFAULT_ROW_MODE.USE ||
                        config.useDefaultRow === TABLE_DEFAULT_ROW_MODE.IGNORE
                    ) {
                        defaultRow = table.shift();
                    }

                    for (let row of table) {
                        // FIXME: skipEmptyLines 无效，手动跳过空行
                        if (
                            row.length === 1 &&
                            isNullEmptyOrWhitespace(row[0])
                        ) {
                            continue;
                        }
                        let rowObj = {};
                        for (let i = 0; i < row.length; i++) {
                            // 如果指定了列名，则跳过不在列名列表中的列
                            if (
                                config.keepColumns.length > 0 &&
                                !config.keepColumns.includes(headerRow[i])
                            ) {
                                continue;
                            }
                            // 空单元格根据设置填充默认值或置空
                            if (isNullEmptyOrWhitespace(row[i])) {
                                if (
                                    config.useDefaultRow ===
                                    TABLE_DEFAULT_ROW_MODE.USE
                                ) {
                                    row[i] = defaultRow[i];
                                } else {
                                    row[i] = null;
                                }
                            }
                            rowObj[headerRow[i]] = row[i];
                        }
                        result.push(rowObj);
                    }

                    resolve(result);
                },
            }
        );
    });

/**
 * 读取 INI 格式数据，并以对象的方式返回。
 * @param {String} content INI 文件内容
 * @returns {Promise<Object>} INI 文件内容
 */
const parseIni = content =>
    new Promise(async resolve => resolve(ini.parse(content)));

/**
 * 把对象数组写入到指定路径的文件内
 * @param {String} filePath 文件路径
 * @param {Object[]} data 文件路径
 * @param {String} encoding 文件编码，默认为 utf8
 */
const writeCsv = async (filePath, data, options) => {
    let csvData = papaparse.unparse(data, options);
    csvData += options?.newline || "\r\n";
    await writeFile(filePath, csvData);
};

const writeJSON = async (filePath, obj, replacer, space) => {
    replacer = replacer || null;
    space = space || 4;
    const newLine = typeof space === "string" ? space : "\r\n";
    await writeFile(filePath, JSON.stringify(obj, replacer, space) + newLine);
};

module.exports = {
    exists,
    ensureDir,
    readFile,
    writeFile,
    parseTable,
    parseIni,
    parseLua,
    parseJx3dat,
    writeCsv,
    writeJSON,
    TABLE_DEFAULT_ROW_MODE: TABLE_DEFAULT_ROW_MODE,
};
