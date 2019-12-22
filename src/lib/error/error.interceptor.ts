import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { QueryFailedError } from 'typeorm';
import { handleError } from './error.handler';

@Injectable()
export class DataBaseErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // next.handle() is an Observable of the controller's result value
    return next.handle()
      .pipe(catchError(error => {
        if (error instanceof QueryFailedError) {
          handleError(error);
        }
        throw error;
      }));
  }
}
