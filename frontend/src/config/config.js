const host = process.env.HOST;
const config = {
    // host - прописан в файле .env
    host: host,
    api: host + '/api',
}

export default config;