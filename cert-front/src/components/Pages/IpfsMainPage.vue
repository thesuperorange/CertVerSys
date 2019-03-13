<template>
  <div class="row">
    <div class="col-md-12">
      <div class="card">
        <paper-table :title="certListTable.title" :sub-title="certListTable.subTitle" :data="certListTable.UserCerts"
          :columns="certListTable.columns" :chtcolumns="certListTable.chtcolumns" :contractAddr="contractAddr"
          :userInfo="userInfo" @showDetail="showCertDeail">
        </paper-table>
      </div>
    </div>
    <div v-if="isShowDetail" class="col-md-12">
      <div class="card">
        <cert-detail-table :title="certDeailTable.title" :sub-title="certDeailTable.subTitle" :data="certDeailTable.data"
          :columns="certDeailTable.columns" :chtcolumns="certDeailTable.chtcolumns">
        </cert-detail-table>
        <div v-if="NotSubmit" class="col-md-12">
          <br>
          <fg-input type="text" label="希望的有效時間(Expire time)" placeholder="以天為單位，最多7天" v-bind:value="expire" @change="expire = $event.target.value">
          </fg-input>
          <fg-input type="password" label="密碼(mnemonic)" placeholder="Mnemonic" v-bind:value="ipfs_mnemonic" @change="ipfs_mnemonic = $event.target.value">
          </fg-input>

          <fg-input type="text" label="證書代碼(ipfshash)" placeholder="Mnemonic" :disabled="true" v-bind:value="ipfshash">
          </fg-input>
          <button class="btn btn-info btn-fill" @click.prevent="getTmpCert">申請時效性證書</button>
        </div>
      </div>
    </div>


    <modal name="modal-user" height='auto' :clickToClose="false" :adaptive="true">
      <div>
        <h3 style="text-align:center">正在驗證申請人</h3>
        <spinner size="medium" message="請稍後..."></spinner>
      </div>
      <br>
    </modal>


    <modal name="modal-ipfs" height='auto' :clickToClose="false" :adaptive="true">
      <div>
        <h3 style="text-align:center">正在產生暫時性證書</h3>
        <spinner size="medium" message="請稍後..."></spinner>
      </div>
      <br>
    </modal>
    <div v-if="!NotSubmit" class="col-md-12">
      <div class="card">
        <ipfs-table :ipfshash="TmpIPFS" :prvKey="TmpKey" :sttime="sttime" :edtime="edtime" :qrcode="qrPngBase64">
        </ipfs-table>
      </div>
    </div>
    <div v-if="isShowAll" class="col-md-12">
      <div class="card">
        <paper-table :title="tempCertTable.title" :sub-title="tempCertTable.subTitle" :data="tempCertTable.data"
          :columns="tempCertTable.columns" :chtcolumns="tempCertTable.chtcolumns">
        </paper-table>
      </div>
    </div>
    <div class="text-center">
       <button type="submit" class="btn btn-info btn-fill btn-wd" @click.prevent="showAllTempCert">
        {{isShowAll?'關閉已申請證書':'查看已申請證書'}}
      </button>
    </div>
  </div>
  
