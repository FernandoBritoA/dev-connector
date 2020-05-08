const express = require('express');

const app = express();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
//listen to port, + callback function to message
app.get('/', (req, res) => res.send('API Running'));
