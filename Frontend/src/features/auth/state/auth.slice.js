import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { updateProfileAPI } from "../services/auth.api"; // Ensure path is correct
import toast from "react-hot-toast";

//updateProfile thunk: Ye async action hai jo profile update ke liye backend API call karega
export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await updateProfileAPI(formData); 
            toast.success(response.message);
            return response.user; 
        } catch (error) {
            console.error("Redux Thunk Error:", error); // Terminal pe real error dekhne ke liye
            const message = error.response?.data?.message || "Profile update failed";
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);
const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: false, // by default false rakhna better hai
        error: null,
        isAuthChecked: false
    },
    reducers: {
        // TERA PURANA LOGIC (Safe & Untouched)
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setAuthChecked: (state, action) => {
            state.isAuthChecked = action.payload;
        }
    },
    // extraReducers is used to handle the lifecycle of async thunks like pending, fulfilled, and rejected
    extraReducers: (builder) => {
        builder
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                // API success hone par purane user data mein naya data overwrite ho jayega
                state.user = { ...state.user, ...action.payload }; 
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { setUser, setLoading, setError, setAuthChecked } = authSlice.actions;
export default authSlice.reducer;