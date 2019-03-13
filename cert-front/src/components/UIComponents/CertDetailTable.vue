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
