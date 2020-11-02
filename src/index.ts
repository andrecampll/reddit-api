import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import mikroOrmConfig from './mikro-orm.config';

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);

  orm.em.create(Post, {
    title: 'My post',
  });
}

main().catch(error => {
  console.log(error);
});
