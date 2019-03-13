<template>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
			<div class="content">
				<div class='row'>
					<div class='col-md-10'>
						<div class="text-center">
							<div>Step1. Fetch information from QRcode {{ getCorrect1 }}</div>
						</div>
					</div>
				</div>
				<hr>
				<div class='row'>
					<div class='col-md-10'>
						<div class="text-center">
							<div>Step2. Download Cert data from IPFS {{ getCorrect2 }}</div>
						</div>
					</div>
				</div>
				<hr>
				<div class='row'>
					<div class='col-md-10'>
						<div class="text-center">
							<div>Step3. Decode IPFS Cert data {{ getCorrect3 }}</div>
						</div>
					</div>
				</div>
				<hr>
				<div class='row'>
					<div class='col-md-10'>
						<div class="text-center">
							<div>Step4. Get hashed Cert from Blockchain {{ getCorrect4 }}</div>
						</div>
					</div>
				</div>
				<hr>
				<div class='row'>
					<div class='col-md-10'>
						<div class="text-center">
							<div>Step5. Compare hash value {{ getCorrect5 }}</div>
						</div>
					</div>
				</div>
			</div>
        </div>
      <div v-if="showPDF" class="col-sm-12 col-md-12">
        <pdf :src="pdfSrc" id='pdfviewer' ref="vuepdf" :rotate="degreesPDF" @loaded="watermark(800)"></pdf>
        <br>
        <div class="text-center">
          <button @click="rotatePDF(1)" style="width:120px;height:40px;border:3px orange double;"><i class="fas fa-redo"></i> 順轉向</button>
          &nbsp;
          <button @click="rotatePDF(-1)" style="width:120px;height:40px;border:3px orange double;"><i class="fas fa-undo"></i> 逆轉向</button>
        </div>
      </div>
		  <br>
      </div>
    </div>
</template>

