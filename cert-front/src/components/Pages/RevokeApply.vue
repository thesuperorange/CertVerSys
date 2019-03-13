<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="header">
            <div class="col-xs-2">
              <div class="icon-big text-center icon-success"><i class="ti-id-badge"></i></div>
            </div>
            <br>
            <div class="col-xs-10">
              <h4 class="title" slot="title">注意事項</h4>
              <span slot="subTitle">お知らせ<br><br></span>
            </div>
          </div>
          <div class="content">
            <div>
              1. 區塊鏈證書撤銷紀錄是永存，無法更改<br>
              2. 撤銷的證書會紀錄發起人、簽署人的地址，故會對此撤銷行為負責 <br>
              3. 撤銷的證書將沒有任何辦法取回，需要的話需重新發起一份 <br>
            </div>
            <div class="footer">
              <div class="chart-legend"></div>
              <hr>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <sign-table :title="issueTable.title" :sub-title="issueTable.subTitle" :data="issueTable.data" :columns="issueTable.columns"
            :chtcolumns="issueTable.chtcolumns" @clickItem="showCertList">
          </sign-table>
        </div>
        <div class="card">
          <cert-detail-table v-if="isShowCertList" :title="certTable.title" :sub-title="certTable.subTitle" :data="certTable.data"
            :columns="certTable.columns" :chtcolumns="certTable.chtcolumns">
          </cert-detail-table>
          <div v-if="isShowCertList">
            <div class="col-md-6">
              <fg-input type="text" label="證書代碼(ipfshash)" placeholder="Mnemonic" :disabled="true" v-bind:value="ipfshash">
              </fg-input>
            </div>
            <div class="col-md-6">
              <fg-input type="password" label="密碼(mnemonic)" placeholder="Mnemonic" v-bind:value="Revoke_mnemonic"
                @change="Revoke_mnemonic = $event.target.value">
              </fg-input>
            </div>
            <div class="col-md-12">
              <fg-input type="text" label="撤銷理由" placeholder="撤銷理由" v-bind:value="RevokeReason" @change="RevokeReason = $event.target.value">
              </fg-input>
            </div>
            <div class="col-md-12">
              <h4>請選擇簽章人數</h4>
              <select required v-model="selected">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
              </select>
            </div>
            <div class="col-md-12">
              <fg-input type="text" label="簽章人位址" placeholder="簽章人位址" v-bind:value="SignAddr" @change="SignAddr = $event.target.value">
              </fg-input>
            </div>
            <div v-if="selected>1" class="col-md-12">
              <fg-input type="text" label="簽章人位址" placeholder="簽章人位址" v-bind:value="SignAddr2" @change="SignAddr2 = $event.target.value">
              </fg-input>
            </div>
            <div v-if="selected>2" class="col-md-12">
              <fg-input type="text" label="簽章人位址" placeholder="簽章人位址" v-bind:value="SignAddr3" @change="SignAddr3 = $event.target.value">
              </fg-input>
            </div>
            <div v-if="selected>3" class="col-md-12">
              <fg-input type="text" label="簽章人位址" placeholder="簽章人位址" v-bind:value="SignAddr4" @change="SignAddr4 = $event.target.value">
              </fg-input>
            </div>
            <div v-if="selected>4" class="col-md-12">
              <fg-input type="text" label="簽章人位址" placeholder="簽章人位址" v-bind:value="SignAddr5" @change="SignAddr5 = $event.target.value">
              </fg-input>
            </div>
            <button class="btn btn-info btn-fill" @click.prevent="RevokeApply">申請證書撤銷</button>
          </div>
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
    <modal name="modal-revoke" height='auto' :clickToClose="false" :adaptive="true">
      <div v-if="!revokeFinish" class="text-center">
        <h3>撤銷證書申請中</h3>
        <spinner size="medium" :message="'請稍後...'"></spinner>
      </div>
      <div v-else class="text-center">
        <h3 style="text-align:center">{{ RevokeStatus }}</h3>
        <p></p>
        <button type="button" class="btn btn-info" @click="$router.push({ path: 'revoketrace'});">&nbsp;&nbsp;確定&nbsp;&nbsp;</button>
      </div>
      <br>
    </modal>
  </div>
