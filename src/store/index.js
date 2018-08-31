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
        playlist: []
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
                    dispatch('getPlaylist')
                    router.push('/dashboard')
                } else {
                    router.push('/login')
                }
            });
        },
        addPlaylist({ state, commit, dispatch }, song) {
            song.userid = state.user.email
            db.collection('playlist').add(song).then(doc => {
                dispatch('getPlaylist')
            }).catch(err => {
                console.error(err)
            })
        },
        getPlaylist({ state, commit, dispatch }) {
            console.log(state.user.displayName)
            db.collection('playlist').where('userid', '==', state.user.email).get().then(querySnapshot => {
                let songs = []
                querySnapshot.forEach(doc => {
                    let song = doc.data()
                    song.id = doc.id
                    songs.push(song)
                })
                commit('setPlaylist', songs)
            }).catch(err => {
                console.error(err)
            })
        },
        removePlaylist({ commit, dispatch }, id) {
            db.collection('playlist').doc(id).delete().then(() => {
                dispatch('getPlaylist')
            }).catch(err => {
                console.error(err)
            })
        }
    }
})

export default store