<script>
  var CryptoJS = require("crypto-js");
  const SHA256 = require('crypto-js/sha256');
  import { APISRV, GetAPIURL, GetCERTDB_ADDR } from 'src/axios'
  import pdf from "vue-pdf";
  
	document.oncontextmenu = function(){
		window.event.returnValue=false; //將滑鼠右鍵事件取消
	}
  function paddingLeft(str,length){
    if(str.length >= length)
    return str;
    else
    return paddingLeft("0" +str,length);
	}
	
	let APIURL
  export default {
		components: {
			pdf
		},
    data () {
      return {
				correct1: 0,
				correct2: 0,
				correct3: 0,
				correct4: 0,
				correct5: 0,
				code: '',
				showPDF: false,
        pdfbase64: '',
        encpdfbase64: '',
				certBuff: '',
				certID: '',
				orgAddr: '',
        degreesPDF: 0,
        BC_certHash: ''
      }
		},
		created: async function() {
			APIURL = await GetAPIURL();
		},
		computed: {
			pdfSrc() {
				return { data: Buffer.from(this.pdfbase64, "base64") };
			},
			getCorrect1 () {
				if (this.correct1 === 0)
					return ''
				else if (this.correct1 === 1)
					return '✔️'
				else 
					return '❌'
			},
			getCorrect2 () {
				if (this.correct2 === 0)
					return ''
				else if (this.correct2 === 1)
					return '✔️'
				else 
					return '❌'
			},
			getCorrect3 () {
				if (this.correct3 === 0)
					return ''
				else if (this.correct3 === 1)
					return '✔️'
				else 
					return '❌'
			},
			getCorrect4 () {
				if (this.correct4 === 0)
					return ''
				else if (this.correct4 === 1)
					return '✔️'
				else 
					return '❌'
			},
			getCorrect5 () {
				if (this.correct5 === 0)
					return ''
				else if (this.correct5 === 1)
					return '✔️'
				else 
					return '❌'
			}
		},
    async mounted () {
			var _this = this;
			this.code = this.$route.query.code;
			const schoolID = this.code.slice(13+46);
			const CERTDB_ADDR = await GetCERTDB_ADDR();
			// 取得school Addr
			const body = {
        idIssuer: 0,
        idSubject: 1,
        orgID: schoolID,
        contract: CERTDB_ADDR
      }
      var resp = await APISRV.post( APIURL + '/cert/get-org-info', body);
      this.orgAddr = resp.data.orginfo_in_sc[1];

	    console.log(this.orgAddr); 
			setTimeout(function() {
				_this.verify1();
			},500)
			
      
    },
    methods: {
			async verify1 () {
				//--------- 1 -------------
				var _this = this;
				var body = {
					verifycode: this.code
				};
				try {
					var resp = await APISRV.post( APIURL + '/cert/sign/verify_qrcode_1', body);
					console.log(resp.data);
					if(resp.data) {
						_this.correct1 = 1;
						setTimeout(function () {
							_this.verify2();
						},600)
					} else {
						_this.correct1 = -1;
						alert('驗證失敗!');
					}
				}
				catch (e) {
					_this.correct1 = -1;
					alert('驗證失敗!');
				}
			},
      async verify2 () {
        var _this = this;
        var body = {
          hash: this.code.slice(13, 13+46),
          role: 1
        };
        var resp = await APISRV.post(APIURL + "/datasrc/db/ipfshash", body);
        console.log("resp = ", resp);
        if (resp.data === "Contract not yet deployed") {
          _this.correct2 = -1;
          alert("合約尚未佈署");
          
          return;
        } else if (resp.data === "file expired" 
									|| resp.data === "file got from ipfs is wrong,wrong format" 
									|| resp.data === "hash not found" 
									|| resp.data === "file not exist"
									|| resp.data === "remove IPFS:OK") {
          _this.correct2 = -1;
          alert("檔案出錯了!");
        } else {
          this.encpdfbase64 = resp.data.toString("base64");
          _this.correct2 = 1;
				  setTimeout(function () {
					  _this.verify3();
				  },800)
        }
				//--------- 2 -------------
				// var _this = this;
				// var body = { };
				// try {
				// 	var resp = await APISRV.post( APIURL + '/cert/sign/verify_qrcode_2', body);
				// 	console.log(resp.data);
				// 	if(resp.data) {
				// 		_this.correct2 = 1;
				// 		setTimeout(function () {
				// 			_this.verify3();
				// 		},800)
				// 	} else {
				// 			_this.correct2 = -1;
				// 			alert('驗證失敗!');
				// 	}
				// }
				// catch (e) {
				// 		_this.correct2 = -1;
				// 		alert('驗證失敗!');
				// }
			},
			async verify3 () {
				//--------- 3 -------------
				var _this = this;
				var body = {
					file: this.encpdfbase64
				};
				try {
					var resp = await APISRV.post( APIURL + '/cert/sign/verify_qrcode_3', body);
          this.pdfbase64 = resp.data;
					if(resp.data) {
						_this.correct3 = 1;
						setTimeout(function () {
							_this.verify4();
						},100)
					} else {
							_this.correct3 = -1;
							alert('驗證失敗!');
					}
				}
				catch (e) {
						_this.correct3 = -1;
						alert('驗證失敗!');
				}
			},
			async verify4 () {
        	//--------- 5 -------------
				var _this = this;
				var body = {
					idIssuer: 0,
					idSubject: 1,
					verifycode: this.code,
					contractname: this.orgAddr
				};
				try { 
					var resp = await APISRV.post( APIURL + '/cert/sign/verify_qrcode_4', body);
          this.BC_certHash = resp.data;
					if(resp.data) {
					_this.correct4 = 1;
						setTimeout(function () {
							_this.verify5();
						},1000)
					} else {
						_this.correct4 = -1;
						alert('驗證失敗!');
					}
        }
        catch (e) {
						_this.correct4 = -1;
						alert('驗證失敗!');
				}
			},
			async verify5 () {
        //--------- 4 -------------
        var _this = this;
				try { 
          const combined_cert_hash = '0x' + SHA256(this.pdfbase64).toString(CryptoJS.enc.Hex);
					if(combined_cert_hash === this.BC_certHash) {
            	_this.correct5 = 1;
						setTimeout(function() {
							alert('QR-CODE正確，驗證成功!');
							_this.showPDF = true;
						},300)
					} else {
						_this.correct5 = -1;
						_this.showPDF = false;
						alert('驗證失敗!');
					}	
				}
				catch (e) {
						_this.correct5 = -1;
						_this.showPDF = false;
						alert('驗證失敗!');
        }
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
					ctx.font = "85px 黑体";
					//ctx.rotate(-20 * Math.PI / 180);
					for (var j = 1; j < 5; j+=2) {
						ctx.fillStyle = "rgba(255,255,255,0.5)";
						ctx.fillText("本檔僅供驗證使用", w/2 - 310, j * (h/5));
					}
					for (var j = 1; j < 5; j+=2) {
						ctx.fillStyle = "rgba(0,0,0,0.3)";
						ctx.fillText("本檔僅供驗證使用", w/2 - 310, j * (h/5));
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
			}
		}
  }

</script>
<style>

</style>
