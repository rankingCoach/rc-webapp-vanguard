import { LocationCategoriesList } from '@common/LocationCategoriesList/LocationCategoriesList';
import { LocationServiceAreasList } from '@common/LocationServiceAreasList/LocationServiceAreasList';
import { OpeningTimes } from '@common/OpeningTimes/OpeningTimes';
import { useGetTextDifferences } from '@custom-hooks/use-get-text-differences';
import { dFlex, dFlexColumn, gap2 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { getPathId } from '@helpers/get-path-id';
import { PostalAddress } from '@models/swagger/App/Domain/Common/Entities/Address/PostalAddress';
import { Company } from '@models/swagger/App/Domain/Common/Entities/Company/Company';
import { ContactInfos } from '@models/swagger/App/Domain/Common/Entities/ContactInfos/ContactInfos';
import { PhoneNumberScope, PhoneNumberType } from '@models/swagger/App/Domain/Common/Entities/ContactInfos/PhoneNumber';
import { LocationCategories } from '@models/swagger/App/Domain/Presence/Entities/Locations/Categories/LocationCategories';
import { Description } from '@models/swagger/App/Domain/Presence/Entities/Locations/Description/Description';
import {
  ListingDataDivergency,
  ListingDataDivergencyType,
} from '@models/swagger/App/Domain/Presence/Entities/Locations/Listings/DataDivergencies/ListingDataDivergency';
import { LocationServiceAreas } from '@models/swagger/App/Domain/Presence/Entities/Locations/ServiceAreas/LocationServiceAreas';
import { OpeningHours } from '@models/swagger/App/Domain/Presence/Entities/OpeningHours/OpeningHours';
import { Website } from '@models/swagger/App/Domain/Seo/Entities/Website';
import { presenceStore } from '@stores/swagger/client/PresenceStore';
import { AnimatedConditional } from '@vanguard/AnimatedConditional/AnimatedConditional';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { InfoBox } from '@vanguard/InfoBox/InfoBox';
import { RadioData } from '@vanguard/RadioButton/RadioButton';
import { RadioButtonGroup } from '@vanguard/RadioButtonGroup/RadioButtonGroup';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React, { useEffect, useState } from 'react';
import { catchError, EMPTY } from 'rxjs';

import styles from './Discrepancy.module.scss';

export enum DiscrepancySelectionType {
  LOCATION = 'location',
  DIRECTORY = 'directory',
}

export type DiscrepancyProps = {
  locationLabel: string;
  directoryLabel: string;
  className?: string;
  divergency: ListingDataDivergency;
  onSelection: (value: DiscrepancySelectionType) => void;
};

export type DiscrepancyOptions = {
  options: RadioData[];
  fieldReadable: string;
};

export const Discrepancy = (props: DiscrepancyProps) => {
  const { locationLabel, directoryLabel, className, divergency, onSelection } = props;

  const getTextDifferences = useGetTextDifferences();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [discrepancyOptions, setDiscrepancyOptions] = useState<DiscrepancyOptions[]>([]);
  const [directoryBusinessNameDisabled, setDirectoryBusinessNameDisabled] = useState<boolean>(false);
  const [directoryServiceAreasDisabled, setDirectoryServiceAreasDisabled] = useState<boolean>(false);

  const prepareCompany = () => {
    const companyOptions: RadioData[] = [];
    const locationBusinessName = (divergency.dataOnLocation as Company)?.doingBusinessAsName ?? '';
    const directoryBusinessName = (divergency.dataOnDirectory as Company)?.doingBusinessAsName ?? '';

    // check for special chars
    if (directoryBusinessName.search(/[#<>\[\]\{\}*?!`’±;]+|(\.){2,}/g) >= 0) {
      setDirectoryBusinessNameDisabled(true);
    }

    companyOptions.push({
      labelText: getTextDifferences(locationBusinessName, directoryBusinessName, 'color-mix(in srgb, var(--w400) 40%, transparent)'),
      infoText: locationLabel,
      value: DiscrepancySelectionType.LOCATION,
    });
    companyOptions.push({
      labelText: getTextDifferences(directoryBusinessName, locationBusinessName, 'color-mix(in srgb, var(--e400) 40%, transparent)'),
      infoText: directoryLabel,
      value: DiscrepancySelectionType.DIRECTORY,
      disabled: directoryBusinessName.search(/[#<>\[\]\{\}*?!`’±;]+|(\.){2,}/g) >= 0 ? true : false,
    });
    setDiscrepancyOptions([{ options: companyOptions, fieldReadable: 'Company name' }]);
  };

  const prepareContactInfos = () => {
    const discrepanciesContactInfosOptions: DiscrepancyOptions[] = [];

    const locationContactInfos = divergency.dataOnLocation as ContactInfos | undefined;
    const directoryContactInfos = divergency.dataOnDirectory as ContactInfos | undefined;

    // If we get data from the directory, we will only iterate through the elements from the directory and compare with the ones from the location.
    if (directoryContactInfos?.elements?.length) {
      directoryContactInfos?.elements?.forEach((directoryContactInfo) => {
        const locationContactInfo = locationContactInfos?.elements?.find(
          (e) => e.type === directoryContactInfo.type && e.scope === directoryContactInfo.scope,
        );

        const options: RadioData[] = [];
        options.push({
          labelText: getTextDifferences(
            locationContactInfo?.value ?? '',
            directoryContactInfo.value ?? '',
            'color-mix(in srgb, var(--w400) 40%, transparent)',
          ),
          infoText: locationLabel,
          value: DiscrepancySelectionType.LOCATION,
        });

        options.push({
          labelText: getTextDifferences(
            directoryContactInfo.value ?? '',
            locationContactInfo?.value ?? '',
            'color-mix(in srgb, var(--e400) 40%, transparent)',
          ),
          infoText: directoryLabel,
          value: DiscrepancySelectionType.DIRECTORY,
        });

        const field =
          directoryContactInfo.scope === PhoneNumberScope.PHONE ? 'Phone number' : 'Additional phone number';

        discrepanciesContactInfosOptions.push({ options, fieldReadable: field });
      });
    } else {
      // In Google Business Profile not all contact information that is allowed in rC is allowed.
      // The only available data in GBP is phone, with main and additional ones.
      const availableContactInfos = [
        {
          type: PhoneNumberType.PHONE,
          scopes: [
            {
              scope: PhoneNumberScope.PHONE,
              label: 'Phone number',
            },
            {
              scope: PhoneNumberScope.ADDITIONALPHONE,
              label: 'Additional phone number',
            },
          ],
        },
      ];

      availableContactInfos.forEach((availableContactInfo) => {
        availableContactInfo.scopes.forEach((scope) => {
          const locationContactInfo = locationContactInfos?.elements?.find(
            (e) => e.type === availableContactInfo.type && e.scope === scope.scope,
          );
          if (locationContactInfo) {
            const options: RadioData[] = [];
            options.push({
              labelText: getTextDifferences(locationContactInfo.value ?? '', '', 'color-mix(in srgb, var(--w400) 40%, transparent)'),
              infoText: locationLabel,
              value: DiscrepancySelectionType.LOCATION,
            });

            options.push({
              labelText: getTextDifferences('', locationContactInfo.value ?? '', 'color-mix(in srgb, var(--e400) 40%, transparent)'),
              infoText: directoryLabel,
              value: DiscrepancySelectionType.DIRECTORY,
            });

            discrepanciesContactInfosOptions.push({ options, fieldReadable: scope.label });
          }
        });
      });
    }

    setDiscrepancyOptions(discrepanciesContactInfosOptions);
  };

  const prepareWebsite = () => {
    const websiteOptions: RadioData[] = [];

    const locationWebsiteDomain = (divergency.dataOnLocation as Website)?.domain;
    const directoryWebsiteDomain = (divergency.dataOnDirectory as Website)?.domain;

    const locationWebsiteName = [
      locationWebsiteDomain?.needsWww ? 'www.' : '',
      locationWebsiteDomain?.name ?? '',
      locationWebsiteDomain?.path ?? '',
    ].join('');
    const directoryWebsiteName = [
      directoryWebsiteDomain?.needsWww ? 'www.' : '',
      directoryWebsiteDomain?.name ?? '',
      directoryWebsiteDomain?.path ?? '',
    ].join('');

    websiteOptions.push({
      labelText: getTextDifferences(locationWebsiteName, directoryWebsiteName, 'color-mix(in srgb, var(--w400) 40%, transparent)'),
      infoText: locationLabel,
      value: DiscrepancySelectionType.LOCATION,
    });
    websiteOptions.push({
      labelText: getTextDifferences(directoryWebsiteName, locationWebsiteName, 'color-mix(in srgb, var(--e400) 40%, transparent)'),
      infoText: directoryLabel,
      value: DiscrepancySelectionType.DIRECTORY,
    });
    setDiscrepancyOptions([{ options: websiteOptions, fieldReadable: 'Business website' }]);
  };

  const prepareDescription = () => {
    const discrepanciesDescriptionOptions: DiscrepancyOptions[] = [];
    const locationDescriptionName = divergency.dataOnLocation as Description | undefined;
    const directoryDescriptionName = divergency.dataOnDirectory as Description | undefined;
    if (directoryDescriptionName?.long || locationDescriptionName?.long) {
      const descriptionLongOptions: RadioData[] = [];
      descriptionLongOptions.push({
        labelText: getTextDifferences(
          locationDescriptionName?.long ?? '',
          directoryDescriptionName?.long ?? '',
          'color-mix(in srgb, var(--w400) 40%, transparent)',
        ),
        infoText: locationLabel,
        value: DiscrepancySelectionType.LOCATION,
      });
      descriptionLongOptions.push({
        labelText: getTextDifferences(
          directoryDescriptionName?.long ?? '',
          locationDescriptionName?.long ?? '',
          'color-mix(in srgb, var(--e400) 40%, transparent)',
        ),
        infoText: directoryLabel,
        value: DiscrepancySelectionType.DIRECTORY,
      });
      discrepanciesDescriptionOptions.push({
        options: descriptionLongOptions,
        fieldReadable: 'Detailed Description',
      });
    }
    if (directoryDescriptionName?.short || locationDescriptionName?.short) {
      const descriptionShortOptions: RadioData[] = [];
      descriptionShortOptions.push({
        labelText: getTextDifferences(
          locationDescriptionName?.short ?? '',
          directoryDescriptionName?.short ?? '',
          'color-mix(in srgb, var(--w400) 40%, transparent)',
        ),
        infoText: locationLabel,
        value: DiscrepancySelectionType.LOCATION,
      });
      descriptionShortOptions.push({
        labelText: getTextDifferences(
          directoryDescriptionName?.short ?? '',
          locationDescriptionName?.short ?? '',
          'color-mix(in srgb, var(--e400) 40%, transparent)',
        ),
        infoText: directoryLabel,
        value: DiscrepancySelectionType.DIRECTORY,
      });
      discrepanciesDescriptionOptions.push({
        options: descriptionShortOptions,
        fieldReadable: 'Brief description',
      });
    }
    setDiscrepancyOptions(discrepanciesDescriptionOptions);
  };

  const prepareOpeningHours = () => {
    const openingHoursOptions: RadioData[] = [];
    const locationOpeningHours = divergency.dataOnLocation as OpeningHours | undefined;
    const directoryOpeningHours = divergency.dataOnDirectory as OpeningHours | undefined;

    const locationOpeningHoursDays = locationOpeningHours?.openingHours?.elements?.map((oh) => {
      return {
        dayOfWeek: oh.dayOfWeek ?? '',
        openAllDay: oh.openAllDay ?? false,
        open: oh.open ?? false,
        intervals:
          oh.elements?.map((interval) => {
            return {
              from: interval.from ?? '',
              to: interval.to ?? '',
            };
          }) ?? [],
      };
    });
    const directoryOpeningHoursDays = directoryOpeningHours?.openingHours?.elements?.map((oh) => {
      return {
        dayOfWeek: oh.dayOfWeek ?? '',
        openAllDay: oh.openAllDay ?? false,
        open: oh.open ?? false,
        intervals:
          oh.elements?.map((interval) => {
            return {
              from: interval.from ?? '',
              to: interval.to ?? '',
            };
          }) ?? [],
      };
    });
    openingHoursOptions.push({
      labelText: (
        <OpeningTimes
          alwaysOpen={locationOpeningHours?.alwaysOpen ?? false}
          noHoursAvailable={locationOpeningHours?.noHoursAvailable ?? true}
          showAmPm={true} // TO DO: get from BE
          openingHoursDays={locationOpeningHoursDays ?? []}
        />
      ),
      infoText: locationLabel,
      value: DiscrepancySelectionType.LOCATION,
    });
    openingHoursOptions.push({
      labelText: (
        <OpeningTimes
          alwaysOpen={directoryOpeningHours?.alwaysOpen ?? false}
          noHoursAvailable={directoryOpeningHours?.noHoursAvailable ?? true}
          showAmPm={true} // TO DO: get from BE
          openingHoursDays={directoryOpeningHoursDays ?? []}
        />
      ),
      infoText: directoryLabel,
      value: DiscrepancySelectionType.DIRECTORY,
    });

    setDiscrepancyOptions([{ options: openingHoursOptions, fieldReadable: 'Opening hours' }]);
  };

  const prepareAddress = () => {
    const postalAddressOptions: RadioData[] = [];

    const locationPostalAddressName = (divergency.dataOnLocation as PostalAddress)?.formattedAddress ?? '';
    const directoryPostalAddressName = (divergency.dataOnDirectory as PostalAddress)?.formattedAddress ?? '';

    postalAddressOptions.push({
      labelText: getTextDifferences(locationPostalAddressName, directoryPostalAddressName, 'color-mix(in srgb, var(--w400) 40%, transparent)'),
      infoText: locationLabel,
      value: DiscrepancySelectionType.LOCATION,
    });
    postalAddressOptions.push({
      labelText: getTextDifferences(directoryPostalAddressName, locationPostalAddressName, 'color-mix(in srgb, var(--e400) 40%, transparent)'),
      infoText: directoryLabel,
      value: DiscrepancySelectionType.DIRECTORY,
    });

    setDiscrepancyOptions([{ options: postalAddressOptions, fieldReadable: 'Business Address' }]);
  };

  const prepareCategories = () => {
    const categoriesOptions: RadioData[] = [];

    const categoriesOnLocation = divergency.dataOnLocation as LocationCategories | undefined;
    const categoriesOnDirectory = divergency.dataOnDirectory as LocationCategories | undefined;

    categoriesOptions.push(
      {
        labelText: categoriesOnLocation ? <LocationCategoriesList categories={categoriesOnLocation} /> : null,
        infoText: locationLabel,
        value: DiscrepancySelectionType.LOCATION,
      },
      {
        labelText: categoriesOnDirectory ? <LocationCategoriesList categories={categoriesOnDirectory} /> : null,
        infoText: directoryLabel,
        value: DiscrepancySelectionType.DIRECTORY,
      },
    );

    setDiscrepancyOptions([{ options: categoriesOptions, fieldReadable: 'Business categories' }]);
  };

  const prepareServiceAreas = () => {
    const serviceAreasOptions: RadioData[] = [];

    const serviceAreasOnLocation = divergency.dataOnLocation as LocationServiceAreas | undefined;
    const serviceAreasOnDirectory = divergency.dataOnDirectory as LocationServiceAreas | undefined;

    presenceStore
      .postClientPresenceLocationsServiceAreasNotMatchCountryByLocationId(
        getPathId(),
        { locationServiceAreas: serviceAreasOnDirectory },
        {},
      )
      .pipe(
        catchError((err, caught) => {
          return EMPTY;
        }),
      )
      .subscribe((response) => {
        if (response.serviceAreas?.elements?.length) {
          setDirectoryServiceAreasDisabled(true);
        }
        serviceAreasOptions.push(
          {
            labelText: serviceAreasOnLocation ? (
              <LocationServiceAreasList serviceAreas={serviceAreasOnLocation} />
            ) : null,
            infoText: locationLabel,
            value: DiscrepancySelectionType.LOCATION,
          },
          {
            labelText: serviceAreasOnDirectory ? (
              <LocationServiceAreasList serviceAreas={serviceAreasOnDirectory} />
            ) : null,
            infoText: directoryLabel,
            value: DiscrepancySelectionType.DIRECTORY,
            disabled: !!response.serviceAreas?.elements?.length,
          },
        );

        setDiscrepancyOptions([{ options: serviceAreasOptions, fieldReadable: 'Service areas' }]);
      });
  };

  const generateOptions = () => {
    switch (divergency.type) {
      case ListingDataDivergencyType.COMPANY:
        prepareCompany();
        break;

      case ListingDataDivergencyType.CONTACTINFOS:
        prepareContactInfos();
        break;

      case ListingDataDivergencyType.WEBSITE:
        prepareWebsite();
        break;

      case ListingDataDivergencyType.DESCRIPTION:
        prepareDescription();
        break;

      case ListingDataDivergencyType.OPENINGHOURS:
        prepareOpeningHours();
        break;

      case ListingDataDivergencyType.POSTAL_ADDRESS:
        prepareAddress();
        break;

      case ListingDataDivergencyType.CATEGORIES:
        prepareCategories();
        break;

      case ListingDataDivergencyType.LOCATIONSERVICEAREAS:
        prepareServiceAreas();
        break;
    }
  };

  useEffect(() => {
    generateOptions();
  }, [divergency]);

  return (
    <ComponentContainer>
      {discrepancyOptions.map((discrepancyOption, index) => {
        return (
          <div className={classNames(dFlex, dFlexColumn, gap2)} key={index}>
            <div className={classNames(styles.headerMiddleLineHorizontal)}>
              <div className={classNames(styles.headerMiddleButton)}>
                <Text type={TextTypes.text} fontWeight={FontWeights.regular}>
                  {discrepancyOption.fieldReadable}
                </Text>
              </div>
            </div>
            <AnimatedConditional condition={directoryBusinessNameDisabled}>
              <InfoBox
                type={'info'}
                description={
                  'While Google Business Profile allows special characters in the business name, most directories do not. We will use the name you gave us in your current profile to make your profile more consistent.'
                }
              />
            </AnimatedConditional>
            <AnimatedConditional condition={directoryServiceAreasDisabled}>
              <InfoBox
                type={'info'}
                description={
                  "While Google Business Profile allows you to include locations outside of your country, most directories do not. We'll use the service areas you defined in your current profile to make it more consistent."
                }
              />
            </AnimatedConditional>
            <RadioButtonGroup
              value={selectedOption}
              direction="row"
              formClassName={className}
              options={discrepancyOption.options}
              name={`discrepancy-${divergency.type}`}
              setRadioValueFn={(value) => {
                onSelection && onSelection(value.toString() as DiscrepancySelectionType);
                setSelectedOption(value);
              }}
              theme={'success'}
              translate={false}
            />
          </div>
        );
      })}
    </ComponentContainer>
  );
};
