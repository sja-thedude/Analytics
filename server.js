const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// Use the cors middleware to allow cross-origin requests
app.use(cors());

// Serve static files from the public directory
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
