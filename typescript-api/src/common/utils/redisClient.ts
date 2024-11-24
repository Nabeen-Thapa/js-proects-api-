import logger from '../../common/utils/logger';
import {createClient} from 'redis';

//create redis client
const redisClient = createClient();
redisClient.on('connect',()=>{
    logger.info("connected to redis");
});
redisClient.on('error', (err)=>{
    logger.error("redis error:", err);
});

//connect to redis
redisClient.connect();

export default redisClient;