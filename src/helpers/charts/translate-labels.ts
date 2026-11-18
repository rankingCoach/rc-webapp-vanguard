import { translationService } from '@services/translation.service';

/** Translates chart labels (categories, legend items) through the translation service, in order. */
export const translateLabels = (labels: string[]): string[] => labels.map((label) => translationService.get(label).value);
