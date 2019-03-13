<template>
  <div>
    <div class="header">
      <slot name="header">
        <h4 class="title">{{title}}</h4>
        <p class="category">{{subTitle}}</p>
      </slot>
    </div>
    <div class="content">
      <div v-for="(item,index) in data">
          <div class="row">
            <div class="col-sm-12">
              <div v-for="(column,index2) in columns" v-if="hasValue(item, column)" class="row">
                <div class="col-3 col-sm-3 text-left text-sm-right">{{ chtcolumns[index2] }} :</div>
                <p class="col-12 col-sm-9 text-left word-break"> {{itemValue(item, column)}}</p>
              </div>
            </div>
          </div>
          <div class="col-md-5">
            <fg-input type="text"
                      label="希望的有效時間(Expire time)"
                      placeholder="以天為單位，最多7天"
                      v-bind:value="expire"
                      @change="expire = $event.target.value"> 
            </fg-input>
            <fg-input type="text"
                      label="密碼(mnemonic)"
                      placeholder="Mnemonic"
                      v-bind:value="ipfs_mnemonic"
                      @change="ipfs_mnemonic = $event.target.value"> 
            </fg-input>
            <fg-input type="text"
                      label="證書代碼(ipfshash)"
                      placeholder="Mnemonic"
                      :disabled="true"
                      v-bind:value="ipfshash"> 
            </fg-input>
              <button class="btn btn-info btn-fill" @click.prevent="getTmpCert">申請時效性證書</button>
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
    data () {
      return {
        
      }
    },
    props: {
      columns: Array,
      data: Array,
      type: {
        type: String, // striped | hover
        default: 'Striped'
      },
      title: {
        type: String,
        default: ''
      },
      subTitle: {
        type: String,
        default: ''

      },
      chtcolumns: Array,
    },
    computed: {
      tableClass () {
        return `table-${this.type}`
      }
    },
    methods: {
      hasValue (item, column) {
        return item[column.toLowerCase()] !== 'undefined'
      },
      itemValue (item, column) {
        return item[column.toLowerCase()]
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
