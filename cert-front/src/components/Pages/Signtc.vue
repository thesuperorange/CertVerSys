<template>
    <div class="row">
    <br><br>
      <div class="col-md-12">
        <div class="card">
        <div class="content">
          <div class="row">
            <div class="col-md-3">發行版本:</div><div class="col-md-5">{{ certinfo.version }} </div>
          </div>
          <div class="row">
            <div class="col-md-3">證書名稱:</div><div class="col-md-5">{{ certinfo.name }} </div>
          </div>
          <!-- <div class="row">
            <div class="col-md-3">revocation:</div><div class="col-md-5">{{ certinfo.revocation }} </div>
          </div> -->
          <div class="row">
            <div class="col-md-3">證書說明:</div><div class="col-md-5">{{ certinfo.description }} </div>
          </div>
          <div class="row">
            <div class="col-md-3">發起人位址:</div><div class="col-md-5">{{ certinfo.address }} </div>
          </div>
        </div>
        </div>
      </div>
      <div class="col-md-12">
        <div class="card">
          <table-cert-list 
            :title="signTable.title" 
            :sub-title="signTable.subTitle" 
            :data="signTable.data" 
            :columns="signTable.columns" 
            :chtcolumns="signTable.chtcolumns"
            v-on:updateSelectd="updateSelect"
            v-bind:signed="signedList"
            :pdfbase64="pdfbase64">
          </table-cert-list>
        </div>
        <div class="card">
          <div style="display: inline-block; height: 50px; margin-left:20px; margin-top:10px; vertical-align:middle;">請輸入密碼：</div>
          <div id="keyinpw">
            <!-- <input type="text"  v-model="mnemonic" v-if="showpw"> -->
            <input type="password"  v-model="mnemonic">
            <!-- <span class="glyphicon glyphicon-eye-open"></span>
            <input type="checkbox" class='hide'  v-model="showpw"> -->
          </div>
        </div>
      </div>
       <!-- <div class="clearfix" id='jwsfile'></div> -->
      
      <div class="text-center">
        <button type="submit" class="btn btn-info btn-fill btn-wd" :class="{disabled: btn_disable}" @click.prevent="signCert()">
          確認簽署
        </button>
      </div>

      <modal name="modal-getcert" height='auto' :clickToClose="false" :adaptive="true">
        <div class="text-center">
          <h3>讀取證書列表中</h3>
          <spinner size="medium" message="請稍後..."></spinner>
        </div>
        <br>
      </modal>

      <modal name="modal-signcert" height='auto' :clickToClose="false" :adaptive="true">
        <div v-if="btn_disable" class="text-center">
          <h3>正在簽署並寫入區塊鏈</h3>
          <spinner size="medium" :message="'請稍後...(' + signCount + '/' + selectedCount +')'"></spinner>
        </div>
        <div v-else class="text-center">
          <h3 style="text-align:center">證書已簽署完畢</h3>
          <p>{{ '完成(' + signCount + '/' + selectedCount +')' }}</p>
          <button type="button" class="btn btn-info" @click="$router.push({ path: 'signinfo' });">&nbsp;&nbsp;確定&nbsp;&nbsp;</button>
        </div>
        <br>
      </modal>
    </div>
</template>

