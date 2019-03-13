<template>
  <div class="row">
    <!-- 角色：學校/老師 發行證書；學生：簽署證書 -->
    <div class="col-md-12">
      <div class="card">
        <profile-paper-table 
          :title="'證書發起人'" 
          :sub-title="'證書發起人相關資訊'" 
          :data="[{ username: userInfo.userName, userid: userInfo.userIDOri, role: userInfo.role, address: userInfo.address, schoolid: userInfo.schoolIDOri}]" 
          :columns="['Username', 'Userid', 'Role', 'Address', 'Schoolid']" 
          :chtcolumns="['發起人', '發起人ID', '發起人角色', '發起人區塊鏈位址', '學校ID']">
        </profile-paper-table>
      </div>
    </div>
    <div v-if="firstSetp" class="col-md-12">
      <edit-profile-form ref="certform" :issueInfo="issueInfo">
      </edit-profile-form>
      <br>
        <div  class="text-center">
          <button type="submit" class="btn btn-info btn-fill btn-wd" @click="goNext">
            下一步
          </button>
        </div>
    </div>
    <div v-if="!firstSetp" class="col-md-12">
      <h4 class="title">請選擇 想要發行的學生清單：</h4>
      <div class="card">
        <div class="header"><h4 class="title">步驟2.請選擇 學生歸屬的班級：</h4></div>
        <div class="row">
          <div class="col-md-5">
            <div class="header"><label>該校的班級列表</label></div>
          </div>
          <div class="col-md-3">
            <div class="content">
              <select class="form-control border-input" name='classid' v-model="selected" @change="showStudentList">
                <option v-for="option in classlist" v-bind:value="option">{{option}}</option>
              </select>
            </div>
          </div>
        </div>
        <div v-if="selected != '-1'">
          <div class="header"><h4 class="title">步驟3.挑選即將發行的學生:</h4></div>
          <paper-table 
            :classnm="listTable.classnm" 
            :data="listTable.data" 
            :columns="listTable.columns" 
            :chtcolumns="listTable.chtcolumns" 
            v-on:updateSelectedAddr="updateOwnerList">
          </paper-table>
         
          <div class="header">
            <h4 class="title">步驟4.上傳對應的檔案</h4>
          </div>
              <file-upload clas @updateFilesList="updateFilesList"></file-upload>
        </div>
        <br>
      </div>
    </div>
    
    <div v-if="!firstSetp" class="text-center">
       <button type="submit" class="btn btn-info btn-fill btn-wd" @click.prevent="goPrev">
        上一步
      </button>
      <button type="submit" class="btn btn-info btn-fill btn-wd" @click.prevent="issueCert">
        發行證書
      </button>
    </div>
    <div class="clearfix"></div>
  
    <modal name="modal-issue" height='auto' :clickToClose="false" :adaptive="true">
      <div v-if="!issueFinish" class="text-center">
        <h3>正在寫入草案到區塊鏈</h3>
        <spinner size="medium" :message="'請稍後...'"></spinner>
      </div>
      <div v-else class="text-center">
        <h3 style="text-align:center">證書發行成功!</h3>
        <p>交易序號: {{txID}}</p>
        <p>區塊編號: {{blockNum}}</p> 
        <p></p>
        <button type="button" class="btn btn-info" @click="$router.push({ path: 'signcert', query: { issueID: issueID} });">&nbsp;&nbsp;確定&nbsp;&nbsp;</button>
      </div>
      <br>
    </modal>
  </div>  
