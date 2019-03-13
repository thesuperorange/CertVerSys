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
          <tr title="點擊顯示詳細資訊" v-for="item in data" @click="sendClick(item.id)">
            <td class="text-center" v-for="column in columns" v-if="hasValue(item, column)">
              {{itemValue(item, column)}}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script>
  export default {
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
      },
      sendClick(issueID) {
        this.$emit('clickItem', issueID);
      }
    }
  }

</script>
<style>
  .list-item:hover {
    background-color: #ccc;
  }
</style>
