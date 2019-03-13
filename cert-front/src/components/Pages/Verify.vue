<template>
    <div class="row">
      <div class='col-md-12'>
        <div class="card" style="margin-top:20px;">
          <div style="display: inline-block; height: 40px; margin-left:20px; margin-top:10px; vertical-align:middle;">jws檔案：</div>
          <input id='jwsfile' type='file' style="height:50px; margin:0 20px;" @click="clearMessage">
          <spinner v-if="showSpinner" size="medium" message="驗證中..."></spinner>
          <div v-if="verifyCorrect" class="text-center">驗證成功 ✔️<br><br></div>
        </div>
      </div>
      <div class="text-center">
        <button type="submit" sytle="margin-bottom:20px;" class="btn btn-info btn-fill btn-wd" @click.prevent="checkJwsFile()">
          驗證
        </button>
      </div>
      <br>
      <div v-if="verifyCorrect" class="col-sm-12 col-md-12">
        <pdf :src="pdfSrc" id='pdfviewer' ref="vuepdf" :rotate="degreesPDF"></pdf>
      </div>
      <div v-if="verifyCorrect" class="text-center">
         <button @click="rotatePDF(1)" style="width:120px;height:40px;border:3px orange double;"><i class="fas fa-redo"></i> 順轉向</button>
          &nbsp;
          <button @click="rotatePDF(-1)" style="width:120px;height:40px;border:3px orange double;"><i class="fas fa-undo"></i> 逆轉向</button>
      </div>
    </div>
</template>

<script>

  document.oncontextmenu = function(){
		window.event.returnValue=false; //將滑鼠右鍵事件取消
  }
  
  import Spinner from "vue-simple-spinner";
  import { APISRV, GetAPIURL } from 'src/axios'
  import pdf from "vue-pdf";
  let APIURL

  export default {
    props: {
      contractAddr: Object,
      userInfo: Object
    },
    components: {
      Spinner,
      pdf
    },
    data () {
      return {
        verifyCorrect: false,
        jwsObj: Object,
        pdfBase64: '',
        showSpinner: false,
        degreesPDF: 0,
      }
    },
    created: async function() {
      APIURL = await GetAPIURL();
    },
    methods: {
      checkJwsFile: function() {
        const _this = this;
        _this.showSpinner = true;
        var selectedJwsFile = document.getElementById('jwsfile').files[0];
        var text;
        //console.log(selectedJwsFile);
        var fReader = new FileReader();
        fReader.onloadend = function (event) {
          text = fReader.result;
        }
        var value = fReader.readAsText(selectedJwsFile)
        setTimeout(async function() {
          var jwscontent = fReader.result;
          try {
            _this.jwsObj = JSON.parse(jwscontent);
          }
          catch (e) {
            _this.showSpinner = false;
            alert('不是正確的驗證檔');
          }
          console.log(_this.jwsObj);
          const body = {
            contractname: _this.jwsObj.org_contract,
            idIssuer: 0,
            idSubject: 1,
            jwsfile: _this.jwsObj,
            certID: _this.jwsObj.certID,
          };
          try {
            var res = await APISRV.post( APIURL + '/cert/sign/verifyfile', body);
            const isCorrect = res.data;
            console.log(isCorrect);
            if(isCorrect === 'true') {
              _this.getPdf();
              _this.showSpinner = false;
              _this.verifyCorrect = true;
            }
            else {
              _this.showSpinner = false;
              _this.verifyCorrect = false;
              alert('驗證失敗!');
            }
          }
          catch (e) {
            _this.showSpinner = false;
            _this.verifyCorrect = false;
            alert('驗證失敗!');
          }
          //_this.downloadData(certID+'.jws', res.data);
        },500);
      },
      async getPdf () {
        const certpath = './cert/' + this.jwsObj.owner_addr + this.jwsObj.certID + '.pdf';
        const body = {
          pdfpath: certpath
        }
        var resp = await APISRV.post( APIURL + '/cert/sign/get-pdf', body);
        this.pdfBase64 = resp.data;
        console.log(this.pdfBase64);
      },
      async downloadPdf () {
        
        let buff = new Buffer(this.pdfBase64, 'base64');
        this.downloadData(this.jwsObj.certID + '.pdf', buff);
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
      clearMessage () {
        this.verifyCorrect = false
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
				//this.watermark(300);
			}
    },
    computed: {
      pdfSrc() {
        return { data: Buffer.from(this.pdfBase64, "base64") };
      }
    }
  }

</script>
<style>

</style>
