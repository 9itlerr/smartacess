const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Données en mémoire (avec données de démo)
let users = [
    { 
        id: 1, 
        email: 'admin@smartaccess.com', 
        password: 'admin123', 
        name: 'Admin Manager', 
        role: 'admin',
        company: 'SmartAccess Corp'
    },
    { 
        id: 2, 
        email: 'employe@entreprise.com', 
        password: 'employe123', 
        name: 'Jean Employé', 
        role: 'employee',
        company: 'Entreprise Test'
    }
];

let employees = [
    { 
        id: 1, 
        name: 'Jean Martin', 
        badgeId: 'EMP001', 
        department: 'Direction', 
        status: 'active', 
        email: 'jean.martin@entreprise.com', 
        phone: '01 23 45 67 89', 
        accessSchedule: '9h-18h',
        createdAt: new Date().toISOString(),
        lastAccess: new Date().toISOString()
    },
    { 
        id: 2, 
        name: 'Marie Dubois', 
        badgeId: 'EMP002', 
        department: 'RH', 
        status: 'active', 
        email: 'marie.dubois@entreprise.com', 
        phone: '01 23 45 67 90', 
        accessSchedule: '8h30-17h30',
        createdAt: new Date().toISOString(),
        lastAccess: new Date(Date.now() - 3600000).toISOString()
    },
    { 
        id: 3, 
        name: 'Pierre Bernard', 
        badgeId: 'EMP003', 
        department: 'Technique', 
        status: 'pending', 
        email: 'pierre.bernard@entreprise.com', 
        phone: '01 23 45 67 91', 
        accessSchedule: '8h-17h',
        createdAt: new Date().toISOString(),
        lastAccess: null
    }
];

let accessLogs = [
    { 
        id: 1, 
        employeeId: 1, 
        employeeName: 'Jean Martin', 
        badgeId: 'EMP001', 
        deviceId: 'SIMULATION', 
        deviceName: 'Simulateur Web', 
        location: 'Porte principale', 
        type: 'entrée', 
        timestamp: new Date().toISOString(), 
        status: 'success', 
        accessGranted: true 
    },
    { 
        id: 2, 
        employeeId: 2, 
        employeeName: 'Marie Dubois', 
        badgeId: 'EMP002', 
        deviceId: 'SIMULATION', 
        deviceName: 'Simulateur Web', 
        location: 'Porte arrière', 
        type: 'entrée', 
        timestamp: new Date(Date.now() - 3600000).toISOString(), 
        status: 'success', 
        accessGranted: true 
    },
    { 
        id: 3, 
        employeeId: 0, 
        employeeName: 'Inconnu', 
        badgeId: 'UNKNOWN001', 
        deviceId: 'SIMULATION', 
        deviceName: 'Simulateur Web', 
        location: 'Porte principale', 
        type: 'entrée', 
        timestamp: new Date(Date.now() - 7200000).toISOString(), 
        status: 'denied', 
        reason: 'Badge non enregistré',
        accessGranted: false
    }
];

let devices = [
    { 
        id: 1, 
        name: 'ESP32 Porte principale', 
        deviceId: 'ESP-ABC123', 
        secretKey: 'SK-123456', 
        location: 'Entrée bâtiment', 
        status: 'online', 
        lastSeen: new Date().toISOString(), 
        registeredAt: new Date().toISOString() 
    },
    { 
        id: 2, 
        name: 'ESP32 Porte arrière', 
        deviceId: 'ESP-DEF456', 
        secretKey: 'SK-789012', 
        location: 'Sortie parking', 
        status: 'offline', 
        lastSeen: new Date(Date.now() - 300000).toISOString(), 
        registeredAt: new Date(Date.now() - 86400000).toISOString() 
    }
];

// Routes API

// 1. Authentification
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                company: user.company
            },
            token: 'demo-token-' + user.id
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Email ou mot de passe incorrect'
        });
    }
});

