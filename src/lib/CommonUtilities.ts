import * as crypto from 'crypto';
import * as jwt from 'jwt-simple';
import * as nodemailer from 'nodemailer';
import kavenegar from 'kavenegar';

export interface BaseJwtPayload {
  id?: number;
  iat?: number;
}

export interface BaseObject {
  // tslint:disable-next-line:no-any
  [key: string]: any;
}

export interface EmailOptions {
  from: string;
  to?: string;
  subject: string;
  text?: string;
  html: string;
}

export interface SmtpServerConfig {
  host: string;
  port: number;
  secure: boolean; // true for 465, false for other ports
  tls: {
    rejectUnauthorized: boolean;
  };
  auth: {
    user: string;
    pass: string;
  };
}

export function getNow(): number {
  return Math.floor(new Date().getTime() / 1000);
}

export async function hashPasswordAutoSalt(pwd: string) {
  const salt = await genRandomString(32);
  const hash = await hashPassword(pwd, salt);
  return { salt, hash };
}

export function hashPassword(pwd: string, salt: string): string {
  return crypto.pbkdf2Sync(pwd, salt, 100000, 64, 'sha512').toString('hex');
}

export async function genRandomString(size = 32, encoding = 'hex') {
  return crypto.randomBytes(size).toString(encoding);
}

export function createJwtToken<T extends BaseJwtPayload>(
  data: T,
  keys: Array<keyof T>,
  tokenSignature: string
): string {
  data = copyWithoutExtraAttrs<T>(data, keys as string[]);
  return jwtEncodeData(data, tokenSignature);
}

export function jwtEncodeData<T extends BaseJwtPayload>(
  data: T,
  tokenSignature: string
): string {
  data.iat = getNow();
  return jwt.encode(data, tokenSignature);
}

export function decodeJwtToken<T extends BaseJwtPayload>(
  token: string,
  tokenSignature: string
): T {
  return jwt.decode(token, tokenSignature);
}

export function sendSMS(phoneNumber: string, code: number | string) {
  const api = kavenegar.KavenegarApi({
    apikey: '3675714248525931465A777542596762537A564C6E4D5946566164727A307135',
  });
  return new Promise((resolve, reject) => {
    api.VerifyLookup(
        {
          receptor: phoneNumber,
          token: code,
          template: 'verify',
        },
        // tslint:disable-next-line:no-any
        (response: any, status: any) => {
          if (status !== '200' && status !== 200) {
            reject(Error('sms problem with code ' + status));
          } else {
            resolve(status);
          }
        }
    );
  });
}

export function copyWithoutExtraAttrs<T>(
  object: BaseObject,
  keys: string[]
): T {
  const a: BaseObject = {};
  for (const key of keys) {
    if (key in object) {
      a[key] = object[key];
    }
  }
  return a as T;
}

export function sendEmail(options: EmailOptions, smtpConfig: SmtpServerConfig) {
  if (!options.to || !options.subject) {
    throw Error('Email configuration needed');
  }
  if (!options.text && !options.html) {
    throw Error('Email content needed');
  }
  const transporter = nodemailer.createTransport(smtpConfig);
  return transporter.sendMail({
    from: options.from, // sender address
    to: options.to, // list of receivers
    subject: options.subject, // Subject line
    text: options.text || options.html, // plain text body
    html: options.html || options.text, // html body
  });
}

/**
 * converts strings like 10s, 2h, 3y to the equivalent seconds
 * if the input is an integer and does not have a char at the end returns the integer itself
 * if format is wrong will return null
 * years are considered 365 days
 * @param timeStr
 * @returns {number | null}
 */
export function strToEpoch(timeStr: string) {
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
