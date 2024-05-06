import express from 'express';

const app = express();
const port = 4320;

app.get('/', (req, res) => {
   res.send('The API is working!');
});

app.listen(port, () => {
   console.log(`Server running on http://localhost:${port}`);
});
