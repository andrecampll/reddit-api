import argon2 from "argon2";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
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
  @Query(() => User, { nullable: true })
  async me(
    @Ctx() { req, em } : MyContext
  ) {
    const { userId } = req.session;

    if (!userId) {
      return null;
    }

    const user = await em.findOne(User, { id: userId });

    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em } : MyContext
  ): Promise<UserResponse> {
    const { username, password } = options;

    const userExists = await em.findOne(User, { username });

    if (userExists) {
      return {
        errors: [{
          message: 'User already exists',
        }],
      };
    }

    if (username.length <= 2) {
      return {
        errors: [{
          message: 'Username length must be greater than 2',
        }],
      };
    }

    const hashedPassword = await argon2.hash(password);

    const user = em.create(User, {
      username,
      password: hashedPassword,
    });

    await em.persistAndFlush(user);

    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req } : MyContext
  ): Promise<UserResponse> {
    const { username, password } = options;

    if (password.length <= 2) {
      return {
        errors: [{
          message: 'Password length must be greater than 2',
        }],
      };
    }

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

    req.session.userId = user.id;

    return {
      user,
    };
  }
}
