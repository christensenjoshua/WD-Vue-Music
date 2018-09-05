<template>
  <div class="dashboard row justify-content-around">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 col-lg-6 border border-dark rounded">
          <h1 class="col-12 title">Music</h1>
          <form @submit.prevent="search(query); query = '';">
            <div class="form-group">
              <label for="name">Search</label>
              <input class="form-control" type="text" id="query" v-model="query">
            </div>
            <button class="btn btn-dark margin-bottom" type="submit">Search</button>
          </form>
          <div v-if="playlist[0]">
            <audio controls id="music-player">
              <source :src="playlist[0].previewUrl" type="audio/mp4">
            </audio>
            <p id="now-playing">Now Playing - {{playlist[0].trackName}} by {{playlist[0].artistName}}</p>
          </div>
        </div>
        <div class="col-12 col-lg-6 pre-scrollable border border-dark rounded playlist-container">
          <div class="row border border-light rounded text-white bg-dark text-left justify-content-between" v-for="song in playlist">
            <div class="col-2">
              <img :src="song.artworkUrl60">
            </div>
            <div class="col-2">
              <button class="btn btn-primary btn-sm" @click="playSong(song)">Play</button>
            </div>
            <div class="col">
              <p>{{song.trackName}}</p>
              <p>{{song.artistName}}</p>
            </div>
            <div class="col-1">
              <button class="fa fa-arrow-circle-up" @click="priorityUp(song)"></button>
              <button class="fa fa-arrow-circle-down" @click="priorityDown(song)"></button>
            </div>
            <div class="col-1">
              <button class="btn btn-danger btn-sm float-right" @click="removePlaylist(song.id)">X</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="container-fluid">
        <div class="row justify-content-between">
          <h1 class="col-12 title" v-if="songs[0]">Results</h1>
          <div class="col-6 col-md-4" v-for="song in songs">
            <div class="card text-white bg-dark" style="max-width: 40rem;">
              <div class="card-body">
                <h3 class="card-title">{{song.trackName}}</h3>
                <h5>By: {{song.artistName}}</h5>
                <img :src="song.artworkUrl100">
                <hr />
                <button class="btn btn-primary btn-sm" @click="playSong(song)">Play</button>
                <button class="btn btn-primary btn-sm" @click="addPlaylist(song)">Add to Playlist</button>
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
    mounted() {
      this.$store.dispatch('getPlaylist')
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
      },
      priorityUp(song) {
        this.$store.dispatch('priorityUp', song)
      },
      priorityDown(song) {
        this.$store.dispatch('priorityDown', song)
      },
      playSong(song) {
        let audioElem = document.getElementById('music-player')
        let playingElem = document.getElementById('now-playing')
        audioElem.load()
        let template = `
        <source src="${song.previewUrl}" type="audio/mp4">
          `
        audioElem.innerHTML = template
        template = `
          Now Playing - ${song.trackName} by ${song.artistName}
          `
        playingElem.innerHTML = template
        audioElem.play()
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