<template>
  <div class="card">
    <div class="header">
      <h4 class="title">步驟1.請填寫 證書發行內容(Issue certificate)</h4>
    </div>
    <div class="content">
      <form ref="issueform" > <!-- action="#/signcert" method="post"-->
        <div class="row">
          <div class="col-md-3">
            <fg-input type="text"
                      label="發行版本(Version)"
                      :disabled="true"
                      placeholder="version"
                      v-model="issueInfo.version"> 
            </fg-input>
          </div>
          <div class="col-md-5">
            <fg-input type="text"
                      label="發行名稱(Issue name)"
                      placeholder="輸入証書發行名稱"
                      v-bind:value="issueInfo.issuename" @change="issueInfo.issuename = $event.target.value">
            </fg-input>
          </div>
          <div class="col-md-4">
            <fg-input type="text"
                      :disabled="true"
                      label="發行撤銷(Revocation)"
                      placeholder="輸入畢業証書撤銷"
                      v-bind:value="issueInfo.revocation" @change="issueInfo.revocation = $event.target.value"> <!-- v-model="certdata.revocation" -->
            </fg-input>
          </div>
        </div>

        <div class="row">
          <div class="col-md-3">
            <label>發行類型(Issue type)</label>
            <select class="form-control border-input" 
                    name='issuetype'
                    v-model="issueInfo.issuetype" >
              <option value='0'>成績單(School Grade)</option>
              <option value='1' selected='selected'>畢業證書(Diploma)</option>
              <option value='2' selected=''>獎狀(Honor List)</option>
              <option value='3' selected=''>全民英檢(GEPT)</option>
            </select>
          </div>
          <div class="col-md-9">
            <fg-input type="text"
                      label="發行說明(Description)"
                      placeholder="輸入相關說明"
                      v-bind:value="issueInfo.description" @change="issueInfo.description = $event.target.value">
            </fg-input>
          </div>
        </div>
        <div class="clearfix"></div>
      </form>
    </div>
  </div>
</template>
<script>

  export default {
    props: {
      issueInfo: {}
    },
    data () {
      return {
        filesinfo: []
      }
    },
    methods: {
      getMsgfromUpload:function(data){
        
        this.filesinfo.push(data);
        console.log(this.filesinfo);
      }
    }
  }

</script>
<style>

</style>
