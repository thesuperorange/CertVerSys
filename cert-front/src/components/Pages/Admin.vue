<template>
    <div class="row">
      <div class='col-md-12'>
				<table>
					<tr>
						<td class="text-center">&nbsp;學校ID:&nbsp;</td> <td>&nbsp;<input type="text" v-model="inputSchoolIDOri"></td>
				 	</tr>
					<tr>
						<td class="text-center">&nbsp;學校名稱:&nbsp;</td> <td>&nbsp;<input type="text" v-model="inputSchoolName"></td>
					</tr>
				</table>
				<br>
        <button @click="deployContract" variant="primary" class="btn btn-info btn-fill btn-wd">部署合約</button>
				<br>
				<br>
				<div v-if="deploySuccess" style="font-size:1.3em;"><label>&nbsp;&nbsp;部署成功! ({{ contractAddr.cert2 }}) </label></div>
				<div v-if="newDeploy">&nbsp;&nbsp;請將 CertDB Address ({{ contractAddr.certDB }}) 寫到 Config.json</label></div>
				<div v-if="alreadyDeploy">School ID: {{ inputSchoolIDOri }} 已部署過 ( addr: {{ orgAddr }} ) </div>
      </div>
    
      <!-- <vue-pdf src='file:///Users/hung/ubuntu/share/dadu3cert-core/testcert.pdf'></vue-pdf> -->
			<modal name="modal-depoly" height='auto' :clickToClose="false" :adaptive="true">
        <div class="text-center">
          <h3>正在部署智能合約</h3>
          <spinner size="medium" message="請稍後..."></spinner>
        </div>
        <br>
      </modal>
			<modal name="modal-passwd" height='auto' :clickToClose="false" :adaptive="true">
        <div class="text-center">
          <h3>請輸入密碼</h3>
          <input type="password" v-model="checkinput">
					<button type="button" class="btn btn-info" @click="goOK">&nbsp;&nbsp;確定&nbsp;&nbsp;</button>
        </div>
        <br>
      </modal>
    </div>
</template>

<script>
  import Spinner from "vue-simple-spinner";
	import { APISRV, GetAPIURL, GetCERTDB_ADDR } from 'src/axios'
	let sha256 = require("crypto-js/sha256");
	let APIURL
	let certDBAddr
  export default {
    props: {
      userInfo: {}
		},
		components: {
      Spinner
    },
    data () {
      return {
				contractAddr: {
          certDB: '',
          cert2: ''
				},
				deploySuccess: false,
				inputSchoolID: '',
				inputSchoolIDOri: '',
				alreadyDeploy: false,
				orgAddr: '',
				inputSchoolName: '',
				newDeploy: false,
				checkinput: ''
      }
		},
		created: async function() {
			APIURL = await GetAPIURL();
			//this.$modal.show("modal-passwd");
		},
    methods: {
      async deployContract() {
				this.alreadyDeploy = false;
				this.newDeploy = false;
				this.deploySuccess = false;
				if(this.inputSchoolIDOri  === '') {
					alert('請填入School ID');
					return;
				}
				this.inputSchoolID = sha256(this.inputSchoolIDOri);
				this.inputSchoolID = '0x' + this.inputSchoolID;
				this.$modal.show("modal-depoly");

				//判斷CertDB是否已經部署過
				const CERTDB_ADDR = await GetCERTDB_ADDR();
				if(CERTDB_ADDR.length === 42){
					this.contractAddr.certDB = CERTDB_ADDR;
					console.log('get certDB addr form config: ' + this.contractAddr.certDB);
				} else {
					var body = {
						idAccount: 0
					}
					var resp = await APISRV.post( APIURL + '/cert/contract-deploy', body);
					//console.log(response);
					this.contractAddr.certDB = resp.data.address;
					this.newDeploy = true;
					console.log('get certDB addr form deploy: ' + this.contractAddr.certDB);
				}

				//讀取School訊息
				var body = {
					idIssuer: 0,
         	idSubject: 1,
					orgID: this.inputSchoolID,
					contract: this.contractAddr.certDB
				}
				var resp = await APISRV.post( APIURL + '/cert/get-org-info', body);
				const respSchoolAddr = resp.data.orginfo_in_sc[1];

				//判斷此學校是否已經部署過
				if(respSchoolAddr != "0x0000000000000000000000000000000000000000") {
					this.alreadyDeploy = true;
					this.orgAddr = respSchoolAddr;
					this.deploySuccess = false;
					this.$modal.hide("modal-depoly");
					return
				} else { 
					//次學校尚未部署，開始部署
					var body = {
						idAccount: 0
					}
					var resp = await APISRV.post( APIURL + '/cert/issue/contract-deploy', body);
					this.contractAddr.cert2 = resp.data.address;
					console.log(this.contractAddr);

					//部署完成，寫入學校資訊
					body = {
						idIssuer: 0,
						idSubject: 1,
						contract: this.contractAddr.certDB,
						//providerUrl: string,
						orgInfo: {
							orgID: this.inputSchoolID,
							orgIDOri: this.inputSchoolIDOri,
							orgName: this.inputSchoolName,
							contract: this.contractAddr.cert2
						}
					}
					var resp = await APISRV.post( APIURL + '/cert/insert-org', body);
					console.log(resp.data);

					//讀出學校資訊並確認
					body = {
						idIssuer: 0,
						idSubject: 1,
						orgID: this.inputSchoolID,
						contract: this.contractAddr.certDB
					}
					var resp = await APISRV.post( APIURL + '/cert/get-org-info', body);
					if(this.contractAddr.cert2 === resp.data.orginfo_in_sc[1]) {
						this.$modal.hide("modal-depoly"); 
						this.deploySuccess = true;
					} else {
						this.$modal.hide("modal-depoly");
						alert('寫入學校位址時出錯了！');
					}
				}
			},
			goOK () {
				if(this.checkinput === 'nchc') {
					this.$modal.hide("modal-passwd");
				} else {
					alert('密碼錯誤');
				}
			}
    }
  }

</script>
<style>

</style>
