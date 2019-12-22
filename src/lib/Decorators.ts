import {createParamDecorator, SetMetadata} from "@nestjs/common";

// tslint:disable-next-line:variable-name
export const Roles = (...roles: string[]) =>
    SetMetadata('roles', roles);


// tslint:disable-next-line:variable-name
export const GetUser = createParamDecorator(
    (data, req) => {
        return req.user;
    },
);

