import * as crypto from 'crypto';
import * as jwt from 'jwt-simple';
import { smtpServerConfig, tokenSignature } from '../config/server.config';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import * as nodemailer from 'nodemailer';

export const now = (): number => {
    return Math.floor(new Date().getTime() / 1000);
};

export const hashPasswordAutoSalt = async (pwd) => {
    const salt = await genRandomString(32);
    const hash = await hashPassword(pwd, salt);
    return { salt, hash };
};

export const hashPassword = async (pwd, salt) => {
    return crypto.pbkdf2Sync(pwd, salt, 100000, 64, 'sha512').toString('hex');
};

export const genRandomString = async (size = 32, encoding = 'hex') => {
    return crypto.randomBytes(size)
        .toString(encoding);
};

export const createJwtToken = (data: JwtPayloadDto) => {
    data = copyWithoutExtraAttrs<JwtPayloadDto>(data, JwtPayloadDto.getKeys());
    return jwtEncodeData(data);
};

export const jwtEncodeData = (data) => {
    data.iat = now();
    return jwt.encode(data, tokenSignature);
};

export const decodeJwtToken = (token): JwtPayloadDto => {
    return jwt.decode(token, tokenSignature);
};

export const sendSMS = (phoneNumber: string, code) => {
    const Kavenegar = require('kavenegar');
    let api: any;
    api = Kavenegar.KavenegarApi({
        apikey: '3675714248525931465A777542596762537A564C6E4D5946566164727A307135',
    });
    return new Promise((resolve, reject) => {
        api.VerifyLookup({
            receptor: phoneNumber,
            token: code,
            template: 'verify',
        }, (response, status) => {
            if (status !== '200' && status !== 200) {
                reject(Error('sms problem with code ' + status));
            } else {
                resolve(status);
            }
        });
    });
};

export const copyWithoutExtraAttrs = <T>(object: any, keys: string[]): T => {
    const a = {};
    for (const key of keys) {
        if (key in object) {
            a[key] = object[key];
        }
    }
    return a as T;
};

export const sendEmail = ({ from = 'هوما <noreply@huma.ir>', to = null, subject = null, text = null, html = null } = {}) => {
    if (!to || !subject) {
        throw Error('Email configuration needed');
    }
    if (!text && !html) {
        throw Error('Email content needed');
    }
    const transporter = nodemailer.createTransport(smtpServerConfig);
    console.log('sending to ', to);
    return transporter.sendMail({
        from, // sender address
        to, // list of receivers
        subject, // Subject line
        text: text || html, // plain text body
        html: html || text, // html body
    });

};

/**
 * converts strings like 10s, 2h, 3y to the equivalent seconds
 * if the input is an integer and does not have a char at the end returns the integer itself
 * if format is wrong will return null
 * years are considered 365 days
 * @param timeStr
 * @returns {number | null}
 */
export const strToEpoch = (timeStr) => {
    if (!isNaN(timeStr)) {
        // tslint:disable-next-line:ban
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
};
