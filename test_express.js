import express from 'express';
const app = express();
app.get('*', (req, res) => {
  res.sendFile('/does/not/exist.html', (err) => {
    if (err) {
      console.log('Error:', err.message);
      res.status(err.status || 500).send(err.message);
    }
  });
});
app.listen(3001, () => console.log('listening'));
