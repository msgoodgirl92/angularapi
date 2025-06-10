const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const PDFDocument = require('pdfkit');

// Inicijalizuj Express aplikaciju
const app = express();

// Port
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Pomoćne funkcije
const dbPath = './db.json';

function loadData() {
  const filePath = path.join(__dirname, 'db.json');

  if (!fs.existsSync(filePath)) {
    console.error('❌ db.json ne postoji na putanji:', filePath);
    return { boeData: [], employeeList: [], rejectList: [], users: [] };
  }

  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('❌ Greška prilikom čitanja db.json:', err.message);
    return { boeData: [], employeeList: [], rejectList: [], users: [] };
  }
}

const getUsers = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeJsonSync(dbPath, { users: [] });
  }
  const db = fs.readJsonSync(dbPath);
  return db.users;
};

const saveUsers = (users) => {
  fs.writeJsonSync(dbPath, { users });
};

// ------------------ RUTE ------------------

// === 1. Rute za korisnike (frontend deo) ===
app.get('/', (req, res) => {
  res.send('Dobrodošli na korisnički API');
});

app.get('/users', (req, res) => {
  const users = getUsers();
  res.json(users);
});
app.get('/users/:id', (req, res) => {
  const users = getUsers();
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'Korisnik nije pronađen' });
  }
});
app.get('/HBSharedAPI/BillOfExchangeRecordsAPI/boeData/:id', (req, res) => {
  const data = loadData();
  const id = Number(req.params.id);

  if (!data.boeData) {
    return res.status(404).json({ message: 'Nema podataka' });
  }

  const record = data.boeData.find(item => Number(item.ID) === id);

  if (!record) {
    return res.status(404).json({ message: 'Zapis nije pronađen' });
  }

  res.json(record);
});


app.get('/HBSharedAPI/BillOfExchangeRecordsAPI/boeData', (req, res) => {
  const serijskibroj = req.query.serijskibroj;
  const data = loadData();

  if (!data.boeData) {
    data.boeData = [];
  }

  if (!serijskibroj) {
    // Ako nema query parametra, vrati sve
    return res.json(data.boeData);
  }

  const filtered = data.boeData.filter(item => item.serijskibroj === serijskibroj);

  res.json(filtered);
});


app.post('/users', (req, res) => {
  const users = getUsers();
  const newUser = { ...req.body, id: users.length + 1 };
  users.push(newUser);
  saveUsers(users);
  res.status(201).json({ message: 'Korisnik dodat', user: newUser });
});

app.put('/users/:id', (req, res) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === Number(req.params.id));
  if (index !== -1) {
    users[index] = { ...users[index], ...req.body };
    saveUsers(users);
    res.json({ message: 'Korisnik ažuriran', user: users[index] });
  } else {
    res.status(404).json({ message: 'Korisnik nije pronađen' });
  }
});

app.delete('/HBSharedAPI/BillOfExchangeRecordsAPI/boeData/:id', (req, res) => {
  const data = loadData();
  const id = Number(req.params.id);

  if (!data.boeData) {
    data.boeData = [];
  }

  const index = data.boeData.findIndex(item => item.ID === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Zapis nije pronađen' });
  }

  data.boeData.splice(index, 1);
  fs.writeJsonSync(dbPath, data);

  res.json({ message: 'Zapis je uspešno obrisan' });
});



// === 2. API za dropdown i boe podatke ===
app.get('/HBSharedAPI/BillOfExchangeRecordsAPI/GetDD', (req, res) => {
  const type = req.query.type;
  const data = loadData();

  if (type === '0') {
    res.json(data.employeeList || []);
  } else if (type === '1') {
    res.json(data.rejectList || []);
  } else {
    res.status(400).json({ error: 'Pogrešan parametar "type"' });
  }
});
app.post('/HBSharedAPI/BillOfExchangeRecordsAPI/GetBOERecords', (req, res) => {
  const filters = req.body; // prima ceo objekat filtera
  const data = loadData();
  let filteredData = data.boeData || [];

    // filtriraj po ID
if (filters.ID) {
    filteredData = filteredData.filter(item => item.ID === Number(filters.ID));
  }

  // filtriraj po serijskom broju
  if (filters.serialNumber) {
    filteredData = filteredData.filter(item =>
      item.serijskibroj.toLowerCase().includes(filters.serialNumber.toLowerCase())
    );
  }

  // filtriraj po razlozima odbijanja
  if (filters.rejectionReason) {
    filteredData = filteredData.filter(item =>
      (item.rejectionReason || '').toLowerCase().includes(filters.rejectionReason.toLowerCase())
    );
  }

  // filtriraj po datumu prijema (pretpostavimo string u formatu 'YYYY-MM-DD')
  if (filters.selectedDate) {
    filteredData = filteredData.filter(item => item.datumPrijema === filters.selectedDate);
  }

  // filtriraj po zaposlenom (createdBy)
  if (filters.createdBy) {
    filteredData = filteredData.filter(item =>
      item.createdBy.toLowerCase().includes(filters.createdBy.toLowerCase())
    );
  }

  res.json(filteredData);
});

app.post('/HBSharedAPI/BillOfExchangeRecordsAPI/boeData', (req, res) => {
  const data = loadData();
  const newRecord = req.body;

  if (!data.boeData) {
    data.boeData = [];
  }

  // Automatski generiši ID
  const nextId = data.boeData.length
    ? Math.max(...data.boeData.map(item => item.ID || 0)) + 1
    : 1;

  newRecord.ID = nextId;
  data.boeData.push(newRecord);

  fs.writeJsonSync(dbPath, data);

  res.status(201).json({
    message: 'Zapis uspešno dodat',
    record: newRecord
  });
});


// === 3. Ruta za preuzimanje PDF izveštaja ===
app.post('/api/DocumentDownload/GetReport', (req, res) => {
  const {
    racunDuznika,
    racunPoverioca,
    datumPrijema,
    razlogOdbijanja,
    serijskiBroj,
    radnik,
    sqllCallType,
    jsonRequest
  } = req.body;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Izvestaj_${serijskiBroj}.pdf"`);

  const doc = new PDFDocument();
  doc.pipe(res);

  doc.font('Helvetica');
  doc.text(`📄 Izveštaj za menicu: ${serijskiBroj}`, { align: 'center' });
  doc.moveDown();
  doc.text(`Racun duznika: ${racunDuznika}`);
  doc.text(`Racun poverioca: ${racunPoverioca}`);
  doc.text(`Datum prijema: ${datumPrijema}`);
  doc.text(`Razlog odbijanja: ${razlogOdbijanja}`);
  doc.text(`Radnik ID: ${radnik}`);
  doc.text(`SQL Call Type: ${sqllCallType}`);
  doc.text(`Originalni JSON: ${jsonRequest}`);
  doc.moveDown();
  doc.text(`Hvala što koristite naš sistem.`, { align: 'center' });

  doc.end();
});

app.get('/debug/dbjson', (req, res) => {
  try {
    const data = loadData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Ne mogu da učitam db.json', details: error.message });
  }
});



app.get('/test', (req, res) => {
  res.send('Test ruta radi! 🚀');
});

// ------------------ POKRETANJE ------------------
app.listen(port, '0.0.0.0', () => {
  console.log(`Server radi na portu ${port}`);
});

