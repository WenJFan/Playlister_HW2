import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import AddSong_Transaction from './transactions/AddSong_Transaction.js';
import DeleteSong_Transaction from './transactions/DeleteSong_Transaction.js';
import EditSong_Transaction from './transactions/EditSong_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';
import DeleteSongModal from './components/DeleteSongModal.js';
import EditSongModal from './components/EditSongModal.js';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';

class App extends React.Component {
    constructor(props) {
        super(props);

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            listKeyPairMarkedForDeletion : null,
            currentList : null,
            sessionData : loadedSessionData,
            deleteSong:null,
            editSong:null
        }
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs,
                editActive: false
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideDeleteListModal();
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    setStateWithUpdatedList(list) {
        this.setState(prevState => ({
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            sessionData : this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }

    addNewSong=(nindex,ntitle,nartist,nid)=>{
        let newSong = {
            "title":ntitle,
            "artist":nartist,
            "youTubeId":nid
        }
        let list = this.state.currentList;
        list.songs.splice(nindex, 0, newSong);
        this.setStateWithUpdatedList(list);
    }
    
    deleteMarkedSong = () => {
        let ds = this.state.deleteSong;
        this.addDeleteSongTransaction(this.state.currentList.songs.indexOf(ds),ds.title,ds.artist,ds.youTubeId);
        this.hideDeleteSongModal();
    }

    deleteSongfunc(index) {
        let list = this.state.currentList;
        let tempArray=list.songs.filter(song=>list.songs.indexOf(song)!==index);
        list.songs = tempArray;
        this.setStateWithUpdatedList(list);
    }
 
    editMarkedSong = ()=>{
        let es = this.state.editSong;
        let newtitle = document.getElementById("text1").value;
        let newartist = document.getElementById("text2").value;
        let newid = document.getElementById("text3").value;
        this.addEditSongTransaction(this.state.currentList.songs.indexOf(es),es.title,newtitle,es.artist,newartist,es.youTubeId,newid);
        this.hideEditSongModal();
   }

   editSong(index,songT,songA,songId){
    let list = this.state.currentList;
    if(songT===""){
        (list.songs[index]).title = "Untitle";
    }else{
        (list.songs[index]).title = songT;
    }
    if(songA===""){
        (list.songs[index]).artist = "Unknown";
    }else{
        (list.songs[index]).artist = songA;
    }
    if(songId===""){
        (list.songs[index]).youTubeId = "dQw4w9WgXcQ";
    }else{
        (list.songs[index]).youTubeId = songId;
    }
    this.setStateWithUpdatedList(list);
}

    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong(start, end) {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }

    // THIS FUNCTION ADDS A AddSong_Transaction TO THE TRANSACTION STACK
    addAddSongTransaction = (title,artist,id) =>{
        let index = (this.state.currentList.songs.length);
        let transaction = new AddSong_Transaction(this,index,title,artist,id);
        this.tps.addTransaction(transaction);
    }
 
    // THIS FUNCTION ADDS A DeleteSong_Transaction TO THE TRANSACTION STACK
    addDeleteSongTransaction = (index,title,artist,id) => {
        let transaction = new DeleteSong_Transaction(this,index,title,artist,id);
        this.tps.addTransaction(transaction);
    }
    
    addEditSongTransaction = (index,Oldtitle,title,Oldartist,artist,Oldid,id)=>{
        let transaction = new EditSong_Transaction(this,index,Oldtitle,title,Oldartist,artist,Oldid,id);
        this.tps.addTransaction(transaction);
    }
 
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : keyPair,
            sessionData: prevState.sessionData,
            deleteSong: prevState.deleteSong,
            flag:true
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    } 

    markSongForDeletion = (dS) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            deleteSong:dS,
            flag:true
        }), () => {
            // PROMPT THE USER
            this.showDeleteSongModal();
        });
    }
 

    markSongForEdition = (eS) => {
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            deleteSong:prevState.deleteSong,
            editSong:eS,
            flag:true
        }), () => {
            // PROMPT THE USER
            this.showEditSongModal();
        });
    }
 
 
 
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal() {
        let modal = document.getElementById("delete-list-modal");
        modal.classList.add("is-visible");
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideDeleteListModal=()=> {
        let modal = document.getElementById("delete-list-modal");
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            deleteSong:prevState.deleteSong,
            flag:false
        }), () => {
            // PROMPT THE USER
            modal.classList.remove("is-visible");
        });
        //modal.classList.remove("is-visible");
       
    }
 

    showDeleteSongModal() {
        let modal = document.getElementById("delete-song-modal");
        modal.classList.add("is-visible");
       
    }
    hideDeleteSongModal=()=> {
        let modal = document.getElementById("delete-song-modal");
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            deleteSong:prevState.deleteSong,
            flag:false
        }), () => {
            // PROMPT THE USER
            modal.classList.remove("is-visible");
        });
    }
 
    showEditSongModal(){
        let modal = document.getElementById("edit-song-modal");
        let est = document.getElementById("text1");
        let esa = document.getElementById("text2");
        let esi = document.getElementById("text3");
        est.value = this.state.editSong.title;
        esa.value = this.state.editSong.artist;
        esi.value = this.state.editSong.youTubeId;
  
        modal.classList.add("is-visible");
       
    }
    hideEditSongModal=()=> {
        let modal = document.getElementById("edit-song-modal");
        this.setState(prevState => ({
            currentList: prevState.currentList,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            sessionData: prevState.sessionData,
            deleteSong:prevState.deleteSong,
            flag:false
        }), () => {
            // PROMPT THE USER
            modal.classList.remove("is-visible");
        });
       
    }
 
    handlectrlKeyPress = (event) => {
        if (event.ctrlKey&&(event.which == 90 || event.keyCode == 90)) {
            if (this.tps.hasTransactionToUndo()){
                this.tps.undoTransaction();
                this.db.mutationUpdateList(this.state.currentList);
            }
        }
        else if (event.ctrlKey&&(event.which == 89 || event.keyCode == 89)) {
            if (this.tps.hasTransactionToRedo()){
                    this.tps.doTransaction();
                    this.db.mutationUpdateList(this.state.currentList);
               
            }
        }
    }

    Editactive = (boolean) =>{
        this.setState(prevState => ({
            flag : boolean
        }));
    }
 
    render() {
        let canAddList,canAddSong,canUndo,canRedo,canClose;
       if(this.state.flag){
           canAddList = false;
           canUndo = false;
           canRedo = false;
           canClose = false;
           canAddSong = false;
       }
       else{
           canAddSong = this.state.currentList !== null;
           canUndo = this.tps.hasTransactionToUndo();
           canRedo = this.tps.hasTransactionToRedo();
           canClose = this.state.currentList !== null;
           canAddList = !canClose;
       }

       return (
        <div id="root" onKeyDown={this.handlectrlKeyPress}>
            <Banner />
            <SidebarHeading
                createNewListCallback={this.createNewList}
                canAddList={canAddList}
            />
            <SidebarList
                currentList={this.state.currentList}
                keyNamePairs={this.state.sessionData.keyNamePairs}
                deleteListCallback={this.markListForDeletion}
                loadListCallback={this.loadList}
                renameListCallback={this.renameList}
                Editactive={this.Editactive}
            />
            <EditToolbar
                canAddSong={canAddSong}
                canUndo={canUndo}
                canRedo={canRedo}
                canClose={canClose}
                undoCallback={this.undo}
                redoCallback={this.redo}
                closeCallback={this.closeCurrentList}
                AddNewSongCallback = {this.addAddSongTransaction}
            />
            <PlaylistCards
                currentList={this.state.currentList}
                moveSongCallback={this.addMoveSongTransaction}
                deleteSongCallback={this.markSongForDeletion}
                editSongCallback={this.markSongForEdition}/>
            <Statusbar
                currentList={this.state.currentList} />
            <DeleteListModal
                listKeyPair={this.state.listKeyPairMarkedForDeletion}
                hideDeleteListModalCallback={this.hideDeleteListModal}
                deleteListCallback={this.deleteMarkedList}
            />
            <DeleteSongModal
                Song={this.state.deleteSong}
                hideDeleteSongModalCallback={this.hideDeleteSongModal}
                deleteSongCallback={this.deleteMarkedSong}
            />
            <EditSongModal
                Song={this.state.editSong}
                hideEditSongModalCallback={this.hideEditSongModal}
                editSongCallback={this.editMarkedSong}
            />
        </div>
    );
}
}

export default App;
