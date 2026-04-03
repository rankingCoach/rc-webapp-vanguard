import { ReduxGenerator, withInitialState } from '@helpers/redux-common';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import { MiddleWareConfig } from '../../../../main.store.ts';

type State = {
  textValue: string;
  colorValue: string;
  selectedCMS: string;
};
const baseState: State = {
  textValue: '',
  colorValue: '#3366cc',
  selectedCMS: 'WordPress',
};

const initialState = withInitialState(baseState);

const G = new ReduxGenerator<typeof initialState>();
export const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    ...G.genAll(initialState),
  },
});

const RootReducer = combineReducers({
  form: formSlice.reducer,
});

export const formStore = configureStore({
  reducer: RootReducer,
  middleware: MiddleWareConfig,
});

export type FormRootState = ReturnType<typeof RootReducer>;

export const FormSLice = formSlice.actions;
