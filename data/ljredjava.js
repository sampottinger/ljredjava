var app = module.exports = require('appjs');

app.serveFilesFrom(__dirname + '/content');

var window = app.createWindow({
    width  : 900,
    height : 600,
    icons  : __dirname + '/content/icons'
});

window.on('create', function(){
    window.frame.show();
    window.frame.center();
});

window.on('ready', function(){
    window.process = process;
    window.module = module;

    function F12(e)
    {
        return e.keyIdentifier === 'F12';
    }

    function Command_Option_J(e)
    {
        return e.keyCode === 74 && e.metaKey && e.altKey;
    }

    window.addEventListener('keydown', function(e){
        if (F12(e) || Command_Option_J(e)) {
            window.frame.openDevTools();
        }
    });
});

app.router.get('/api/get_devices.json', function(request, response)
{
    var testingValues = [
        {
            deviceType: "T7 Pro",
            serialNumber: "1234567890",
            ethernetIP: "192.168.0.1",
            wifiIP: "192.168.0.2",
            availableByUSB: false
        },
        {
            deviceType: "U3",
            serialNumber: "0987654321",
            ethernetIP: null,
            wifiIP: null,
            availableByUSB: true
        }
    ];
    
    response.send(200, JSON.stringify(testingValues));
});

