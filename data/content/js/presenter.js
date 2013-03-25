function loadDevice(eventInfo)
{
}

function loadDevices()
{
    $.getJSON('/api/get_devices.json', function(deviceData)
    {
        $.get('/templates/device_list.html', function(template)
        {
            $('#device-bar').html(
                Mustache.render(template, {devices: deviceData})
            );

            
        });
    });
}

$(document).ready(function() {
    loadDevices();
});