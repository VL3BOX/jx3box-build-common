const iconv = require("iconv-lite");
const { isNullEmptyOrWhitespace } = require("./common");

const simpleDecode = function (input, key) {
    if (input.length % 2 !== 0)
        throw new Error("Invalid input length");

    key = key || [0x76, 0x75, 0x53, 0x72, 0x71, 0x39, 0x4f, 0x62];

    let output = [];
    for (let i = 0; i < input.length / 2; ++i) {
        let char = ((input[i * 2] - 0x41) << 4) | (input[i * 2 + 1] - 0x41);
        output.push(char ^ key[i % key.length]);
    }

    return output;
};

const simpleDecodeString = function(input, key, encoding = "gbk") {
    input = iconv.encode(input, "ascii");
    if (key)
        key = iconv.encode(key, "ascii");
    const decodedBuf = Buffer.from(simpleDecode(input, key));
    return iconv.decode(decodedBuf, encoding);
};

const simpleEncode = function (input, key) {
    key = key || [0x76, 0x75, 0x53, 0x72, 0x71, 0x39, 0x4f, 0x62];

    let output = [];
    for (let i = 0; i < input.length; ++i) {
        let char = input[i] ^ key[i % key.length];
        output.push((char >> 4 & 0x0F) + 0x41);
        output.push((char & 0x0F) + 0x41);
    }

    return output;
};

const simpleEncodeString = function(input, key, encoding = "gbk") {
    input = iconv.encode(input, encoding);
    if (key)
        key = iconv.encode(key, "ascii");
    const encodedBuf = Buffer.from(simpleEncode(input, key));
    return iconv.decode(encodedBuf, "ascii");
};

/**
 * 读取形如 "x,y,z;x,y,z;x,y,z" 的坐标数据，并以对象数组的方式返回。
 * @param {String} content 坐标数据字符串
 * @returns {Object[]} 坐标数据
 */
const parsePosition = content => {
    const result = [];
    const items = content.split(";");
    for (let item of items) {
        if (!isNullEmptyOrWhitespace(item)) {
            const [x, y, z] = item.split(",");
            result.push({
                x: parseInt(x),
                y: parseInt(y),
                z: parseInt(z),
            });
        }
    }
    return result;
};

module.exports = {
    simpleDecode,
    simpleDecodeString,
    simpleEncode,
    simpleEncodeString,
    parsePosition,
};
