/**
 * GATED consumer fixture for the default entry (`@rankingcoach/vanguard`).
 *
 * Consumer-style code: imports ONLY from the package root, exactly like rc-webapp does. Must compile with
 * `tsc --noEmit` + `skipLibCheck: true` in BOTH scenarios (A: no @mui in the consumer, B: consumer has its own
 * @mui/material@5.16.14).
 *
 * Every `@ts-expect-error` in this file targets a prop whose type does NOT depend on a package the consumer may
 * lack (MUI, moment, react-date-range, libphonenumber-js). If one of them becomes "unused" (TS2578), a public prop
 * silently degraded to `any`: that is a gate failure. Expectations on props that DO depend on such packages live
 * in `mui-typed.tsx` / `undeclared-types.tsx`, whose results are recorded, not gated.
 */
import {
  Accordion,
  AppBar,
  type AutocompleteProps,
  Button,
  type ButtonProps,
  ButtonSizes,
  ButtonTypes,
  Collapse,
  CONTENY_TYPE_APPLICATION_PDF,
  DatePicker,
  type DatePickerProps,
  DateRangeInput,
  DateRangePicker,
  type DateRangePickerProps,
  DateTimePicker,
  type DateTimePickerProps,
  DocumentDisplay,
  DocumentUpload,
  Drawer,
  type DrawerProps,
  DrawerService,
  DropdownMenu,
  FlagAdornment,
  FormControl,
  IconNames,
  Input,
  type InputProps,
  ListShowMore,
  Menu,
  MenuItem,
  PhoneNumber,
  Popover,
  PopoverModal,
  type PopoverPosition,
  type PopoverProps,
  ProgressBar,
  SearchableSelect,
  Select,
  type SelectOnChange,
  type SelectOptionProp,
  Slider,
  type SliderProps,
  Snackbar,
  SnackbarRoot,
  snackbarService,
  Textarea,
  TimePicker,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
} from '@rankingcoach/vanguard';
import type { ChangeEvent, MouseEvent } from 'react';
import { useRef, useState } from 'react';

import type { Equal, Expect, NotAny } from './_helpers';
import { use } from './_helpers';

/**
 * 1. Type-level expectations on props that must never be `any`
 * ---------------------------------------------------------------------------------------------------------------------
 */
export type GatedTypeChecks = [
  Expect<Equal<ButtonProps['size'], ButtonSizes | undefined>>,
  Expect<NotAny<InputProps['onChange']>>,
  Expect<NotAny<InputProps['label']>>,
  Expect<Equal<NonNullable<InputProps['type']>, 'text' | 'number' | 'email' | 'date' | 'password'>>,
  Expect<Equal<NonNullable<InputProps['size']>, 'small' | 'medium'>>,
  Expect<Equal<Parameters<NonNullable<DatePickerProps['onChange']>>[0], number | null | undefined>>,
  Expect<Equal<DatePickerProps['locale'], string>>,
  Expect<Equal<NonNullable<SliderProps['onChange']>, (event: Event | null, value: number, activeThumb: number) => void>>,
  Expect<Equal<NonNullable<DrawerProps['title']>, string>>,
  Expect<NotAny<DrawerProps['onClose']>>,
  Expect<Equal<ReturnType<typeof DrawerService.open>, string>>,
  Expect<Equal<ReturnType<typeof snackbarService.open>, string>>,
  Expect<
    Equal<SelectOnChange, (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, selectedValue?: SelectOptionProp) => void>
  >,
  Expect<Equal<NonNullable<AutocompleteProps['hideCaret']>, boolean>>,
  Expect<Equal<NonNullable<PopoverProps['position']>, PopoverPosition>>,
  Expect<Equal<Parameters<NonNullable<DateRangePickerProps['onChange']>>[1], 'MANUAL' | 'AUTOMATIC'>>,
  Expect<Equal<Parameters<NonNullable<DateTimePickerProps['onChange']>>[0], number | undefined>>,
];

/**
 * 2. Realistic usage of every exported component in the Tier A list (must compile)
 * ---------------------------------------------------------------------------------------------------------------------
 */
const options: SelectOptionProp[] = [
  { key: 0, value: 'apple', title: 'Apple' },
  { key: 1, value: 'banana', title: 'Banana', description: 'Yellow', disabled: true },
];

