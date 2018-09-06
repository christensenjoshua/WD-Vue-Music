import vue from 'vue'
import vuex from 'vuex'
import router from '../router'
import firebase from 'firebase/app'
import 'firebase/auth'
import db from '../utils/firebaseInit'
import axios from 'axios'

vue.use(vuex)

let itunes = axios.create({
    baseURL: 'https://itunes.apple.com/search?term=',
    timeout: 5000
})

let store = new vuex.Store({
    state: {
        user: {},
        songs: [],
        playlist: [],
        userPlaylists: [],
        activePlaylist: ''
    },
    mutations: {
        setUser(state, user) {
            state.user = user
        },
        setSongs(state, songs) {
            state.songs = songs
        },
        setPlaylist(state, songs) {
            state.playlist = songs
        },
        setUserPlaylists(state, payload) {
            state.userPlaylists = payload
            if (payload[0]) {
                state.activePlaylist = payload[0].id
            } else {
                state.activePlaylist = state.user.uid + 'default'
            }
        },
        setActivePlaylist(state, payload) {
            state.activePlaylist = payload
        }
    },
    actions: {
        search({ commit, dispatch }, query) {
            itunes.get('' + query).then(res => {
                console.log("Itunes: ", res.data.results)
                commit("setSongs", res.data.results)
            })
                .catch(err => { console.error(err) })
        },
        // USER AUTHENTICATION
        register({ commit, dispatch }, user) {
            firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
                .then(res => {
                    router.push("/dashboard")
                    commit("setUser", res.user)
                    firebase.auth().currentUser.updateProfile({ displayName: user.displayName })
                        .then(res => {
                            console.log("Profile Updated")
                        })
                        .catch(err => { console.error(err) })
                    firebase.auth().currentUser.sendEmailVerification()
                        .then(res => {
                            console.log("Verification Email Sent")
                        })
                        .catch(err => { console.error(err) })
                })
                .catch(err => { console.error(err) })
        },
        login({ commit, dispatch }, user) {
            firebase.auth().signInWithEmailAndPassword(user.email, user.password)
                .then(res => {
                    router.push('/dashboard')
                    commit("setUser", res.user)
                })
                .catch(err => { console.error(err) })
        },
        logout({ commit, dispatch }) {
            firebase.auth().signOut()
                .then(res => {
                    router.push('/login')
                    commit('setUser', {})
                })
                .catch(err => { console.error(err) })
        },
        authenticate({ commit, dispatch }) {
            // you can change the default route here
            //if someone is signed in, it goes to dashboard, if not, go to auth
            firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    commit("setUser", user)
                    router.push('/dashboard')
                } else {
                    router.push('/login')
                }
            });
        },
        getUserPlaylists({ state, commit, dispatch }) {
            db.collection('playlists').where('creatorId', '==', state.user.uid).get().then(querySnapshot => {
                let userPlaylists = []
                querySnapshot.forEach(doc => {
                    let list = doc.data()
                    list.id = doc.id
                    userPlaylists.push(list)
                })
                commit('setUserPlaylists', userPlaylists)
                dispatch('getPlaylist')
            }).catch(err => {
                console.error(err)
            })
        },
        addPlaylist({ state, commit, dispatch }, song) {
            song.creatorId = state.user.uid
            song.playlistId = state.activePlaylist
            if (state.playlist[0]) {
                song.creatorPriority = state.playlist[state.playlist.length - 1].creatorPriority + 1
            } else {
                song.creatorPriority = 0
            }
            db.collection('songs').add(song).then(doc => {
                dispatch('getPlaylist')
            }).catch(err => {
                console.error(err)
            })
        },
        getPlaylist({ state, commit, dispatch }) {
            db.collection('songs').where('creatorId', '==', state.user.uid).where('playlistId', '==', state.activePlaylist).get().then(querySnapshot => {
                let songs = []
                querySnapshot.forEach(doc => {
                    let song = doc.data()
                    song.id = doc.id
                    songs.push(song)
                })
                songs.sort(function (a, b) {
                    return a.creatorPriority - b.creatorPriority
                })
                commit('setPlaylist', songs)
            }).catch(err => {
                console.error(err)
            })
        },
        createPlaylist({ state, commit, dispatch }, name) {
            let newPlaylist = {}
            newPlaylist.name = name
            newPlaylist.creatorId = state.user.uid
            db.collection('playlists').add(newPlaylist).then(doc => {
                dispatch('getUserPlaylists')
                commit('setActivePlaylist', doc.id)
                dispatch('getPlaylist')
            }).catch(err => {
                console.error(err)
            })
        },
        changeActivePlaylist({ commit, dispatch }, id) {
            commit('setActivePlaylist', id)
            dispatch('getPlaylist')
        },
        removePlaylist({ commit, dispatch }, id) {
            db.collection('songs').doc(id).delete().then(() => {
                dispatch('getPlaylist')
            }).catch(err => {
                console.error(err)
            })
        },
        priorityUp({ state, commit, dispatch }, index) {
            if (index > 0) {
                let currSong = state.playlist[index]
                let othSong = state.playlist[index - 1]
                let currPrio = currSong.creatorPriority
                let othPrio = othSong.creatorPriority
                currSong.creatorPriority = othPrio
                othSong.creatorPriority = currPrio
                //put both updated songs to db
                db.collection('songs').doc(currSong.id).set(currSong).then(() => {
                    // all is well
                }).catch(err => {
                    console.error(err)
                })
                db.collection('songs').doc(othSong.id).set(othSong).then(() => {
                    // all is well
                }).catch(err => {
                    console.error(err)
                })
                dispatch('getPlaylist')
            }

        },
        priorityDown({ state, commit, dispatch }, index) {
            if (index < state.playlist.length - 1) {
                let currSong = state.playlist[index]
                let othSong = state.playlist[index + 1]
                let currPrio = currSong.creatorPriority
                let othPrio = othSong.creatorPriority
                currSong.creatorPriority = othPrio
                othSong.creatorPriority = currPrio
                //put both updated songs to db
                db.collection('songs').doc(currSong.id).set(currSong).then(() => {
                    // all is well
                }).catch(err => {
                    console.error(err)
                })
                db.collection('songs').doc(othSong.id).set(othSong).then(() => {
                    // all is well
                }).catch(err => {
                    console.error(err)
                })
                dispatch('getPlaylist')
            }
        }
    }
})

export default store