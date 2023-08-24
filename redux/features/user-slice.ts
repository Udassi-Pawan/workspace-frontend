import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  user: {
    _id: string;
    name: string;
    email: string;
    groups: any[];
  };
};

const initialState = {
  user: {
    _id: "",
    name: "",
    email: "",
    groups: [],
  },
} as InitialState;

export const user = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setUser } = user.actions;
export default user.reducer;