app.post('/api/register', (req, res) => {
    const { email, password, name, company } = req.body;
    
    // Vérifier si l'email existe déjà
    if (users.some(u => u.email === email)) {
        return res.status(400).json({
            success: false,
            message: 'Cet email est déjà utilisé'
        });
    }
    
    // Créer nouvel utilisateur
    const newUser = {
        id: users.length + 1,
        email,
        password,
        name: name || 'Nouvel utilisateur',
        role: 'admin',
        company: company || 'Ma société',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    res.json({
        success: true,
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            company: newUser.company
        },
        token: 'demo-token-' + newUser.id
    });
});

// 2. Employés
app.get('/api/employees', (req, res) => {
    res.json({
        success: true,
        employees: employees
    });
});

app.get('/api/employees/:id', (req, res) => {
    const employee = employees.find(e => e.id === parseInt(req.params.id));
    
    if (employee) {
        res.json({
            success: true,
            employee: employee
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Employé non trouvé'
        });
    }
});

app.post('/api/employees', (req, res) => {
    const { name, badgeId, department, email, phone, accessSchedule } = req.body;
    
    // Vérifier si le badge ID existe déjà
    if (employees.some(e => e.badgeId === badgeId)) {
        return res.status(400).json({
            success: false,
            message: 'Ce badge ID est déjà utilisé'
        });
    }
    
    const newEmployee = {
        id: employees.length + 1,
        name,
        badgeId,
        department: department || 'Non spécifié',
        status: 'active',
        email: email || '',
        phone: phone || '',
        accessSchedule: accessSchedule || '9h-18h',
        createdAt: new Date().toISOString(),
        lastAccess: null
    };
    
    employees.push(newEmployee);
    
    res.json({
        success: true,
        employee: newEmployee,
        message: 'Employé ajouté avec succès'
    });
});

app.put('/api/employees/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = employees.findIndex(e => e.id === id);
    
    if (index !== -1) {
        employees[index] = { ...employees[index], ...req.body };
        res.json({
            success: true,
            employee: employees[index],
            message: 'Employé modifié avec succès'
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Employé non trouvé'
        });
    }
});

app.delete('/api/employees/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = employees.findIndex(e => e.id === id);
    
    if (index !== -1) {
        employees.splice(index, 1);
        res.json({
            success: true,
            message: 'Employé supprimé avec succès'
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Employé non trouvé'
        });
    }
});

// 3. Appareils ESP32
app.get('/api/devices', (req, res) => {
    res.json({
        success: true,
        devices: devices
    });
});

app.post('/api/devices', (req, res) => {
    const { name, location, deviceId, secretKey } = req.body;
    
    // Vérifier si l'ID d'appareil existe déjà
    if (devices.some(d => d.deviceId === deviceId)) {
        return res.status(400).json({
            success: false,
            message: 'Cet appareil est déjà enregistré'
        });
    }
    
    const newDevice = {
        id: devices.length + 1,
        name: name || 'ESP32 RFID',
        location: location || 'Non spécifié',
        deviceId: deviceId || `ESP-${Date.now()}`,
        secretKey: secretKey || generateSecretKey(),
        status: 'offline',
        type: 'rfid_reader',
        lastSeen: null,
        registeredAt: new Date().toISOString()
    };
    
    devices.push(newDevice);
    
    res.json({
        success: true,
        device: newDevice,
        message: 'Appareil enregistré avec succès'
    });
});

