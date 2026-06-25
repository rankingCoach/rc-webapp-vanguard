import './SearchableSelect.scss';

import { classNames } from '@helpers/classNames';
import { Box, FormControl, InputAdornment, MenuItem, Select } from '@mui/material';
import createFuzzer from '@nozbe/microfuzz';
import { InputBase } from '@vanguard/_internal/InputBase/InputBase';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { SelectOptionProp } from '@vanguard/Select/Select';
import { Text, TextTypes } from '@vanguard/Text/Text';
import React, { useEffect, useRef, useState } from 'react';

export interface SearchableSelectProps<T extends string, O extends SelectOptionProp<T> = SelectOptionProp<T>> {
  options: O[];
  searchableProps?: (keyof O)[];
  defaultSelected?: T;
  onSelection?: (value: T) => void;
  value?: T;
  elementName?: string;
  displayTotalCountThreshold?: number;
  displaySearchBarMinimumElements?: number;
  startAdornment?: {
    icon: IconNames;
    color?: string;
  };
}

/**
 * Component
 */

const DEFAULT_SEARCHABLE_PROPS: any[] = ['title'];

export const SearchableSelect = <T extends string, O extends SelectOptionProp<T> = SelectOptionProp<T>>(
  props: SearchableSelectProps<T, O>,
) => {
  const {
    options,
    searchableProps = DEFAULT_SEARCHABLE_PROPS,
    onSelection,
    value,
    elementName,
    displayTotalCountThreshold = 5,
    displaySearchBarMinimumElements = 10,
    startAdornment,
  } = props;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [displayedOptions, setDisplayedOptions] = useState<O[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const search = React.useMemo(() => {
    return createFuzzer(options, {
      getText: (item) =>
        searchableProps.map((p) => {
          const val = item[p];
          if (val === undefined || val === null) return '';
          if (typeof val === 'string') return val;
          if (typeof val === 'number') return val.toString();
          if (typeof val === 'object') {
            try {
              return JSON.stringify(val);
            } catch {
              return '';
            }
          }
          return String(val);
        }),
    });
  }, [options, searchableProps]);

  useEffect(() => {
    let filteredOptions = options.filter((o) => !o.hidden);
    if (searchText) {
      filteredOptions = search(searchText).map((result) => result.item);
    }
    setDisplayedOptions(filteredOptions);
  }, [searchText, options, search]);

  return (
    <Box className={classNames('vanguard-input', 'vanguard-searchable-select-input')}>
      <FormControl fullWidth>
        <Select
          data-testid={'vanguard-searchable-select-input'}
          MenuProps={{
            anchorEl: inputRef.current,
            // Disables auto focus on MenuItems and allows TextField to be in focus
            autoFocus: false,
            marginThreshold: 0,
            MenuListProps: {
              style: {
                width: inputRef && inputRef.current ? inputRef.current.offsetWidth - 8 : '',
              },
            },
          }}
          style={isOpen ? { background: 'var(--n000)' } : { background: 'transparent' }}
          ref={inputRef}
          id="search-select"
          value={value}
          inputProps={{ 'aria-label': 'Without label' }}
          onChange={(e) => {
            const selectedId = e.target.value as T;
            onSelection && onSelection(selectedId);
          }}
          onClose={() => {
            setSearchText('');
            setIsOpen(false);
          }}
          onOpen={() => setIsOpen(true)}
          // This prevents rendering empty string in Select's value
          // if search text would exclude currently selected option.
          renderValue={(value) => {
            const title = (options.find((o) => o.value === value)?.title as string) ?? '';
            return <Text>{title}</Text>;
          }}
          endAdornment={
            <InputAdornment position="end">
              <Icon color={'--n400'} type={IconSize.small}>
                {isOpen ? IconNames.caretUp : IconNames.caretDown}
              </Icon>
            </InputAdornment>
          }
          startAdornment={
            startAdornment && (
              <InputAdornment position="start">
                <Icon color={startAdornment.color} type={IconSize.small}>
                  {startAdornment.icon}
                </Icon>
              </InputAdornment>
            )
          }
        >
          {/* TextField is put into ListSubheader so that it doesn't
              act as a selectable item in the menu
              i.e. we can click the TextField without triggering any selection.*/}
          {options.length >= displaySearchBarMinimumElements && (
            <div className={classNames('search-bar-container')}>
              <InputBase
                testId={'search-select-input-search'}
                placeholder={elementName ? `Search ${elementName}` : 'Search'}
                textFieldProps={{
                  size: 'small',
                  // Autofocus on textfield
                  autoFocus: true,
                  fullWidth: true,
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon color={'--n400'} type={IconSize.small}>
                          {IconNames.search}
                        </Icon>
                      </InputAdornment>
                    ),
                  },
                }}
                onChange={(e) => {
                  setSearchText(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Escape') {
                    // Prevents autoselecting item while typing (default Select behaviour)
                    e.stopPropagation();
                  }
                }}
              />
            </div>
          )}

          {displayedOptions.map((option: O, index: number) => (
            <MenuItem key={index} value={option.value as string}>
              <div>
                <Text>{option.title}</Text>
                {option.description && <Text type={TextTypes.textCaption}>{option.description}</Text>}
              </div>
            </MenuItem>
          ))}

          {options.length >= displayTotalCountThreshold && (
            <div className={'vanguard-searchable-select-input-menu-list-footer'}>
              <Text
                testId={'search-selector-footer-menu'}
                type={TextTypes.textCaption}
                replacements={{ count: options.length }}
              >
                {elementName ? `%count% ${elementName}s` : '%count% elements'}
              </Text>
            </div>
          )}
        </Select>
      </FormControl>
    </Box>
  );
};
