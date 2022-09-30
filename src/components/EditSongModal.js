import React, { Component } from 'react';
 
export default class EditSongModal extends Component {
  
   render() {
       const {Song, editSongCallback, hideEditSongModalCallback } = this.props;
 
       return (
           <div class="modal" id="edit-song-modal" data-animation="slideInOutLeft">
           <div class="modal-root" id='edit-platform'>
               <div class="modal-north">
                   Edit Song
               </div>               
               <div class="editmode-center" >
                   <div class="editmode-centerT">
                       Title:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       <input type="text" id="text1" />
                   </div>
                   <div class="editmode-centerA">
                       Artist:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       <input type="text" id="text2" />
                   </div>
                   <div class="editmode-centerI">
                       You Tube Id:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                       <input type='text' id='text3' />
                   </div>
               </div>
 
               <div class="modal-south">
                   <input type="button" id="edit-song-confirm-button" class="modal-button" value='Confirm' onClick={editSongCallback}/>
                   <input type="button" id="edit-song-cancel-button" class="modal-button" value='Cancel' onClick={hideEditSongModalCallback}/>
                  
               </div>
           </div>
       </div>
       );
   }
}
