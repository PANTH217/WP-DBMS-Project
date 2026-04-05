var express = require('express');
var { MongoClient, ObjectId } = require('mongodb');
var path = require('path');
var app = express();
var PORT = 3000;
var uri = "mongodb://dhggaming49_db_user:PAN_2517@ac-7hvlxy5-shard-00-00.tjvixh1.mongodb.net:27017,ac-7hvlxy5-shard-00-01.tjvixh1.mongodb.net:27017,ac-7hvlxy5-shard-00-02.tjvixh1.mongodb.net:27017/?ssl=true&replicaSet=atlas-dy5hoi-shard-0&authSource=admin&appName=WPDBMS";
var client = new MongoClient(uri);
var db;
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));
async function connectDB() {
  try {
    await client.connect();
    db = client.db('roomfix');
    var admin = await db.collection('users').findOne({ role: 'admin' });
    if (!admin) {
      await db.collection('users').insertOne({
        name: "Admin User",
        email: "admin@roomfix.com",
        password: "admin123",
        sapid: "",
        role: "admin",
        room: ""
      });
      console.log(' - Default Admin seeded (admin@roomfix.com / admin123)');
    }
    console.log('----------------------------------');
    console.log(' RoomFix server started!');
    console.log(' Open: http://localhost:' + PORT);
    console.log('----------------------------------');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
  }
}
app.get('/api/checkEmail', async (req, res) => {
  try {
    var email = req.query.email;
    var user = await db.collection('users').findOne({ email: email });
    res.json({ exists: user ? true : false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/register', async (req, res) => {
  try {
    var user = req.body;
    var existing = await db.collection('users').findOne({ email: user.email });
    if (existing) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }
    var result = await db.collection('users').insertOne(user);
    res.json({ success: true, id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/login', async (req, res) => {
  try {
    var email = req.body.email;
    var password = req.body.password;
    var user = await db.collection('users').findOne({ email, password });
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Invalid email or password.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/complaints', async (req, res) => {
  try {
    var { email, role } = req.query;
    var filter = {};
    if (role === 'student' && email) {
      filter = { email: email };
    }
    var complaints = await db.collection('complaints').find(filter).sort({ _id: -1 }).toArray();
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/complaints', async (req, res) => {
  try {
    var complaint = req.body;
    var result = await db.collection('complaints').insertOne(complaint);
    res.json({ success: true, id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put('/api/complaints/:id', async (req, res) => {
  try {
    var id = req.params.id;
    var { status } = req.body;
    await db.collection('complaints').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: status } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/students', async (req, res) => {
  try {
    var students = await db.collection('users').find({ role: 'student' }, { projection: { password: 0 } }).toArray();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/notices', async (req, res) => {
  try {
    var notices = await db.collection('notices').find({}).sort({ _id: -1 }).toArray();
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/notices', async (req, res) => {
  try {
    var notice = req.body;
    var result = await db.collection('notices').insertOne(notice);
    res.json({ success: true, id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete('/api/notices/:id', async (req, res) => {
  try {
    var id = req.params.id;
    await db.collection('notices').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
connectDB();
app.listen(PORT);
