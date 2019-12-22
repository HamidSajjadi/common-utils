"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const typeorm_1 = require("typeorm");
const error_handler_1 = require("./error.handler");
let DataBaseErrorInterceptor = class DataBaseErrorInterceptor {
    intercept(context, next) {
        // next.handle() is an Observable of the controller's result value
        return next.handle()
            .pipe(operators_1.catchError(error => {
            if (error instanceof typeorm_1.QueryFailedError) {
                error_handler_1.handleError(error);
            }
            throw error;
        }));
    }
};
DataBaseErrorInterceptor = __decorate([
    common_1.Injectable()
], DataBaseErrorInterceptor);
exports.DataBaseErrorInterceptor = DataBaseErrorInterceptor;
//# sourceMappingURL=error.interceptor.js.map