"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* tslint:disable:no-any */
const postgres_error_code_enum_1 = require("./postgres-error-code.enum");
const common_1 = require("@nestjs/common");
function handleError(error) {
    switch (error.code) {
        case postgres_error_code_enum_1.PostgresErrorCodeEnum.FK_VIOLATION:
            throw new common_1.BadRequestException(`Foreign key conflict`);
        case postgres_error_code_enum_1.PostgresErrorCodeEnum.UNIQUE_VIOLATION:
            throw new common_1.ConflictException('Unique key conflict');
        default:
            throw error;
    }
}
exports.handleError = handleError;
//# sourceMappingURL=error.handler.js.map