// Générer une clé secrète pour l'ESP32
function generateSecretKey() {
    return 'SK-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// 4. API POUR ESP32
app.post('/api/esp32/register', (req, res) => {
    const { deviceId, secretKey } = req.body;
    
    const device = devices.find(d => d.deviceId === deviceId && d.secretKey === secretKey);
    
    if (device) {
        // Mettre à jour le statut de l'appareil
        device.status = 'online';
        device.lastSeen = new Date().toISOString();
        
        res.json({
            success: true,
            message: 'ESP32 authentifié avec succès',
            deviceName: device.name,
            location: device.location
        });
    } else {
        // Créer automatiquement si pas trouvé
        const newDevice = {
            id: devices.length + 1,
            deviceId: deviceId,
            secretKey: secretKey,
            name: 'ESP32 Auto-Détecté',
            location: 'Automatique',
            status: 'online',
            lastSeen: new Date().toISOString(),
            registeredAt: new Date().toISOString()
        };
        devices.push(newDevice);
        
        res.json({
            success: true,
            message: 'ESP32 enregistré automatiquement',
            device: newDevice
        });
    }
});

// ENDPOINT PRINCIPAL POUR LES SCANS RFID
app.post('/api/esp32/scan', (req, res) => {
    const { deviceId, secretKey, badgeId, timestamp } = req.body;
    
    // Vérifier l'authentification de l'ESP32
    const device = devices.find(d => d.deviceId === deviceId && d.secretKey === secretKey);
    
    if (!device) {
        return res.status(401).json({
            success: false,
            message: 'Appareil non authentifié'
        });
    }
    
    // Mettre à jour la dernière activité de l'appareil
    device.lastSeen = new Date().toISOString();
    device.status = 'online';
    
    // Chercher l'employé correspondant au badge
    const employee = employees.find(e => e.badgeId === badgeId);
    
    // Vérifier les autorisations
    let accessGranted = false;
    let reason = '';
    
    if (employee) {
        if (employee.status === 'active') {
            accessGranted = true;
            // Mettre à jour le dernier accès de l'employé
            employee.lastAccess = new Date().toISOString();
        } else {
            reason = 'Employé inactif';
        }
    } else {
        reason = 'Badge non enregistré';
    }
    
    // Créer le log d'accès
    const newLog = {
        id: accessLogs.length + 1,
        employeeId: employee ? employee.id : 0,
        employeeName: employee ? employee.name : 'Inconnu',
        badgeId: badgeId,
        deviceId: deviceId,
        deviceName: device.name,
        location: device.location,
        type: 'scan',
        timestamp: timestamp || new Date().toISOString(),
        status: accessGranted ? 'success' : 'denied',
        reason: reason,
        accessGranted: accessGranted
    };
    
    accessLogs.unshift(newLog);
    
    // Réponse à l'ESP32
    res.json({
        success: true,
        accessGranted: accessGranted,
        employeeName: employee ? employee.name : null,
        department: employee ? employee.department : null,
        message: accessGranted ? 'Accès autorisé' : `Accès refusé: ${reason}`,
        timestamp: new Date().toISOString(),
        logId: newLog.id
    });
});

// 5. Historique des accès
app.get('/api/access-logs', (req, res) => {
    const { limit = 50, offset = 0, deviceId } = req.query;
    
    let filteredLogs = accessLogs;
    
    // Filtrer par appareil si spécifié
    if (deviceId) {
        filteredLogs = accessLogs.filter(log => log.deviceId === deviceId);
    }
    
    const logs = filteredLogs
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
        success: true,
        logs: logs,
        total: filteredLogs.length
    });
});

// 6. Statistiques
app.get('/api/stats', (req, res) => {
    const today = new Date().toDateString();
    const todayLogs = accessLogs.filter(log => 
        new Date(log.timestamp).toDateString() === today
    );
    
    const stats = {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.status === 'active').length,
        totalDevices: devices.length,
        onlineDevices: devices.filter(d => d.status === 'online').length,
        todayAccess: todayLogs.length,
        todayAuthorized: todayLogs.filter(log => log.status === 'success').length,
        todayDenied: todayLogs.filter(log => log.status === 'denied').length
    };
    
    res.json({
        success: true,
        stats: stats
    });
});

