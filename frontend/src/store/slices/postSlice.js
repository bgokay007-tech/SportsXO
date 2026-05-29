import { createSlice } from '@reduxjs/toolkit';

const postSlice = createSlice({
    name: 'posts',
    initialState: {
        posts: [],
        isLoading: false,
        error: null,
    },
    reducers: {
        setPosts: (state, action) => {
            state.posts = action.payload;
        },
        addPost: (state, action) => {
            state.posts.unshift(action.payload);
        },
        removePost: (state, action) => {
            state.posts = state.posts.filter(p => p.id !== action.payload);
        },
        togglePostLike: (state, action) => {
            const post = state.posts.find(p => p.id === action.payload);
            if (post) {
                post.isLiked = !post.isLiked;
                post._count.likes += post.isLiked ? 1 : -1;
            }
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setPosts, addPost, removePost, togglePostLike, setLoading } = postSlice.actions;
export default postSlice.reducer;