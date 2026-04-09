import { ReduxGenerator, withInitialState } from '@helpers/redux-common';
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import { MiddleWareConfig } from '../../../../main.store.ts';

type State = {
  aliasField: string;
  textValue: string;
  colorValue: string;
  selectedCMS: string;
  termsAccepted: boolean;
  notes: string;
  phoneNumber: string;
  items: string[];
  itemErrors: Array<string | undefined>;
  customInput: string;
  customCheckbox: boolean;
};
const baseState: State = {
  aliasField: '',
  textValue: '',
  colorValue: '#3366cc',
  selectedCMS: 'WordPress',
  termsAccepted: false,
  notes: '',
  phoneNumber: '9876543210',
  items: ['first item', 'second item'],
  itemErrors: [undefined, undefined],
  customInput: '',
  customCheckbox: false,
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
