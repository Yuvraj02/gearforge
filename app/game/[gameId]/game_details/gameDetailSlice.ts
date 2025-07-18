import { createSlice } from "@reduxjs/toolkit";

const initState = {
  player_perspective: [
    {
      id: 1,
      name: "First person",
    },
    { id: 2, name: "Third person" },
    { id: 3, name: "Bird view / Isometric" },
    { id: 4, name: "Side view" },
    { id: 5, name: "Text" },
    { id: 6, name: "Auditory" },
    { id: 7, name: "VR" },
  ],
};

const playerPerspectiveSlice = createSlice({
    name:'playerPerspective',
    initialState:initState,
    reducers:{}
})

export default playerPerspectiveSlice.reducer