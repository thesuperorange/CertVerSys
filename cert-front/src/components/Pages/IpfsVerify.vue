<template>
<div>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="header">
            <div class="col-xs-2"><div class="icon-big text-center icon-success"><i class="ti-id-badge"></i></div></div>
            <br>
            <div class="col-xs-10"><h4 class="title" slot="title">使用方法</h4>
            <span slot="subTitle">use method<br><br></span></div>
          </div>
          <div class="content">
            <div>
             1. 驗證機構(公司、學校)跟學生要一份證書代碼(ipfs)和一把暫時性密鑰 <br>
             2. 在規定時間內在此網站輸入該代碼和密鑰來做驗證 <br>
             3. 超過時效驗證將會失效，請在要求學生申請一份時效性證書 <br>
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
          		<div class="header">
          			<div class="content">
          			  	<div class="row">
		          			<div class="col-md-5">
			          			<fg-input type="text"
			                      label="證書代碼(ipfs)"
			                      placeholder="請輸入驗證代碼(ipfs)"
			                      v-bind:value="ipfshash"
			                      @change="ipfshash = $event.target.value"> 
			            		</fg-input>
			            	</div>
			            	<div class="col-md-5">
			            		<fg-input type="text"
			                      label="暫時性密鑰"
			                      placeholder="請輸入暫時性密鑰"
			                      v-bind:value="prvkey"
			                      @change="prvkey = $event.target.value"> 
			            		</fg-input>
			            	</div>
            			</div>
            			<button class="btn btn-info btn-fill" @click.prevent="getIPFShash">驗證證書</button>
            		</div>
          		</div>
      		</div>
  		</div>
	</div>

	<div v-if="showError" class="row">
		<div class="col-md-12">
        	<div class="card">
	        	<div class="alert-danger alert" style="text-align:center">
	        		<h4>{{errorInfo}}</h4>
	        	</div>
        	</div>
        </div>
	</div>
	<div v-if="showPDF" class="row">
		<pdf :src="pdfSrc" id='pdfviewer' ref="vuepdf" :rotate="degreesPDF" @loaded="watermark(1000)"></pdf>
	</div>
	<div v-if="showPDF" class="text-center">
    <button @click="rotatePDF(1)" style="width:120px;height:40px;border:3px orange double;"><i class="fas fa-redo"></i> 順轉向</button>
    &nbsp;
    <button @click="rotatePDF(-1)" style="width:120px;height:40px;border:3px orange double;"><i class="fas fa-undo"></i> 逆轉向</button>
  </div>
</div>
</template>

<script>
	  import { APISRV, GetAPIURL } from 'src/axios'
	  import { getAddr } from 'src/sign.js'
	  import { aes_decrypt,HASH_SHA256} from 'src/encryptipfs'
    import pdf from "vue-pdf";
	  let APIURL
	export default {
		data(){
			return{
				ipfshash:'',
				prvkey:'',
				errorInfo:'',
				showError:false,
				showPDF:false,
        pdfBase64: '',
				degreesPDF: 0,
        pdfBase64: ''
			}
		},
    components:{
        pdf
		},
		computed: {
			pdfSrc() {
				return { data: Buffer.from(this.pdfBase64, "base64") };       
			}     
		},
		created: async function() {
					APIURL = await GetAPIURL();
					this.ipfshash = this.$route.query.ipfs;
		},
		methods:{
			rotatePDF(dir) {
				if(dir === 1) {
					this.degreesPDF += 90;
					if(this.degreesPDF >= 360)
						this.degreesPDF = 0;
				} else {
					this.degreesPDF -= 90;
					if(this.degreesPDF <= -360)
						this.degreesPDF = 0;
				}
				this.watermark(300);
			},
			watermark(microSec) {
				var _this = this;
				const nowTime = new Date().toLocaleString();
				setTimeout(function() {
					var canvasPDF = _this.$refs.vuepdf.$el.childNodes[0].childNodes[0];
					var ctx = canvasPDF.getContext("2d");
					var h = canvasPDF.height;
					var w = canvasPDF.width;
					console.log(h + "," + w);
					ctx.font = "100px 黑体";
					//ctx.rotate(-20 * Math.PI / 180);
					for (var j = 1; j < 5; j+=2) {
						ctx.fillStyle = "rgba(255,255,255,0.5)";
						ctx.fillText("本檔僅供驗證使用", w/2 - 400, j * (h/5));
					}
					for (var j = 1; j < 5; j+=2) {
						ctx.fillStyle = "rgba(0,0,0,0.3)";
						ctx.fillText("本檔僅供驗證使用", w/2 - 400, j * (h/5));
					}
					for (var j = 2; j < 5; j+=2) {
						ctx.fillStyle = "rgba(255,255,255,0.5)";
						ctx.fillText(nowTime, w/2 - 500, j * (h/5));
					}
					for (var j = 2; j < 5; j+=2) {
						ctx.fillStyle = "rgba(0,0,0,0.3)";
						ctx.fillText(nowTime, w/2 - 500, j * (h/5));
					}
					//ctx.rotate(20 * Math.PI / 180);
				}, microSec)
			},
			async getIPFShash(){
				this.ipfshash = this.ipfshash.trim();
				this.prvkey = this.prvkey.trim();
				console.log("ipfshash = ",this.ipfshash)
				var body = {
		            hash: this.ipfshash,
                role:0
	            };
      	var resp = await APISRV.post(APIURL + '/datasrc/db/ipfshash', body);
      	console.log("resp = ",resp)
      	var ret = resp.data
      	// console.log("ret = ",ret)
      	if(ret === "file expired" || ret === "file got from ipfs is wrong,wrong format" || ret === "hash not found" || ret === "Contract not yet deployed" || ret ==="file not exist"){
      		this.errorInfo = ret;
      		this.showError = true;
					this.showPDF = false;
      		return ;
      	}
      	else{
          console.log("decrypt")
      		var plaintext = aes_decrypt(ret,this.prvkey);
          if(plaintext === "wrong"){
            this.errorInfo = "wrong ipfs code or wrong key";
            this.showError = true;
						this.showPDF = false;
            return ;
          }
          else{
            this.pdfBase64 = plaintext
						//this.downloadPdf();
						this.showError = false;
						this.showPDF = true;
      	 }
        }
			},
      async downloadPdf () {
        let buff = new Buffer(this.pdfBase64, 'base64');
        this.downloadData('tmpCert.pdf', buff);
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
      }
		}
	}
</script>