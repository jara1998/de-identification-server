import express from 'express';
import { processText } from './deidentify';
import { body, header, validationResult } from 'express-validator';
import validatorMW from './middleware/validatorMW';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://174.127.165.69',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/deidentify', 
    body('payload_data').notEmpty().isString().withMessage('payload_data is required'),
    validatorMW.checkErrors,
    async (req, res) => {
        try {
            let text = req.body.payload_data;
            console.log("Received text: " + text);
            let result = await processText(text);
            res.status(200).send(result);
        } catch (error) {
            res.status(500).send(error);
        }
})

app.post('/deidentify_batch', async (req, res) => {
    res.status(200).send('Deidentify batch to be implemented');
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});