import jsTPS_Transaction from "../common/jsTPS.js"
/**
* MoveSong_Transaction
*
* This class represents a transaction that works with drag
* and drop. It will be managed by the transaction stack.
*
* @author McKilla Gorilla
* @author ?
*/
export default class EditSong_Transaction extends jsTPS_Transaction {
   constructor(initModel,index,inittitle,newtitle,initartist,newartist,initid,newid) {
       super();
       this.app = initModel;
       this.index = index;
       this.Otitle = inittitle;
       this.Oartist = initartist;
       this.Oid=initid;  
       this.Ntitle = newtitle;
       this.Nartist = newartist;
       this.Nid=newid;  
   }
 
   doTransaction() {
       this.app.editSong(this.index,this.Ntitle,this.Nartist,this.Nid);
   }
 
   undoTransaction() {
       this.app.editSong(this.index,this.Otitle,this.Oartist,this.Oid);
   }
}
