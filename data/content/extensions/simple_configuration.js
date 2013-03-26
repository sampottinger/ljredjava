function SimpleConfigurationExtension(extensionToolkit)
{
    this.deviceDescriptionListing = null;

    this.generateDisplayID = function(field)
    {
        return extensionToolkit.renderText(
            "simple-configuration-display-{{name}}",
            {name: field.name}
        );
    }

    this.setDeviceDescriptionListing = function(listing)
    {
        this.deviceDescriptionListing = listing;
    }

    this.saveCategory = function(categoryName)
    {
        var categoryDescription;
        var categoryFields;
        var field;
        var fieldID;
        var fieldValue;
        var registersToWrite;
        var valuesToWrite;

        var registersToWrite = [];
        var valuesToWrite = [];
        for(var i in this.deviceDescriptionListing)
        {
            categoryDescription = this.deviceDescriptionListing[i];

            if(categoryDescription.name === categoryName)
            {
                categoryFields = categoryDescription.fields;
                for(var j in categoryFields)
                {
                    field = categoryFields[j];
                    fieldID = this.generateDisplayID(field);
                    fieldValue = extensionToolkit.getFieldValue(fieldID);
                    registersToWrite.push(field.registerNum);
                    valuesToWrite.push(fieldValue);
                }
            }
        }

        extensionToolkit.writeRegisters(registersToWrite, valuesToWrite);
    }

    this.populateExistingValues = function()
    {
        var categoryDescription;
        var categoryFields;
        var field;
        var fieldID;
        var settingInfo;
        var configurationSettingsToRead;
        var registersToRead;
        var registerValues;
        var registerValue;

        var SettingInfo = function(fieldID, registerNum, field)
        {
            this.fieldID = fieldID;
            this.registerNum = registerNum;
            this.field = field;
            this.value = null;
        };

        configurationSettingsToRead = [];
        for(var i in this.deviceDescriptionListing)
        {
            categoryDescription = this.deviceDescriptionListing[i];
            categoryFields = categoryDescription.fields;
            for(var j in categoryFields)
            {
                field = categoryFields[j];
                fieldID = this.generateDisplayID(field);
                configurationSettingsToRead.push(
                    new SettingInfo(fieldID, field.registerNum, field)
                );
            }
        }

        registersToRead = [];
        for(var i in configurationSettingsToRead)
        {
            settingInfo = configurationSettingsToRead[i];
            registersToRead.push(settingInfo.registerNum);
        }
        registerValues = extensionToolkit.readRegisters(registersToRead);

        for(var i in registerValues)
        {
            registerValue = registerValues[i];
            setting = configurationSettingsToRead[i];
            extensionToolkit.setFieldValue(setting.fieldID, registerValue);
        }
    }

    this.createTabs = function(tabTemplate, newDeviceDescriptionListing)
    {
        var renderedTemplate;
        var categoryDescription;

        this.deviceDescriptionListing = newDeviceDescriptionListing;

        for(var i in deviceDescriptionListing)
        {
            categoryDescription = deviceDescriptionListing[i];
            renderedTemplate = Mustache.render(
                tabTemplate,
                categoryDescription
            );
            extensionToolkit.addTab(renderedTemplate);
        }

        this.populateExistingValues();

        var saveFunction = this.saveCategory;

        $(".simple-configuration-save-button").click(function(eventInfo){
            var buttonID = event.target.id;
            var categoryName = buttonID.replace(
                "simple-configuration-save-button-", "");
            saveFunction(categoryName);
        });
    }

    this.init = function(device)
    {
        var deviceDescriptorURL = Mustache.render(
            "/extensions_data/simple_configuration/{{type}}.json",
            {type: device.deviceType}
        );

        var callback = this.createTabs

        $.getJSON(deviceDescriptorURL, function(deviceData)
        {

            var templateURL =
                "/extensions_data/simple_configuration/tab_template.html";

            $.get(templateURL, function(template) {
                callback(template, deviceData);
            });

        });
    }
}

var usingNode = typeof window === 'undefined';
if(usingNode)
{
    exports.SimpleConfigurationExtension = SimpleConfigurationExtension;
}
