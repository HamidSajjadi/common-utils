import { ExecutionContext } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Reflector } from '@nestjs/core';
interface BaseUser {
    privilege: string;
    id: number;
}
interface JwtBaseData {
    iat?: number;
}
export declare enum UserPrivilegeEnum {
    USER = "user",
    ADMIN = "admin",
    ALL = "all"
}
export interface CacheOptionsInterface {
    cacheLabelFn: (a: number) => string;
    cacheTime: number;
}
export declare class AuthGuard<UserType extends BaseUser, JwtDataType extends BaseUser> {
    private userRepository;
    private readonly reflector;
    private jwtSignature;
    constructor(userRepository: Repository<UserType>, reflector: Reflector, jwtSignature: string);
    static decodeJwtToken<U extends BaseUser>(token: string, jwtSignature: string): U;
    static encodeJwtData<U extends JwtBaseData>(data: U, jwtSignature: string): string;
    canActivate(context: ExecutionContext, cache?: CacheOptionsInterface): Promise<boolean>;
    private validateRequest;
}
export {};
