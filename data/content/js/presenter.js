var selectedDeviceSerialNumber = null;

function requestDevices()
{
    $.getJSON("/api/get_devices.json", function(deviceData)
    {
        $.get("/templates/device_list.html", function(template)
        {
            loadDevices(deviceData, template);
        });
    });
}

function requestDevice(deviceType, connectionType, identifier, serialNumber)
{
    var loadDataPayload = {
        deviceType: deviceType,
        connectionType: connectionType,
        identifier: identifier,
        serialNumber: serialNumber
    };

    $.post(
        "/api/load_device",
        loadDataPayload,
        function(data)
        {
            loadDevice(serialNumber);
        }
    );
}

function loadDevices(deviceData, template)
{
    var buttonDescriptor;
    var buttonDescriptorTemplate;

    buttonDescriptorTemplate = "#device-entry-{{serial}}-{{type}}-btn";

    $("#device-bar").html(
        Mustache.render(template, {devices: deviceData})
    );

    for(var i in deviceData)
    {
        var device = deviceData[i];
        var serialNumber = device.serialNumber;
        var deviceType = device.deviceType;

        var ConnectCallback = function(identifier, connType, serialNumber,
            deviceType)
        {
            this.identifier = identifier;
            this.serialNumber = serialNumber;
            this.deviceType = deviceType;
            this.connType = connType;

            this.apply = function()
            {
                requestDevice(
                    this.deviceType,
                    this.connType,
                    this.identifier,
                    this.serialNumber
                );
            }
        }

        if(device.ethernetIP != null)
        {
            buttonDescriptor = Mustache.render(
                buttonDescriptorTemplate,
                {serial: serialNumber, type:"ethernet"}
            );
            $(buttonDescriptor).click(new ConnectCallback(
                device.ethernetIP,
                "ethernet",
                serialNumber,
                deviceType
            ));
        }

        if(device.wifiIP != null)
        {
            buttonDescriptor = Mustache.render(
                buttonDescriptorTemplate,
                {serial: serialNumber, type:"wifi"}
            );
            $(buttonDescriptor).click(new ConnectCallback(
                device.wifiIP,
                "wifi",
                serialNumber,
                deviceType
            ));
        }

        if(device.availableByUSB)
        {
            buttonDescriptor = Mustache.render(
                buttonDescriptorTemplate,
                {serial: serialNumber, type:"usb"}
            );
            $(buttonDescriptor).click(new ConnectCallback(
                serialNumber,
                "usb",
                serialNumber,
                deviceType
            ));
        }
    }
}

function loadDevice(serialNumber)
{
    var url = "/api/device/general.json";
    var getParams = {serial: serialNumber}
    selectedDeviceSerialNumber = serialNumber;

    $.getJSON(url, getParams, function(deviceData)
    {
        $.get("/templates/general_info.html", function(template)
        {
            $("#device-general-info-display").html(
                Mustache.render(template, deviceData)
            );
        });
        $.get("/templates/capability_display.html", function(template)
        {
            $("#device-capability-display").html(
                Mustache.render(template, deviceData)
            );
        });
    });

    // Refresh devices list
    requestDevices();
}

$(document).ready(function() {
    requestDevices();
});