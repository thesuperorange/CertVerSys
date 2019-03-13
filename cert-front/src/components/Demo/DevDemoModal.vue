<template>
  <div>
  <p>BASE ON <a href="https://github.com/euvl/vue-js-modal">euvl/vue-js-modal: Simple to use, highly customizable, mobile friendly Vue.js 2.0+ modal.</a></p>
  <button @click="openModal" variant="primary" class="btn btn-info btn-fill btn-wd">延遲反應</button>
   <modal name="foo"  @before-open="beforeOpen"
         @before-close="beforeClose">


    <div slot="top-right">
      <button @click="$modal.hide('foo')">
        ❌
      </button>
    </div>

    <div>
    <h3 style="text-align:center">Hello, ☀️!</h3>
    <spinner size="huge" message="寫入區塊鏈中..."></spinner>
    </div>

  </modal>
  </div>
</template>
<script>
import { APISRV } from "src/axios";
import Spinner from "vue-simple-spinner";

export default {
  components: {
    Spinner
  },
  data() {
    return {
      time: 0,
      duration: 9000
    };
  },
  methods: {
    openModal() {
      this.$modal.show("foo");
    },

    beforeOpen(event) {
      console.log(event);
      // Set the opening time of the modal
      this.time = Date.now();
    },

    beforeClose(event) {
      console.log(event);
      // If modal was open less then 5000 ms - prevent closing it
      let isTimeout = this.time + this.duration < Date.now();
      if (!isTimeout) {
        event.stop();
      }
    }
  }
};
</script>
<style>
</style>
