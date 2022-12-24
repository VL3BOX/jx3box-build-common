const papaparse = require('papaparse');
const iconv = require('iconv-lite');
const fs = require('fs').promises;
const isNullEmptyOrWhitespace = require('./common').isNullEmptyOrWhitespace;

/**
 * 异步读取指定路径的文件，并以字符串的方式返回。
 * @param {String} filePath 文件路径
 * @param {String} encoding 文件编码，默认为 gbk
 * @returns {String} 文件内容
 */
const readFile = async (filePath, encoding = 'gbk') => {
    const fileData = await fs.readFile(filePath);
    return iconv.decode(fileData, encoding);
}

/**
 * 对数据表默认值行（第二行）的处理方式
 */
const TABLE_DEFAULT_ROW_MODE = {
    /**
     * 使用默认值行
     */
    USE: 0,

    /**
    * 忽略默认值行
    */
    IGNORE: 1,

    /**
     * 没有默认值行
     */
    NO: 2,
}

/**
 * 异步读取指定路径的纯文本表格文件（自动检测分隔符），并以对象数组的方式返回。
 * @param {String} content 表格数据字符串
 * @param {Number} useDefaultRow 对数据表默认值行（第二行）的处理方式
 * @param {String} delimiter 分隔符，为空则自动检测
 * @returns {Object[]} 返回的对象数组
 */
const parseTable = (content, useDefaultRow = TABLE_DEFAULT_ROW_MODE.USE, delimiter = '') =>
    new Promise(async (resolve, reject) => {
        papaparse.parse(content, {
            complete: function (results) {
                // 有任何出错则炸
                if (results.errors.length > 0) {
                    reject(results.errors);
                }

                let result = [];
                let table = results.data;
                let headerRow = table.shift();
                let defaultRow = null;

                // 处理默认值行
                if (useDefaultRow === TABLE_DEFAULT_ROW_MODE.USE
                    || useDefaultRow === TABLE_DEFAULT_ROW_MODE.IGNORE) {
                    defaultRow = table.shift();
                }

                for (let row of table) {
                    let rowObj = {};
                    for (let i = 0; i < row.length; i++) {
                        // 空单元格根据设置填充默认值或置空
                        if (isNullEmptyOrWhitespace(row[i])) {
                            if (useDefaultRow === TABLE_DEFAULT_ROW_MODE.USE) {
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
            }
        }, {
            delimiter: delimiter,
        });
    });

module.exports = {
    readFile,
    parseTable,
    TAB_FILE_DEFAULT_ROW: TABLE_DEFAULT_ROW_MODE,
};