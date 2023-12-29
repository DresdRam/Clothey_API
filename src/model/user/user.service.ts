import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { compare, hash } from 'bcryptjs';
import { Repository } from "typeorm";
import { PutUpdateUserDto } from "./dto/update_all_user_data.dto";
import { UserSignInDto } from "./dto/user_sign_in.dto";
import { UserSignUpDto } from "./dto/user_sign_up.dto";
import { User } from "./entity/user.entity";
import { PatchUpdateUserDto } from "./dto/update_user_data.dto";
import { UserType } from "../user_type/entity/user_type.entity";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly jwtService: JwtService
    ) { }

    async signUp(user: UserSignUpDto) {
        const email: string = user.email
        const password: string = await this.hashPassword(user.password)
        const first_name: string = user.first_name
        const last_name: string = user.last_name
        const phone_number: string = user.phone_number

        const userExists = await this.userRepo.createQueryBuilder('u')
            .select()
            .where('u.email = :email', { email: email })
            .getOne()

        if (userExists) {

            throw new HttpException("Email already exists.", HttpStatus.CONFLICT)

        }

        const insertResults = await this.userRepo.createQueryBuilder('u')
            .insert()
            .into(User)
            .values([
                { email: email, password: password, first_name: first_name, last_name: last_name, phone_number: phone_number }
            ])
            .execute()

        if (!insertResults) {
            throw new HttpException("Could not sign up user.", HttpStatus.INTERNAL_SERVER_ERROR)
        }

        const insertedUser = await this.userRepo.createQueryBuilder('u').select().innerJoinAndSelect('u.user_type', 'ut', 'u.user_type_id = ut.id').where('u.id = :id', { id: insertResults.raw.insertId }).getOne()

        const payload = {
            id: insertResults.raw.insertId,
            user_type_id: 2,
            user_type: "Customer"
        }

        const authorization_token = await this.jwtService.signAsync(payload, { secret: process.env.JWT_TOKEN, noTimestamp: true })

        return this.reformatUser(insertedUser, authorization_token)
    }

    async signIn(user: UserSignInDto) {

        const email: string = user.email
        const password: string = user.password

        const databaseUser = await this.userRepo.createQueryBuilder('u')
            .select()
            .innerJoinAndSelect('u.user_type', 'ut', 'u.user_type_id = ut.id')
            .where('u.email = :email', { email: email })
            .getOne()

        if (!databaseUser) {
            throw new HttpException("Email does not exists.", HttpStatus.UNAUTHORIZED)
        }

        const authenticated = await compare(password, databaseUser.password)

        if (!authenticated) {
            throw new HttpException("Wrong Password.", HttpStatus.UNAUTHORIZED)
        }

        const payload = {
            id: databaseUser.id,
            user_type_id: databaseUser.user_type.id,
            user_type: databaseUser.user_type.user_type
        }

        const auth_token = await this.jwtService.signAsync(payload, { secret: process.env.JWT_TOKEN, noTimestamp: true })

        return this.reformatUser(databaseUser, auth_token)

    }

    async checkAuthorization(token: string) {
        try {
            const authorization = await this.jwtService.verifyAsync(
                token,
                {
                    secret: process.env.JWT_TOKEN
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

    async hashPassword(password: string, salt: number = 12) {
        return await hash(password, salt)
    }

    async updateAllUserData(body: PutUpdateUserDto, user_id: number) {

        const userExists = await this.userRepo.createQueryBuilder('u')
            .select()
            .where('u.email = :email', { email: body.email })
            .getOne()

        if (userExists.id == user_id) {

            throw new HttpException("Email already exists.", HttpStatus.CONFLICT)

        }

        const results = await this.userRepo.createQueryBuilder()
            .update(User)
            .set({
                email: body.email,
                password: body.password,
                first_name: body.first_name,
                last_name: body.last_name,
                phone_number: body.phone_number
            })
            .where('id = :user_id', { user_id: user_id })
            .execute()

        if (!results) {
            throw new HttpException("Could not update user data!", HttpStatus.INTERNAL_SERVER_ERROR)
        }

        const payload = {
            id: user_id,
            user_type_id: userExists.user_type.id,
            user_type: userExists.user_type.user_type
        }

        return {
            authentication_token: await this.jwtService.signAsync(payload, { secret: process.env.JWT_TOKEN, noTimestamp: true })
        }

    }

    async updateUserData(body: PatchUpdateUserDto, user_id: number) {

        const user = await this.userRepo.createQueryBuilder('u')
            .select()
            .innerJoinAndSelect('u.user_type', 'ut', 'u.user_type_id = ut.id')
            .where('u.id = :user_id', { user_id: user_id })
            .getOne()

        if (!user) {
            throw new HttpException("User Doesn't exists.", HttpStatus.NOT_FOUND)
        }

        if (body.email) {

            const userEmailExists = await this.userRepo.createQueryBuilder('u')
                .select()
                .where('u.email = :email', { email: body.email })
                .andWhere('u.id != :user_id', { user_id: user_id })
                .getOne()

            if (userEmailExists) {
                throw new HttpException("Email already exists.", HttpStatus.CONFLICT)
            }
        }

        const updated_user = new User();
        updated_user.email = body.email || user.email;
        updated_user.password = await this.hashPassword(body.password) || user.password;
        updated_user.first_name = body.first_name || user.first_name;
        updated_user.last_name = body.last_name || user.last_name;
        updated_user.phone_number = body.phone_number || user.phone_number;
        updated_user.user_type = user.user_type;

        const results = await this.userRepo.createQueryBuilder()
            .update(User)
            .set(updated_user)
            .where('id = :id', { id: user_id })
            .execute()

        if (!results) {
            throw new HttpException("Could not update user data!", HttpStatus.INTERNAL_SERVER_ERROR)
        }

        const payload = {
            id: user_id,
            user_type_id: user.user_type.id,
            user_type: user.user_type.user_type
        }

        const authorization_token = await this.jwtService.signAsync(payload, { secret: process.env.JWT_TOKEN, noTimestamp: true })

        return this.reformatUser(updated_user, authorization_token);

    }

    async makeAdmin(user_id: number) {

        const user_type = new UserType();
        user_type.id = 1;

        const results = await this.userRepo.createQueryBuilder()
            .update(User)
            .set({
                user_type: user_type,
            })
            .where('id = :user_id', { user_id: user_id })
            .execute()

        if (!results) {
            throw new HttpException("Could not promote user to Admin!", HttpStatus.INTERNAL_SERVER_ERROR)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "User Promoted To Admin Successfuly."
        }

    }

    reformatUser(user: User, token: string) {
        const stringified_user = JSON.stringify(user);
        const json_user = JSON.parse(stringified_user);
        json_user.authorization_token = token;
        delete json_user['id'];
        delete json_user['password'];
        delete json_user['updated_at'];
        return json_user;
    }

}