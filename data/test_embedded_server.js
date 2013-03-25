var util = require("util");
var qs = require('querystring');

var connectedSerials = {};

function contains(a, obj)
{
    return obj[a] != undefined;
}

exports.configureApp = function(app)
{
    app.router.get("/api/get_devices.json", function(req, resp)
    {
        var testingValues = [
            {
                deviceType: "T7 Pro",
                serialNumber: 1234567890,
                ethernetIP: "192.168.0.1",
                wifiIP: "192.168.0.2",
                availableByUSB: false,
                connected: contains(1234567890, connectedSerials)
            },
            {
                deviceType: "U3 HV",
                serialNumber: 0987654321,
                ethernetIP: null,
                wifiIP: null,
                availableByUSB: true,
                connected: contains(0987654321, connectedSerials)
            }
        ];
        
        resp.send(200, JSON.stringify(testingValues));
    });

    app.router.post("/api/load_device", function(req, resp)
    {
        // TODO: Check all params are there
        var postData = qs.parse(req.post);
        var deviceType = postData.deviceType;
        var connectionType = postData.connectionType;
        var identifier = postData.identifier;
        var serialNumber = postData.serialNumber;

        if(connectionType === "usb")
        {
            if(deviceType === "T7 Pro" && identifier === 1234567890)
            {
                connectedSerials[serialNumber] = "usb";
                resp.send(200, util.format("Opened %d.", identifier));
            }
            else if(deviceType === "U3" && identifier === 0987654321)
            {
                connectedSerials[serialNumber] = "usb";
                resp.send(200, util.format("Opened %d.", identifier));
            }
            else
            {
                resp.send(400, "USB device not found.");
            }
        }
        else if(connectionType === "ethernet")
        {
            if(deviceType === "T7 Pro" && identifier === "192.168.0.1")
            {
                connectedSerials[serialNumber] = "ethernet";
                resp.send(200, util.format("Opened %s.", identifier));
            }
            else
            {
                resp.send(400, "Ethernet device not found.");
            }
        }
        else if(connectionType === "wifi")
        {
            if(deviceType === "T7 Pro" && identifier === "192.168.0.2")
            {
                connectedSerials[serialNumber] = "wifi";
                resp.send(200, util.format("Opened %s.", identifier));
            }
            else
            {
                resp.send(400, "WiFi device not found.");
            }
        }
        else
        {
            resp.send(400, "Invalid connection type.");
        }
    });

    app.router.get("/api/device/general.json", function(req, resp){
        var serial = parseInt(req.params.serial);

        if(!contains(serial, connectedSerials))
        {
            resp.send(404, "Device not opened.");
            return;
        }

        var deviceType;
        var supportedCommunicationTypes;
        var capabilities;
        if(serial == 1234567890)
        {
            deviceType = "T7 Pro";
            supportedCommunicationTypes = ["USB", "WiFi", "Ethernet"];
            capabilities = [
                "Arbitrary capability 1",
                "Arbitrary capability 2"
            ];
        }
        else if(serial == 0987654321)
        {
            deviceType = "U3 HV";
            supportedCommunicationTypes = ["USB"];
            capabilities = [
                "Arbitrary capability 3",
                "Arbitrary capability 4"
            ];
        }

        var deviceData = {
            deviceType: deviceType,
            serialNumber: serial,
            firmware: 0.1,
            bootloader: 0.2,
            capabilities: capabilities,
            connectionType: connectedSerials[serial]
        };

        resp.send(200, JSON.stringify(deviceData));
    });
}