export const ConsumerPage = () => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<number | null | undefined>(undefined);
  const [toggle, setToggle] = useState<string | null>('a');
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Options omitted on purpose: DrawerProps needs MUI to type its options (see realistic-usage.tsx).
  const drawerId: string = DrawerService.open(<div>drawer body</div>);
  DrawerService.close(drawerId);
  const snackId: string = snackbarService.open({ type: 'success', title: 'Saved', message: 'All good' });
  snackbarService.openErrorSnackbar({ text: 'Failed: {{reason}}', replacements: { reason: 'x' } });
  snackbarService.closeEv(snackId);
  use(drawerId, snackId);

  return (
    <div ref={anchorRef}>
      <Button type={ButtonTypes.primary} size={ButtonSizes.large} icon={IconNames.search} onClick={() => setOpen(true)}>
        Open
      </Button>
      <Button type={ButtonTypes.muted} blurred pressed htmlType="button" ariaLabel="close" icon={IconNames.close} />

      {/* MUI-typed passthrough props, as consumers write them today (v5 legacy keys) */}
      <Input
        id="email"
        label="Email"
        type="email"
        size="small"
        value="a@b.c"
        inputRef={inputRef}
        onChange={(e) => use(e.target.value)}
        textFieldProps={{
          InputProps: { endAdornment: <span>@</span>, readOnly: false },
          inputProps: { maxLength: 10, 'data-qa': 'email' },
          InputLabelProps: { shrink: true },
          SelectProps: { native: false, MenuProps: { disablePortal: true } },
          helperText: 'helper',
          variant: 'outlined',
        }}
      />
      <Textarea label="Bio" rows={3} maxRows={6} counter maxLength={200} onChange={(e) => use(e.target.value)} />
      <Select
        id="fruit"
        label="Fruit"
        options={options}
        value="apple"
        onChange={(e, selected?: SelectOptionProp) => use(e.target.value, selected?.value)}
      />
      <SearchableSelect<'de' | 'fr'>
        options={[
          { key: 'de', value: 'de', title: 'Germany' },
          { key: 'fr', value: 'fr', title: 'France' },
        ]}
        searchableProps={['title']}
        onSelection={(value) => use(value satisfies 'de' | 'fr')}
      />
      {/* Autocomplete usage lives in realistic-usage.tsx: it does not compile without MUI (see README). */}
      <DatePicker locale="en_US" label="Start" value={date ?? undefined} disablePast onChange={(v) => setDate(v)} />
      <DateTimePicker locale="en_US" date={Date.now()} time="10:00" disablePast onChange={(d, t) => use(d, t)} />
      <TimePicker label="Time" hourListType="half" value="10:30" onChange={(_e, opt) => use(opt?.value)} />
      <DateRangePicker
        startDate={new Date()}
        endDate={new Date()}
        onChange={(dates, source) => use(dates.startDate, source)}
      />
      <DateRangeInput
        label="Range"
        inputFormatter={{ formatFn: (v) => v, reverseFormatFn: (v) => v }}
        textFieldProps={{ InputProps: { readOnly: true } }}
      />
      <PhoneNumber id="phone" countryCode="DE" phoneNumberBase="301234567" phoneNumberBaseInputEvents={{ onBlur: () => undefined }} />
      <FlagAdornment countryCode="DE" />
      <DocumentDisplay fileName="a.pdf" fileSrc="https://example.com/a.pdf" fileMimeType={CONTENY_TYPE_APPLICATION_PDF} showDownload />
      <DocumentUpload onDocumentSelected={(doc) => use(doc.fileName)} onDocumentRemoved={() => undefined} />
      <ListShowMore type="numerical" listElements={[{ content: 'One' }, { content: 'Two' }]} limit={1} />
      <ProgressBar progressValue={40} variant="determinate" />
      <Slider value={5} min={0} max={10} step={1} marks={[{ value: 0, label: '0' }]} onChange={(_e, v) => use(v)} />
      <Collapse isOpen={open} orientation="vertical">
        <p>collapsible</p>
      </Collapse>
      <Popover message="Tooltip text" position="top" className={{ tooltip: 'my-tooltip' }}>
        <span>hover me</span>
      </Popover>
      <PopoverModal isOpen={open} content={<div>popover modal</div>} anchorEl={anchorRef.current} placement="bottom" onClose={() => setOpen(false)} />
      <DropdownMenu
        anchorEl={anchorRef}
        isOpen={open}
        toggleIsOpen={() => setOpen((o) => !o)}
        placement="bottom-start"
        items={[{ title: 'Edit', iconName: IconNames.edit, onClick: () => undefined }]}
      />
      <Menu
        open={open}
        anchorEl={anchorRef.current}
        onClose={() => setOpen(false)}
        testId="menu"
        items={[{ key: 'edit', children: 'Edit', onClick: () => undefined }]}
        PaperProps={{ elevation: 2 }}
        MenuListProps={{ dense: true }}
      >
        <MenuItem icon={IconNames.edit} iconPosition="before" onClick={() => undefined} dense>
          Edit
        </MenuItem>
      </Menu>
      <Drawer
        open={open}
        title="Details"
        description="More"
        anchor="left"
        variant="temporary"
        hideBackdrop={false}
        showCloseButton
        onClose={(e) => use(e?.isOk)}
      >
        <p>drawer content</p>
      </Drawer>
      <Accordion
        accordionId="faq-1"
        summaryChildren="Question"
        detailsChildren={<p>Answer</p>}
        defaultExpanded={false}
        onExpandedChange={(expanded) => use(expanded)}
        TransitionProps={{ unmountOnExit: true }}
      />
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar variant="dense" disableGutters>
          toolbar
        </Toolbar>
      </AppBar>
      <FormControl fullWidth margin="dense" variant="outlined" error={false}>
        <span>form control</span>
      </FormControl>
      <ToggleButtonGroup
        value={toggle}
        exclusive
        size="small"
        onChange={(_e: MouseEvent<HTMLElement>, v: string | null) => setToggle(v)}
      >
        <ToggleButton value="a" testId="toggle-a">
          A
        </ToggleButton>
        <ToggleButton value="b">B</ToggleButton>
      </ToggleButtonGroup>
      <Snackbar
        open={open}
        message="Saved"
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        onClose={() => setOpen(false)}
      />
      <SnackbarRoot />
    </div>
  );
};

