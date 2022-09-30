import jsTPS_Transaction from "../common/jsTPS.js"
/**
* MoveSong_Transaction
*
* This class represents a transaction that works with drag
* and drop. It will be managed by the transaction stack.
*
* @author McKilla Gorilla
* @author Wenjun Fan
*/
export default class DeleteSong_Transaction extends jsTPS_Transaction {
   constructor(initApp,index,inittitle,initartist,initid) {
       super();
       this.app = initApp;
       this.index = index;
       this.title = inittitle;
       this.artist = initartist;
       this.id=initid;  
   }
 
   doTransaction() {
       this.app.deleteSongfunc(this.index);
   }
 
   undoTransaction() {
       this.app.addNewSong(this.index,this.title,this.artist,this.id);
   }
}
