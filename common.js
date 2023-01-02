const moment = require("moment");
const ProgressBar = require("progress");

/** 同步运行一个 Promise
 * @param {Promise} promise 要同步运行的 Promise
 */
const runSync = require("synchronous-promise");

/** 输出格式化后的当前时间的方法
 * @param {String} format 格式化字符串
 */
const now = () => moment().format("YYYY-MM-DD HH:mm:ss");

/**
 * 在异步方法中暂停一段时间
 * @param {Number} time 暂停时间，单位ms
 */
const sleep = async time => new Promise(resolve => setTimeout(resolve, time));

/**
 * 判断所给的字符串是否是空值或者空白字符串
 * @param {String} str 要判断的字符串
 * @returns {boolean} 是否为空
 */
const isNullEmptyOrWhitespace = str => str == null || str.trim() === "";

/**
 * 判断所给的值是否是空值或者0
 * @param {any} value
 * @returns {boolean} true: 空值或者0；false: 非空值或者非0
 */
const isNullOrZero = value =>
    [null, undefined, 0, "0", "", " "].includes(value);

/**
 * 判断所给的参数是否全都是空值或者0
 * @param  {...any} values
 * @returns
 */
const areAllNullOrZero = (...values) => values.every(isNullOrZero);

/**
 * 构建进度条
 * @param {Number} total 进度条总长度
 * @param {String} title 进度条标题
 * @param {String} doing 进度条当前正在做什么
 * @returns {ProgressBar}
 */
const buildProgressBar = async (total, title, doing = "进行中") => {
    let ansiEscapes = (await import("ansi-escapes")).default;
    let bar = new ProgressBar(
        ":title [:bar] :current/:total :percent | :elapsed | :doing",
        {
            title: title,
            total,
            width: 30,
            stream: process.stdout,
        }
    );
    bar.tick(0, { title, doing });
    bar.title = title;
    bar.clear = () => {
        process.stdout.write(ansiEscapes.eraseLine);
        process.stdout.write(ansiEscapes.cursorLeft);
    };
    return bar;
};

module.exports = {
    now,
    sleep,
    delay: sleep,
    isNullOrZero,
    isNullEmptyOrWhitespace,
    areAllNullOrZero,
    buildProgressBar,
    runSync,
};
