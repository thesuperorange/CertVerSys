<template>
  <div class="row">
    <div v-if="showform">
    <div class="col-md-12">
      <div class="card">
        <div class="header">
          <h4 class="title"><span class="label label-success">基本資料確認 </span></h4>
        </div>
        <div class="content">
          <ul class="list-unstyled team-members">
            <li>
              <div class="row" >
                <div class="col-md-3">
                  <img src="static/img/faces/face-sample.png" class="imgRatioFull">
                </div>
                <div class="col-md-3">
                  <h5 class="title">
                    姓名：{{userinfo.userName}}
                    <br>
                    <span>
                      <small>帳號：{{userinfo.userIDOri}}</small>
                    </span>
                  </h5>
                    <hr>
                    <p class="description">身份：{{userinfo.role}}</p>
                    <p class="description">學校代碼：{{userinfo.schoolIDOri}} </p>
                    <p class="description">學校名稱：{{userinfo.schoolName}}</p> <!-- 補呼叫 教育局api -->
                    <p v-if="userinfo.role==='學生'" class="description">班級：{{userinfo.classTitle}} </p>
                  
                </div>
                <div class="col-md-5" v-if="userinfo.role==='學生'">
                  <h5>
                  </h5>
                  <button class="btn btn-sm btn-success btn-icon">
                    <i class="fa fa-graduation-cap"></i>
                  </button> 學號：
                  <input type='text' id="studentID" class='whiteRadius' palceholder="請輸入Eamil" v-model="userinfo.studentID">
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="card-footer">
          <hr> <div class="stats"></div>
        </div>
      </div>
    </div>
    <div class="col-md-12">
      <agreerule>
      </agreerule>
    </div>
    <div class="col-md-12">
      <h4 class="title"><span class="label label-danger">請勾選下列事項：</span></h4>
      <h5 class="title">
        <input id='check1' type="checkbox" v-model="checkUserInfo">確認基本資料無誤</input>
      </h5>
      <h5 class="title">
        <input id='check2' type="checkbox" v-model="checkAgreeAuth">同意授權條款</input>
      </h5>
    </div>

    <div class="text-center">
      <button v-if="hasContract" @click="createMnemonic" variant="primary" class="btn btn-info btn-fill btn-wd">下一步</button>
    </div>
    <div class="clearfix"></div>
    </div>

    <div v-if="showpwd" class="col-md-12">
      <p>注意：該密碼 僅會出現一次，請抄寫或 下載檔案，謝謝</p>
      <p>個人密碼：{{mnemonic}}</p>
      <button @click="downloadMnemonic" variant="primary" class="btn btn-info btn-fill btn-wd">檔案下載</button>
      <button @click="goUserinfoPage" variant="primary" class="btn btn-info btn-fill btn-wd">確認</button>
      <button @click="createMnemonic" variant="primary" class="btn btn-info btn-fill btn-wd">重新產生</button>
    </div>
    
    <modal name="modal-login" height='auto' :clickToClose="false" :adaptive="true">
      <div>
        <h3 style="text-align:center">使用者登入中</h3>
        <spinner size="medium" message="請稍後..."></spinner>
      </div>
      <br>
    </modal>

    <modal name="modal-createuser" height='auto' :clickToClose="false" :adaptive="true">
      <div>
        <h3 style="text-align:center">正在幫您創建區塊鏈用戶</h3>
        <spinner size="medium" message="此過程需要一段時間，請不要關閉此頁面..."></spinner>
      </div>
      <br>
    </modal>

    <modal name="modal-mnemonic" height='auto' :clickToClose="false" :adaptive="true">
      <div>
        <h3 style="text-align:center">密鑰產生中</h3>
        <spinner size="medium" message="請稍後..."></spinner>
      </div>
      <br>
    </modal>

  </div>
</template>

