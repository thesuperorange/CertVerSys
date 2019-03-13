<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="header">
            <div class="col-xs-2">
              <div class="icon-big text-center icon-success"><i class="ti-server"></i></div>
            </div>
            <br>
            <div class="col-xs-10">
              <h4 class="title" slot="title">簡介</h4>
              <span slot="subTitle">お知らせ<br><br></span>
            </div>
          </div>
          <div class="content">
            <div>
              1. 以下證書為申請撤銷並要求您簽名的清單<br>
              2. 所有撤銷簽核人員、紀錄都會記錄在區塊鏈上<br>
              3. 因區塊鏈不可篡改性，因此所有記錄將無法刪除，簽核請謹慎 <br>
              4. 若沒有問題請盡快簽核<br>
            </div>
            <div class="footer">
              <div class="chart-legend"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <paper-table :title="certListTable.title" :sub-title="certListTable.subTitle" :data="certListTable.UserCerts"
            :columns="certListTable.columns" :chtcolumns="certListTable.chtcolumns" :contractAddr="contractAddr"
            :userInfo="userInfo" @showDetail="showCertDetail">
          </paper-table>
        </div>
      </div>
    </div>

    <div class="row">
      <div v-if="isShowDetail" class="col-md-12">
        <div class="card">
          <cert-detail-table :title="certDeailTable.title" :sub-title="certDeailTable.subTitle" :data="certDeailTable.data"
            :columns="certDeailTable.columns" :chtcolumns="certDeailTable.chtcolumns">
          </cert-detail-table>
          <br>
          <table class="text-center" style="margin:0px auto;">
            <tr>
              <td class="groove padfive">簽章人位址</td>
              <td class="groove padfive">簽章狀況</td>
            </tr>
            <tr v-for="(item,index) in Queuingbool">
              <td class="groove padfive">{{item.addr}}</td>
              <td class="groove padfive">{{item.bool}}</td>
            </tr>
          </table>
          <br>
        </div>
        <div v-if="needsign">
          <div style="display: inline-block; height: 50px; margin-left:20px; margin-top:10px; vertical-align:middle;">請輸入密碼：</div>
          <div id="keyinpw">
            <input type="password" v-model="Revoke_mnemonic">
          </div>
          <button class="btn btn-info btn-fill" @click.prevent="RevokeSign">簽核</button>
        </div>
      </div>
    </div>
    <modal name="modal-signRevoke" height='auto' :clickToClose="false" :adaptive="true">
      <div>
        <h3 style="text-align:center">正在簽署撤銷證書</h3>
        <spinner size="medium" message="請稍後..."></spinner>
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
  import {
    getAddr,
    SignString,
    getPubKey
  } from "src/sign.js";
  import Spinner from "vue-simple-spinner";
  import PaperTable from "components/UIComponents/PaperTable2.vue";
  import CertDetailTable from "components/UIComponents/CertDetailTable.vue";

  const tableColumns = ["Id", "Date", "Name", "isRevoc", "detail"];
  const tablechtcolumns = [
    "證書ID",
    "發行日期",
    "發行名稱",
    "是否撤銷",
    "內容瀏覽"
  ];
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

  let APIURL;

  function CertInfo(id, date, name, isRevoc, detail) {
    this.id = id;
    this.date = date;
    this.name = name;
    this.isrevoc = isRevoc;
    this.detail = detail;
  }

  function CertDetailInfo(
    id,
    ver,
    date,
    name,
    description,
    owneraddr,
    issueaddr,
    signeraddr,
    ipfshash
  ) {
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
      Spinner,
      PaperTable,
      CertDetailTable
    },
    data() {
      return {
        certListTable: {
          title: "待簽核證書列表",
          subTitle: "以下證書撤銷需您簽核，請盡快簽核",
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
        certDeailInfos: {},
        Revoke_mnemonic: "",
        PlainString: "",
        isShowDetail: false,
        Queuingbool: [], //待簽核bool
        needsign: false,
        revokeCertID: 0
      };
    },
    created: async function () {
        APIURL = await GetAPIURL();
        var body = {
          TeacherAddr: this.userInfo.address
        };
        var res = await APISRV.post(APIURL + "/datasrc/db/dumpRevokeList", body);
        var data = res.data;
        var len = data.certName.length;
        for (var i = 0; i < len; i++) {
          var body = {
            idIssuer: 0,
            idSubject: 1,
            certID: data.certID[i],
            owner: this.userInfo.address,
            contractname: this.contractAddr.cert2
          };
          var res = await APISRV.post(APIURL + "/cert/sign/get-certinfo-bycertID", body);
          const resCertInfo = res.data;
          console.log(resCertInfo);
          var certIDLength8 = paddingLeft(data.certID[i], 8);
          body = {
            contractname2: this.contractAddr.certDB,
            idIssuer: 0,
            idSubject: 1,
            signerID: resCertInfo.Signerid[0],
            owneraddr: this.userInfo.address,
            certID: certIDLength8,
            signeraddr: resCertInfo.SignerAddr[0]
          };
          var tmp = "";
          if (data.isRevoc[i] === false) tmp = "否";
          else tmp = "是";

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
          this.certListTable.UserCerts.push(
            new CertInfo(
              data.certID[i],
              dateFormat,
              resCertInfo.certname,
              tmp,
              "查看"
            )
          );
          this.certDeailInfos[data.certID[i]] = new CertDetailInfo(
            data.certID[i],
            resCertInfo.version,
            dateFormat,
            resCertInfo.certname,
            resCertInfo.description,
            resCertInfo.OwnerAddr,
            resCertInfo.IssuerAddr,
            resCertInfo.SignerAddr[0]
          );
          this.ipfshash = resCertInfo.IpfsHash;
          this.OwnerAddr = resCertInfo.OwnerAddr;
        }
      },
      methods: {
        async showCertDetail(certID) {
          this.revokeCertID = certID;
          this.isShowDetail = false;
          this.certDeailTable.data = [];
          this.certDeailTable.data.push(this.certDeailInfos[certID]);
          this.isShowDetail = true;
          // dump data
          var body = {
            revokehash: this.ipfshash
          };

          var resp = await APISRV.post(APIURL + "/datasrc/db/DumpRevokeData", body);
          console.log(resp.data)
          var dumpInfo = resp.data;
          this.PlainString = dumpInfo.PlainString;
          this.Queuingbool = [];
          for (var i = 0; i < dumpInfo.confirm_Status.length; i++) {
            var tmp = {
              addr: dumpInfo.Teacher_Address[i],
              bool: ""
            };
            if (dumpInfo.confirm_Status[i] === true) {
              tmp.bool = "是";
            } else {
              if (dumpInfo.Teacher_Address[i] === this.userInfo.address) {
                this.needsign = true;
              }
              tmp.bool = "否";
            }
            this.Queuingbool.push(tmp);
          }
        },
        async RevokeSign() {
          var _this = this;
          _this.$modal.show("modal-signRevoke")
          setTimeout(async() => {
            var output = SignString(_this.Revoke_mnemonic, _this.PlainString);
            var pubKey = getPubKey(_this.Revoke_mnemonic);
            console.log(_this.contractAddr.cert2)
            var body = {
              contractname: _this.contractAddr.cert2,
              certID: _this.revokeCertID
            };
            var res = await APISRV.post(APIURL + "/cert/sign/revokeToCertInfo", body);
            console.log(res.data)
            var body = {
              signfile: _this.ipfshash,
              Addr: _this.userInfo.address,
              SignedString: output,
              plain: _this.PlainString,
              pubkey: pubKey
            };
            var res = await APISRV.post(APIURL + "/datasrc/db/TeacherSig", body);
            
            _this.$modal.hide("modal-signRevoke");
            alert("證書撤銷，簽署成功");
            _this.$router.go(0);
          }, 100);
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

  td.groove {
    border: groove;
  }

  td.padfive {
    padding: 5px 10px;
  }

</style>