// 7. Simulation pour le frontend
app.post('/api/simulate-rfid', (req, res) => {
    const { badgeId, location = 'Porte principale' } = req.body;
    
    // Simuler un délai réseau
    setTimeout(() => {
        const employee = employees.find(e => e.badgeId === badgeId);
        
        if (employee && employee.status === 'active') {
            // Accès autorisé
            const successLog = {
                id: accessLogs.length + 1,
                employeeId: employee.id,
                employeeName: employee.name,
                badgeId: badgeId,
                deviceId: 'SIMULATION',
                deviceName: 'Simulateur Web',
                location: location,
                type: 'scan',
                timestamp: new Date().toISOString(),
                status: 'success',
                accessGranted: true
            };
            
            accessLogs.unshift(successLog);
            employee.lastAccess = new Date().toISOString();
            
            res.json({
                success: true,
                log: successLog,
                message: `Accès autorisé - ${employee.name}`
            });
        } else {
            // Accès refusé
            const deniedLog = {
                id: accessLogs.length + 1,
                employeeId: employee ? employee.id : 0,
                employeeName: employee ? employee.name : 'Inconnu',
                badgeId: badgeId,
                deviceId: 'SIMULATION',
                deviceName: 'Simulateur Web',
                location: location,
                type: 'scan',
                timestamp: new Date().toISOString(),
                status: 'denied',
                reason: employee ? `Employé ${employee.status}` : 'Badge non enregistré',
                accessGranted: false
            };
            
            accessLogs.unshift(deniedLog);
            
            res.json({
                success: false,
                log: deniedLog,
                message: employee ? `Accès refusé - ${employee.name} (${employee.status})` : 'Accès refusé - Badge non enregistré'
            });
        }
    }, 1000);
});

// 8. Ping des appareils
app.post('/api/esp32/ping', (req, res) => {
    const { deviceId, secretKey } = req.body;
    
    const device = devices.find(d => d.deviceId === deviceId && d.secretKey === secretKey);
    
    if (device) {
        device.lastSeen = new Date().toISOString();
        device.status = 'online';
        
        res.json({
            success: true,
            timestamp: new Date().toISOString()
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Appareil non authentifié'
        });
    }
});

// 9. Dashboard data (tout en un)
app.get('/api/dashboard-data', (req, res) => {
    const today = new Date().toDateString();
    const todayLogs = accessLogs.filter(log => 
        new Date(log.timestamp).toDateString() === today
    );
    
    const stats = {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.status === 'active').length,
        totalDevices: devices.length,
        onlineDevices: devices.filter(d => d.status === 'online').length,
        todayAccess: todayLogs.length,
        todayAuthorized: todayLogs.filter(log => log.status === 'success').length,
        todayDenied: todayLogs.filter(log => log.status === 'denied').length
    };
    
    res.json({
        success: true,
        stats: stats,
        employees: employees.slice(0, 5), // 5 premiers employés
        recentLogs: accessLogs.slice(0, 5), // 5 derniers logs
        devices: devices,
        lastUpdate: new Date().toISOString()
    });
});

// Route pour servir les pages
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});
// Route DELETE pour les appareils (si elle n'existe pas)
app.delete('/api/devices/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = devices.findIndex(d => d.id === id);
    
    if (index !== -1) {
        devices.splice(index, 1);
        res.json({
            success: true,
            message: 'Appareil supprimé avec succès'
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Appareil non trouvé'
        });
    }
});

// Route PUT pour modifier un appareil
app.put('/api/devices/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = devices.findIndex(d => d.id === id);
    
    if (index !== -1) {
        devices[index] = { ...devices[index], ...req.body };
        res.json({
            success: true,
            device: devices[index],
            message: 'Appareil modifié avec succès'
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Appareil non trouvé'
        });
    }
});
// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📁 Frontend: http://localhost:${PORT}`);
    console.log(`🔌 API: http://localhost:${PORT}/api/`);
    console.log(`📊 Données: ${employees.length} employés, ${devices.length} appareils, ${accessLogs.length} logs`);
    console.log(`👤 Compte test: admin@smartaccess.com / admin123`);
});