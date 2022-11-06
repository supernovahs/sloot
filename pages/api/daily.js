import nextConnect from 'next-connect';
import middleware from '../../middleware/database';

const handler = nextConnect();

handler.use(middleware);

handler.get(async (req, res) => {

    let doc = await req.db.collection('slot').findOne();
    console.log("doc",doc);
    res.json(doc);
});

export default handler;