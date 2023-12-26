import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class AuthorizationGuard implements CanActivate {

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const request = context.switchToHttp().getRequest();

        const id: number = request.user_id

        if (!id) {
            console.log(`Authorization Guard: Forbidden Access!`)
            throw new HttpException("UnAuthorized Request.", HttpStatus.FORBIDDEN)
        }

        return true
    }
}