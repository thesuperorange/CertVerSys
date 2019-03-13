const ethtool = require("../src/ethtool");
const Web3 = require("web3");
var Web3Utils = require("web3-utils");

test("PrivateKeyProvider with ganache-cli's account", async () => {
  const pk1 =
    "fa6f9d41bbee4e626acb899b6a4f480ce4b5a6796a61a499a935ecdb10bb2744";
  const providerPk1 = new ethtool.PrivateKeyProvider({
    privateKey: pk1,
    rpcUrl: "http://localhost:8546"
  });
  var web3Pk1 = new Web3(providerPk1);
  // 雛 張 壞 施 防 勵 鋼 廣 伸 弟 插 酒
  // Private Keys
  // ==================
  // (0) fa6f9d41bbee4e626acb899b6a4f480ce4b5a6796a61a499a935ecdb10bb2744
  // (1) 5f0c593c5a562bce6719842fa2aa65908194d234525e5b4eb358d4dc78cbc78a
  // (2) 0ee0ae766492c951ec0ec4133e349ab688ecd2b38eaa755f4c27fdf5aacce068
  // Available Accounts
  // ==================
  // (0) 0xe3576bd442fb1f6109e6db773d7be462452c1dfa
  // (1) 0x8dc362163ab592a237947715a2716282f4155551
  // (2) 0xe60d575ef72db17a593a9c7c46a1ddbdd1a60260

  // web3.fromWei(web3.eth.getBalance(web3.eth.accounts[0]), 'ether')
  const addr0 = "0xe3576bd442fb1f6109e6db773d7be462452c1dfa";
  const addr1 = "0x8dc362163ab592a237947715a2716282f4155551";
  const balance0 = await web3Pk1.eth.getBalance(addr0);
  expect(Web3Utils.fromWei(balance0, "ether")).toBe("100");

  await web3Pk1.eth.sendTransaction({
    from: addr0,
    to: addr1,
    value: Web3Utils.toWei("5", "ether")
  });
  const balance0_after = await web3Pk1.eth.getBalance(addr0);
  const balance1_after = await web3Pk1.eth.getBalance(addr1);
  // 100 - 5 - gas
  expect(Number(Web3Utils.fromWei(balance0_after, "ether"))).toBeLessThan(95);
  expect(Number(Web3Utils.fromWei(balance1_after, "ether"))).toBe(105);

  const addressNotInWallet = "0xdab83a4162d81968222af8ed246d57d6ff3675e0";
  const privatekeyNotInWallet =
    "5acc495d261bcd417875b42c553f3366e72e743588f48caf164d90a1f86afa89";
  await web3Pk1.eth.sendTransaction({
    from: addr0,
    to: addressNotInWallet,
    value: Web3Utils.toWei("5", "ether")
  });
});

test("PrivateKeyProvider with privatekey", async () => {
  const addr1 = "0x8dc362163ab592a237947715a2716282f4155551";

  const addressNotInWallet = "0xdab83a4162d81968222af8ed246d57d6ff3675e0";
  const privatekeyNotInWallet =
    "5acc495d261bcd417875b42c553f3366e72e743588f48caf164d90a1f86afa89";

  const providerPkNotInWallet = new ethtool.PrivateKeyProvider({
    privateKey: privatekeyNotInWallet,
    rpcUrl: "http://localhost:8546"
  });

  var web3PkNotInWallet = new Web3(providerPkNotInWallet);
  expect(
    Number(
      Web3Utils.fromWei(
        await web3PkNotInWallet.eth.getBalance(addressNotInWallet),
        "ether"
      )
    )
  ).toBe(5);

  await web3PkNotInWallet.eth.sendTransaction({
    from: addressNotInWallet,
    to: addr1,
    value: Web3Utils.toWei("1", "ether")
  });

  expect(
    Number(
      Web3Utils.fromWei(
        await web3PkNotInWallet.eth.getBalance(addressNotInWallet),
        "ether"
      )
    )
  ).toBeLessThan(4);
});
