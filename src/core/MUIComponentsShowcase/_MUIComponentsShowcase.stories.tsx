import React, { useRef, useState } from 'react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { baseStore } from '@stores/redux-base.store';
import { Accordion } from '@vanguard/Accordion/Accordion';
import { Autocomplete } from '@vanguard/Autocomplete/Autocomplete';
import { AppBar } from '@vanguard/AppBar/AppBar';
import { Button, ButtonTypes, ButtonSizes } from '@vanguard/Button/Button';
import { Collapse } from '@vanguard/Collapse/Collapse/Collapse';
import { DatePicker } from '@vanguard/DatePicker/DatePicker';
import { DateRangePicker } from '@vanguard/DateRangePicker/DateRangePicker';
import { DateRangeInput } from '@vanguard/DateRangeInput/DateRangeInput';
import { DocumentDisplay } from '@vanguard/Documents/DocumentDisplay/DocumentDisplay';
import { DocumentUpload } from '@vanguard/Documents/DocumentUpload/DocumentUpload';
import { Drawer } from '@vanguard/Drawer/Drawer';
import { DropdownMenu } from '@vanguard/DropdownMenu/DropdownMenu';
import { FlagAdornment } from '@vanguard/FlagAdornment/FlagAdornment';
import { FormControl } from '@vanguard/FormControl/FormControl';
import { Input } from '@vanguard/Input/Input';
import { ListShowMore } from '@vanguard/List/ListShowMore/ListShowMore';
import { Popover } from '@vanguard/Popover/Popover';
import { PopoverModal } from '@vanguard/PopoverModal/PopoverModal';
import { ProgressBar } from '@vanguard/ProgressBar/ProgressBar';
import { SearchableSelect } from '@vanguard/SearchableSelect/SearchableSelect';
import { Select } from '@vanguard/Select/Select';
import { Slider } from '@vanguard/Slider/Slider';
import { Snackbar } from '@vanguard/Snackbar/Snackbar';
import { Tabs } from '@vanguard/Tabs/Tabs';
import { ToggleButton } from '@vanguard/ToggleButton/ToggleButton';
import { ToggleButtonGroup } from '@vanguard/ToggleButtonGroup/ToggleButtonGroup';
import { Toolbar } from '@vanguard/Toolbar/Toolbar';
import { Icon } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import muiComponentsDescription from './MUIComponentsShowcase.description.md?raw';

