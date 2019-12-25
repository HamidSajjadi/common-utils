import {ExecutionContext, ForbiddenException, UnauthorizedException,} from '@nestjs/common';
import {Repository, SelectQueryBuilder} from 'typeorm';
import {Reflector} from '@nestjs/core';
import {Request} from 'express';
import * as jwt from 'jwt-simple';


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

export enum UserPrivilegeEnum {
    USER = 'user',
    ADMIN = 'admin',
    ALL = 'all',
}

export interface CacheOptionsInterface {
    cacheLabelFn: (a: number) => string;
    cacheTime: number;
}

interface CanActivateOptionsInterface<T> {
    cacheOption?: CacheOptionsInterface,
    qb?: SelectQueryBuilder<T>

}

export class AuthGuard<UserType extends BaseUser, JwtDataType extends BaseUser> {
    constructor(
        private userRepository: Repository<UserType>,
        private readonly reflector: Reflector,
        private jwtSignature: string
    ) {
    }

    static decodeJwtToken<U extends BaseUser>(
        token: string,
        jwtSignature: string
    ): U {
        return jwt.decode(token, jwtSignature);
    }

    static encodeJwtData<U extends JwtBaseData>(data: U, jwtSignature: string) {
        data.iat = Math.floor(new Date().getTime() / 1000);
        return jwt.encode(data, jwtSignature);
    }


    async canActivate(
        context: ExecutionContext,
        options: CanActivateOptionsInterface<UserType>
    ): Promise<boolean> {
        const request: CustomRequest<UserType> = context
            .switchToHttp()
            .getRequest();
        const roles: string[] = this.reflector.get('roles', context.getHandler());
        const userData = await this.validateRequest(request, roles, options);
        return !!userData;
    }

    async validateRequest(
        request: CustomRequest<UserType>,
        roles: string[] | null = null,
        options: CanActivateOptionsInterface<UserType> = {}
    ): Promise<JwtDataType | boolean> {
        let userData: JwtDataType;

        /** we are using this guard globally,
         * so they will be some routes with no need to be authorized using this guard
         * thus it is not always mandatory to have headers authorization to pass this guard
         * but having user data would be useful for some routes (like get last software updates, or whatever)
         * so try to get user object if token is provided even if route access is not limited
         */

        if (request.headers.authorization) {
            try {
                userData = AuthGuard.decodeJwtToken(
                    request.headers.authorization,
                    this.jwtSignature
                );
            } catch (e) {
                throw new UnauthorizedException('token not valid');
            }
            // const user: User = await this.userRepository.findOne(userData.id);
            let query = options.qb || this.userRepository
                .createQueryBuilder('user')
                .where('user.id = :id');
            if (options.cacheOption) {
                query = query.cache(options.cacheOption.cacheLabelFn(userData.id), options.cacheOption.cacheTime)
            }
            query.setParameters(userData);
            const user: UserType | undefined = await query.getOne();
            if (!user) {
                throw new UnauthorizedException('token not valid');
            }

            if (user.privilege !== userData.privilege) {
                throw new UnauthorizedException('token not valid');
            }
            request.user = user;
            /**
             * if user is admin, let him through
             */
            if (
                request.user.privilege &&
                request.user.privilege === UserPrivilegeEnum.ADMIN
            ) {
                return userData;
            }
        }

        /**
         * if there is roles provided for this route it means that it should be authorized
         */
        if (roles) {
            if (!request.user) {
                throw new UnauthorizedException('token not valid');
            }

            /** all means all user have access */

            const hasAccess =
                roles.includes(UserPrivilegeEnum.ALL) ||
                roles.includes(request.user.privilege);
            if (!hasAccess) {
                throw new ForbiddenException("you don't have access");
            }
        }

        return true;
    }
}
