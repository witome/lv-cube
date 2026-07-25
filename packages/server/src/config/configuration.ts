export default () => ({
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10) || 6379,
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  wechat: {
    appid: process.env.WECHAT_APPID,
    appSecret: process.env.WECHAT_APP_SECRET,
    pay: {
      mchId: process.env.WECHAT_PAY_MCH_ID,
      apiKey: process.env.WECHAT_PAY_API_KEY,
      certPath: process.env.WECHAT_PAY_CERT_PATH,
      keyPath: process.env.WECHAT_PAY_KEY_PATH,
    },
  },
  map: {
    provider: process.env.MAP_PROVIDER || 'tencent',
    key: process.env.MAP_KEY,
  },
  oss: {
    provider: process.env.OSS_PROVIDER || 'aliyun',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
    region: process.env.OSS_REGION,
  },
});
