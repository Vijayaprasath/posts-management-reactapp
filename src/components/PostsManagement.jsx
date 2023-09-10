import '../style/postmanagement.css';
import React, { useState, useEffect } from "react";
import { Card,
     CardContent,
     Dialog, 
     DialogActions,
     DialogTitle,
     List, 
     ListItem, 
     IconButton,
     ListItemText, 
     TextField, 
     DialogContent,
     CardActionArea, 
     Button } from "@mui/material";
import axios from "axios";
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
// import Typography from '@mui/material/Typography';

const PostsManagement = () => {
  const [posts, setPosts] = useState([]);
  const [searchPosts, setSearchPosts] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [deleteQueue, setDeleteQueue] = useState([]);
  const [comments, setComments] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteCount, setDeleteCount] = useState(0);

  useEffect(() => {
    axios.get("https://jsonplaceholder.typicode.com/posts").then((response) => {
      setPosts(response.data);
    });
  }, []);

  useEffect(() => {
    const savedsearchPosts = localStorage.getItem("searchPosts");
    const savedFilteredPosts = JSON.parse(localStorage.getItem("filteredPosts"));
    const savedDeleteCount = parseInt(localStorage.getItem("deleteCount")) || 0;

    if (savedsearchPosts && savedFilteredPosts) {
      setSearchPosts(savedsearchPosts);
      setFilteredPosts(savedFilteredPosts);
    }

    setDeleteCount(savedDeleteCount);
  }, []);

  const handleSearch = () => {
    const filtered = posts.filter((post) => post.title.includes(searchPosts));
    setFilteredPosts(filtered);

    localStorage.setItem("searchPosts", searchPosts);
    localStorage.setItem("filteredPosts", JSON.stringify(filtered));
  };

  const handleRefreshState = () => {
    localStorage.removeItem("searchPosts");
    localStorage.removeItem("filteredPosts");

    axios.get("https://jsonplaceholder.typicode.com/posts").then((response) => {
      setPosts(response.data);
      setSearchPosts("");
      setFilteredPosts([]);
      setSelectedPost(null);
      setDeleteQueue([]);
      setDeleteCount(0);
      localStorage.setItem("deleteCount", 0);
    });
  };

  const DialogBox = styled(Dialog)();

  const handleClickOpen = (post) => {
    setSelectedPost(post);

    if (post) {
      axios
        .get(`https://jsonplaceholder.typicode.com/posts/${post.id}/comments`)
        .then((response) => {
          setComments(response.data);
        });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeletePost = (postId) => {
    axios.delete(`https://jsonplaceholder.typicode.com/posts/${postId}`).then(() => {
      const updatedPosts = posts.filter((post) => post.id !== postId);
      setPosts(updatedPosts);

      const updatedFilteredPosts = filteredPosts.filter((post) => post.id !== postId);
      setFilteredPosts(updatedFilteredPosts);

      const updatedQueue = deleteQueue.filter((id) => id !== postId);
      setDeleteQueue(updatedQueue);

      const updatedCount = deleteCount + 1;
      setDeleteCount(updatedCount);
      localStorage.setItem("deleteCount", updatedCount);

      setOpen(false);
    });
  };

  return (
    <div className="container">
      <TextField
        label="Search"
        variant="outlined"
        value={searchPosts}
        onChange={(e) => setSearchPosts(e.target.value)}
        className="search-input"
      /> 
      <Button variant="contained" onClick={handleSearch} className="action-button">
        Search
      </Button>
      <Button variant="contained" onClick={handleRefreshState} className="action-button">
        Refresh State
      </Button>
      <div>
        DELETE QUEUE {deleteCount}
      </div>
      {filteredPosts.length > 0 ? (
        filteredPosts.map((post) => (
          <Card key={post.id} className="post-card">
            <CardActionArea onClick={() => handleClickOpen(post)}>
              <CardContent>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
                <Button variant="outlined" onClick={() => handleDeletePost(post.id)}>Delete</Button>
              </CardContent>
            </CardActionArea>
          </Card>
        ))
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="post-card">            
            <CardActionArea onClick={() => handleClickOpen(post)}>
              <CardContent>
                <h3>{post.title}</h3>
                <p>{post.body}</p>
                <Button variant="outlined" onClick={() => handleDeletePost(post.id)}>Delete</Button>
              </CardContent>
            </CardActionArea>
          </Card>
        ))
      )}
      <DialogBox
        onClose={handleClose}
        open={open}
      >
        <DialogTitle >
          {selectedPost ? selectedPost.title : "No Post Selected"}
        </DialogTitle>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <List>
            {comments.map((comment) => (
              <ListItem key={comment.id}>
                <ListItemText primary={comment.name} secondary={comment.body} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
      </DialogBox>
    </div>
  );
};

export default PostsManagement;
