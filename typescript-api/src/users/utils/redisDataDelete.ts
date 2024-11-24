import redisClient from "./redisClient";


export async function deleteRedis(key: string): Promise<boolean> {
    try {
        const deleteData = await redisClient.del(key);
        return deleteData > 0;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to delete key ${key} from Redis: ${error.message}`);
        } else {
            throw new Error(`Failed to delete key ${key} from Redis: Unknown error`);
        }
    }
}

 export async function finsAndDeleteKey(Username:string):Promise<string | null>{
    try {
        const keys = await redisClient.keys('username:*');
        for (const key of keys) {
            const storedData = await redisClient.get(key);
            const parsedData = storedData ? JSON.parse(storedData) : null;
            if (parsedData?.username === Username) {
                await deleteRedis(key);
                return key;
            }
        }
        return null; // No matching key found
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to delete key  from Redis: ${error.message}`);
        } else {
            throw new Error(`Failed to delete key from Redis: Unknown error`);
        }
    }
 }
