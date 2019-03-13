<template>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
           <sign-table 
            :title="issueTable.title"
            :sub-title="issueTable.subTitle"
            :data="issueTable.data"
            :columns="issueTable.columns"
            :chtcolumns="issueTable.chtcolumns"
            @clickItem="showCertList">
          </sign-table>
        </div>
        <div class="card">
          <cert-table v-if="isShowCertList"
            :title="certTable.title"
            :sub-title="certTable.subTitle"
            :data="certTable.data"
            :columns="certTable.columns"
            :chtcolumns="certTable.chtcolumns">
          </cert-table>
        </div>
      </div>
      <div v-if="showSignBtn" class="text-center">
        <button type="submit" class="btn btn-info btn-fill btn-wd" @click="gotoSign()">
          前往簽署
        </button>
      </div>
    </div>
</template>
<script>
  import { APISRV, GetAPIURL } from 'src/axios'
  import SignTable from 'components/UIComponents/IssueListTable.vue'
  import CertTable from 'components/UIComponents/CertListTable.vue'
  let APIURL

  //未簽核列表(master)
  const issueInfoCol = ['Id', 'Date', 'Name', 'Desc','Signstatus']
  const issueInfoChtCol =['發行編號','發行日期','發行名稱', '描述', '簽署狀態']

  const certInfoCol    = ['Id',      'Date',  'Owner', 'Desc', 'Signstatus']
  const certInfoChtCol = ['發行編號', '發行日期','擁有人位址', '描述',  '簽署狀態']

  export default {
    props: {
      contractAddr: Object,
      userInfo: Object
    },
    components: {
      SignTable,
      CertTable
    },
    data () {
      return {
        issueTable: {
          title: '與您相關的發行',
          subTitle: '這些發行的簽署人是您',
          columns: [...issueInfoCol],
          chtcolumns: [...issueInfoChtCol],
          data: []
        },
        certTable: {
          title: '',
          subTitle: '關於此發行的所有證書',
          columns: [...certInfoCol],
          chtcolumns: [...certInfoChtCol],
          data: []
        },
        issueIDInfo: {},
        isShowCertList: false,
        showSignBtn: false
      }
    },
    created: async function() {
      APIURL = await GetAPIURL();
      var body = {  
          contractname2: this.contractAddr.cert2,
          idIssuer: 0,
          idSubject: 1,
          issueraddr: this.userInfo.address,
         }
      var resp = await APISRV.post( APIURL + '/cert/sign/get-all-issueID-by-signer', body);
      const issueList = resp.data;
      for(const issueid of issueList) {
        body = {
          contractname: this.contractAddr.cert2,
          idIssuer: 0,
          idSubject: 1,
          issueraddr: this.userInfo.address,
          issueid: issueid
        }
        resp = await APISRV.post( APIURL + '/cert/sign/get-certInfo-in-issue', body);
        const issueInfo = resp.data;
        console.log(issueInfo);
        
        var issueinfoObj = {
          date: issueInfo[3],
          name: issueInfo[1],
          desc: issueInfo[2],
          certs: issueInfo[0],
          signedCert: issueInfo[4],
        }
        this.issueIDInfo[issueid] = issueinfoObj;

        var issueDate = new Date(parseInt(issueInfo[3]));
        var dateFormat = issueDate.getFullYear()+'/'+('0'+(issueDate.getMonth() + 1)).slice(-2)+'/'+('0'+issueDate.getDate()).slice(-2)+
                        ' '+('0'+issueDate.getHours()).slice(-2)+':'+('0'+issueDate.getMinutes()).slice(-2)+':'+('0'+issueDate.getSeconds()).slice(-2);
        this.issueTable.data.push({
          id: issueid,
          date: dateFormat,
          name: issueInfo[1],
          desc: issueInfo[2],
          signstatus: issueInfo[4].length.toString() + '/' + issueInfo[0].length.toString()
        })
      }
      console.log(this.issueIDInfo);
    },
    methods: {
      async showCertList (issueID) {
        this.issueID = issueID;
        console.log('click issue of id: ', issueID);
        this.isShowCertList = false;
        this.certTable.data = [];
        this.certTable.title = '發行編號' + issueID + '的證書列表';
        const thisissue = this.issueIDInfo[issueID];
        
        for(var certid of thisissue.certs) {
          var body = {
            idIssuer: 0,
            idSubject: 1,
            certID: certid,
            owner: '',
            contractname: this.contractAddr.cert2
          }
          var resp = await APISRV.post( APIURL + '/cert/sign/get-certinfo-bycertID', body);
          var resCertInfo = resp.data;
          var ownerAddr = resCertInfo.OwnerAddr;
          var issueDate = new Date(parseInt(thisissue.date));
          var dateFormat = issueDate.getFullYear()+'/'+('0'+(issueDate.getMonth() + 1)).slice(-2)+'/'+('0'+issueDate.getDate()).slice(-2)+
                        ' '+('0'+issueDate.getHours()).slice(-2)+':'+('0'+issueDate.getMinutes()).slice(-2)+':'+('0'+issueDate.getSeconds()).slice(-2);
          var certinfo = {
            id: certid,
            date: dateFormat,
            owner: ownerAddr,
            desc: thisissue.desc,
            signstatus: '尚未簽署'
          }
          if(thisissue.signedCert.indexOf(certid) != -1)
            certinfo.signstatus = '已簽署';
          this.certTable.data.push(certinfo);
        }
        this.showSignBtn = false;
        for(var data of this.certTable.data) {
          if(data.signstatus==='尚未簽署')
            this.showSignBtn = true;
        }
        this.isShowCertList = true;
      },
      gotoSign() {
        this.$router.push({ path: 'signcert', query: { issueID: this.issueID} });
      }
    }
  }
</script>
<style>

</style>
