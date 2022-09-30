import React from "react";
 
export default class SongCard extends React.Component {
   constructor(props) {
       super(props);
 
       this.state = {
           isDragging: false,
           draggedTo: false,
           editActive: false,
           text1:this.props.song.title,
           text2:this.props.song.artist,
           text3:this.props.song.youTubeId
       }
   }
  
 
   handleDragStart = (event) => {
       event.dataTransfer.setData("song", event.target.id);
       this.setState(prevState => ({
           isDragging: true,
           draggedTo: prevState.draggedTo
       }));
   }
   handleDragOver = (event) => {
       event.preventDefault();
       this.setState(prevState => ({
           isDragging: prevState.isDragging,
           draggedTo: true
       }));
   }
   handleDragEnter = (event) => {
       event.preventDefault();
       this.setState(prevState => ({
           isDragging: prevState.isDragging,
           draggedTo: true
       }));
   }
   handleDragLeave = (event) => {
       event.preventDefault();
       this.setState(prevState => ({
           isDragging: prevState.isDragging,
           draggedTo: false
       }));
   }
   handleDrop = (event) => {
       event.preventDefault();
       let target = event.target;
       let targetId = target.id;
       targetId = targetId.substring(target.id.indexOf("-") + 1);
       let sourceId = event.dataTransfer.getData("song");
       sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
      
       this.setState(prevState => ({
           isDragging: false,
           draggedTo: false
       }));
 
       // ASK THE MODEL TO MOVE THE DATA
       this.props.moveCallback(sourceId, targetId);
   }
 
   handelDeleteSong = (event)=>{
       event.stopPropagation();
       this.props.deleteCallback(this.props.song);
   }
 
   getItemNum = () => {
       return this.props.id.substring("playlist-song-".length);
   }
   handleToggleEdit = (event) => {
       this.setState({
           editActive: !this.state.editActive
       });
   }
   handleClick = (event) => {
       if (event.detail === 2) {
           event.stopPropagation();
           this.props.editSongCallback(this.props.song);
           this.handleToggleEdit(event);
       }
   }
  
 
   render() {
       const { song } = this.props;
       let num = this.getItemNum();
       console.log("num: " + num);
       let itemClass = "playlister-song";
       if (this.state.draggedTo) {
           itemClass = "playlister-song-dragged-to";
       }
       return (
           <div
               id={'song-' + num}
               className={itemClass + "list-card " + "unselected-list-card"}
               onDragStart={this.handleDragStart}
               onDragOver={this.handleDragOver}
               onDragEnter={this.handleDragEnter}
               onDragLeave={this.handleDragLeave}
               onDrop={this.handleDrop}
               draggable="true"
               onClick={this.handleClick}
           >
              <span>
                   {num}. {}
               <a
               target = {"_blank"}
               href = {"https://www.youtube.com/watch?v="+song.youTubeId}>
                   {song.title} by {song.artist}
               </a>
               </span>
               <input
                   type = "button"
                   id = {"delete-song-" + num}
                   className = {"list-card-button"}
                   onClick = {this.handelDeleteSong}
                   value = {"X"}
                   />
           </div>
       )
   }
}
