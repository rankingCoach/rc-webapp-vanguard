import { ReduxGenerator, withInitialState } from '@helpers/redux-common';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import { MiddleWareConfig } from '../../../../main.store.ts';

type ShowcaseBaseState = {
  colorValue: string;
  datePickerValue: number;
  inputEmailValue: string;
  inputNumberValue: number;
  inputPasswordValue: string;
  inputTextValue: string;
  notesValue: string;
  phoneNumberValue: string;
  selectedCmsValue: string;
  termsAcceptedValue: boolean;
};

const baseState: ShowcaseBaseState = {
  colorValue: '#3366cc',
  datePickerValue: 1705276800, // Unix timestamp for 2024-01-15
  inputEmailValue: 'user@example.com',
  inputNumberValue: 42,
  inputPasswordValue: 'secretPassword123',
  inputTextValue: 'Sample text input',
  notesValue: 'Existing notes loaded from the store',
  phoneNumberValue: '9876543210',
  selectedCmsValue: 'WordPress',
  termsAcceptedValue: false,
};

const initialState = withInitialState(baseState);

const G = new ReduxGenerator<typeof initialState>();
export const showcaseSlice = createSlice({
  name: 'showcase',
  initialState,
  reducers: {
    ...G.genAll(initialState),
  },
});

const RootReducer = combineReducers({
  showcase: showcaseSlice.reducer,
});

export const showcaseStore = configureStore({
  reducer: RootReducer,
  middleware: MiddleWareConfig,
});

export type ShowcaseRootState = ReturnType<typeof RootReducer>;
export const ShowcaseSlice = showcaseSlice.actions;
