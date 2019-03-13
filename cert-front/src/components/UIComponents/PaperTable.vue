<template>
  <div>
    <div class="content table-responsive table-full-width">
      <table class="table" :class="tableClass">
        <thead>
          <th>全選/全不選 <input  class="myinput"  type="checkbox" @click="selectAll" v-model="isSelectall"></th>
          <th v-for="chtcolumn in chtcolumns">{{chtcolumn}}</th>
        </thead>
        <tbody>
          <tr v-for="(item, index) in data">
            <td><input class="myinput" type="checkbox" :value="item['id']" v-model="selectedList[index]" @click="select"></td>
            <td v-for="column in columns" v-if="hasValue(item, column)">{{itemValue(item, column)}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="clearfix"></div>
    <br>
  </div>
</template>
<script>
  export default {
    props: {
      columns: Array,
      data: Array,
      type: {
        type: String, // striped | hover
        default: 'striped'
      },
      chtcolumns: Array
    },
    data () {
      return {
        isSelectall: false,
        selectedList:[],
        selectedAddrList:[],
        studentidList:[]
      }
    },
    watchs: {
      selectedAddrList: function() {
        console.log('change selectedAddrList');
      }
      //this.$emit("gotoNext", this.selectedAddrList);
    },
    computed: {
      tableClass () {
        return `table-${this.type}`
      }
    },
    created () {
      console.log(this.isSelectall);
    },
    methods: {
      hasValue (item, column) {
        return item[column.toLowerCase()] !== 'undefined'
      },
      itemValue (item, column) {
        return item[column.toLowerCase()]
      },
      selectAll: function() {
        var _this = this;
        setTimeout(function() {
          console.log(_this.isSelectall);
        _this.selectedAddrList = [];
        _this.studentidList = [];
        if (_this.isSelectall) {
          for (var index in _this.data) {
            _this.selectedAddrList.push(_this.data[index].address);
             _this.$set(_this.selectedList, index, true);
             _this.studentidList.push(_this.data[index].studentid);
          }
        } else {
          for (var index in _this.data) {
            _this.$set(_this.selectedList, index, false);
          }
        }
        
        _this.$emit('updateSelectedAddr', { addrList: _this.selectedAddrList, sudIDList: _this.studentidList });
        },50);
        
      },
      select: function() {
        const _this = this;
        setTimeout(function () {
          console.log(_this.selectedList);
          _this.selectedAddrList = [];
          _this.studentidList = [];
          for(var index in _this.selectedList) {
            if(_this.selectedList[index]) {
              _this.selectedAddrList.push(_this.data[index].address);
              _this.studentidList.push(_this.data[index].studentid);
            }
          }
          _this.$emit('updateSelectedAddr',  { addrList: _this.selectedAddrList, sudIDList: _this.studentidList });
          }, 50);
      },

    }
  }

</script>
<style>
input[type=checkbox].myinput {
    opacity: 1;
    margin: 5px;
    width: 15px;
    height: 25px;
}
</style>
