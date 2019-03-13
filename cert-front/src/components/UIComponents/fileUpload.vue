<template>
	<div class="content">
		<div class='row'>
			<div class="col-md-10 col-md-offset-0">
				<button v-on:click="addFiles()">加入證書檔案</button>
				<br>
				<div class="text-center">
					<label class="text-center">證書檔案列表</label>
				</div>
			</div>
    </div>
		<div class="table-responsive table-full-width">
			<input class="hidden-input" type="file" name='uploadfile' id="files" ref="files" multiple v-on:change="handleFilesUpload()"/>						<!-- trigger when input change-->
			<table class="table" :class="tableClass">
				<thead>
					<th class="text-center" >檔案名稱</th>
					<th class="text-center" >檔案大小</th>
					<th class="text-center" >移除</th>
				</thead>
				<tbody>
					<tr title="" v-for="(file, key) in files">
						<td class="text-center">{{ file.name }}</td>
						<td class="text-center">{{ file.size }} KB</td>
						<td class="text-center remove-file" v-on:click="removeFile( key )"><a><span>❌</span></a></td>
					</tr>
				</tbody>
			</table>
		</div>
    <br>
  </div>
</template>

<script>
	import axios from 'axios'
	import { aes_encrypt,HASH_SHA256 } from 'src/encryptipfs'
  export default {
		props: {
      type: {
        type: String, // striped | hover
        default: 'striped'
      }
    },
    data() {
      return {
        files: [],
        secret: "nchc",
      }
		},
		computed: {
      tableClass () {
        return `table-${this.type}`
      }
    },
    methods: {
      addFiles() {
				this.$refs.files.click();	//trigger onchange event
				this.updateFilesList();
      },
      VueAESEncrypt(plaintext,key){
      	return aes_encrypt(plaintext,key);
      },
      handleFilesUpload() {
      	let _this = this
        let uploadedFiles = this.$refs.files.files;
        for( var i = 0; i < uploadedFiles.length; i++ ){
          this.files.push( uploadedFiles[i] );
          	console.log("files = ",uploadedFiles[i])
            // var reader = new FileReader();
            // reader.onload = function(e) {
            	// var f = new File([reader.result], "enc.pdf", {type: "text/plain"})
            	// _this.files.push(f)
			  // var textToSaveAsBlob = new Blob([reader.result], {type:"application/pdf",name:"encrypt_tmp"});
			  // console.log("Blob = ",textToSaveAsBlob)
			// }
          // reader.readAsDataURL(uploadedFiles[i])
		}
			this.updateFilesList();
      },
      removeFile( key ) {
				this.files.splice( key, 1);
				this.updateFilesList();
			},
	  updateFilesList() {
		this.$emit('updateFilesList', this.files);
	  }
    }
  }
</script>
<style>
  input[type="file"].hidden-input{
    position: absolute;
    top: -500px;
		left: -1000px;
		opacity: 0;
  }
</style>