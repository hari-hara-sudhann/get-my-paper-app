import redis from "../redis/redisClient.js";

export const generate4digitCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const saveDocument = async (document: string): Promise<string> => {
  while (true) {
    const code: string = generate4digitCode();
    const success = await redis.set(`otp:${code}`, document, {
      NX: true,
      EX: 900,
    });

    if (success === "OK") {
      return code;
    }
  }
};

export const getDocument = async (code: string): Promise<string | null> => {
  const document = await redis.get(`otp:${code}`);
  return document;
};
