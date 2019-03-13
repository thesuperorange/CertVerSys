<template>
  <div>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <paper-table 
            :title="revokeListTable.title" 
            :sub-title="revokeListTable.subTitle" 
            :data="revokeListTable.revokeList"
            :columns="revokeListTable.columns" 
            :chtcolumns="revokeListTable.chtcolumns" 
            :contractAddr="contractAddr"
            :userInfo="userInfo" 
            >
          </paper-table>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import {
    APISRV,
    GetAPIURL
  } from "src/axios";
  import {
    getAddr,
    SignString,
    getPubKey
  } from "src/sign.js";
  import Spinner from "vue-simple-spinner";
  import PaperTable from "components/UIComponents/PaperTable2.vue";
  let APIURL;

  function paddingLeft(str, length) {
    if (str.length >= length) return str;
    else return paddingLeft("0" + str, length);
  }
   function revokeInfo(id, name, date, isRevoc, detail) {
    this.id = id;
    this.name = name;
    this.date = date;
    this.isrevoc = isRevoc;
    this.detail = detail;
  }

  export default {
    props: {
      contractAddr: Object,
      userInfo: Object
    },
    components: {
      PaperTable,
      Spinner
    },
    data() {
      return {
        revokeListTable: {
          title: "已撤銷證書一覽",
          subTitle: "以下為已撤銷完成之證書",
          columns: ["Id", "Name", "Date", "isRevoc", "detail"],
          chtcolumns: [
            "證書ID",
            "證書名稱",
            "撤銷時間",
            "是否撤銷",
            "撤銷原因"
          ],
          revokeList: []
        }
      };
    },
    created: async function () {
        APIURL = await GetAPIURL();
        var resp = await APISRV.get(APIURL + "/datasrc/db/AllRevokeList");
        console.log(resp.data);
        const AllRevokeList = resp.data;
        for (var i = 0; i < AllRevokeList.length; i++) {
          var body = {
            revokehash: AllRevokeList[i]
          }
          var resp = await APISRV.post(APIURL + "/datasrc/db/DumpRevokeData", body);
          console.log(resp.data);
          const revokeData = resp.data;
          var revokeTime = new Date(parseInt(revokeData.timestamp));
          var timeFormat =
            revokeTime.getFullYear() +
            "/" +
            ("0" + (revokeTime.getMonth() + 1)).slice(-2) +
            "/" +
            ("0" + revokeTime.getDate()).slice(-2) +
            " " +
            ("0" + revokeTime.getHours()).slice(-2) +
            ":" +
            ("0" + revokeTime.getMinutes()).slice(-2) +
            ":" +
            ("0" + revokeTime.getSeconds()).slice(-2);
          this.revokeListTable.revokeList.push(new revokeInfo(revokeData.certID, revokeData.certificate_Name, timeFormat, revokeData.isRevoc?"是":"否", revokeData.Reason))
        }
      },
      methods: {}
  };

</script>

<style>
</style>
