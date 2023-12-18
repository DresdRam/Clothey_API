import { BadRequestException, Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { UserSignInDto } from './dto/userSignIn.dto';
import { UserService } from './user.service';
import { UserSignUpDto } from './dto/userSignUp.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@Controller('users')
export class UserController {

    constructor(private readonly userService: UserService) { }

    @Post('signin')
    logIn(@Body() body: UserSignInDto) {
        return this.userService.signIn(body)
    }

    @Post('signup')
    signup(@Body() body: UserSignUpDto) {
        return this.userService.signUp(body)
    }

    @Put('update')
    updateUserData(@Body() body: UpdateUserDto) {
        return this.userService.updateUserData(body)
    }

    @Get('verify-token')
    verifyToken(@Query('token') token: string) {
        if (!token) {
            return new BadRequestException()
        }

        return this.userService.checkAuthorization(token)
    }

}