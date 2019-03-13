<template>
  <div>
    <div class="header">
      <slot name="header">
        <h4 class="title">{{title}}</h4>
        <p class="category">{{subTitle}}</p>
      </slot>
    </div>
    <hr>
    <div class="content container-fluid">
      <div v-for="item in data">
        <div v-for="(column,index) in columns" v-if="hasValue(item, column)" class="row">
          <div class="col-3 col-sm-3 text-left text-sm-right">{{ chtcolumns[index] }} :</div> 
          <p class="col-12 col-sm-9 text-left word-break"> {{itemValue(item, column)}}</p>
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
<style>
  .word-break {
    word-wrap: break-word;
  }
  @media screen and (min-width: 768px) {
    .text-sm-right {
      text-align: right;
    }
  }
  
</style>
<script>
  export default {
    created () {
      console.log(this.columns);
      console.log(this.data);
      console.log(this.title);
      console.log(this.chtcolumns);
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
      chtcolumns: Array
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

