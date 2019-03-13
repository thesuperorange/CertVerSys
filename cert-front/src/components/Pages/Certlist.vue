<template>
    <div class="row">
    我的個人資訊
      <div class="col-md-12">
        <div class="card">
          <paper-table 
            :title="certListTable.title"
            :sub-title="certListTable.subTitle"
            :data="certListTable.UserCerts"
            :columns="certListTable.columns"
            :chtcolumns="certListTable.chtcolumns"
            v-on:downloadjws="downloadJws"
            :contractAddr="contractAddr"
            :userInfo="userInfo"
            @showDetail="showCertDeail">
          </paper-table>
        </div>
      </div>
      <div v-if="isShowDetail" class="col-md-12">
        <div class="card">
          <cert-detail-table
            :title="certDeailTable.title"
            :sub-title="certDeailTable.subTitle"
            :data="certDeailTable.data"
            :columns="certDeailTable.columns"
            :chtcolumns="certDeailTable.chtcolumns"
          >
          </cert-detail-table>
          <br>
          <div class="text-center">
            <label>掃描驗證</label><br>
            <img :src="qrPngBase64"><br>
          </div>
          <br>
        </div>
      </div>
    </div>
</template>
<script>
  import PaperTable from 'components/UIComponents/PaperTable2.vue'
  import CertDetailTable from 'components/UIComponents/CertDetailTable.vue'
  import qr from 'qr-image'
  import { APISRV, GetAPIURL } from 'src/axios'
  let APIURL
  const tableColumns = ['Id', 'Date', 'Name', 'Description', 'Detail', 'Jws']
  const tablechtcolumns =['證書ID', '發行日期', '發行名稱', '描述', '內容瀏覽', 'jws']
  const detailTableColumns = ['Id', 'Ver', 'Date', 'Name', 'Description', 'Owneraddr', 'Issueaddr', 'Signeraddr']
  const detailTablechtcolumns =['證書ID', '發行版本', '發行日期', '發行名稱', '描述', '擁有人位址' ,'發起人位址', '簽署人位址']
  function CertInfo (id, date, name, description, detail, jws, qrcode) {
    this.id = id;
    this.date = date;
    this.name = name;
    this.description = description;
    this.detail = detail;
    this.jws = jws;
    this.qrcode = qrcode;
  }
  function CertDetailInfo (id, ver, date, name, description, owneraddr, issueaddr, signeraddr) {
    this.id = id;
    this.ver = ver;
    this.date = date;
    this.name = name;
    this.description = description;
    this.owneraddr = owneraddr;
    this.issueaddr = issueaddr;
    this.signeraddr = signeraddr;
  }

  function paddingLeft(str,length){
    if(str.length >= length)
    return str;
    else
    return paddingLeft("0" +str,length);
  }

  export default {
    props: {
      contractAddr: Object,
      userInfo: Object
    },
    components: {
      PaperTable,
      CertDetailTable
    },
    data () {
      return {
        certListTable: {
          title: '發行文件列表',
          subTitle: '截至目前已發行的文件，包含 畢業證書、成績單、獎狀等',
          columns: [...tableColumns],
          chtcolumns: [...tablechtcolumns],
          UserCerts: []
        },
        certDeailTable: {
          title: '證書詳細資訊',
          subTitle: '與證書相關的資訊',
          columns: [...detailTableColumns],
          chtcolumns: [...detailTablechtcolumns],
          data: []
        },
        certDeailInfos: {},
        isShowDetail: false,
        qrPngBase64All: {},
        qrPngBase64: ''
      }
    },
    created: async function() {
      APIURL = await GetAPIURL();
      const _this = this;

      var body = {  
        contractname: this.contractAddr.cert2,
        idIssuer: 0,
        idSubject: 1, 
        useraddr: this.userInfo.address,
      };
      var res = await APISRV.post( APIURL + '/cert/get-user-certid', body);
      const certIDList = res.data.userinfo;
      console.log(res.data);
      console.log("certIDList = ",certIDList);

      certIDList.forEach( async function (certID, index, ar) {
        body = {
          idIssuer: 0,
          idSubject: 1,
          certID: certID,
          owner: _this.userInfo.address,
          contractname: _this.contractAddr.cert2
        }
        var res = await APISRV.post( APIURL + '/cert/sign/get-certinfo-bycertID', body);
        const resCertInfo = res.data;
        
        console.log("resCertInfo = ",resCertInfo);
        var certIDLength8 = paddingLeft(certID, 8);
        body = {  
           contractname2: _this.contractAddr.certDB,
           idIssuer: 0,
           idSubject: 1, 
           signerID: resCertInfo.Signerid[0],
           owneraddr: _this.userInfo.address,
           certID:certIDLength8,
           signeraddr:resCertInfo.SignerAddr[0],
           //ipfshash:resCertInfo.ipfshash
        };
        var downloadMode;
        var detailMode;
        try { 
          var res = await APISRV.post( APIURL + '/cert/sign/checkdownloadpermission', body);
          console.log('checkdownloadpermission: ' + res.data);
          detailMode = '查看';
          downloadMode  = '下載';
        }
        catch(e) {
          console.log('checkdownloadpermission Error');
          detailMode = '尚未簽署';
          downloadMode = '尚未簽署';
        }
        if(resCertInfo.revocation == true) {
          console.log(certID, "已經撤銷");
          detailMode = '已撤銷';
          downloadMode = '已撤銷';
        }
        var issueDate = new Date(parseInt(resCertInfo.timestamp));
        var dateFormat = issueDate.getFullYear()+'/'+('0'+(issueDate.getMonth() + 1)).slice(-2)+'/'+('0'+issueDate.getDate()).slice(-2)+
                      ' '+('0'+issueDate.getHours()).slice(-2)+':'+('0'+issueDate.getMinutes()).slice(-2)+':'+('0'+issueDate.getSeconds()).slice(-2);
        _this.certListTable.UserCerts.push(new CertInfo(certID, dateFormat, resCertInfo.certname, resCertInfo.description, detailMode, downloadMode));
        _this.certDeailInfos[certID] = new CertDetailInfo(certID, resCertInfo.version, dateFormat, resCertInfo.certname, resCertInfo.description, resCertInfo.OwnerAddr, resCertInfo.IssuerAddr, resCertInfo.SignerAddr[0])
        
      })
    },
    methods: {
      async downloadJws(DLcertID) {
        console.log(DLcertID);
        var certIDLength8 = paddingLeft(DLcertID, 8);
        var body = {
          jwspath: './sJWS/' + this.userInfo.address + certIDLength8 + '.json'
        }
        var res = await  APISRV.post( APIURL + '/cert/sign/getjwsfile', body)
          
        console.log(res.data);
        this.downloadData(DLcertID + '.jws', JSON.stringify(res.data));
      },
      downloadData: function (filename, data) {
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
      async showCertDeail (certID) {
        this.isShowDetail = false;
        this.showQRCode(certID);
        this.certDeailTable.data = [];
        this.certDeailTable.data.push(this.certDeailInfos[certID]);
        this.isShowDetail = true;
      },
      async showQRCode(certID) {
        if(!this.qrPngBase64All[certID]) {
          var thisurl = window.location.href;
          var index = thisurl.lastIndexOf('/');
          const localUrl = thisurl.substring(0,index+1);
          var certIDLength8 = paddingLeft(certID, 8);
          var body = {
            certContractAddr: this.contractAddr.cert2,
            idIssuer: 0,
            idSubject: 1, 
            certID: certIDLength8,
            owneraddr: this.userInfo.address,
            schooid: this.userInfo.schoolID
          };
          var resp = await APISRV.post( APIURL + '/cert/sign/get-qrcode-code', body);
          var code = resp.data;
          console.log(code);

          
          const qrCodeUrl = localUrl + 'qrcodeverify?code=' + code;
          console.log(qrCodeUrl);
          const qrPng = qr.imageSync(qrCodeUrl, { type: 'png' });

          this.qrPngBase64All[certID] = "data:image/png;base64," + qrPng.toString('base64');
        }
        this.qrPngBase64 = this.qrPngBase64All[certID];
        
        this.isShowQrCode = true;

        // 顯示QR Code 到獨立視窗，但有時會顯示空白
        // var qrImageElement = new Image();
        // qrImageElement.src = this.qrPngBase64;
        // qrImageElement.style = "width:100%; height:100%";
        // var w = window.open('', "QR_Code", "width=500, height=450");
        // w.document.title = 'QR_CODE';
        // w.document.write(qrImageElement.outerHTML);        
      }
    }
  }

</script>