/**
 * 3. Invalid usage on props that must stay typed (each line must error)
 * ---------------------------------------------------------------------------------------------------------------------
 */
export const InvalidUsage = () => (
  <>
    {/* @ts-expect-error [Button.type] unknown variant */}
    <Button type="nope">x</Button>
    {/* @ts-expect-error [Button.children] children must be a string */}
    <Button>{42}</Button>
    {/* @ts-expect-error [Button.blurred] only the muted type accepts blurred */}
    <Button type={ButtonTypes.primary} blurred>x</Button>
    {/* @ts-expect-error [Input.type] not in the union */}
    <Input type="tel" />
    {/* @ts-expect-error [Input.size] not in the union */}
    <Input size="large" />
    {/* @ts-expect-error [Input.labelType] not in the union */}
    <Input labelType="sideways" />
    {/* @ts-expect-error [Textarea.rows] must be a number */}
    <Textarea rows="3" />
    {/* @ts-expect-error [Select.options] option without key */}
    <Select options={[{ value: 'a', title: 'A' }]} />
    {/* @ts-expect-error [DatePicker.locale] required */}
    <DatePicker />
    {/* @ts-expect-error [DatePicker.value] must be a timestamp */}
    <DatePicker locale="en_US" value="2024-01-01" />
    {/* @ts-expect-error [DateTimePicker.locale] required */}
    <DateTimePicker />
    {/* @ts-expect-error [TimePicker.hourListType] not in the union */}
    <TimePicker label="t" hourListType="minute" />
    {/* @ts-expect-error [DateRangePicker.startDate] must be a Date */}
    <DateRangePicker startDate="2024-01-01" />
    {/* @ts-expect-error [DateRangeInput.inputFormatter] wrong shape */}
    <DateRangeInput inputFormatter={{ formatFn: 1 }} />
    {/* @ts-expect-error [PhoneNumber.phoneNumberDisabled] must be boolean */}
    <PhoneNumber phoneNumberDisabled="yes" />
    {/* @ts-expect-error [FlagAdornment.countryCode] must be a string */}
    <FlagAdornment countryCode={49} />
    {/* @ts-expect-error [DocumentDisplay.fileMimeType] not in the union */}
    <DocumentDisplay fileName="a" fileSrc="b" fileMimeType="image/gif" />
    {/* @ts-expect-error [DocumentUpload.onDocumentRemoved] required */}
    <DocumentUpload onDocumentSelected={() => undefined} />
    {/* @ts-expect-error [ListShowMore.type] not in the union */}
    <ListShowMore type="roman" listElements={[]} />
    {/* @ts-expect-error [ProgressBar.variant] not in the union */}
    <ProgressBar variant="circular" />
    {/* @ts-expect-error [Slider.value] must be a number */}
    <Slider value="5" min={0} max={10} />
    {/* @ts-expect-error [Collapse.isOpen] required */}
    <Collapse>x</Collapse>
    {/* @ts-expect-error [Popover.position] not in the union */}
    <Popover position="center"><span /></Popover>
    {/* @ts-expect-error [Popover.children] must be a single element */}
    <Popover>text</Popover>
    {/* @ts-expect-error [PopoverModal.placement] not in the union */}
    <PopoverModal isOpen content="x" placement="left" />
    {/* @ts-expect-error [DropdownMenu.placement] not in the union */}
    <DropdownMenu isOpen toggleIsOpen={() => undefined} items={[]} placement="middle" />
    {/* @ts-expect-error [DropdownMenu.items] item without title */}
    <DropdownMenu isOpen toggleIsOpen={() => undefined} items={[{ selected: true }]} />
    {/* @ts-expect-error [Drawer.title] must be a string */}
    <Drawer title={42} />
    {/* @ts-expect-error [SearchableSelect.options] options required */}
    <SearchableSelect />
  </>
);

// @ts-expect-error [snackbarService.open.type] not in the union
snackbarService.open({ type: 'error', title: 't', message: 'm' });
// @ts-expect-error [DrawerService.close] id must be a string
DrawerService.close(1);
