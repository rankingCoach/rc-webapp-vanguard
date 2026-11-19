import { baseStore } from '@stores/redux-base.store';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { DocumentDisplay } from './DocumentDisplay';
import { Story } from './stories/_DocumentDisplay.default';
import { CustomDimensions as _CustomDimensions } from './stories/CustomDimensions.story';
import { Default as _Default } from './stories/Default.story';
import { WithImage as _WithImage } from './stories/WithImage.story';
import { WithoutDownload as _WithoutDownload } from './stories/WithoutDownload.story';

export const Default: Story = { ..._Default };
export const WithImage: Story = { ..._WithImage };
export const WithoutDownload: Story = { ..._WithoutDownload };
export const CustomDimensions: Story = { ..._CustomDimensions };

export default {
  ...SbDecorator({
    title: 'Vanguard/Documents/DocumentDisplay',
    component: DocumentDisplay,
    opts: {
      customStore: baseStore,
    },
  }),
};
