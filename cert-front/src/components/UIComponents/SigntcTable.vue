<template>
  <div>
    <div class="header">
      <slot name="header">
        <h4 class="title">{{title}}</h4>
        <p class="category">{{subTitle}}</p>
      </slot>
    </div>
    <input id="checkall" type="checkbox" v-model="isSelectall" @click="selectall" class="myinput">全選/全不選
    <hr>
    <div class="content container-fluid">
        
      <div v-for="(item,index) in data">
          <div>
            <input v-if="!signed[index]" :id="'checkbox'+index" type="checkbox" v-model="selected[index]" class="myinput" @click="changeCheck">
            <label :class="[signed[index] ? 'signfinish' : '', ]"> 
              {{  signed[index] ? '此證書已簽署完畢' : (selected[index] ? '已加入待簽署列表':'尚未簽署') }}
            </label>
          </div>
          <div class="row">
            <div class="col-sm-12 col-md-8">
              <div v-for="(column,index2) in columns" v-if="hasValue(item, column)" class="row">
                <div class="col-3 col-sm-3 text-left text-sm-right">{{ chtcolumns[index2] }} :</div>
                <p class="col-12 col-sm-9 text-left word-break"> {{itemValue(item, column)}}</p>
              </div>
              <div class="row">
                <div class="col-3 col-sm-3 text-left text-sm-right">查看證書 :</div>
                <a href='javascript: void(0)' class="col-12 col-sm-9 text-left word-break" @click.prevent="showBigPdf(item.owneraddr)">點擊查看</a>
              </div>
            </div>
            <div class="col-sm-12 col-md-3">
              <embed @click="showBigPdf" width="100%" height="100%" :src="pdfbase64[item.owneraddr]" type="application/pdf">
              <!-- <iframe :src="pdfbase64[item.owneraddr]" frameborder="0" style="width:100%; height:100%;"></iframe> -->
            </div>
          </div>
        <hr>
      </div>
      
      <!-- <table class="table" :class="tableClass">
        <thead>
          <th v-for="chtcolumn in chtcolumns">{{chtcolumn}}</th>
        </thead>
        <tbody>
          <tr v-for="item in data">
            <td v-for="column in columns" v-if="hasValue(item, column)">{{itemValue(item, column)}}</td>
          </tr>
        </tbody>
      </table> -->
    </div>
  </div>
</template>

<script>
  export default {
    data () {
        return {
            isSelectall: false,
            selected: []
        }
    },
    created () {

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
      signed: Array,
      pdfbase64: Object
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
      },
      selectall() {
          console.log(this.selected)
          console.log(this.isSelectall)
          console.log(this.data.length);
          if(this.isSelectall) {
              for(var index in this.data){
                  this.selected[index] = false;
              }
          } else {
              for(var index in this.data){
                if(!this.signed[index])
                  this.selected[index] = true;
              }
          }
          var _this = this;
          setTimeout(function() {
               _this.$emit('updateSelectd', _this.selected);
          },100);
      },
      changeCheck() {
          this.isSelectall = false;
          var _this = this;
          setTimeout(function() {
               _this.$emit('updateSelectd', _this.selected);
          },100);
      },
      showBigPdf(ownerAddr) {
        var qrEmbedElement = document.createElement("EMBED");
        qrEmbedElement.src = this.pdfbase64[ownerAddr];
        qrEmbedElement.style = "width:100%; height:100%";
        var w = window.open('', 'title', "width=800, height=600");
        w.document.title = 'PDF';
        w.document.write(qrEmbedElement.outerHTML);
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
  hr.myhr {
      margin-top: 5px;
      margin-bottom: 5px;
  }
  label.signfinish {
    color: dodgerblue;
  }
  input[type=checkbox].myinput {
    opacity: 1;
    margin: 5px;
    width: 15px;
    height: 25px;
  }
</style>



