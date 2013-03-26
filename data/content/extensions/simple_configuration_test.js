var simple_configuration = require("./simple_configuration");

function TestExtensionToolkit()
{
    this.lastWriteReigsters = [];
    this.lastWriteValues = [];
    this.fieldsSet = [];

    this.renderText = function(template, vals)
    {
        return template + JSON.stringify(vals);
    }

    this.getFieldValue = function(field)
    {
        return field + "-value";
    }

    this.writeRegisters = function(registers, values)
    {
        this.lastWriteReigsters = registers;
        this.lastWriteValues = values;
    }

    this.readRegisters = function(registers)
    {
        return registers;
    }

    this.setFieldValue = function(fieldID, registerValue)
    {
        this.fieldsSet.push(fieldID + registerValue);
    }
}

function generateTestField()
{
    return {name: "test"};
}

function generateTestDeviceDescriptionListing()
{
    return [
        {
            name: "category1",
            fields: [
                {name: "test1", registerNum: 1},
                {name: "test2", registerNum: 2}
            ]
        },
        {
            name: "category2",
            fields: [
                {name: "test3", registerNum: 3},
                {name: "test4", registerNum: 4}
            ]
        }
    ]
}

exports.testPopulateExistingValues = function(test)
{
    var listing = generateTestDeviceDescriptionListing();
    var testExtensionToolkit = new TestExtensionToolkit();
    var extension = new simple_configuration.SimpleConfigurationExtension(
        testExtensionToolkit);
    extension.setDeviceDescriptionListing(listing);

    extension.populateExistingValues();

    test.deepEqual(
        testExtensionToolkit.fieldsSet,
        [
            'simple-configuration-display-{{name}}{"name":"test1"}1',
            'simple-configuration-display-{{name}}{"name":"test2"}2',
            'simple-configuration-display-{{name}}{"name":"test3"}3',
            'simple-configuration-display-{{name}}{"name":"test4"}4'
        ]
    );

    test.done();
}

exports.testSaveCategory = function(test)
{
    var listing = generateTestDeviceDescriptionListing();
    var testExtensionToolkit = new TestExtensionToolkit();
    var extension = new simple_configuration.SimpleConfigurationExtension(
        testExtensionToolkit);
    extension.setDeviceDescriptionListing(listing);
    extension.saveCategory("category2");
    
    test.deepEqual(
        testExtensionToolkit.lastWriteReigsters,
        [3, 4]
    );
    test.deepEqual(
        testExtensionToolkit.lastWriteValues,
        [
            'simple-configuration-display-{{name}}{"name":"test3"}-value',
            'simple-configuration-display-{{name}}{"name":"test4"}-value'
        ]
    );
    
    test.done();
}

exports.testGenerateDisplayID = function(test)
{
    var testExtensionToolkit = new TestExtensionToolkit();
    var extension = new simple_configuration.SimpleConfigurationExtension(
        testExtensionToolkit);
    var generatedID = extension.generateDisplayID(generateTestField());
    test.equal(
        generatedID,
        "simple-configuration-display-{{name}}" + '{"name":"test"}'
    );
    test.done();
}