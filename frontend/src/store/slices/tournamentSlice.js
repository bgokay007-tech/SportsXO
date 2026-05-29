import { createSlice } from '@reduxjs/toolkit';

const tournamentSlice = createSlice({
    name: 'tournaments',
    initialState: {
        tournaments: [],
        isLoading: false,
        error: null,
    },
    reducers: {
        setTournaments: (state, action) => {
            state.tournaments = action.payload;
        },
        addTournament: (state, action) => {
            state.tournaments.unshift(action.payload);
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
    },
});

export const { setTournaments, addTournament, setLoading } = tournamentSlice.actions;
export default tournamentSlice.reducer;