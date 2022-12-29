const winston = require('winston');
const assert = require('assert');
const { v4: uuid } = require('uuid');

/**
 * 初始化日志记录器
 * @param {String} appName 应用名称
 * @param {Object} config 配置
 * @param {String} config.sessionID 会话ID，不填则自动生成
 * @param {Object} config.console 控制台输出配置，不填则使用默认配置
 */
const initLogger = (appName, config) => {
    assert(appName, 'appName is required');

    let logger = null;
    let consoleTransport = null;

    // 应用默认设置
    config = Object.assign({}, {
        sessionID: uuid(),
        console: {
            format: winston.format.combine(
                winston.format.printf(info => 
                    `[${info.timestamp}] [${info.labels.app}:${config.sessionID.slice(-4)}] [${info.labels.job ?? 'Main'}] [${info.level.toUpperCase().padEnd(5, ' ')}] ${info.message}`),
                winston.format.colorize(),
            )
        },
    }, config);

    // 设置端点
    let transports = [];
    if (config.console) {
        consoleTransport = new winston.transports.Console(config.console);
        transports.push(consoleTransport);
    }

    // 初始化 winston
    logger = winston.createLogger({
        levels: winston.config.syslog.levels,
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.splat(),
            winston.format((obj) => {   // 注入AppName
                obj.labels = {
                    app: appName,
                    session: config.sessionID,
                    ...obj.labels
                };
                return obj;
            })()
        ),
        transports: transports,
        exitOnError: false
    });

    return {
        debug: (...msg) => logger.debug(...msg),
        info: (...msg) => logger.info(...msg),
        warn: (...msg) => logger.warning(...msg),
        error: (...msg) => logger.error(...msg),

        success: (...msg) => {
            msg = msg.length > 0 ? msg : [`${appName} finished successfully`];
            logger.log('notice', ...msg, { labels: { 'result': true } });
        },
        fail: (...msg) => {
            msg = msg.length > 0 ? msg : [`${appName} failed`];
            logger.log('crit', ...msg, { labels: { 'result': false } })
        },

        // 关闭日志框架，刷新流
        end: async () => {
            const loggerEnd = new Promise((resolve) => logger.on('finish', resolve));
            logger.end();
            await loggerEnd;
        },

        // 获取一个带 tag 的子 Logger
        job: (jobName) => {
            const subLogger = logger.child({
                labels: {
                    job: jobName
                }
            });
            return {
                debug: (...msg) => subLogger.debug(...msg),
                info: (...msg) => subLogger.info(...msg),
                warn: (...msg) => subLogger.warning(...msg),
                error: (...msg) => subLogger.error(...msg),
            };
        }
    };
}

module.exports = {
    initLogger
};