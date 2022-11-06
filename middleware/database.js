import { MongoClient } from 'mongodb';
import nextConnect from 'next-connect';
const client = new MongoClient(`${process.env.NEXT_PUBLIC_DATABASE_MONGODB}s`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
console.log("Client",client);

async function database(req, res, next) {
await client.connect();
  req.dbClient = client;
  req.db = client.db('sloot');
  return next();
}

const middleware = nextConnect();
console.log("middleware",middleware);
middleware.use(database);

export default middleware;