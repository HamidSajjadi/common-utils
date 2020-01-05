"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const jwt = require("jwt-simple");
const nodemailer = require("nodemailer");
const camelcase_1 = require("camelcase");
const kavenegar = require("kavenegar");
function getNow() {
    return Math.floor(new Date().getTime() / 1000);
}
exports.getNow = getNow;
async function hashPasswordAutoSalt(pwd) {
    const salt = await genRandomString(32);
    const hash = await hashPassword(pwd, salt);
    return { salt, hash };
}
exports.hashPasswordAutoSalt = hashPasswordAutoSalt;
function hashPassword(pwd, salt) {
    return crypto.pbkdf2Sync(pwd, salt, 100000, 64, 'sha512').toString('hex');
}
exports.hashPassword = hashPassword;
async function genRandomString(size = 32, encoding = 'hex') {
    return crypto.randomBytes(size).toString(encoding);
}
exports.genRandomString = genRandomString;
function createJwtToken(data, keys, tokenSignature) {
    data = copyWithoutExtraAttrs(data, keys);
    return jwtEncodeData(data, tokenSignature);
}
exports.createJwtToken = createJwtToken;
function jwtEncodeData(data, tokenSignature) {
    data.iat = getNow();
    return jwt.encode(data, tokenSignature);
}
exports.jwtEncodeData = jwtEncodeData;
function decodeJwtToken(token, tokenSignature) {
    return jwt.decode(token, tokenSignature);
}
exports.decodeJwtToken = decodeJwtToken;
function sendSMS(phoneNumber, code) {
    const api = kavenegar.KavenegarApi({
        apikey: '3675714248525931465A777542596762537A564C6E4D5946566164727A307135',
    });
    return new Promise((resolve, reject) => {
        api.VerifyLookup({
            receptor: phoneNumber,
            token: code,
            template: 'verify',
        }, 
        // tslint:disable-next-line:no-any
        (response, status) => {
            if (status !== '200' && status !== 200) {
                reject(Error('sms problem with code ' + status));
            }
            else {
                resolve(status);
            }
        });
    });
}
exports.sendSMS = sendSMS;
function copyWithoutExtraAttrs(object, keys) {
    const a = {};
    for (const key of keys) {
        if (key in object) {
            a[key] = object[key];
        }
    }
    return a;
}
exports.copyWithoutExtraAttrs = copyWithoutExtraAttrs;
function sendEmail(options, smtpConfig) {
    if (!options.to || !options.subject) {
        throw Error('Email configuration needed');
    }
    if (!options.text && !options.html) {
        throw Error('Email content needed');
    }
    const transporter = nodemailer.createTransport(smtpConfig);
    return transporter.sendMail({
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: options.text || options.html,
        html: options.html || options.text,
    });
}
exports.sendEmail = sendEmail;
/**
 * converts strings like 10s, 2h, 3y to the equivalent seconds
 * if the input is an integer and does not have a char at the end returns the integer itself
 * if format is wrong will return null
 * years are considered 365 days
 * @param timeStr
 * @returns {number | null}
 */
function strToEpoch(timeStr) {
    if (!isNaN(Number(timeStr))) {
        return parseInt(timeStr, 10);
    }
    const re = new RegExp('\\d+([mhdwy]|mo)$');
    timeStr = timeStr.toLowerCase();
    if (!re.test(timeStr)) {
        return null;
    }
    const day = 60 * 60 * 24;
    if (timeStr.endsWith('m')) {
        const integer = timeStr.replace('m', '');
        return parseInt(integer, 10) * 60;
    }
    if (timeStr.endsWith('h')) {
        const integer = timeStr.replace('h', '');
        return parseInt(integer, 10) * 60 * 60;
    }
    if (timeStr.endsWith('d')) {
        const integer = timeStr.replace('d', '');
        return parseInt(integer, 10) * day;
    }
    if (timeStr.endsWith('w')) {
        const integer = timeStr.replace('w', '');
        return parseInt(integer, 10) * day * 7;
    }
    if (timeStr.endsWith('mo')) {
        const integer = timeStr.replace('mo', '');
        return parseInt(integer, 10) * day * 30;
    }
    if (timeStr.endsWith('y')) {
        const integer = timeStr.replace('mo', '');
        return parseInt(integer, 10) * day * 365;
    }
    return null;
}
exports.strToEpoch = strToEpoch;
/**
 * if input is stinrg, turn it to camel case
 * if input is object, turns it keys (not values to camel case)
 * @param input string or object to convert
 * @param values whether the values should be converted or not
 */
function toCamelCase(input, values = false) {
    if (typeof input === 'string') {
        return camelcase_1.default(input);
    }
    const output = {};
    for (const inputKey in input) {
        if (input.hasOwnProperty(inputKey)) {
            if (Array.isArray(input[inputKey])) {
                const tempArray = [];
                for (const element of input[inputKey]) {
                    if (typeof element === 'string' && !values) {
                        tempArray.push(element);
                    }
                    else if (typeof element !== 'object') {
                        tempArray.push(element);
                    }
                    else {
                        tempArray.push(toCamelCase(element, values));
                    }
                }
                output[camelcase_1.default(inputKey)] = tempArray;
            }
            else if (typeof input[inputKey] === 'object' && input[inputKey] !== null) {
                output[camelcase_1.default(inputKey)] = toCamelCase(input[inputKey], values);
            }
            else {
                output[camelcase_1.default(inputKey)] = values && typeof input[inputKey] === 'string' ? camelcase_1.default(input[inputKey]) : input[inputKey];
            }
        }
    }
    return output;
}
exports.toCamelCase = toCamelCase;
//# sourceMappingURL=CommonUtilities.js.map