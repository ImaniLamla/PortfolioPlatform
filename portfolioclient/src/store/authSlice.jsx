import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from 'axios'

export const signup = createAsyncThunk('auth/signup', async({email, password, profileName}, {rejectWithValue}) => {
    try {
        const res = await axios.post('http://localhost:8080/signup', {email, password, profileName})
        return res.data
    } catch (err) {
        console.log(err)
        return rejectWithValue(err.response?.data ?? 'Signup Failed!')
    }
})

export const signin = createAsyncThunk('auth/signin', async({email, password}, {rejectWithValue}) => {
    try {
        const res = await axios.post('http://localhost:8080/signin', {email, password})
        return res.data
    } catch (err) {
        console.log(err)
        return rejectWithValue(err.response?.data ?? 'Signin Failed!')
    }
})


const initialState = {
    user: null,
    isLoggedIn: false,
    loading: false,
    error: null
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state, action) => {
            state.user = null
            state.isLoggedIn = false
            state.loading = false
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase (signup.fulfilled, (state, action) => {
                state.user = {
                    email: action.payload.email,
                    profileName: action.payload.profileName,
                };
                state.isLoggedIn = true
                state.loading = false
                state.error = null
            })
            .addCase (signup.pending, (state, action) => {
                state.loading = true
            })
            .addCase (signup.rejected, (state, action) => {
                state.loading = false
                state.isLoggedIn = false
                state.error = action.payload
            })
            .addCase (signin.fulfilled, (state, action) => {
                state.user = {
                    email: action.payload.email,
                    profileName: action.payload.profileName,
                };
                state.isLoggedIn = true
                state.loading = false
                state.error = null
            })
            .addCase (signin.pending, (state, action) => {
                state.loading = true
            })
            .addCase (signin.rejected, (state, action) => {
                state.loading = false
                state.isLoggedIn = false
                state.error = action.payload
            })

    }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
