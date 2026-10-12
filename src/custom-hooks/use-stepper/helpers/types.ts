import type { ActionCreatorWithPayload } from '@reduxjs/toolkit';

/**
 * Setup for slice
 * */

export type StepperState = {
  step: string;
  modalId: string | null;
  isValid: boolean;
  stepStatus: StepStatus;
};

/**
 * Other types
 * */
export type UseStepStatusPairs = Array<[unknown, unknown]>;
export type StepStatus = 'dirty' | 'clean';
export type SetupSelector<RootState> = (state: RootState) => any;

/**
 * Structural type describing the slice actions the stepper hooks actually consume.
 * Only `setStep` (use-go-to-step, ModalStepper) and `setStepStatus` (use-step-status)
 * are ever read. Concrete consumer slices are distinct CaseReducerActions instances
 * over their own state, so we match structurally on just these two action creators
 * instead of pinning to a throwaway internal slice's `typeof`.
 */
export type SetupSliceType<Steps = unknown> = {
  setStep: ActionCreatorWithPayload<any>;
  setStepStatus: ActionCreatorWithPayload<any>;
};

export type StepsOrFN<Steps, T = unknown> = Steps | ((data?: T) => void);