</template>
<script>
  import {
    APISRV,
    GetAPIURL
  } from "src/axios";
  import SignTable from "components/UIComponents/IssueListTable.vue";
  import CertTable from "components/UIComponents/CertListTable.vue";
  import CertDetailTable from "components/UIComponents/CertDetailTable.vue";
  import {
    getAddr,
    SignString
  } from "src/sign.js";
  import Spinner from "vue-simple-spinner";
  let APIURL;

  //未簽核列表(master)
  const issueInfoCol = ["Id", "Date", "Name", "Desc"];
  const issueInfoChtCol = ["發行編號", "發行日期", "發行名稱", "描述"];

  const certInfoCol = [
    "Id",
    "CertName",
    "Date",
    "Owner",
    "IssuerAddr",
    "signerAddr",
    "Desc"
  ];
  const certInfoChtCol = [
    "發行編號",
    "證書名稱",
    "發行日期",
    "擁有人位址",
    "發起人位址",
    "簽署人位址",
    "描述"
  ];

  export default {
    props: {
      contractAddr: Object,
      userInfo: Object
    },
    components: {
      SignTable,
      CertTable,
      CertDetailTable,
      Spinner
    },
    data() {
      return {
        issueTable: {
          title: "與您相關的發行",
          subTitle: "這些發行的簽署人是您",
          columns: [...issueInfoCol],
          chtcolumns: [...issueInfoChtCol],
          data: []
        },
        certTable: {
          title: "",
          subTitle: "證書相關資訊",
          columns: [...certInfoCol],
          chtcolumns: [...certInfoChtCol],
          data: []
        },
        issueIDInfo: {},
        isShowCertList: false,
        showSignBtn: false,
        ipfshash: "",
        certName: "",
        RevokeReason: "",
        Revoke_mnemonic: "",
        SignerAddress: "",
        SignAddr: "",
        SignAddr2: "",
        SignAddr3: "",
        SignAddr4: "",
        SignAddr5: "",
        revokeFinish: false,
        RevokeStatus: "",
        RevokeCertID: "",
        selected: 1
      };
    },
    created: async function () {
        APIURL = await GetAPIURL();
        var body = {
          contractname2: this.contractAddr.cert2,
          idIssuer: 0,
          idSubject: 1,
          issueraddr: this.userInfo.address
        };
        var resp = await APISRV.post(APIURL + "/cert/sign/get-all-issueID-by-signer", body);
        const issueList = resp.data;
        for (const issueid of issueList) {
          body = {
            contractname: this.contractAddr.cert2,
            idIssuer: 0,
            idSubject: 1,
            issueraddr: this.userInfo.address,
            issueid: issueid
          };
          resp = await APISRV.post(
            APIURL + "/cert/sign/get-certInfo-in-issue",
            body
          );
          const issueInfo = resp.data;
          console.log(issueInfo);

          var issueinfoObj = {
            date: issueInfo[3],
            name: issueInfo[1],
            desc: issueInfo[2],
            certs: issueInfo[0],
            signedCert: issueInfo[4]
          };
          console.log("issueinfoObj = ", issueinfoObj);
          this.issueIDInfo[issueid] = issueinfoObj;

          var issueDate = new Date(parseInt(issueInfo[3]));
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
          if (issueInfo[4].length !== 0) {
            this.issueTable.data.push({
              id: issueid,
              date: dateFormat,
              name: issueInfo[1],
              desc: issueInfo[2]
            });
          }
        }
        console.log(this.issueIDInfo);
        //alert("證書撤銷後將記錄在區塊鏈上將無法恢復，申請前請再三確認");
      },
      methods: {
        async showCertList(issueID) {
          console.log("show CertList");
          this.issueID = issueID;
          console.log("click issue of id: ", issueID);
          this.isShowCertList = false;
          this.certTable.data = [];
          this.certTable.title = "證書撤銷資訊";
          const thisissue = this.issueIDInfo[issueID];

          for (var certid of thisissue.certs) {
            var body = {
              idIssuer: 0,
              idSubject: 1,
              certID: certid,
              owner: "",
              contractname: this.contractAddr.cert2
            };
            var resp = await APISRV.post(
              APIURL + "/cert/sign/get-certinfo-bycertID",
              body
            );
            var resCertInfo = resp.data;
            var ownerAddr = resCertInfo.OwnerAddr;
            var issueDate = new Date(parseInt(thisissue.date));
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
            console.log("IssuerID = ", resCertInfo.IssuerAddr);
            var certinfo = {
              id: certid,
              certname: resCertInfo.certname,
              date: dateFormat,
              owner: ownerAddr,
              issueraddr: resCertInfo.IssuerAddr,
              signeraddr: resCertInfo.SignerAddr[0],
              desc: thisissue.desc
            };
            if (thisissue.signedCert.indexOf(certid) != -1) {
              this.certTable.data.push(certinfo);
              this.ipfshash = resCertInfo.IpfsHash;
              this.SignerAddress = resCertInfo.SignerAddr[0];
              this.certName = resCertInfo.certname;
              this.RevokeCertID = certid;
            }
          }

          this.isShowCertList = true;
        },
        async showCertDeail(certID) {
          this.isShowDetail = false;
          this.certDeailTable.data = [];
          this.certDeailTable.data.push(this.certDeailInfos[certID]);
          this.isShowDetail = true;
        },
        async prepaerRevoke() {
          var TeacherAddr = [];
          switch (this.selected.toString()) {
            case "1":
              TeacherAddr.push(this.SignAddr);
              break;
            case "2":
              TeacherAddr.push(this.SignAddr);
              TeacherAddr.push(this.SignAddr2);
              break;
            case "3":
              TeacherAddr.push(this.SignAddr);
              TeacherAddr.push(this.SignAddr2);
              TeacherAddr.push(this.SignAddr3);
              break;
            case "4":
              TeacherAddr.push(this.SignAddr);
              TeacherAddr.push(this.SignAddr2);
              TeacherAddr.push(this.SignAddr3);
              TeacherAddr.push(this.SignAddr4);
              break;
            case "5":
              TeacherAddr.push(this.SignAddr);
              TeacherAddr.push(this.SignAddr2);
              TeacherAddr.push(this.SignAddr3);
              TeacherAddr.push(this.SignAddr4);
              TeacherAddr.push(this.SignAddr5);
              break;
          }
          var body = {
            filehash: this.ipfshash,
            CertName: this.certName,
            ApplierAddr: this.SignerAddress,
            TeacherAddr: TeacherAddr,
            reason: this.RevokeReason,
            RevokeCertID: this.RevokeCertID
          };
          console.log("body = ", body);

          var res = await APISRV.post(APIURL + "/datasrc/db/addRevokeList", body);
          console.log("res = ", res);
          if (res.data === "Cert Revoke already applied") {
            this.RevokeStatus = "證書已在撤銷申請，請勿重新申請";
          } else {
            this.RevokeStatus = "證書申請撤銷成功";
          }
          this.revokeFinish = true;
        },
        async checkMnemonic(mnemonic) {
          var ethaddr = await getAddr(mnemonic);
          if (ethaddr !== this.SignerAddress || ethaddr !== this.userInfo.address) {
            alert("輸入密碼(mnemonic)錯誤");
            return false;
          } else {
            return true;
          }
        },
        async RevokeApply() {
          var _this = this;
          if (
            this.Revoke_mnemonic === "" ||
            this.RevokeReason === "" ||
            this.SignerAddress === ""
          ) {
            alert("請確認資料都有輸入");
            return;
          }
          
          this.Revoke_mnemonic = this.Revoke_mnemonic.trim();
          this.$modal.show("modal-user");
          setTimeout(async () => {
            // verify user
            var correct = await _this.checkMnemonic(this.Revoke_mnemonic);
            _this.$modal.hide("modal-user");
            if (correct) {
              _this.$modal.show("modal-revoke");
              setTimeout(async () => {
                await _this.prepaerRevoke();
                //_this.$modal.hide("modal-revoke");
              }, 100);
            }
          }, 100);
        }
      }
  };

</script>
<style>
</style>
