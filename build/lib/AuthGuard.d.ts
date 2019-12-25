import { ExecutionContext } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
interface BaseUser {
    privilege: string;
    id: number;
}
interface JwtBaseData {
    iat?: number;
}
interface CustomRequest<T extends BaseUser> extends Request {
    user: T;
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
interface CanActivateOptionsInterface<T> {
    cacheOption?: CacheOptionsInterface;
    qb?: SelectQueryBuilder<T>;
}
export declare class AuthGuard<UserType extends BaseUser, JwtDataType extends BaseUser> {
    private userRepository;
    private readonly reflector;
    private jwtSignature;
    constructor(userRepository: Repository<UserType>, reflector: Reflector, jwtSignature: string);
    static decodeJwtToken<U extends BaseUser>(token: string, jwtSignature: string): U;
    static encodeJwtData<U extends JwtBaseData>(data: U, jwtSignature: string): string;
    canActivate(context: ExecutionContext, options: CanActivateOptionsInterface<UserType>): Promise<boolean>;
    validateRequest(request: CustomRequest<UserType>, roles?: string[] | null, options?: CanActivateOptionsInterface<UserType>): Promise<JwtDataType | boolean>;
}
export {};
