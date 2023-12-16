import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { compare, hash } from 'bcryptjs';
import { Repository } from "typeorm";
import { jwtConstants } from "./constants/jwt.constants";
import { UserSignInDto } from "./dto/userSignIn.dto";
import { User } from "./entity/user.entity";
import { UserSignUpDto } from "./dto/userSignUp.dto";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService
    ) { }

    async signUp(user: UserSignUpDto) {
        const email: string = user.email
        const username: string = user.username
        const password: string = await this.hashPassword(user.password)
        const first_name: string = user.first_name
        const last_name: string = user.last_name
        const phone_number: string = user.phone_number

        const userExists = await this.userRepository.createQueryBuilder('u')
            .select()
            .where('u.email = :email', { email: email })
            .getOne()

        if(userExists){

            throw new HttpException("Email already exists.", HttpStatus.CONFLICT)

        }

        const insertResults = await this.userRepository.createQueryBuilder('u')
            .insert()
            .into(User)
            .values([
                { email: email, username: username, password: password, first_name: first_name, last_name: last_name, phone_number: phone_number }
            ])
            .execute()

        if(!insertResults){
            throw new HttpException("Could not sign up user.", HttpStatus.INTERNAL_SERVER_ERROR)
        }

        const payload = { 
            id: insertResults.raw.insertId,
            username: username
        }

        return {
            authentication_token: await this.jwtService.signAsync(payload, { secret: jwtConstants.secret, noTimestamp: true })
        }
    }

    async signIn(user: UserSignInDto) {

        const email: string = user.email
        const password: string = user.password

        const databaseUser = await this.userRepository.createQueryBuilder('u')
            .select()
            .where('u.email = :email', { email: email })
            .getOne()

        if(!databaseUser){
            throw new HttpException("Email does not exists.", HttpStatus.UNAUTHORIZED)
        }

        const authenticated = await compare(password, databaseUser.password)

        if (!authenticated) {
            throw new HttpException("Wrong Password.", HttpStatus.UNAUTHORIZED)
        }

        const payload = { 
            id: databaseUser.id,
            username: databaseUser.username
        }

        return {
            authentication_token: await this.jwtService.signAsync(payload, { secret: jwtConstants.secret, noTimestamp: true })
        }

    }

    async checkAuthorization(token: string) {
        try {
            const authorization = await this.jwtService.verifyAsync(
                token,
                {
                    secret: jwtConstants.secret
                }
            )

            if (!authorization) {
                return false
            }

            return true

        } catch (exception: any) {
            return false
        }
    }

    async hashPassword(password: string, salt: number = 12){
        return await hash(password, salt)
    }

}