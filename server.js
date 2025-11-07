const express = require('express');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = 3000; 

// --- CONFIGURATION ---
// *** ต้องเปลี่ยนเป็น ID ล่าสุดของคุณ ***
const SPREADSHEET_ID = '1QaR4IKWUIS_p6l-vikgyZ_G51fELo7tqzlLI07aZXdA'; 
const ADMIN_PASSWORD = '0000';
const SERVICE_ACCOUNT_KEY_FILE = 'gen-lang-client-0812539218-b066ffaf6d26.json'; // ชื่อไฟล์คีย์ JSON ของคุณ

// 1. ตั้งค่าการเชื่อมต่อ Sheets API ด้วย Service Account
const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_KEY_FILE,
    // สิทธิ์ในการอ่าน/เขียน/ลบทั้งหมดใน Sheet (จำเป็นสำหรับ Setup/Admin actions)
    scopes: ['https://www.googleapis.com/auth/spreadsheets'], 
});

// Helper: อ่านข้อมูลจาก Sheets (แทน readSheet_ ใน Apps Script)
async function readSheet(authClient, sheetName) {
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    
    // ดึงข้อมูลทั้งหมดจาก A:Z
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:Z`, 
    });
    
    const [headers, ...rows] = response.data.values || [];
    if (!headers) return [];

    return rows.map(row => {
        const obj = {};
        headers.forEach((header, i) => {
            // แปลงค่าทั้งหมดเป็น String เพื่อให้เปรียบเทียบรหัสผ่าน/Username ได้ถูกต้อง
            obj[header.trim()] = row[i] ? String(row[i]).trim() : ''; 
        });
        return obj;
    }).filter(obj => obj.username || obj.customer_no); 
}

// Helper: Response Format (ok/err)
const ok = (obj) => ({ ok: true, success: true, ...obj });
const err = (msg) => ({ ok: false, success: false, error: msg });

// --- MIDDLEWARE & CORS ---
app.use(express.json()); // สำหรับการรับ JSON ใน req.body

// อนุญาต CORS สำหรับการทดสอบ (คุณควรจำกัด Domain จริงใน Production)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); 
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// --- API ENDPOINT (Login) ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body.payload || {};
    
    if (!username || !password) {
        return res.status(400).json(err("กรุณากรอกข้อมูลให้ครบถ้วน"));
    }

    try {
        const authClient = await auth.getClient();
        const users = await readSheet(authClient, 'Users');

        const user = users.find(u =>
            u.username.toUpperCase() === username.toUpperCase() ||
            u.phone === username
        );

        if (!user) {
            return res.json(err("รหัสลูกค้าหรือรหัสผ่านไม่ถูกต้อง"));
        }
        
        let valid = false;
        
        // 1. ADMIN CHECK
        if (user.role === "ADMIN" && password === ADMIN_PASSWORD) {
             valid = true;
        } 
        // 2. CUSTOMER CHECK: Full phone number (หรือ 4 หลักสุดท้าย ถ้ามี)
        else if (user.role === "CUSTOMER" && (password === user.phone || password === user.phone.slice(-4))) {
            valid = true;
        }

        if (!valid) {
            return res.json(err("รหัสลูกค้าหรือรหัสผ่านไม่ถูกต้อง"));
        }
        
        // Login Success
        const token = require('crypto').randomUUID(); // สร้าง Token
        
        return res.json(ok({ 
            token: token,
            username: user.username,
            name: user.name,
            role: user.role,
            customer_no: user.customer_no
        }));

    } catch (e) {
        console.error('API Login Error:', e.stack);
        return res.status(500).json(err(`เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล: ${e.message}`));
    }
});

// --- API ENDPOINT (Placeholder for GETALL) ---
app.get('/api/getcustomerdata', async (req, res) => {
    return res.json(err("API is running, but GETCUSTOMERDATA is not implemented yet."));
});

// --- SERVER STARTUP ---
app.listen(PORT, () => {
    console.log(`SWB Node API running on http://localhost:${PORT}`);
});