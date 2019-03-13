<template>
  <div>
    <div class="header">
      <slot name="header">
        <h4 class="title">暫時性證書資訊</h4>
      </slot>
    </div>
    <div class="content">
    	<div class="row">
    		 <div class="col-sm-12">
    		 	 <div class="text-left">暫時性證書代碼(IPFS) :
    		 	 </div>
    		 	 <p class="text-left">{{ipfshash}}</p>
      		</div>
    	</div>
    	<div class="row">
    		<div class="col-sm-12">
    			<div class="text-left">暫時性金鑰</div>
    			<p class="text-left">{{prvKey}}</p>
    		</div>
    	</div>
    	<div class="row">
    		<div class="col-sm-12">
    			<div class="text-left">申請時間 : </div>
    			<p class="text-left">{{sttime}}</p>
    		</div>
    	</div>
    	<div class="row">
    		<div class="col-sm-12">
    			<div class="text-left">截止時間 : </div>
    			<p class="text-left">{{edtime}}</p>
    		</div>
    	</div>
			<div class="row">
    		<div class="col-sm-12">
    			<img :src="qrcode"><br>
    		</div>
    	</div>

    </div>
  </div>
</template>

<script>
function paddingLeft(str,length){
	if(str.length >= length)
		return str;
	else
		return paddingLeft("0" +str,length);
}

export default {
	props:{
		ipfshash:{
			type : String,
			default : ''
		},
		prvKey:{
			type : String,
			default : ''
		},
		sttime:{
			type:String,
			default:''
		},
		edtime:{
			type:String,
			default:''
		},
		qrcode:{
			type:String,
			default:''
		}
	}
}
</script>
<style>
  .word-break {
    word-wrap: break-word;
    margin: 0 0 3px;
  }
  @media screen and (min-width: 768px) {
    .text-sm-right {
      text-align: right;
    }
  }
</style>
