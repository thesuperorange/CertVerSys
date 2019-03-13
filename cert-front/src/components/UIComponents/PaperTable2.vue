<template>
  <div>
    <div class="header">
      <slot name="header">
        <h4 class="title">{{title}}</h4>
        <p class="category">{{subTitle}}</p>
      </slot>
    </div>
    <div class="content table-responsive table-full-width">
      <table class="table" :class="tableClass">
        <thead>
          <th class="text-center" v-for="chtcolumn in chtcolumns">{{chtcolumn}}</th>
        </thead>
        <tbody>
          <tr v-for="item in data">
            <td class="text-center" v-for="column in columns" v-if="hasValue(item, column)">
              <a href='javascript: void(0)' v-if="itemValue(item, column) === '下載'" @click="clickDownload(item.id)">下載</a>
              <a href='javascript: void(0)' v-else-if="itemValue(item, column) === '查看'" @click="viewDetail(item.id)">查看</a>
              <a href='javascript: void(0)' v-else-if="itemValue(item, column) === '顯示'" @click="showQRCode(item.id)">顯示</a>
              <span v-else>{{itemValue(item, column)}}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
  import { APISRV, GetAPIURL } from 'src/axios'
  import { setTimeout } from 'timers';
  let APIURL

  function paddingLeft(str,length){
    if(str.length >= length)
    return str;
    else
    return paddingLeft("0" +str,length);
  }

  export default {
    data () {
      return {
        qrPngBase64: ''
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
      contractAddr: Object,
      userInfo: Object,
    },
    computed: {
      tableClass () {
        return `table-${this.type}`
      }
    },
    created: async function() {
      APIURL = await GetAPIURL();
    },
    methods: {
      hasValue (item, column) {
        return item[column.toLowerCase()] !== 'undefined'
      },
      itemValue (item, column) {
        return item[column.toLowerCase()]
      },
      clickDownload(certID) {
        this.$emit('downloadjws', certID);
      },
      viewDetail(certID) {
        this.$emit('showDetail', certID);
      }
    }
  }

</script>
<style>

</style>
