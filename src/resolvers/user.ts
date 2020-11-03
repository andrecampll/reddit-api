import argon2 from "argon2";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Resolver,
} from "type-graphql";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em } : MyContext
  ) {
    const { username, password } = options;

    const hashedPassword = await argon2.hash(password);

    const user = em.create(User, {
      username,
      password: hashedPassword,
    });

    await em.persistAndFlush(user);

    return user;
  }
}
