const commonlib = require("../index")

test("Test common lib", () => {
    const keytool = commonlib.keytool
    const mnemonic = keytool.GenerateMnemonic(true)
    expect(mnemonic).toHaveLength(12+11)
})