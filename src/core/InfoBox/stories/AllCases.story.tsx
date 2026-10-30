import React from 'react';
import { expect, waitFor, within } from 'storybook/test';

import { InfoBox } from '../InfoBox';
import { findFirstLineMisalignments } from './_InfoBox.alignment';
import { INFO_BOX_CASE_COUNT, INFO_BOX_CASE_GROUPS } from './_InfoBox.cases';
import { CaseCell, CaseGroupSection, CasePage } from './_InfoBox.caseLayout';
import { Story } from './_InfoBox.default';

const description = `
Every InfoBox case side by side: all types × content shapes (with and without the close button), action buttons,
description formats, size & layout props and a narrow (mobile) width. The dashed outline is the cell the InfoBox
is laid out in.

The red line marks the centre of the first line (title, or first description line when there's no title). The test
checks that in every case the icon's glyph and the close button are centred on it.
`;

export const AllCases: Story = {
  name: 'All Cases',
  parameters: { layout: 'fullscreen', controls: { disable: true }, docs: { description: { story: description } } },
  render: () => (
    <CasePage>
      {INFO_BOX_CASE_GROUPS.map((group) => (
        <CaseGroupSection key={group.key} group={group}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 16px', alignItems: 'flex-start' }}>
            {group.cases.map((infoBoxCase) => (
              <CaseCell key={infoBoxCase.key} infoBoxCase={infoBoxCase} caption={infoBoxCase.label} showGuide>
                <InfoBox {...infoBoxCase.props} />
              </CaseCell>
            ))}
          </div>
        </CaseGroupSection>
      ))}
    </CasePage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getAllByTestId('info-box-content')).toHaveLength(INFO_BOX_CASE_COUNT));
    // icons load asynchronously, so retry until they are all rendered and lined up
    await waitFor(() => expect(findFirstLineMisalignments(canvasElement)).toEqual([]));
  },
};
