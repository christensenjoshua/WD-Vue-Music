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
          <!-- Button trigger modal -->
          <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#manage-playlist-modal">
            Manage Playlists
          </button>


          <div class="row border shadow border-light rounded text-white bg-dark text-left justify-content-between" v-for="(song, index) in playlist">
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
              <button class="fa fa-arrow-circle-up" @click="priorityUp(index)"></button>
              <button class="fa fa-arrow-circle-down" @click="priorityDown(index)"></button>
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
                <button class="btn btn-primary btn-sm" @click="addPlaylist(song)">Add to Current Playlist</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="manage-playlist-modal" tabindex="-1" role="dialog" aria-labelledby="manage-playlist-modal-label"
      aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="manage-playlist-modal-label">Manage Playlists</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createPlaylist()">
              <input type="text" placeholder="Playlist Name" v-model="newPlaylist" required>
              <button type="submit" class="btn btn-success">Create Playlist</button>
            </form>
            <hr />
            <h5>Choose Active Playlist:</h5>
            <div class="text-left row" v-for="list in userPlaylists">
              <div class="col-10">
                <button type="button" class="btn btn-primary text-left btn-sm" style="white-space:normal;" @click="changeActiveList(list.id)"
                  data-dismiss="modal">{{list.name}}</button>
              </div>
              <div class="col-2">
                <button type="button" @click="deletePlaylist(list.id)" class="btn btn-danger btn-sm">X</button>
              </div>
              <br />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
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
        query: '',
        newPlaylist: ''
      }
    },
    mounted() {
      this.$store.dispatch('getUserPlaylists')
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
      },
      userPlaylists() {
        return this.$store.state.userPlaylists
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
      priorityUp(index) {
        this.$store.dispatch('priorityUp', index)
      },
      priorityDown(index) {
        this.$store.dispatch('priorityDown', index)
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
      },
      createPlaylist() {
        this.$store.dispatch('createPlaylist', this.newPlaylist)
        this.newPlaylist = ''
      },
      changeActiveList(listId) {
        this.$store.dispatch('changeActivePlaylist', listId)
      },
      deletePlaylist(listId) {
        this.$store.dispatch('deletePlaylist', listId)
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

  .button-wrap {
    word-wrap: break-word;
  }
</style>