<script>
  import agreerule from './UserProfile/AgreeRule.vue'
  import Spinner from "vue-simple-spinner"
  import { APISRV, GetAPIURL, GetCERTDB_ADDR } from 'src/axios'
  let APIURL
  let sha256 = require("crypto-js/sha256");
  const keytool = require("@/../../cert-common/src/keytool");

  function paddingLeft(str,length){
    if(str.length >= length)
    return str;
    else
    return paddingLeft("0" +str,length);
  }

  export default {
    components: {
      agreerule,
      Spinner
    },
    name: 'ShowOidInfo',
    props: {
      checked: [Array, Boolean],
      inline: Boolean,
      //userInfo: Object,
      contractAddr: Object

    },
    data () {
      return {
        userinfo: {
          userID: '',
          userName: '',
          schoolID: '',
          schoolIDOri: '',
          classTitle: '',
          role: '',
          address: '',
          studentID: '',
          schoolName: '',
          userIDOri: ''
        },
        acc_token: '',
        showform: false,
        showpwd: false,
        checkUserInfo: 0,
        checkAgreeAuth: 0,
        mnemonic: '',
        isDownloaded: false,
        hasContract: false
      }
    },
    created: async function () {
      APIURL = await GetAPIURL();
      const CERTDB_ADDR = await GetCERTDB_ADDR();
      this.$emit("sendCERTDBADDR", CERTDB_ADDR);

      const code = this.$route.query.code;
      const state = this.$route.query.state;
      var body = {
        code: code
      }
      this.$modal.show("modal-login");
      
      console.log(this.sidebarStore);
      var resp = await APISRV.post( APIURL + '/auth/oid-callback', body)
      console.log(resp.data)
      this.acc_token = resp.data.response.access_token
      this.$emit('accesstoken', this.acc_token);

      const resp3 = await APISRV.get( APIURL + '/auth/oid-userinfo/'+this.acc_token)
      console.log(resp3.data.response);

      this.userinfo.userIDOri = JSON.parse(resp3.data.response).sub;
      // 若UserID非數字
      //if(!parseInt(this.userinfo.userIDOri)){
        console.log('NaN');
        var hashUserID = sha256(this.userinfo.userIDOri);
        hashUserID = '0x' + hashUserID;
        //console.log(hashUserID);
        //hashUserID = hashUserID.slice(0,8);
        //hashUserID = parseInt(hashUserID,16).toString();
        
        //if(hashUserID < 9) {
        //  var hashUserID = paddingLeft(hashUserID, 9);
        //} else if (hashUserID > 9) {
        //  hashUserID = hashUserID.slice(0,9);
        //}
        this.userinfo.userID = hashUserID;
      //} else {
      //  this.userinfo.userID = this.userinfo.userIDOri;
      //}
      console.log(this.userinfo.userID);
      this.userinfo.userName = JSON.parse(resp3.data.response).name;

      // ------ 確認是否有 address 存在，若有表示已經註冊過 ------
      var apiUserinfo = await this.getUserinfo();
      console.log(apiUserinfo);
      var userAddress = apiUserinfo[3];
      console.log('userAddress:' + userAddress);
      if(userAddress != '0x0000000000000000000000000000000000000000') {
        // 有 address 存在，將 userinfo 更新並emit
        this.$emit('nowlogin', true); //通知父元件已登入
        this.userinfo.schoolID = apiUserinfo[0];
        this.userinfo.classTitle = apiUserinfo[1];
        if(apiUserinfo[2] === '1')
          this.userinfo.role = '教師';
        else if (apiUserinfo[2] === '3') {
          this.userinfo.role = '學生';
        }
        this.userinfo.address = apiUserinfo[3];
        this.userinfo.studentID = apiUserinfo[5];
        //this.getSchoolContAddr(this.userinfo.schoolID);

        // ==== get orgInfo ====
        body = {
          idIssuer: 0,
          idSubject: 1,
          orgID: this.userinfo.schoolID,
          contract: this.contractAddr.certDB
        }
        resp = await APISRV.post( APIURL + '/cert/get-org-info', body);
        console.log(resp.data);
        const orgAddr = resp.data.orginfo_in_sc[1];
        this.userinfo.schoolName = resp.data.orginfo_in_sc[0];
        this.userinfo.schoolIDOri = resp.data.orginfo_in_sc[2];
        if(orgAddr === "0x0000000000000000000000000000000000000000") {
          alert('您的學校尚未部署合約');
        } else {
          this.hasContract = true;
        }
        this.$emit('apiUserinfo', this.userinfo);
        this.$emit("sendOrgAddr", orgAddr);
        this.$router.push({ path: '../../userinfo' });
        return
      } else {
        this.$modal.hide("modal-login");
        this.showform = true;
      }

      const resp2 = await APISRV.get( APIURL + '/auth/oid-eduinfo/'+this.acc_token)
      // this.userinfo.schoolID = parseInt(resp2.data.response.schoolid).toString();//去掉以0開頭的
      this.userinfo.schoolIDOri = resp2.data.response.schoolid;
      this.userinfo.schoolID = sha256(resp2.data.response.schoolid);
      this.userinfo.schoolID = '0x'+ this.userinfo.schoolID;
      //========== 測試用 ===========
      if(this.userinfo.userIDOri === 'tctest') {
        this.userinfo.schoolIDOri = '064720';
        this.userinfo.schoolID = sha256(this.userinfo.schoolIDOri);
        this.userinfo.schoolID = '0x'+ this.userinfo.schoolID;
        console.log("user info = ",this.userinfo.schoolID)
      }
      this.userinfo.role = resp2.data.response.titles;
      if(this.userinfo.role === '教師') {
        this.userinfo.classTitle = '---'
      } else {
        // this.userinfo.classTitle = resp2.data.response.classtitle; 目前從台中市政府那邊抓不到
        this.userinfo.classTitle = resp2.data.response.grade + '年' + resp2.data.response.classno + '班';
      }
      // ==== get orgInfo ====
      body = {
				idIssuer: 0,
       	idSubject: 1,
				orgID: this.userinfo.schoolID,
				contract: this.contractAddr.certDB
      }
			resp = await APISRV.post( APIURL + '/cert/get-org-info', body);
      console.log(resp.data);
      const orgAddr = resp.data.orginfo_in_sc[1];
      this.userinfo.schoolName = resp.data.orginfo_in_sc[0];
      this.userinfo.schoolIDOri = resp.data.orginfo_in_sc[2];
      if(orgAddr === "0x0000000000000000000000000000000000000000") {
        alert('您的學校尚未部署合約');
      } else {
        this.hasContract = true;
      }
      this.$modal.hide("modal-login");
      this.$emit('apiUserinfo', this.userinfo);
      this.$emit("sendOrgAddr", orgAddr);
    },
    methods: {
      async inserUserinfo () {
        this.$modal.show("modal-createuser");

        var role_id = 0;
        if(this.userinfo.role =='學生') {
          role_id = 3;
        } else if(this.userinfo.role =='教師') {
          role_id = 1;
        } else role_id = 2; //教職員…
        var body = {
          idIssuer: 0,
          idSubject: 1,
          contract: this.contractAddr.certDB,
          userInfo: {
            name: this.userinfo.userName,
            userID: this.userinfo.userID,
            orgID: this.userinfo.schoolID,
            orgIDOri: this.userinfo.schoolIDOri,
            classID: this.userinfo.classTitle,
            role: role_id,
            studentID: this.userinfo.studentID
          }
        }
        var res = await APISRV.post( APIURL + '/cert/insert-user', body);
        console.log(res.data);
        
        var apiUserinfo = await this.getUserinfo();
        var userAddress = apiUserinfo[3];
        if(userAddress != '') {
          // 有 address 存在，將 userinfo 更新並emit
          this.userinfo.schoolID = apiUserinfo[0];
          this.userinfo.classTitle = apiUserinfo[1];
          if(apiUserinfo[2] === '1')
            this.userinfo.role = '教師';
          else if (apiUserinfo[2] === '3') {
            this.userinfo.role = '學生';
          }
          this.userinfo.address = apiUserinfo[3];
          this.userinfo.studentID = apiUserinfo[5];
          this.$emit('nowlogin', true); //通知父元件已登入
          this.$emit('apiUserinfo', this.userinfo);
        } else {
          alert('首次登入失敗，請重新嘗試');
        }
        this.$modal.hide("modal-createuser");
      },
      downloadMnemonic(){
        var message = {
          mnemonic: this.mnemonic
        }
        this.downloadData(this.userinfo.userID ,JSON.stringify(message));
        this.isDownloaded = true;
      },
      async createMnemonic() {
        if(this.userinfo.role==='教師') {
          this.userinfo.studentID = this.userinfo.userID;
        }
        if(this.checkUserInfo == 0){
          alert("請勾選 確認基本資料無誤！");
          return;
        }
        if(this.checkAgreeAuth == 0){
          alert("請勾選 同意授權條款！");
          return;
        }
        if(this.userinfo.studentID === '') {
          alert("請填入 學號！");
          return;
        }
        const _this = this;
        _this.$modal.show("modal-mnemonic");
        this.isDownloaded = false;
        this.showform = false;
        this.showpwd = true;
        
        setTimeout(()=> {
          const mnemonic = keytool.GenerateMnemonic(true)
          const path = "m/2018'/5'/1'/0";
          const type = "secp256r1";
          const result2 = keytool.CreateTcEduNchcV0DIDoc(mnemonic, path, type);
          console.log('result2');
          console.log(result2);
          _this.result2 = result2;
          _this.mnemonic = mnemonic
          _this.$modal.hide("modal-mnemonic");
        },100)
      },
      downloadData (filename, data) {
        var textFileAsBlob = new Blob([data], {type: 'text/plain'});

        var downloadLink = document.createElement("a");
        downloadLink.download = filename;
        if(window.webkitURL != null) {
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        } else {
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = function() { document.body.removeChild(event.target); };
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }
        downloadLink.click();
      },
      async goUserinfoPage() {
        if(this.isDownloaded){
          var body = {
            userID: this.userinfo.userID,
            idIssuer: 0,
            idSubject: 1,
            contract: this.contractAddr.certDB,
            result2: this.result2
          }

          var res = await APISRV.post( APIURL + '/cert/create-user', body);
          const createResult = res.data;
          console.log(createResult);

          //跳轉已簽署的清單
          await this.inserUserinfo();
          this.$router.push({ path: '../../userinfo' });
        } else {
          alert("此資訊極為重要，請先下載");
        }
      },
      async getUserinfo() {
        //get userinfo
        const user = {
          userID: this.userinfo.userID, 
          orgID: 0,  
          classID: '',
          role: 0,
          address: '',
        }
        var body = {
          idIssuer: 0,
          idSubject: 1, 
          contract: this.contractAddr.certDB,
          userInfo: user
        }
        const resp = await APISRV.post( APIURL + '/cert/get-user-info', body);
        console.log('---- userinfo ----');
        return resp.data.userinfo_in_sc;
        // console.log(resp.data);
        // const userAddress = resp.data.userinfo[3];
        // if(userAddress != '0x0000000000000000000000000000000000000000')
        //   return userAddress;
        // else
        //   return '';
      }
    }
  }
</script>
<style>
.imgRatioFull {
  max-width: 100%; 
  max-height: 100%;
}

.whiteRadius {
    /* border:1px solid #CCC5B9; */
    
    border-style: none none solid none;
    border-color: #CCC5B9;
    background-color: #ffffff;
    /* border-radius: 4px; */
    color: #66615b;
    font-size: 14px;
    transition: border-color, box-shadow 0.3s ease-out 0s;
    padding: 7px 5px;
    height: 40px;
    
    display: inline;
    width: 180px;
}

.whiteRadius:focus {
  box-shadow: 0 5px 4px -4px rgba(65, 184, 131 ,0.5);
  border-color: rgb(65, 184, 131 ,0.7);
}

</style>
