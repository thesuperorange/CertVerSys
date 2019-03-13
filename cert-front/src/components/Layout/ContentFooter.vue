<template>
  <footer class="footer">
    <div class="container-fluid" style="margin:20px;">
      <nav class="pull-left">
        <ul>
          <li>
            <a :href="gotoManual">使用說明</a>
            <!-- <router-link :to="gotoManual">操作流程</router-link> -->
          </li>
        </ul>
      </nav>
      <div class="pull-center text-center">
        <img class="img-logo" src="static/img/nchcbclab.png"><br>
        &copy; 2018, 國家高速網路與計算中心
        <a href="https://www.nchc.org.tw/tw/" target="_blank">NCHC</a>.
        Designed by <a href="#" target="_blank">Blockchain Lab</a>.
        <br>最佳瀏覽建議： Chrome 瀏覽器 ♦ 最佳解析度：1280x768
      </div>
    </div>
  </footer>
</template>
<script>
  export default {
    computed: {
      gotoManual () {
        console.log(window.location.host);
        return '/static/manual.pdf';
      }
    }
  }

</script>
<style>
.img-logo {
  max-width:20%;
  max-height:20%;
}
</style>
