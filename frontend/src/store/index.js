import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postReducer from './slices/postSlice';
import tournamentReducer from './slices/tournamentSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postReducer,
        tournaments: tournamentReducer,
    },
});