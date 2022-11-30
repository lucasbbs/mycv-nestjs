import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable
} from "@nestjs/common";
import { handleRetry } from "@nestjs/typeorm";
import { Observable } from "rxjs";
import { User } from "../user.entity";

import { UsersService } from "../users.service";

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) { }

  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest()
    const { userId } = request.session || {};
    if (userId) {
      const user = await this.usersService.findOne(userId)
      request.currentUser = user
    }
    return handler.handle()
  }
}