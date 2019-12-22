"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
// tslint:disable-next-line:variable-name
exports.Roles = (...roles) => common_1.SetMetadata('roles', roles);
// tslint:disable-next-line:variable-name
exports.GetUser = common_1.createParamDecorator((data, req) => {
    return req.user;
});
//# sourceMappingURL=Decorators.js.map