"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const jwt = require("jwt-simple");
var UserPrivilegeEnum;
(function (UserPrivilegeEnum) {
    UserPrivilegeEnum["USER"] = "user";
    UserPrivilegeEnum["ADMIN"] = "admin";
    UserPrivilegeEnum["ALL"] = "all";
})(UserPrivilegeEnum = exports.UserPrivilegeEnum || (exports.UserPrivilegeEnum = {}));
class AuthGuard {
    constructor(userRepository, reflector, jwtSignature) {
        this.userRepository = userRepository;
        this.reflector = reflector;
        this.jwtSignature = jwtSignature;
    }
    static decodeJwtToken(token, jwtSignature) {
        return jwt.decode(token, jwtSignature);
    }
    static encodeJwtData(data, jwtSignature) {
        data.iat = Math.floor(new Date().getTime() / 1000);
        return jwt.encode(data, jwtSignature);
    }
    canActivate(context, cache) {
        const request = context
            .switchToHttp()
            .getRequest();
        const roles = this.reflector.get('roles', context.getHandler());
        return this.validateRequest(request, roles, cache);
    }
    async validateRequest(request, roles = null, cacheOption) {
        let userData;
        /** we are using this guard globally,
         * so they will be some routes with no need to be authorized using this guard
         * thus it is not always mandatory to have headers authorization to pass this guard
         * but having user data would be useful for some routes (like get last software updates, or whatever)
         * so try to get user object if token is provided even if route access is not limited
         */
        if (request.headers.authorization) {
            try {
                userData = AuthGuard.decodeJwtToken(request.headers.authorization, this.jwtSignature);
            }
            catch (e) {
                throw new common_1.UnauthorizedException('token not valid');
            }
            // const user: User = await this.userRepository.findOne(userData.id);
            let query = await this.userRepository
                .createQueryBuilder('user')
                .where('user.id = :id', { id: userData.id });
            if (cacheOption) {
                query = query.cache(cacheOption.cacheLabelFn(userData.id), cacheOption.cacheTime);
            }
            const user = await query.getOne();
            if (!user) {
                throw new common_1.UnauthorizedException('token not valid');
            }
            if (user.privilege !== userData.privilege) {
                throw new common_1.UnauthorizedException('token not valid');
            }
            request.user = user;
            /**
             * if user is admin, let him through
             */
            if (request.user.privilege &&
                request.user.privilege === UserPrivilegeEnum.ADMIN) {
                return true;
            }
        }
        /**
         * if there is roles provided for this route it means that it should be authorized
         */
        if (roles) {
            if (!request.user) {
                throw new common_1.UnauthorizedException('token not valid');
            }
            /** all means all user have access */
            const hasAccess = roles.includes(UserPrivilegeEnum.ALL) ||
                roles.includes(request.user.privilege);
            if (!hasAccess) {
                throw new common_1.ForbiddenException("you don't have access");
            }
        }
        return true;
    }
}
exports.AuthGuard = AuthGuard;
//# sourceMappingURL=AuthGuard.js.map