import React, { Component } from 'react';
 
export default class DeleteSongModal extends Component {
   render() {
       const {Song, deleteSongCallback, hideDeleteSongModalCallback } = this.props;
       let title = "";
       if (Song) {
           title = Song.title;
       }
       return (
           <div
               class="modal"
               id="delete-song-modal"
               data-animation="slideInOutLeft">
                   <div class="modal-root" id='verify-delete-song-root'>
                       <div class="modal-north">
                           Remove Song?
                       </div>
                       <div class="modal-center">
                           <div class="modal-center-content">
                               Are you sure you wish to permanently remove the <span>{title}</span> &nbsp;from the playlist?
                           </div>
                       </div>
                       <div class="modal-south">
                           <input type="button"
                               id="delete-song-confirm-button"
                               class="modal-button"
                               onClick={deleteSongCallback}
                               value='Confirm' />
                           <input type="button"
                               id="delete-song-cancel-button"
                               class="modal-button"
                               onClick={hideDeleteSongModalCallback}
                               value='Cancel' />
                       </div>
                   </div>
           </div>
       );
   }
}