export const Showcase: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [progress, setProgress] = useState(50);
  const [sliderValue, setSliderValue] = useState(50);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [popoverModalOpen, setPopoverModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLButtonElement>(null);
  const popoverModalRef = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <div
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          minHeight: '100vh',
        }}
      >
        <h1>MUI Components Showcase</h1>
        <div>
          This showcase displays all Vanguard components that utilize Material-UI components internally.
        </div>

        {/* Form Controls Section */}
        <section>
          <h2>Form Controls</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <h3>FormControl</h3>
              <FormControl>
                <Input label="Email" type="email" placeholder="Enter email" />
              </FormControl>
            </div>
            <div>
              <h3>Select</h3>
              <Select
                label="Choose option"
                options={[
                  { key: '1', value: 'option1', title: 'Option 1' },
                  { key: '2', value: 'option2', title: 'Option 2' },
                ]}
              />
            </div>
            <div>
              <h3>Autocomplete</h3>
              <Autocomplete label="Select item" options={['Apple', 'Banana', 'Cherry', 'Date']} />
            </div>
            <div>
              <h3>SearchableSelect</h3>
              <SearchableSelect
                options={[
                  { key: '1', value: 'item1', title: 'Item 1' },
                  { key: '2', value: 'item2', title: 'Item 2' },
                ]}
              />
            </div>
            <div>
              <h3>Slider</h3>
              <Slider
                value={sliderValue}
                onChange={(_, value) => setSliderValue(value)}
                min={0}
                max={100}
              />
            </div>
          </div>
        </section>

        {/* Layout & Navigation Section */}
        <section>
          <h2>Layout & Navigation</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3>AppBar with Toolbar</h3>
              {/* Darker than MUI's default primary so the inverted muted Login keeps >= 4.5:1 contrast */}
              <AppBar sx={{ backgroundColor: '#0d47a1' }}>
                <Toolbar>
                  <div>Vanguard App</div>
                  <div style={{ marginLeft: 'auto' }}>
                    <Button type={ButtonTypes.muted} size={ButtonSizes.medium} inverted>
                      Login
                    </Button>
                  </div>
                </Toolbar>
              </AppBar>
            </div>
            <div>
              <h3>Tabs</h3>
              <Tabs
                tabs={[
                  { label: 'Tab 1', component: <div>Content for Tab 1</div> },
                  { label: 'Tab 2', component: <div>Content for Tab 2</div> },
                  { label: 'Tab 3', component: <div>Content for Tab 3</div> },
                ]}
                value={selectedTab}
                onChange={(_, value) => setSelectedTab(value)}
              />
            </div>
            <div>
              <h3>Accordion</h3>
              <Accordion
                accordionId="accordion-example"
                summaryChildren="Accordion Item"
                detailsChildren={<div>This is the content of the accordion.</div>}
              />
            </div>
            <div>
              <h3>Drawer</h3>
              <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
              <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <div style={{ padding: '20px' }}>
                  <div>Drawer content</div>
                  <Button onClick={() => setDrawerOpen(false)}>Close</Button>
                </div>
              </Drawer>
            </div>
          </div>
        </section>

        {/* Feedback & Display Section */}
        <section>
          <h2>Feedback & Display</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <h3>ProgressBar</h3>
              <ProgressBar progressValue={progress} />
              <Button onClick={() => setProgress(Math.min(100, progress + 10))}>Increase Progress</Button>
            </div>
            <div>
              <h3>Snackbar</h3>
              <Button onClick={() => setSnackbarOpen(true)}>Show Snackbar</Button>
              <Snackbar
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                message="This is a snackbar notification"
                autoHideDuration={3000}
              />
            </div>
            <div>
              <h3>Popover</h3>
              <Popover message={<div>This is popover content</div>}>
                <Button>Hover for Popover</Button>
              </Popover>
            </div>
            <div>
              <h3>DropdownMenu</h3>
              <Button targetRef={dropdownRef} onClick={() => setDropdownOpen(!dropdownOpen)}>Menu</Button>
              <DropdownMenu
                anchorEl={dropdownRef}
                isOpen={dropdownOpen}
                toggleIsOpen={() => setDropdownOpen(!dropdownOpen)}
                items={[
                  { title: 'Item 1', onClick: () => {} },
                  { title: 'Item 2', onClick: () => {} },
                ]}
              />
            </div>
            <div>
              <h3>PopoverModal</h3>
              <Button targetRef={popoverModalRef} onClick={() => setPopoverModalOpen(true)}>Open Popover Modal</Button>
              <PopoverModal
                anchorEl={popoverModalRef.current}
                isOpen={popoverModalOpen}
                onClose={() => setPopoverModalOpen(false)}
                content={<div>This is the content of the popover modal.</div>}
              />
            </div>
          </div>
        </section>

        {/* Date & Time Section */}
        <section>
          <h2>Date & Time</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <h3>DatePicker</h3>
              <DatePicker label="Select date" locale="en-US" />
            </div>
            <div>
              <h3>DateRangePicker</h3>
              <DateRangePicker />
            </div>
            <div>
              <h3>DateRangeInput</h3>
              <DateRangeInput label="Select date range" />
            </div>
          </div>
        </section>

        {/* Documents Section */}
        <section>
          <h2>Documents</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <h3>DocumentDisplay</h3>
              <DocumentDisplay
                fileName="sample.pdf"
                fileSrc="https://example.com/sample.pdf"
                fileMimeType="application/pdf"
              />
            </div>
            <div>
              <h3>DocumentUpload</h3>
              <DocumentUpload
                onDocumentSelected={(document) => console.log('Document selected:', document)}
                onDocumentRemoved={() => console.log('Document removed')}
              />
            </div>
          </div>
        </section>

        {/* Buttons & Controls Section */}
        <section>
          <h2>Buttons & Controls</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3>Button with Animation</h3>
              <Button type={ButtonTypes.primary}>Animated Button</Button>
            </div>
            <div>
              <h3>ToggleButtonGroup</h3>
              <ToggleButtonGroup>
                <ToggleButton value="bold">
                  <Icon>{IconNames.edit}</Icon>
                </ToggleButton>
                <ToggleButton value="italic">
                  <Icon>{IconNames.settings}</Icon>
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>
        </section>

        {/* Utilities Section */}
        <section>
          <h2>Utilities</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3>Collapse</h3>
              <Collapse isOpen={true}>
                <div style={{ padding: '10px', background: '#f0f0f0' }}>
                  <div>Collapsible content</div>
                </div>
              </Collapse>
            </div>
            <div>
              <h3>FlagAdornment</h3>
              <Input label="Phone" adornment={<FlagAdornment countryCode="US" />} />
            </div>
            <div>
              <h3>ListShowMore</h3>
              <ListShowMore
                listElements={[
                  { content: 'Item 1' },
                  { content: 'Item 2' },
                  { content: 'Item 3' },
                  { content: 'Item 4' },
                  { content: 'Item 5' },
                ]}
                limit={3}
                type="none"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default {
  ...SbDecorator({
    title: 'vanguard/MUIComponentsShowcase',
    component: Showcase,
    opts: {
      customStore: baseStore,
    },
  }),
  parameters: {
    docs: {
      description: {
        component: muiComponentsDescription,
      },
    },
  },
};
