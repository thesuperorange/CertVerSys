<template>
    <div class="row">
      <div class="col-lg-5 col-md-6">
        <user-card v-bind:contractAddr="contractAddr" v-bind:userInfo.sync="userInfo">

        </user-card>

      </div>
      <div class="col-lg-4 col-md-5">
        <!-- <members-card> </members-card> -->
      </div>
    </div>
</template>
<script>

  import UserCard from './UserProfile/UserCard.vue'
  import MembersCard from './UserProfile/MembersCard.vue'
  export default {
    props: {
      contractAddr: Object,
      userInfo: Object
    },
    components: {
      UserCard,
      MembersCard
    },
    data () {
      return {
      }
    },
    name: 'userINFO',
  }

</script>
<style>

</style>
