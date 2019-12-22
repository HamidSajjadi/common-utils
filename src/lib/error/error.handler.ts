/* tslint:disable:no-any */
import {PostgresErrorCodeEnum} from './postgres-error-code.enum';
import {BadRequestException, ConflictException} from '@nestjs/common';
import {QueryFailedError} from 'typeorm';

export function handleError(error: QueryFailedError | any) {
    switch (error.code) {
        case PostgresErrorCodeEnum.FK_VIOLATION:
            throw new BadRequestException(`Foreign key conflict`);
        case PostgresErrorCodeEnum.UNIQUE_VIOLATION:
            throw new ConflictException('Unique key conflict');
        default:
            throw error;
    }
}
