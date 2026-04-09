var express = require('express');
var { MongoClient, ObjectId } = require('mongodb');
var path = require('path');
var app = express();
require('dotenv').config();
var PORT = process.env.PORT || 3000;
var uri = process.env.MONGODB_URI;
var client = new MongoClient(uri);
var db;
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));
app.use(async (req, res, next) => {
  try {
    if (!db) {
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
      }

      var hostelCount = await db.collection('hostels').countDocuments();
      if (hostelCount === 0) {
        await db.collection('hostels').insertMany([
          { name: "NEW Boys Hostel" },
          { name: "Old Boys Hostel" },
          { name: "Girls Hostel" }
        ]);
      }

      var catCount = await db.collection('categories').countDocuments();
      if (catCount === 0) {
        await db.collection('categories').insertMany([
          { name: "Plumbing", description: "Water leakage, tap repair, etc." },
          { name: "Electrical", description: "Fan, light, switch repair, etc." },
          { name: "Carpentry", description: "Door, bed, chair repair, etc." },
          { name: "Housekeeping", description: "Cleaning, bathroom sanitization, etc." },
          { name: "WiFi/Networking", description: "Router, LAN port, and internet connectivity." },
          { name: "Safety & Security", description: "Fire safety, locks, and security issues." },
          { name: "Pest Control", description: "Insects, termites, or rodent issues." },
          { name: "Civil & Painting", description: "Wall paint, plastering, or ceiling issues." },
          { name: "AC Maintenance", description: "Cooling issues or air filter cleaning." }
        ]);
      }

      var roomsTotal = await db.collection('rooms').countDocuments();
      if (roomsTotal < 10) {
        await db.collection('rooms').deleteMany({});
        var hostels = await db.collection('hostels').find().toArray();
        var roomsToInsert = [];
        
        for (var h of hostels) {
          for (var i = 1; i <= 32; i++) {
            roomsToInsert.push({ 
              roomNo: h.name.charAt(0) + "-G" + i, 
              hostelId: h._id.toString(), 
              floor: "Ground", 
              capacity: 4 
            });
          }
          var floors = ["1st", "2nd", "3rd"];
          for (var f = 0; f < floors.length; f++) {
            for (var i = 1; i <= 68; i++) {
              var roomNum = ((f + 1) * 100) + i;
              roomsToInsert.push({ 
                roomNo: h.name.charAt(0) + "-" + roomNum, 
                hostelId: h._id.toString(), 
                floor: floors[f], 
                capacity: 4 
              });
            }
          }
        }
        
        if (roomsToInsert.length > 0) {
          await db.collection('rooms').insertMany(roomsToInsert);
        }
      }

      var staffCount = await db.collection('staff').countDocuments();
      if (staffCount === 0) {
        var plumbingCat = await db.collection('categories').findOne({ name: "Plumbing" });
        var electricalCat = await db.collection('categories').findOne({ name: "Electrical" });
        await db.collection('staff').insertMany([
          { name: "Ramesh Kumar", specialization: plumbingCat._id.toString(), phone: "9876543210" },
          { name: "Suresh Singh", specialization: electricalCat._id.toString(), phone: "9123456780" }
        ]);
      }

      var invCount = await db.collection('inventory').countDocuments();
      if (invCount === 0) {
        await db.collection('inventory').insertMany([
          { itemName: "LED Bulb 9W", categoryId: "Electrical", quantity: 100 },
          { itemName: "Water Tap (Brass)", categoryId: "Plumbing", quantity: 45 },
          { itemName: "Door Handle / Latch", categoryId: "Carpentry", quantity: 30 },
          { itemName: "Ethernet Cable (5m)", categoryId: "WiFi/Networking", quantity: 60 },
          { itemName: "Floor Cleaner (5L)", categoryId: "Housekeeping", quantity: 15 },
          { itemName: "Window Mesh Roll", categoryId: "Carpentry", quantity: 10 },
          { itemName: "Switchboard Panel", categoryId: "Electrical", quantity: 25 },
          { itemName: "Fire Extinguisher", categoryId: "Safety & Security", quantity: 20 },
          { itemName: "Rat Trap (Glue Pad)", categoryId: "Pest Control", quantity: 50 },
          { itemName: "White Paint (5L)", categoryId: "Civil & Painting", quantity: 15 },
          { itemName: "AC Air Filter", categoryId: "AC Maintenance", quantity: 30 },
          { itemName: "Cement Bag (10kg)", categoryId: "Civil & Painting", quantity: 10 }
        ]);
      }
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection error.', details: err.message });
  }
});

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
    var { email, password } = req.body;
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

app.get('/api/hostels', async (req, res) => {
  try {
    var hostels = await db.collection('hostels').find().toArray();
    res.json(hostels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/rooms', async (req, res) => {
  try {
    var rooms = await db.collection('rooms').find().toArray();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    var categories = await db.collection('categories').find().toArray();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/staff', async (req, res) => {
  try {
    var staff = await db.collection('staff').find().toArray();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/staff', async (req, res) => {
  try {
    var staff = req.body;
    var result = await db.collection('staff').insertOne(staff);
    res.json({ success: true, id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/staff/:id', async (req, res) => {
  try {
    var id = req.params.id;
    await db.collection('staff').deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
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

app.get('/api/assignments', async (req, res) => {
  try {
    var assignments = await db.collection('assignments').find().toArray();
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assignments', async (req, res) => {
  try {
    var assignment = req.body;
    var result = await db.collection('assignments').insertOne(assignment);
    res.json({ success: true, id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/feedback', async (req, res) => {
  try {
    var feedback = req.body;
    var result = await db.collection('feedback').insertOne(feedback);
    res.json({ success: true, id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/feedback', async (req, res) => {
  try {
    var feedback = await db.collection('feedback').find().toArray();
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    var items = await db.collection('inventory').find().toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/inventory/:id', async (req, res) => {
  try {
    var id = req.params.id;
    var qty = parseInt(req.body.quantity);
    var result = await db.collection('inventory').updateOne(
      { _id: new (require('mongodb').ObjectId)(id) },
      { $set: { quantity: qty } }
    );
    res.json({ success: true, result: result });
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

app.get('/api/students', async (req, res) => {
  try {
    var students = await db.collection('users').find({ role: 'student' }, { projection: { password: 0 } }).toArray();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
module.exports = app;
