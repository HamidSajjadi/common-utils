import { ObjectLiteral } from "typeorm";
export interface BaseJwtPayload {
    id?: number;
    iat?: number;
}
export interface BaseObject {
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
    secure: boolean;
    tls: {
        rejectUnauthorized: boolean;
    };
    auth: {
        user: string;
        pass: string;
    };
}
export declare function getNow(): number;
export declare function hashPasswordAutoSalt(pwd: string): Promise<{
    salt: string;
    hash: string;
}>;
export declare function hashPassword(pwd: string, salt: string): string;
export declare function genRandomString(size?: number, encoding?: string): Promise<string>;
export declare function createJwtToken<T extends BaseJwtPayload>(data: T, keys: Array<keyof T>, tokenSignature: string): string;
export declare function jwtEncodeData<T extends BaseJwtPayload>(data: T, tokenSignature: string): string;
export declare function decodeJwtToken<T extends BaseJwtPayload>(token: string, tokenSignature: string): T;
export declare function sendSMS(phoneNumber: string, code: number | string): Promise<unknown>;
export declare function copyWithoutExtraAttrs<T>(object: BaseObject, keys: string[]): T;
export declare function sendEmail(options: EmailOptions, smtpConfig: SmtpServerConfig): Promise<any>;
/**
 * converts strings like 10s, 2h, 3y to the equivalent seconds
 * if the input is an integer and does not have a char at the end returns the integer itself
 * if format is wrong will return null
 * years are considered 365 days
 * @param timeStr
 * @returns {number | null}
 */
export declare function strToEpoch(timeStr: string): number | null;
/**
 * if input is stinrg, turn it to camel case
 * if input is object, turns it keys (not values to camel case)
 * @param input string or object to convert
 * @param values whether the values should be converted or not
 */
export declare function toCamelCase<T>(input: string | ObjectLiteral, values?: boolean): string | T;
export declare function ensureDir(dirPath: string): Promise<string>;
