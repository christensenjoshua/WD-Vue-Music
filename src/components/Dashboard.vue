<template>
  <div class="dashboard row justify-content-around">
    <div class="col-6">
      <h1 class="col-12 title">Music</h1>
      <form @submit.prevent="search(query); query = '';">
        <div class="form-group">
          <label for="name">Search</label>
          <input class="form-control" type="text" id="query" v-model="query">
        </div>
        <button class="btn btn-dark margin-bottom" type="submit">Search</button>
      </form>
    </div>
    <div class="col-6 pre-scrollable playlist-container">
      <div class="row border border-light rounded text-white bg-dark text-left justify-content-between" v-for="song in playlist">
        <div class="col">
          <img :src="song.artworkUrl60">
        </div>
        <div class="col">
          <p>{{song.trackName}}</p>
        </div>
        <div class="col">
          <p>{{song.artistName}}</p>
        </div>
        <div class="col">
          <button class="btn btn-danger btn-sm float-right" @click="removePlaylist(song.id)">X</button>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="container-fluid">
        <div class="row justify-content-between">
          <div class="col-4" v-for="song in songs">
            <div class="card text-white bg-dark" style="max-width: 40rem;">
              <div class="card-body">
                <h3 class="card-title">{{song.trackName}}</h3>
                <h5>By: {{song.artistName}}</h5>
                <img :src="song.artworkUrl60">
                <br />
                <button class="btn btn-primary" @click="addPlaylist(song)">Add to Playlist</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Dashboard',
    data() {
      return {
        query: ''
      }
    },
    computed: {
      songs() {
        return this.$store.state.songs
      },
      user() {
        return this.$store.state.user
      },
      playlist() {
        return this.$store.state.playlist
      }
    },
    methods: {
      search(query) {
        this.$store.dispatch('search', query)
      },
      addPlaylist(song) {
        this.$store.dispatch('addPlaylist', song)
      },
      removePlaylist(id) {
        this.$store.dispatch('removePlaylist', id)
      }
    }
  }
</script>

<style scoped>
  .margin-bottom {
    margin-bottom: 2rem;
  }

  .row {
    margin-left: 0px;
    margin-right: 0px;
  }

  .title {
    font-size: 4rem
  }

  .card {
    height: 20rem;
  }
</style>