</template>
<script>
  import PaperTable from "components/UIComponents/PaperTable2.vue";
  import ipfsTable from "components/UIComponents/ipfsTable.vue";
  import CertDetailTable from "components/UIComponents/CertDetailTable.vue";
  import Spinner from "vue-simple-spinner";
  import {
    APISRV,
    GetAPIURL
  } from "src/axios";
  import {
    getAddr
  } from "src/sign.js";
  import {
    aes_ipfsencrypt,
    aes_decrypt,
    HASH_SHA256
  } from "src/encryptipfs";
  import qr from 'qr-image'
  let APIURL;
  const tableColumns = ["Id", "Date", "Name", "Description", "Detail"];
  const tablechtcolumns = ["證書ID", "發行日期", "發行名稱", "描述", "內容瀏覽"];
  const detailTableColumns = [
    "Id",
    "Ver",
    "Date",
    "Name",
    "Description",
    "Owneraddr",
    "Issueaddr",
    "Signeraddr"
  ];
  const detailTablechtcolumns = [
    "證書ID",
    "發行版本",
    "發行日期",
    "發行名稱",
    "描述",
    "擁有人位址",
    "發起人位址",
    "簽署人位址"
  ];

  const allTempCertCol = ["hash", "key", "expire"];
  const allTempCertChtCol = ["檔案位址", "密碼", "有效期限"];

  function CertInfo(id, date, name, description, detail) {
    this.id = id;
    this.date = date;
    this.name = name;
    this.description = description;
    this.detail = detail;
  }

  function CertDetailInfo(id, ver, date, name, description, owneraddr, issueaddr, signeraddr, ipfshash) {
    this.id = id;
    this.ver = ver;
    this.date = date;
    this.name = name;
    this.description = description;
    this.owneraddr = owneraddr;
    this.issueaddr = issueaddr;
    this.signeraddr = signeraddr;
    this.ipfshash = ipfshash;
  }

  function paddingLeft(str, length) {
    if (str.length >= length) return str;
    else return paddingLeft("0" + str, length);
  }

  export default {
    props: {
      contractAddr: Object,
      userInfo: Object
    },
    components: {
      PaperTable,
      CertDetailTable,
      ipfsTable,
      Spinner
    },
    data() {
      return {
        OwnerAddr: "",
        expire: "",
        ipfs_mnemonic: "",
        TmpKey: "",
        TmpIPFS: "",
        sttime: "",
        edtime: "",
        certListTable: {
          title: "申請時效性驗證證書",
          subTitle: "以下為您所擁有的證書，點擊'查看'即可申請",
          columns: [...tableColumns],
          chtcolumns: [...tablechtcolumns],
          UserCerts: []
        },
        certDeailTable: {
          title: "證書詳細資訊",
          subTitle: "與證書相關的資訊",
          columns: [...detailTableColumns],
          chtcolumns: [...detailTablechtcolumns],
          data: []
        },
        tempCertTable: {
          title: "臨時性證書",
          subTitle: "已申請的臨時性驗證用證書",
          columns: [...allTempCertCol],
          chtcolumns: [...allTempCertChtCol],
          data: []
        },
        certDeailInfos: {},
        isShowDetail: false,
        NotSubmit: true,
        qrPngBase64: '',
        isShowAll: false
      };
    },
    created: async function () {
        APIURL = await GetAPIURL();
        const _this = this;

        var body = {
          contractname: this.contractAddr.cert2,
          idIssuer: 0,
          idSubject: 1,
          useraddr: this.userInfo.address
        };
        var res = await APISRV.post(APIURL + "/cert/get-user-certid", body);
        const certIDList = res.data.userinfo;

        certIDList.forEach(async function (certID, index, ar) {
          body = {
            idIssuer: 0,
            idSubject: 1,
            certID: certID,
            owner: _this.userInfo.address,
            contractname: _this.contractAddr.cert2
          };
          var res = await APISRV.post(
            APIURL + "/cert/sign/get-certinfo-bycertID",
            body
          );
          const resCertInfo = res.data;
          console.log(resCertInfo);
          _this.ipfshash = resCertInfo.IpfsHash;
          var certIDLength8 = paddingLeft(certID, 8);
          body = {
            contractname2: _this.contractAddr.certDB,
            idIssuer: 0,
            idSubject: 1,
            signerID: resCertInfo.Signerid[0],
            owneraddr: _this.userInfo.address,
            certID: certIDLength8,
            signeraddr: resCertInfo.SignerAddr[0]
          };
          var downloadMode;
          var detailMode;
          try {
            var res = await APISRV.post(
              APIURL + "/cert/sign/checkdownloadpermission",
              body
            );
            console.log("checkdownloadpermission: " + res.data);
            detailMode = "查看";
            downloadMode = "下載";
          } catch (e) {
            console.log("checkdownloadpermission Error");
            detailMode = "尚未簽署";
            downloadMode = "尚未簽署";
          }

          var issueDate = new Date(parseInt(resCertInfo.timestamp));
          var dateFormat =
            issueDate.getFullYear() +
            "/" +
            ("0" + (issueDate.getMonth() + 1)).slice(-2) +
            "/" +
            ("0" + issueDate.getDate()).slice(-2) +
            " " +
            ("0" + issueDate.getHours()).slice(-2) +
            ":" +
            ("0" + issueDate.getMinutes()).slice(-2) +
            ":" +
            ("0" + issueDate.getSeconds()).slice(-2);
          if (detailMode !== "尚未簽署") {
            _this.certListTable.UserCerts.push(
              new CertInfo(
                certID,
                dateFormat,
                resCertInfo.certname,
                resCertInfo.description,
                detailMode
              )
            );
            _this.certDeailInfos[certID] = new CertDetailInfo(
              certID,
              resCertInfo.version,
              dateFormat,
              resCertInfo.certname,
              resCertInfo.description,
              resCertInfo.OwnerAddr,
              resCertInfo.IssuerAddr,
              resCertInfo.SignerAddr[0]
            );
          }
          _this.OwnerAddr = resCertInfo.OwnerAddr;
        });
      },
      methods: {
        async checkMnemonic(mnemonic) {
          var ethaddr = await getAddr(mnemonic);
          if (ethaddr !== this.OwnerAddr || this.OwnerAddr !== this.userInfo.address) {
            alert("輸入密碼(mnemonic)錯誤");
            return false;
          } else {
            return true;
          }
        },
        async createTempIpfs() {
          var body = {
            hash: this.ipfshash,
            role: 1
          };
          var resp = await APISRV.post(APIURL + "/datasrc/db/ipfshash", body);
          console.log("resp = ", resp);
          if (resp.data === "OK") {
            alert("檔案不存在");
            this.ipfs_mnemonic = "";
            this.expire = "";
            return;
          } else {
          
            var file = resp.data.toString("base64");
            var date = new Date();
            this.sttime =
              date.getYear() +
              1900 +
              "/" +
              date.getMonth() + 1 +
              "/" +
              date.getDate();
            console.log("sttime = ", this.sttime);
            date.setDate(date.getDate() + parseInt(this.expire));
            this.edtime =
              date.getYear() +
              1900 +
              "/" +
              date.getMonth() + 1 +
              "/" +
              date.getDate();
            console.log("sttime = ", this.edtime);
            // console.log("TmpKey = ",Tmpkey);

            //decrypt
            var secretkey = HASH_SHA256("nchc");
            console.log("secertkey = ", secretkey);
            var plain = aes_decrypt(file, secretkey);
            // console.log("plain = ",plain)
            //encrypt
            var cipher = aes_ipfsencrypt(plain, this.ipfs_mnemonic);
            // console.log("front end cipher = ",cipher.cipher)
            this.TmpKey = cipher.key;
            console.log("tmpkey = ", this.TmpKey);
            body = {
              file: cipher.cipher, //cipher in base64 mode
              expire: this.expire,
            };
            var resp = await APISRV.post(APIURL + "/datasrc/db/ipfsupload", body);
            console.log("resp = ", resp);
            this.TmpIPFS = resp.data.split(",")[2];

            body = {
              useraddr: this.userInfo.address
            };
            var resp = await APISRV.post(APIURL + "/datasrc/db/get-temp-cert", body);
            var tempCtrlIpfs = resp.data;
            console.log("tempCtrlIpfs:", tempCtrlIpfs);
            if(tempCtrlIpfs== ''){ //臨時性證書尚未創建
              var tempCertObj = [{
                hash: this.TmpIPFS,
                key: this.TmpKey,
                expire: this.edtime
              }];
              var JSONcert = JSON.stringify(tempCertObj);
            } else { //已存在臨時性證書
                var body = {
                hash: tempCtrlIpfs
              };
              var resp = await APISRV.post(APIURL + "/datasrc/db/get-string-ipfs", body);
              console.log("getTempIPFS:", resp.data);
              var tempCertObj = JSON.parse(resp.data);
              tempCertObj.push({
                hash: this.TmpIPFS,
                key:this.TmpKey,
                expire: this.edtime
              })
              console.log(tempCertObj)
              var JSONcert = JSON.stringify(tempCertObj);
            }

            body = {
              useraddr: this.userInfo.address,
              file: JSONcert,
            };
            var resp = await APISRV.post(APIURL + "/datasrc/db/update-temp-cert", body);
            console.log("update-temp-cert:", resp.data);

            //-------- QRCODE --------
            var thisurl = window.location.href;
            var index = thisurl.lastIndexOf('/');
            const localUrl = thisurl.substring(0, index + 1);
            const qrCodeUrl = localUrl + 'ipfsverify?ipfs=' + this.TmpIPFS;
            console.log(qrCodeUrl);
            const qrPng = qr.imageSync(qrCodeUrl, {
              type: 'png'
            });
            this.qrPngBase64 = "data:image/png;base64," + qrPng.toString('base64')
            //------------------------

            this.NotSubmit = false;
          }
        },
        async getTmpCert() {
          var _this = this;
          this.ipfs_mnemonic = this.ipfs_mnemonic.trim();
          this.expire = this.expire.trim();
          var expire = parseInt(this.expire);
          if (!Number.isInteger(expire) || expire <= 0 || expire > 7) {
            this.expire = "";
            alert("輸入有效期間必須為1-7天");
            return;
          }
          //verify user
          this.$modal.show("modal-user");
          setTimeout(async () => {
            var correct = await _this.checkMnemonic(this.ipfs_mnemonic);
            _this.$modal.hide("modal-user");
            if (correct) {            
              _this.$modal.show("modal-ipfs");
              setTimeout(async () => {
                await _this.createTempIpfs();
                _this.$modal.hide("modal-ipfs");
              }, 100);
            }
          }, 100);
        },
        async showCertDeail(certID) {
          this.isShowDetail = false;
          this.certDeailTable.data = [];
          this.certDeailTable.data.push(this.certDeailInfos[certID]);
          this.isShowDetail = true;
        },
        async showAllTempCert() {
          body = {
              useraddr: this.userInfo.address
            };
            var resp = await APISRV.post(APIURL + "/datasrc/db/get-temp-cert", body);
            var tempCtrlIpfs = resp.data;
            console.log("tempCtrlIpfs:", tempCtrlIpfs);
            this.isShowAll=!this.isShowAll;
            if(tempCtrlIpfs== ''){
              
            } else { //已存在臨時性證書
              var body = {
                hash: tempCtrlIpfs
              };
              var resp = await APISRV.post(APIURL + "/datasrc/db/get-string-ipfs", body);
              var tempCertObj = JSON.parse(resp.data);
              this.tempCertTable.data = tempCertObj;
              console.log(tempCertObj);

            }
        }
      }
  };

</script>

<style>
  #keyinpw {
    display: inline-block;
    vertical-align: middle;
    margin-left: 20px;
  }

</style>
