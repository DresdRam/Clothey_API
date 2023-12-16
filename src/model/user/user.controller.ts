import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserSignInDto } from './dto/userSignIn.dto';
import { UserService } from './user.service';
import { UserSignUpDto } from './dto/userSignUp.dto';

@Controller('users')
export class UserController {

    constructor(private userService: UserService) { }

    @Post('signin')
    logIn(@Body() body: UserSignInDto) {
        return this.userService.signIn(body)
    }

    @Post('signup')
    signup(@Body() body: UserSignUpDto) {
        return this.userService.signUp(body)
    }

    @Get('verify-token')
    verifyToken(@Query('token') token: string) {
        if (!token) {
            return BadRequestException
        }

        return this.userService.checkAuthorization(token)
    }

}