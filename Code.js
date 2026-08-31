const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // โฟลเดอร์เก็บไฟล์ HTML

// สร้าง VAPID Keys สำหรับ Push Notification (ใช้คำสั่ง npx web-push generate-vapid-keys เพื่อสร้างของจริง)
const publicVapidKey = 'YOUR_PUBLIC_VAPID_KEY';
const privateVapidKey = 'YOUR_PRIVATE_VAPID_KEY';
webpush.setVapidDetails('mailto:test@example.com', publicVapidKey, privateVapidKey);

let subscriptions = []; // สมมติว่าเก็บใน Memory (ระบบจริงควรเก็บใน Database)

// Endpoint สำหรับรับการ Subscribe จากเครื่องผู้ใช้
app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    subscriptions.push(subscription);
    res.status(201).json({});
});

// Endpoint สำหรับรับข้อมูลงานและตั้งเวลาแจ้งเตือน
app.post('/add-task', (req, res) => {
    const { task, dateTime } = req.body;
    const taskTime = new Date(dateTime).getTime();
    const now = Date.now();
    const delay = taskTime - now;

    if (delay > 0) {
        // ตั้งเวลาให้ระบบส่งแจ้งเตือนเมื่อถึงเวลา
        setTimeout(() => {
            const payload = JSON.stringify({ title: 'ถึงเวลาทำงานแล้ว!', body: task });
            subscriptions.forEach(sub => {
                webpush.sendNotification(sub, payload).catch(err => console.error(err));
            });
        }, delay);
        res.status(200).json({ message: 'Task scheduled' });
    } else {
        res.status(400).json({ message: 'เวลาผ่านไปแล้ว' });
    }
});

app.listen(3000, () => console.log('Server started on port 3000'));