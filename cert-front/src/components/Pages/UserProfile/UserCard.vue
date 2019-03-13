<template>
  <div class="card card-user">
    <div class="image">
      <img src="static/img/background2.png" alt="...">
    </div>
    <div class="content">
      <div class="author">
        <img class="avatar border-white" src="static/img/faces/face-sample.png" alt="...">
        <h4 class="title">姓名：{{ userInfo.userName }}
          <br>
          <a href="#">
            <small>帳號：{{ userInfo.userIDOri }}</small>
          </a>
        </h4>
      </div>
      <div class="description text-center">
        <div>身份：{{ userInfo.role }}</div>
        <div>學校：{{ userInfo.schoolName }}</div>
        <div>學校ID：{{ userInfo.schoolIDOri }}</div>
        <div v-if="userInfo.role === '學生'">學號：{{ userInfo.studentID }}</div>
        <div v-if="userInfo.role === '學生'">班級：{{ userInfo.classTitle }}</div>
      </div>
    </div>
    <hr>
    <div class="text-center">
      <div class="row">
        <div class="col-md-12">
          <h5>我的區塊鏈地址
            <br>
            <small>{{ userInfo.address }}</small>
          </h5>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    userInfo: Object
  },
  data () {
    return {
      
    }
  },
  created: async function () {
    console.log(this.userInfo);
  }
}
</script>
