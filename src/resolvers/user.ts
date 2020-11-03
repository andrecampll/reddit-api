import argon2 from "argon2";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from "type-graphql";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  message: string;
}


@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em } : MyContext
  ): Promise<User> {
    const { username, password } = options;

    const hashedPassword = await argon2.hash(password);

    const user = em.create(User, {
      username,
      password: hashedPassword,
    });

    await em.persistAndFlush(user);

    return user;
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em } : MyContext
  ): Promise<UserResponse> {
    const { username, password } = options;

    const user = await em.findOne(User, {
      username,
    });

    if (!user) {
      return {
        errors: [{
          message: 'Incorrect username/password',
        }]
      }
    }

    const valid = await argon2.verify(user.password, password);

    if (!valid) {
      return {
        errors: [{
          message: 'Incorrect username/password',
        }]
      }
    }

    return {
      user,
    };
  }
}
