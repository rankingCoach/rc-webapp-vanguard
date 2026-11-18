import { render } from '@test-utils/test-utils';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Tutorial } from './Tutorial';
import { TutorialStep } from './TutorialStep/TutorialStep';

describe('Tutorial data-slot contract', () => {
  it('renders story steps while preserving the delegated modal markup', () => {
    const steps = [
      {
        name: 'step1',
        component: <TutorialStep title={'Title1'} description={'description2'} />,
        footerOptions: {
          positive: { text: 'Next', cta: () => {} },
          negative: { text: 'Skip', cta: () => {} },
        },
      },
      {
        name: 'step2',
        component: <TutorialStep title={'Title2'} description={'description2'} />,
        footerOptions: {
          positive: { text: 'Finish', cta: () => {} },
          negative: { text: 'Back', cta: () => {} },
        },
      },
    ];
    const { container } = render(<Tutorial steps={steps} close={() => {}} />);
    expect(container.querySelector('.rc-modal')?.tagName).toBe('DIV');
    expect(container.textContent).toContain('Title1');
    expect(container.textContent).toContain('description2');
  });
});