<script>
  import { APISRV, GetAPIURL } from 'src/axios'
  import TableCertList from 'components/UIComponents/SigntcTable.vue'
  import { signJson, verifyByKjur } from 'src/sign.js'
  import Spinner from "vue-simple-spinner";
  let APIURL
  
  //const tableColumns = ['Owneraddr','Certhash', 'Jsonhash1', 'Issueraddr', 'Date']
  //const tablechtcolumns =['擁有人地址','證書發行hash','Jsonhash', '合約地址', '發行日期']
  const tableColumns = ['Certid', 'Ownername', 'Ownerstudentid', 'Owneraddr', 'Issueraddr', 'Date']
  const tablechtcolumns =['證書ID','擁有人姓名', '擁有人學號', '擁有人地址', '發起人地址', '發行日期']
 
  let ownerAddr
  function paddingLeft(str,length){
    if(str.length >= length)
    return str;
    else
    return paddingLeft("0" +str,length);
  }

  let _this;

  export default {
    props: {
      contractAddr: Object,
      userInfo: Object
    },
    components: {
      TableCertList,
      Spinner
    },
    data () {
      return {
        signTable: {
          title: '本次發行文件列表',
          subTitle: '本次預計發行的文件，包含 畢業證書、成績單、獎狀等',
          columns: [...tableColumns],
          chtcolumns: [...tablechtcolumns],
          data: []
        },
        certinfo: {
          version: '',
          name: '',
          revocation: '',
          description: '',
          address: ''
        },
        mnemonic: '',
        showpw: false,
        btn_disable: true,
        issueID: 0,
        certIDs: [],
        certJsons: [],
        checkCerts: [],
        ownerAddrs:[],
        signedList:[],
        pdfbase64: {},
        signCount: 0,
        selectedCount: 0,
        ownerInfo: []
      }
    },

    created: async function () {
      APIURL = await GetAPIURL();
      _this = this;
      this.$modal.show("modal-getcert");      
      this.issueID  = this.$route.query.issueID;
      console.log('issueID: ' + this.issueID);
      var body = {
        idIssuer: 0,
        idSubject: 1,
        contractname: this.contractAddr.cert2,
        issueid: this.issueID
      }
      var resp = await APISRV.post( APIURL + '/cert/sign/get-certInfo-in-issue', body);
      var thissigned = resp.data[4];

      resp = await APISRV.post( APIURL + '/cert/sign/get-certID-in-issue', body);
      this.certIDs = resp.data;
      //get cert info by certID
      console.log(this.certIDs);
      for(var certID of this.certIDs) {
        if(thissigned.indexOf(certID) != -1) {
          this.signedList.push(true);
        } else {
          this.signedList.push(false);
        }
        body = {
          idIssuer: 0,
          idSubject: 1,
          certID: certID,
          owner: '',
          contractname: this.contractAddr.cert2
        }
        resp = await APISRV.post( APIURL + '/cert/sign/get-certinfo-bycertID', body);
        const resCertInfo = resp.data;
        console.log(resCertInfo);

        //讀取擁有人資訊
        var body = {
          idIssuer: 0,
          idSubject: 1, 
          contract: this.contractAddr.certDB,
          userInfo: {
            userID: resCertInfo.userid, 
            orgID: 0,  
            classID: '',
            role: 0,
            address: '',
          }
        }
        resp = await APISRV.post( APIURL + '/cert/get-user-info', body);
        const userInfo = resp.data.userinfo_in_sc;

        // 填入顯示訊息
        ownerAddr = resCertInfo.OwnerAddr;
        this.ownerAddrs.push(ownerAddr);
        this.certinfo = {"revocation":resCertInfo.revocation, "description":resCertInfo.description , "version":resCertInfo.version, "name":resCertInfo.certname, "address":resCertInfo.IssuerAddr};
        var issueDate = new Date(parseInt(resCertInfo.timestamp));
        var dateFormat = issueDate.getFullYear()+'/'+('0'+(issueDate.getMonth() + 1)).slice(-2)+'/'+('0'+issueDate.getDate()).slice(-2)+
                      ' '+('0'+issueDate.getHours()).slice(-2)+':'+('0'+issueDate.getMinutes()).slice(-2)+':'+('0'+issueDate.getSeconds()).slice(-2);
        var detail = {certid:certID, ownername:userInfo[4], ownerstudentid:userInfo[5],  owneraddr:resCertInfo.OwnerAddr, issueraddr:resCertInfo.IssuerAddr, date:dateFormat};
        this.signTable.data.push(detail)

        //get cert json by jsonpath
        var certIDLength8 = paddingLeft(certID, 8);
        body = {
          jsonpath: './json/' + ownerAddr + certIDLength8 + '.json'
        }
        console.log('./json/' + ownerAddr + certIDLength8 + '.json')
        resp = await APISRV.post( APIURL + '/cert/sign/get-json', body);
        console.log(resp.data);
        this.certJsons.push(resp.data);
      }
      console.log(this.ownerInfo);
      console.log(this.certJsons);
      this.getPdfData ();
      this.$modal.hide("modal-getcert");
      this.btn_disable = false;
    },
    methods: {
      signCert: function () {
        let isSuccess;
        if(_this.mnemonic === '') {
          alert("請填入密碼");
          return
        }
        var isSelected;
        for(var select of _this.checkCerts) {
          if(select){
            isSelected = true;
            break;
          }
        }
        if(!isSelected) {
          alert("您尚未選取任何證書");
          return
        }
        this.$modal.show("modal-signcert");
        this.btn_disable = true;
        this.signCount = 0;
        setTimeout(async function() {
          for(var index in _this.checkCerts){
            if(_this.checkCerts[index] != true) {
              continue;
            }
            const path = "m/2018'/5'/1'/0";
            const type = "secp256r1";
            var sJWS = signJson(_this.mnemonic, _this.certJsons[index], path, type);
            console.log('sJWS: ' + sJWS);
            var certIDLength8 = paddingLeft(_this.certIDs[index], 8);
            var body = {
              contractname: _this.contractAddr.cert2,
              contractname2: _this.contractAddr.certDB,
              signerID: _this.userInfo.userID,
              idIssuer: 0,
              idSubject: 1,
              owneraddr: _this.ownerAddrs[index],
              certID: certIDLength8,
              issueid: _this.issueID,
              sJWS: sJWS,
              signeraddr: _this.userInfo.address,
            }
            var resp = await APISRV.post( APIURL + '/cert/sign/signsig', body)
            isSuccess = resp.data;
            console.log(isSuccess);
            if(isSuccess === "true") {
              _this.$set(_this.signedList, index, true);
              _this.signCount++
            } else {
              alert(certIDLength8 + " 簽署失敗!!");
              break;
            }
          }
          _this.btn_disable = false;
          if(isSuccess === "true") {
            setTimeout(async function() {
              //_this.$modal.hide("modal-signcert");
              _this.btn_disable = false;
            },100); 
            //_this.$router.push({ path: 'signinfo' });
          }
        },50);

      },
      updateSelect(checkCerts){
        this.checkCerts = checkCerts;
        this.selectedCount = 0;
        for(var index in this.checkCerts) {
          if(this.checkCerts[index])
            this.selectedCount += 1;
          console.log(this.selectedCount);
        }
      },
      async getPdfData () {
        console.log('getPdfData');
        let certpath;
        for(var cerinfo of this.signTable.data) {
          var certIDLength8 = paddingLeft(cerinfo.certid, 8);
          certpath = './cert/' + cerinfo.owneraddr + certIDLength8 + '.pdf';
          const body = {
            pdfpath: certpath
          }
          var resp = await APISRV.post( APIURL + '/cert/sign/get-pdf', body);
          const pdfBase64 = resp.data;
          this.$set(this.pdfbase64, cerinfo.owneraddr, "data:application/pdf;base64," + pdfBase64);
        }
      }
    }
  }

</script>
<style>
    #keyinpw{
        display: inline-block;
        vertical-align:middle;
        margin-left:20px;
    }
    /* input[type=text],input[type=password]{
        width:260px;
        height:28px;
        display: inline-block;
    } */
    span{
        margin-left:-30px;
        cursor: pointer;
    }
    input[type=checkbox].hide{
        cursor: pointer;
        opacity: 0;
        margin-left:-18px;
        display: inline-block;
    }
</style>