</template>
<script>
  import EditProfileForm from 'components/UIComponents/IssueInfoForm.vue'
  import PaperTable from 'components/UIComponents/PaperTable.vue'
  import ProfilePaperTable from 'components/UIComponents/PaperTable3.vue'
  import { APISRV, GetAPIURL } from 'src/axios'
  import axios from 'axios'
  import FileUpload from 'components/UIComponents/fileUpload.vue'
  import Spinner from "vue-simple-spinner";
  import {aes_encrypt,aes_decrypt} from "src/encryptipfs"
  let APIURL

  const tableColumns = ['Name', 'Address', 'Studentid']
  const tablechtcolumns =['學生姓名(Name)', '區塊鏈地址(Address)', '學號']
  var logindata = JSON.parse(sessionStorage.getItem('logininfo'));

  function random_item(items)
  {
    return items[Math.floor(Math.random()*items.length)];  
  }

  export default {
    props: {
      contractAddr: Object,
      userInfo: Object
    },
    components: {
      EditProfileForm,
      PaperTable,
      ProfilePaperTable,
      FileUpload,
      Spinner
      //UploadFile
    },
    data () {
      return {
        txID: [],
        blockNum: [],
        listTable: {
          columns: [...tableColumns],
          chtcolumns: [...tablechtcolumns],
          data: [],
          classnm: '',
        },
        classlist: JSON,
        selected: '-1', //尚未選擇任何一項
        issueID: 0,
        schoolContract: '',
        firstSetp: true,
        issueInfo: {
          version: '1.0.0',
          issuename: '',
          revocation: 'none',
          issuetype: '1',
          description: '',
          ownerAddr: []
        },
        myselectd: [],
        filesList: [],
        studentIDList: [],
        studentidToAddr: {},
        addrToUserid: {},
        issueFinish: false
      }
    },
    //name: 'issue',
    created: async function () {
      APIURL = await GetAPIURL();
      //學校初始化於 Pmlogin...
      //this.getschoolSC(logindata.org_id);

      const body = {
        idSubject: 0,
        idIssuer: 0,
        contract: this.contractAddr.certDB, 
        orgID: this.userInfo.schoolID
      }

      try{
        var resp = await APISRV.post( APIURL + '/cert/issue/get-class-list', body);
        this.classlist = resp.data
      }catch(error){
        console.error(error);
      }
      // var encrypted = CryptoJS.AES.encrypt("Message", passPhrase, { mode: CryptoJS.mode.CFB });
      // console.log("encrypted = ",encrypted)
      // const body3 = {
      //   idSubject: 0,
      //   idIssuer: 0,
      //   contract: this.contractAddr.certDB, //db contract
      //   orgInfo:{
      //     userID:this.userInfo.userID,
      //     orgID: this.userInfo.schoolID,
      //     orgName: "展示國小",
      //     contract: {}
      //   }
      // }

      // try{
      //   var resp = await APISRV.post( APIURL + '/cert/issue/get-contract', body3);
      //   var parsedData = JSON.stringify(resp);
      //   this.schoolContract = resp.data.contract; 
      //   console.log('schoolContract:'+resp.data.contract);
      // }catch(error){
      //   console.error(error);
      // }

    },
    methods: {
      reloadFiles() {
        console.log(this.$refs.uploadfiles.files);
        this.filesList = this.$refs.uploadfiles.files;
        
      },
      mySelected(selected) {
        this.myselectd = selected;
        console.log(this.myselectd);
      },
      async showStudentList(){
        const body = {
          idSubject: 0,
          idIssuer: 0,
          contract: this.contractAddr.certDB, 
          orgID: this.userInfo.schoolID,
          classID: this.selected
        }
        try{
          console.log('on change selected:'+this.selected);
          var resp = await APISRV.post( APIURL + '/cert/issue/get-student-list', body);
          console.log(resp.data.studentlist);
          var studentList = resp.data.studentlist;
          var i =0; 
          var tableData =[];
          for(let userID of studentList) {
            console.log(userID);
            tableData[i] = [];
            //tableData[key].choose = 0;
            //tableData[i].id = userID;
            const user = {
              userID: userID, 
              orgID: 0,  
              classID: '',
              role: 0,
              address: '',
            }
            var newbody = {
              idIssuer: 0,
              idSubject: 1, 
              contract: this.contractAddr.certDB,
              userInfo: user
            }
            const resp = await APISRV.post( APIURL + '/cert/get-user-info', newbody);
            var tempuserinfo = resp.data.userinfo_in_sc;
            console.log(tempuserinfo);
            tableData[i].name = tempuserinfo[4];
            tableData[i].studentid = tempuserinfo[5];
            tableData[i].address = tempuserinfo[3];
            //this.issueInfo.ownerAddr.push(tableData[i].address);
            this.studentidToAddr[tempuserinfo[5]] = tempuserinfo[3];
            this.addrToUserid[tempuserinfo[3]] = userID;
            i++;
          }
          this.listTable.data = tableData;
          console.log(this.studentidToAddr);
          //console.log('resp:'+this.table1.data);
        }catch(error){
          console.error(error);
        }
      },
      goNext(){
        if(this.$refs.certform.issueInfo.issuename =='') {
          console.log(this.$refs.certform.issueInfo)
          alert('請填寫 發行名稱');
          return 
        }
        if(this.$refs.certform.issueInfo.description =='') {
          alert('請填寫 發行說明');
          return
        }
        this.issueInfo = this.$refs.certform.issueInfo;
        this.firstSetp = false;
      },
      goPrev() {
        this.firstSetp = true;
      },

      async issueCert() {
        console.log('go issueCert')
        
        //欄位必填驗証
        var rexName = new RegExp('^[0-9]+.pdf$');
        var rexStudentID = new RegExp('^[0-9]+');
        if(this.studentIDList.length != this.filesList.length) {
          alert('檔案數量與簽署學生數量不符');
          return;
        }
        for(var file of this.filesList) {
          var correct = rexName.test(file.name);
          if(!correct) {
            alert('請確認此檔案'+ file.name +'是否正確');
            return;
          }
          var getStudentID = file.name.match(rexStudentID)[0]
          if(this.studentIDList.indexOf(getStudentID) === -1) {
            alert(file.name + '該檔案與學生學號未對應');
            return;
          }
        }
        if(!confirm("是否確定發表此次簽署")) {
          return
        }
        this.$modal.show("modal-issue");
        // 產生表單並加入檔案element
        let formData = new FormData();
        // var reader = new FileReader();
			 	for(var file of this.filesList) {
          formData.append('uploadfile', file);
          // reader.readAsDataURL(file);
          // reader.onload = function() {
          //   console.log(reader.result);
          // };
				}
        formData.append('owner', JSON.stringify(this.studentidToAddr));
        console.log("fornData = ",formData);
        var resp = await axios.post ( APIURL + '/datasrc/db/uploads', formData, {
          headers:{
            'Content-Type':'multipart/form-data'
          }
        });
        var ownerCertID = resp.data.certid_list;
        var IPFShashList = resp.data.IPFS_hash_list;
        var certHashList = resp.data.cert_Hash_list
        console.log(ownerCertID);
        var certIDList = []
        var userIDList = []
        for(var key in ownerCertID) {
          certIDList.push(ownerCertID[key])
          userIDList.push(this.addrToUserid[key])
        }
        // var body = {
        //   idIssuer: 0,
        //   idSubject: 1,
        //   contractname: this.contractAddr.cert2,
        //   certid: certIDList,
        //   userid: userIDList
        // }
        // resp = await APISRV.post( APIURL + '/cert/issue/set-userid-into-cert2', body);
        // console.log(resp.data)
        
        var milliseconds = new Date().getTime();
        console.log('milliseconds:'+milliseconds);
        // this.issue_stulist

        var body = {
            owners: this.issueInfo.ownerAddr,
            issuer: this.userInfo.address,
            userID: userIDList,
            signerID: [this.userInfo.userID],
            signer: [this.userInfo.address],
            contract: this.contractAddr.cert2,
            certName: this.issueInfo.issuename,
            description: this.issueInfo.description,
            timestamp: milliseconds.toString(),
            ownerToCertID: ownerCertID,
            ownerToHash: IPFShashList,
            certHashList: certHashList,
            contractname: this.contractAddr.cert2,
            certFilePath: '',
            idIssuer: 0,
            idSubject: 1
        }
          resp = await APISRV.post( APIURL + '/cert/issue', body);
          console.log(resp.data);
          this.issueID = resp.data.issueID;
          this.txID = resp.data.txId;
          this.blockNum = resp.data.blockID;
          if(resp.status ==200){
            this.issueFinish = true;
        }
      },
      // getMsgfromUpload:function(data){  
      //   this.filesinfo.push(data);
      //   console.log(this.filesinfo);
      // },
      updateOwnerList(info) {
        this.issueInfo.ownerAddr = info.addrList;
        this.studentIDList = info.sudIDList
      },
      updateFilesList(filesList) {
        this.filesList = filesList;
      }
    },
    computed: {
      chooseclass(){
        return this.selected;
      },
      tableClass () {
        return `table-${this.type}`
      }
    },
  }
</script>
<style>

</style>
