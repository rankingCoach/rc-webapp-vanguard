import { translationHelper } from '@helpers/translation-helper';
import { rcWindow } from '@stores/window.store';
import { appScreen, render } from '@test-utils/test-utils';
import { Text } from '@vanguard/Text/Text';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const KEY = '%count% review without a reply.';

describe('Vanguard Text translation key tracking', () => {
  beforeEach(() => {
    translationHelper.shouldTrackTranslationKeys = true;
  });

  afterEach(() => {
    translationHelper.shouldTrackTranslationKeys = false;
    delete rcWindow.TranslationsData;
  });

  it('marks a text whose key exists as translated', async () => {
    rcWindow.TranslationsData = { Collapse: 'Einklappen' };
    await render(<Text>{'Collapse'}</Text>);
    expect(appScreen.getByText('Einklappen').closest('.rc-text')?.classList.contains('was-translated')).toBe(true);
  });

  it('marks an English plural whose key only has a MANY value as translated', async () => {
    rcWindow.TranslationsData = { [`${KEY}_other`]: '%count% reviews without a reply.' };
    await render(
      <Text context={'other'} replacements={{ count: 53 }}>
        {KEY}
      </Text>,
    );
    expect(
      appScreen.getByText('53 reviews without a reply.').closest('.rc-text')?.classList.contains('was-translated'),
    ).toBe(true);
  });

  it('marks a text whose key is missing as not translated', async () => {
    rcWindow.TranslationsData = {};
    await render(<Text>{'Unknown key'}</Text>);
    expect(appScreen.getByText('Unknown key').closest('.rc-text')?.classList.contains('not-translated')).toBe(true);
  });
});
