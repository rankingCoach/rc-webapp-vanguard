# VAN-85 · Button sizes: webapp migration

How the webapp (`rc-webapp/html/react`) moves to the harmonized button sizes in vanguard 2.6.0. Background and options are in `VAN-85-button-sizes-investigation.md` (option A).

## 1. Run the codemod alongside the vanguard bump

The codemod ships in vanguard as `scripts/codemod-button-sizes.js`. It bumps every non-muted `<Button>` (default, primary, secondary, shimmer) one size step, so each keeps its footprint. Muted buttons aren't touched.

| before 2.6 | from 2.6 | height (mobile / desktop) |
| --- | --- | --- |
| `small` | `medium` | 40 / 32px, unchanged; text 16 → 12px |
| `medium` or no `size` | `extraLarge` | 40 / 48px, unchanged |
| `large` | `extraLarge` | 48 → 40 / 60 → 48px (shorter) |

```bash
# from the vanguard checkout: dry run, then write
node scripts/codemod-button-sizes.js /path/to/rc-webapp/html/react/src
node scripts/codemod-button-sizes.js /path/to/rc-webapp/html/react/src --write
```

The dry run against `rc-webapp` at `1e62365a352` changes **822 buttons**:

- 532 with no size become `extraLarge`
- 254 `small` become `medium`
- 30 explicit `medium` become `extraLarge`
- 6 `large` become `extraLarge`

It adds `ButtonSizes` to the `vanguard` import where it's missing. The full list is in §4.

Re-checked on 2026-10-20 at `8a846a885e8` (`feature/competitor-selection-redesign`, which already has the secondary → muted refactor `d776413cd85`): **469 buttons** and **42** by hand. The codemod fix for the `@vanguard/Button` barrel changes nothing here, because the webapp imports from `vanguard`. The drop from 822 comes from that refactor, which isn't on `master` yet. Re-run the dry run on the branch you migrate, right before `--write`, and use its output instead of §4.

## 2. By hand: type or size computed at runtime (39)

The codemod leaves these alone. Guidance per group:

- **Toggle rows that switch between `primary` and `muted` at `small`** (AgentControlPanel:199/218/229, DashboardMeasurements:35, WidgetSetControls:28): **keep `small`**. Before 2.6 the selected chip was 32px and the others 24px on desktop. From 2.6 they all render at 24px.
- **Send/submit buttons that switch between shimmer and muted** (ConversationMessageInput:418, MediaPromptInput:85): before 2.6, `shimmer small` (32px) was paired with `muted medium` (32px). From 2.6, set the shimmer branch to `ButtonSizes.medium`, or just drop the size ternary.
- **Ternaries between two non-muted types** (PartnerApiTesterLoginForm ×4, AgentSchedulesList:744, AiVisibilityCustomQueries:110, StatusInfo:149, WebsiteThemeManagerPanel:181, WebsiteBuildProgressCard:127, YourWebsiteCard:407): apply the §1 bump.
- **Type from config or props** (LandingPage sections, Hero, BusinessListItemWithConnections, SectionMissing, MediaItemActions, MediaLibraryUpload, WebsiteReleaseStateLine): bump unless the type can be muted. Then use `type === ButtonTypes.muted ? <muted size> : <bumped size>`, the pattern vanguard's InfoBox uses.
- **A `size` prop forwarded through a wrapper** (WebsiteTemplateExportButton, WebsiteLookReviewInvitation, WebsiteReleaseStateLine `compact ? small : undefined`, AiVisibilityUpsellTriggerSmall `isMobile ? medium : small`): bump the wrapper's default and the values its callers pass. In WebsiteLookReviewInvitation, one `size` covers both muted and non-muted buttons, so split it.
- **Spread props** (HoverableCard, ConversationWidgetButton (15 call sites), AIExtensionsTrigger, PublishingBoardCTA): check what the spread carries.
- **ActionBar footer `props.size`:** before 2.6, `ActionBarFooter` turned an untyped `small` into muted `medium`. From 2.6 it uses the consumer's size as-is and defaults every button to the row size (`extraLarge`). The webapp has no footer-template usages today, so nothing to do.

## 3. By hand: CSS that depends on the old sizes

After the codemod, heights stay the same. These still need a look:

- `upsellings/.../SpaceshipUpsellCard.module.scss:70/80`: `.card .cta.cta` sets `--padding-y: 10px` and a 1rem label to get a 40px `large` button. After the bump the button is `extraLarge`, so check it still lands at 40px.
- `presence/GBP/GoogleBusinessProfileCreateNotInPlanNotice/...module.scss:37`: `height: auto` plus wrapping label below 480px. It still works, but consider the `textWrap="wrap"` prop instead.
- The 6 `large` CTAs: FeatureBox:149, MobileAppInviteSheet:118/128, CardBasedBenefits:516, UpsellingCard:210, SpaceshipUpsellCard:95. They drop from 60 to 48px on desktop. **Approved by design (2026-10-21)**: keep them at `extraLarge`, no extra change.

## 4. Full codemod dry run

```text
Would change 822 buttons:
  app/routes/customer/app/logout.lazy.tsx:16  primary: (default) -> extraLarge
  components/_common/BundleBadge/BundleBadge.tsx:67  primary: small -> medium
  components/_common/BusinessLogoPicker/BusinessLogoPicker.tsx:117  secondary: (default) -> extraLarge
  components/_common/BusinessLogoPicker/BusinessLogoPicker.tsx:138  primary: (default) -> extraLarge
  components/_common/BusinessLogoPicker/BusinessLogoPicker.tsx:175  secondary: (default) -> extraLarge
  components/_common/BusinessLogoSquareEditor/BusinessLogoSquareControls/BusinessLogoSquareControls.tsx:226  secondary: medium -> extraLarge
  components/_common/BusinessLogoSquareEditor/BusinessLogoSquareEditor.tsx:191  primary: (default) -> extraLarge
  components/_common/ChangePasswordModal/ChangePasswordModal.tsx:150  primary: (default) -> extraLarge
  components/_common/CommentItem/CommentItem.tsx:255  default: small -> medium
  components/_common/CommentItem/CommentItem.tsx:282  default: small -> medium
  components/_common/CommentItem/CommentItem.tsx:311  default: small -> medium
  components/_common/CommentItem/CommentItem.tsx:337  default: small -> medium
  components/_common/CommentItem/ReplyCommentItemForm/ReplyCommentItemForm.tsx:248  primary: (default) -> extraLarge
  components/_common/CommentItem/ReplyCommentItemForm/ReplyCommentItemForm.tsx:262  default: (default) -> extraLarge
  components/_common/EntityListPage/EntityListEmpty/EntityListEmpty.tsx:29  secondary: (default) -> extraLarge
  components/_common/EntityListPage/EntityListEmpty/EntityListEmpty.tsx:33  primary: (default) -> extraLarge
  components/_common/EntityListPage/EntityListEmpty/EntityListEmpty.tsx:51  primary: (default) -> extraLarge
  components/_common/EntityListPage/EntityListError/EntityListError.tsx:27  secondary: (default) -> extraLarge
  components/_common/EntityListPage/EntityListTable/EntityListTable.tsx:145  secondary: small -> medium
  components/_common/EntityListPage/EntityListToolbar/EntityListToolbar.tsx:96  primary: (default) -> extraLarge
  components/_common/EntityListPage/EntityListToolbar/EntityListToolbar.tsx:122  secondary: (default) -> extraLarge
  components/_common/EntityListPage/stories/HeaderActions.story.tsx:28  primary: (default) -> extraLarge
  components/_common/EntityListPage/stories/Refetching.story.tsx:15  primary: (default) -> extraLarge
  components/_common/FeatureBox/FeatureBox.tsx:117  primary: (default) -> extraLarge
  components/_common/FeatureBox/FeatureBox.tsx:149  primary: large -> extraLarge
  components/_common/FlatPage/_FlatPage.stories.tsx:20  secondary: (default) -> extraLarge
  components/_common/ListPage/ListPageEmpty/ListPageEmpty.tsx:34  primary: (default) -> extraLarge
  components/_common/ListPage/ListPageHeaderWithActions/ListPageActions/ListPageActions.tsx:205  secondary: medium -> extraLarge
  components/_common/ListPage/ListPageHeaderWithActions/ListPageActions/ListPageActions.tsx:231  primary: (default) -> extraLarge
  components/_common/ListPage/ListPageHeaderWithActions/ListPageActions/ListPageActions.tsx:240  secondary: (default) -> extraLarge
  components/_common/ListPage/ListPageHeaderWithActions/ListPageHeader/ListPageHeader.tsx:38  primary: (default) -> extraLarge
  components/_common/ListPage/_ListPage.stories.tsx:489  primary: (default) -> extraLarge
  components/_common/ListPage/_ListPage.stories.tsx:490  secondary: (default) -> extraLarge
  components/_common/ListingServiceConnectionDetails/ListingServiceConnectionDetails.tsx:101  secondary: (default) -> extraLarge
  components/_common/ListingServiceConnectionDetails/ListingServiceFacebook/FBAndIGConnectedModal/FBAndIGConnectedModal.tsx:126  primary: (default) -> extraLarge
  components/_common/ListingServiceTitle/ListingServiceTitle.tsx:171  secondary: small -> medium
  components/_common/LocationCard/LocationCard.tsx:115  default: (default) -> extraLarge
  components/_common/LocationCard/LocationCard.tsx:243  default: (default) -> extraLarge
  components/_common/PageSectionRecommended/PageSectionRecommended.tsx:104  primary: (default) -> extraLarge
  components/_common/RecommendationCard/ClosedRecommendationCard.tsx:143  shimmer: (default) -> extraLarge
  components/_common/RecommendationCard/OpenRecommendationCard.tsx:117  shimmer: (default) -> extraLarge
  components/_common/ReviewCard/ReviewCardForm/ReviewCardForm.tsx:488  primary: (default) -> extraLarge
  components/_common/ReviewCard/ReviewCardForm/ReviewCardForm.tsx:551  default: (default) -> extraLarge
  components/_common/ReviewCard/ReviewCardForm/ReviewCardFormUpsellMessage/ReviewCardFormUpsellMessage.tsx:30  primary: (default) -> extraLarge
  components/_common/ReviewCard/ReviewCardReplies/ReviewCardReply.tsx:95  default: small -> medium
  components/_common/ReviewCard/ReviewCardReplies/ReviewCardReply.tsx:108  default: small -> medium
  components/_common/StatisticsBoard/StatisticsBoardItem/StatisticsBoardItem.tsx:235  default: (default) -> extraLarge
  components/_common/UpsellingTrigger/UpsellingTrigger.tsx:27  default: small -> medium
  components/_common/VerificationMethod/VerificationMethod.tsx:187  secondary: (default) -> extraLarge
  components/_common/VerificationMethod/VerificationMethod.tsx:198  primary: (default) -> extraLarge
  components/_common/upselling-triggers/EngagementUpsell/EngagementUpsell.tsx:74  primary: (default) -> extraLarge
  components/_common/upselling-triggers/ListingsUpsell/ListingUpsellDashboardCard/ListingUpsellDashboardCard.tsx:61  primary: (default) -> extraLarge
  components/_widgets/LocationSummaryPageHeader/LocationSummaryPageHeader.tsx:158  primary: (default) -> extraLarge
  components/_widgets/LocationSummaryPageHeader/LocationSummaryPageHeader.tsx:171  primary: (default) -> extraLarge
  components/_widgets/LocationSummaryPageHeader/LocationSummaryPageHeaderCover/LocationSummaryPageHeaderCover.tsx:172  default: small -> medium
  components/_widgets/LocationSummaryPageHeader/LocationSummaryPageHeaderLogo/LocationSummaryPageHeaderLogo.tsx:167  default: small -> medium
  components/_widgets/LocationSummaryPageHeader/LocationSummaryPageHeaderLogo/LocationSummaryPageHeaderLogo.tsx:219  default: small -> medium
  components/account/BillingDocuments/BillingDocumentsList/BillingDocumentYear/BillingDocumentItem/BillingDocumentItem.tsx:220  secondary: small -> medium
  components/account/PersonalSettings/PersonalSettingsPage/EmailCard/EditAccountEmail/EditAccountEmail.tsx:61  default: (default) -> extraLarge
  components/account/PersonalSettings/PersonalSettingsPage/EmailCard/EditAccountEmail/EditAccountEmail.tsx:108  primary: (default) -> extraLarge
  components/account/PersonalSettings/PersonalSettingsPage/EmailCard/EditAccountEmail/EditAccountEmail.tsx:116  default: (default) -> extraLarge
  components/account/PersonalSettings/PersonalSettingsPage/EmailCard/EditAccountPassword/EditAccountPassword.tsx:93  primary: (default) -> extraLarge
  components/account/PersonalSettings/PersonalSettingsPage/EmailCard/EditAccountPassword/EditAccountPassword.tsx:101  default: (default) -> extraLarge
  components/account/PersonalSettings/PersonalSettingsPage/EmailCard/EmailCard.tsx:48  secondary: small -> medium
  components/account/PersonalSettings/PersonalSettingsPage/EmailCard/EmailCard.tsx:51  secondary: small -> medium
  components/account/PersonalSettings/PersonalSettingsPage/InvoiceAddressCard/EditAccountInvoiceAddress/EditAccountInvoiceAddress.tsx:422  primary: (default) -> extraLarge
  components/account/PersonalSettings/PersonalSettingsPage/InvoiceAddressCard/EditAccountInvoiceAddress/EditAccountInvoiceAddress.tsx:430  default: (default) -> extraLarge
  components/account/PersonalSettings/PersonalSettingsPage/MinimalPersonalSettingsPage.tsx:51  default: (default) -> extraLarge
  components/account/PersonalSettings/PersonalSettingsPage/NewsletterCard/EditAccountNewsletter/EditAccountNewsletter.tsx:85  primary: (default) -> extraLarge
  components/account/PersonalSettings/PersonalSettingsPage/NewsletterCard/EditAccountNewsletter/EditAccountNewsletter.tsx:93  default: (default) -> extraLarge
  components/account/PersonalSettings/PersonalSettingsPage/ProfileCard/EditAccountProfile/EditAccountProfile.tsx:141  primary: (default) -> extraLarge
  components/account/PersonalSettings/PersonalSettingsPage/ProfileCard/EditAccountProfile/EditAccountProfile.tsx:149  default: (default) -> extraLarge
  components/admin/AiUsageExplorer/AiUsageExplorer.tsx:143  primary: small -> medium
  components/admin/AiUsageExplorer/AiUsageExplorerDayTable.tsx:32  primary: small -> medium
  components/admin/AiUsageExplorer/AiUsageExplorerModelsTable.tsx:42  primary: small -> medium
  components/admin/AiUsageExplorer/AiUsageExplorerOperationMix.tsx:79  primary: small -> medium
  components/admin/AiUsageExplorer/AiUsageExplorerOperationMix.tsx:114  primary: small -> medium
  components/admin/AiUsageKpis/AiUsageKpisDashboard.tsx:179  primary: small -> medium
  components/admin/AiUsageKpis/AiUsageKpisMetricsByPeriod.tsx:77  primary: small -> medium
  components/admin/PartnerApiTester/PartnerApiTester.tsx:102  default: small -> medium
  components/admin/PartnerApiTester/PartnerApiTesterLoginForm.tsx:150  primary: (default) -> extraLarge
  components/admin/PartnerApiTester/PartnerApiTesterPdfExport/PartnerApiTesterPdfExport.tsx:37  default: small -> medium
  components/admin/PartnerApiTester/PartnerApiTesterSessionCard.tsx:54  default: (default) -> extraLarge
  components/admin/PartnerApiTester/PartnerApiTesterSessionCard.tsx:63  default: (default) -> extraLarge
  components/admin/PartnerApiTester/PartnerApiTesterTargetCard.tsx:97  primary: small -> medium
  components/admin/PartnerApiTester/sections/InsightTileSection.tsx:97  primary: small -> medium
  components/admin/ResellerOverviewDashboard/ResellerOverviewDashboard.tsx:315  primary: small -> medium
  components/admin/ResellerOverviewDashboard/ResellerOverviewJSONTable.tsx:205  primary: (default) -> extraLarge
  components/admin/ResellerOverviewDashboard/ResellerOverviewJSONTable.tsx:233  primary: (default) -> extraLarge
  components/admin/UnitTestRunner/UnitTestRunnerContent/UnitTestRunnerContent.tsx:136  secondary: (default) -> extraLarge
  components/admin/UnitTestRunner/UnitTestRunnerTopBar/UnitTestRunnerTopBar.tsx:52  default: (default) -> extraLarge
  components/admin/UnitTestRunner/UnitTestRunnerTopBar/UnitTestRunnerTopBar.tsx:63  default: (default) -> extraLarge
  components/admin/agent/Conversations/AgentConversationInspector.tsx:1808  secondary: small -> medium
  components/admin/agent/Conversations/AgentConversationInspector.tsx:1811  primary: small -> medium
  components/admin/agent/Conversations/AgentConversationInspector.tsx:1824  secondary: small -> medium
  components/admin/agent/Conversations/AgentConversationInspector.tsx:1832  secondary: small -> medium
  components/admin/agent/Conversations/AgentConversationInspector.tsx:1929  secondary: small -> medium
  components/admin/agent/Conversations/AgentConversationInspector.tsx:1939  secondary: small -> medium
  components/admin/agent/Conversations/AgentConversationInspector.tsx:1958  secondary: small -> medium
  components/admin/agent/Conversations/AgentConversationInspector.tsx:1965  secondary: small -> medium
  components/admin/agent/Conversations/AgentConversationInspector.tsx:1979  secondary: small -> medium
  components/admin/agent/Conversations/AgentConversationInspector.tsx:1987  secondary: small -> medium
  components/admin/agent/Conversations/AgentConversationInspector.tsx:2002  secondary: small -> medium
  components/admin/agent/Conversations/AgentConversationInspector.tsx:2431  secondary: small -> medium
  components/admin/agent/Conversations/AgentConversationInspector.tsx:2473  primary: small -> medium
  components/admin/agent/Conversations/AgentConversationInspector.tsx:2505  primary: small -> medium
  components/admin/agent/Conversations/AgentConversationInspector.tsx:2716  primary: small -> medium
  components/admin/agent/Conversations/AgentConversationMessageRow.tsx:605  secondary: small -> medium
  components/admin/agent/Conversations/AgentConversationMessageRow.tsx:613  primary: small -> medium
  components/admin/agent/Conversations/AgentConversationsList.tsx:548  primary: small -> medium
  components/admin/agent/Conversations/AgentConversationsList.tsx:668  primary: small -> medium
  components/admin/agent/Conversations/AgentConversationsList.tsx:850  secondary: small -> medium
  components/admin/agent/Conversations/AgentConversationsList.tsx:859  secondary: small -> medium
  components/admin/agent/Conversations/AgentConversationsList.tsx:1060  secondary: small -> medium
  components/admin/agent/Conversations/AgentConversationsList.tsx:1068  primary: small -> medium
  components/admin/agent/McpSkills/AgentMcpSkills.tsx:159  secondary: small -> medium
  components/admin/agent/PhoneCalls/AgentPhoneCallsList.tsx:188  primary: small -> medium
  components/admin/agent/PhoneCalls/AgentPhoneCallsList.tsx:242  default: small -> medium
  components/admin/agent/PhoneCalls/AgentPhoneCallsList.tsx:260  secondary: small -> medium
  components/admin/agent/Quality/QualityCatalogueEntry.tsx:125  secondary: small -> medium
  components/admin/agent/Quality/QualityCatalogueEntry.tsx:133  secondary: small -> medium
  components/admin/agent/Quality/QualityCatalogueEntry.tsx:142  primary: small -> medium
  components/admin/agent/Quality/QualityCatalogueEntry.tsx:147  secondary: small -> medium
  components/admin/agent/Quality/QualityCatalogueEntry.tsx:178  primary: small -> medium
  components/admin/agent/Quality/QualityCatalogueEntry.tsx:197  primary: small -> medium
  components/admin/agent/Quality/QualityShared.tsx:380  secondary: small -> medium
  components/admin/agent/Quality/QualityShared.tsx:389  secondary: small -> medium
  components/admin/agent/Schedules/AgentScheduleCreateEditDialog.tsx:219  secondary: small -> medium
  components/admin/agent/Schedules/AgentScheduleCreateEditDialog.tsx:222  primary: small -> medium
  components/admin/agent/Schedules/AgentScheduleRunHistory.tsx:197  secondary: small -> medium
  components/admin/agent/Schedules/AgentSchedulesList.tsx:279  primary: small -> medium
  components/admin/agent/Schedules/AgentSchedulesList.tsx:333  primary: small -> medium
  components/admin/agent/Schedules/AgentSchedulesList.tsx:510  secondary: small -> medium
  components/admin/agent/Schedules/AgentSchedulesList.tsx:519  secondary: small -> medium
  components/admin/agent/Schedules/AgentSchedulesList.tsx:529  secondary: small -> medium
  components/admin/agent/Schedules/AgentSchedulesList.tsx:539  secondary: small -> medium
  components/admin/agent/Schedules/AgentSchedulesList.tsx:549  secondary: small -> medium
  components/admin/agent/Schedules/AgentSchedulesList.tsx:558  secondary: small -> medium
  components/admin/agent/Schedules/AgentSchedulesList.tsx:640  secondary: small -> medium
  components/admin/agent/Schedules/AgentSchedulesList.tsx:651  secondary: small -> medium
  components/admin/agent/Schedules/AgentSchedulesList.tsx:741  secondary: small -> medium
  components/admin/agent/WidgetImageTester/WidgetImageTester.tsx:258  primary: (default) -> extraLarge
  components/admin/agent/WidgetImageTester/WidgetImageTester.tsx:261  primary: (default) -> extraLarge
  components/admin/agent/WidgetImageTester/WidgetImageTester.tsx:264  primary: (default) -> extraLarge
  components/admin/agent/WidgetImageTester/WidgetImageTester.tsx:300  primary: (default) -> extraLarge
  components/admin/business-processor/BusinessProcessorCampaignsList/BusinessProcessorCampaignsList.tsx:43  default: small -> medium
  components/admin/business-processor/BusinessProcessorCampaignsList/use-business-processor-columns.tsx:80  default: small -> medium
  components/admin/business-processor/BusinessProcessorCreateCampaign/BusinessProcessorCreateCampaign.tsx:198  primary: (default) -> extraLarge
  components/admin/business-processor/BusinessProcessorCreateCampaign/BusinessProcessorCreateCampaign.tsx:201  primary: (default) -> extraLarge
  components/admin/business-processor/BusinessProcessorCreateCampaign/BusinessProcessorCreateCampaign.tsx:225  primary: (default) -> extraLarge
  components/admin/business-processor/BusinessProcessorCreateCampaign/BusinessProcessorCreateCampaign.tsx:249  primary: (default) -> extraLarge
  components/admin/business-processor/BusinessProcessorDataGrid/BusinessProcessorDataGridDetails/BusinessProcessorDataGridDetails.tsx:39  primary: small -> medium
  components/admin/business-processor/BusinessProcessorDataGrid/BusinessProcessorDataGridDetails/BusinessProcessorDataGridDetails.tsx:49  primary: small -> medium
  components/admin/business-processor/BusinessProcessorDataGrid/BusinessProcessorDataGridSearchInput/BusinessProcessorDataGridSearchInput.tsx:60  primary: small -> medium
  components/admin/configuration/AccountForcedFeatureFlags/AccountForcedFeatureFlagsDialog/AccountForcedFeatureFlagsDialog.tsx:233  secondary: (default) -> extraLarge
  components/admin/configuration/AccountForcedFeatureFlags/AccountForcedFeatureFlagsDialog/AccountForcedFeatureFlagsDialog.tsx:339  secondary: (default) -> extraLarge
  components/admin/configuration/AccountForcedFeatureFlags/AccountForcedFeatureFlagsDialog/AccountForcedFeatureFlagsDialog.tsx:342  primary: (default) -> extraLarge
  components/admin/configuration/AccountForcedFeatureFlags/AccountForcedFeatureFlagsList.tsx:136  primary: (default) -> extraLarge
  components/admin/configuration/CronJobs/CronJobConfig.tsx:596  default: small -> medium
  components/admin/configuration/CronJobs/CronJobConfig.tsx:604  primary: small -> medium
  components/admin/configuration/CronJobs/CronJobDetailShared.tsx:147  secondary: small -> medium
  components/admin/maintenance/DatabaseTables/DatabaseTablesScreen.tsx:161  secondary: small -> medium
  components/admin/maintenance/DatabaseTables/DatabaseTablesScreen.tsx:169  primary: small -> medium
  components/admin/maintenance/EncryptionScopes/EncryptionScopesScreen.tsx:448  primary: small -> medium
  components/admin/maintenance/EncryptionScopes/EncryptionScopesScreen.tsx:456  default: small -> medium
  components/admin/maintenance/EncryptionScopes/EncryptionScopesScreen.tsx:463  default: small -> medium
  components/admin/maintenance/EncryptionScopes/EncryptionScopesScreen.tsx:486  secondary: small -> medium
  components/admin/maintenance/EncryptionScopes/EncryptionScopesScreen.tsx:505  default: small -> medium
  components/admin/maintenance/EncryptionScopes/EncryptionScopesScreen.tsx:564  secondary: small -> medium
  components/admin/maintenance/EncryptionScopes/EncryptionScopesScreen.tsx:687  default: small -> medium
  components/admin/maintenance/EncryptionScopes/EncryptionScopesScreen.tsx:702  primary: small -> medium
  components/admin/maintenance/EncryptionScopes/EncryptionScopesScreen.tsx:738  default: small -> medium
  components/admin/maintenance/EncryptionScopes/EncryptionScopesScreen.tsx:772  primary: small -> medium
  components/admin/maintenance/EncryptionScopes/EncryptionScopesScreen.tsx:779  default: small -> medium
  components/admin/maintenance/EncryptionScopes/EncryptionScopesScreen.tsx:805  default: small -> medium
  components/admin/maintenance/EncryptionScopes/EncryptionScopesScreen.tsx:814  secondary: small -> medium
  components/admin/maintenance/EncryptionScopes/EncryptionScopesScreen.tsx:860  default: small -> medium
  components/admin/maintenance/EncryptionScopes/EncryptionScopesScreen.tsx:874  primary: small -> medium
  components/admin/mobile/PushNotificationSender/MobilePushNotificationSender.tsx:268  primary: small -> medium
  components/admin/mobile/TargetLocationCard/MobileTargetLocationCard.tsx:91  secondary: small -> medium
  components/admin/mobile/VoiceCall/MobileVoiceCallTester.tsx:162  primary: small -> medium
  components/admin/mobile/VoiceCall/MobileVoiceCallTester.tsx:194  default: small -> medium
  components/admin/mobile/VoiceCall/MobileVoiceCallTester.tsx:226  secondary: small -> medium
  components/admin/mobile/VoiceCall/MobileVoiceCallTester.tsx:269  default: small -> medium
  components/admin/website-builder/_shared/WebsiteWorkTrace/WebsiteWorkTraceNodeDrawer.tsx:182  secondary: (default) -> extraLarge
  components/admin/website-builder/_shared/WebsiteWorkTrace/WebsiteWorkTraceNodeDrawer.tsx:186  default: (default) -> extraLarge
  components/ado/AdoDashboard/intro/_AdoIntro.stories.tsx:70  primary: small -> medium
  components/ado/AdoDashboard/measurements/DashboardMeasurements/DashboardMeasurements.tsx:26  primary: (default) -> extraLarge
  components/ado/AdoDashboard/tasks/NeedsSection/NeedsFocusedCard/NeedsFocusedCard.tsx:51  shimmer: small -> medium
  components/ado/AdoDashboard/tasks/NeedsSection/NeedsFocusedCard/NeedsFocusedCard.tsx:62  secondary: small -> medium
  components/ado/AdoDashboard/tasks/TaskCard/_TaskCard.stories.tsx:147  primary: small -> medium
  components/ado/AdoDashboard/tasks/TaskCard/_TaskCard.stories.tsx:180  primary: small -> medium
  components/ado/AdoDashboard/tasks/TaskCard/_TaskCard.stories.tsx:183  secondary: small -> medium
  components/ado/AdoDashboard/tasks/TaskStatus/_TaskStatus.stories.tsx:28  shimmer: (default) -> extraLarge
  components/ado/AdoDashboard/tutorial/AdoTutorialMessage/AdoTutorialMessage.tsx:43  primary: medium -> extraLarge
  components/ado/AdoDashboard/widgets/DashboardWidget/DashboardWidget.tsx:75  primary: small -> medium
  components/ado/AdoDashboard/widgets/_stories/WidgetGallery/WidgetGallery.tsx:71  primary: (default) -> extraLarge
  components/ado/AdoDashboard/widgets/_stories/WidgetGallery/WidgetGallery.tsx:72  primary: (default) -> extraLarge
  components/ado/AdoDashboard/widgets/_stories/WidgetGallery/WidgetGallery.tsx:73  primary: (default) -> extraLarge
  components/ado/AdoDashboard/widgets/_stories/WidgetGallery/WidgetGallery.tsx:74  primary: (default) -> extraLarge
  components/ado/AdoDashboard/widgets/_stories/WidgetGallery/WidgetGallery.tsx:75  primary: (default) -> extraLarge
  components/ado/AdoDashboard/widgets/_stories/WidgetGallery/WidgetGallery.tsx:76  primary: (default) -> extraLarge
  components/ado/AdoDashboard/widgets/_stories/WidgetGallery/WidgetGallery.tsx:77  primary: (default) -> extraLarge
  components/ado/AdoDashboard/widgets/_stories/WidgetGallery/WidgetGallery.tsx:78  primary: (default) -> extraLarge
  components/ads/GoogleAdsAssetGroupsPanel/GoogleAdsAssetGroupAssetsList.tsx:31  secondary: (default) -> extraLarge
  components/ads/GoogleAdsAssetGroupsPanel/GoogleAdsAssetGroupAssetsList.tsx:75  secondary: (default) -> extraLarge
  components/ads/GoogleAdsAssetGroupsPanel/GoogleAdsAssetGroupsPanel.tsx:59  secondary: (default) -> extraLarge
  components/ads/GoogleAdsAssetGroupsPanel/GoogleAdsAssetGroupsPanel.tsx:63  secondary: (default) -> extraLarge
  components/ads/GoogleAdsAssetGroupsPanel/GoogleAdsAssetGroupsPanel.tsx:95  secondary: (default) -> extraLarge
  components/ads/GoogleAdsAssetGroupsPanel/GoogleAdsAssetGroupsPanel.tsx:99  secondary: (default) -> extraLarge
  components/ads/GoogleAdsAssetGroupsPanel/GoogleAdsAssetGroupsPanel.tsx:157  secondary: (default) -> extraLarge
  components/ads/GoogleAdsAssetGroupsPanel/GoogleAdsAssetGroupsPanel.tsx:206  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutCreateModal/GoogleAdsCalloutCreateModal.tsx:319  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutCreateModal/GoogleAdsCalloutCreateModal.tsx:386  default: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutCreateModal/GoogleAdsCalloutCreateModal.tsx:405  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutCreateModal/_GoogleAdsCalloutCreateModal.stories.tsx:8  primary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:105  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:109  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:171  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:177  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:180  default: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:185  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:226  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:317  primary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:321  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:325  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:362  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:370  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:392  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:400  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:428  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCalloutsPanel/GoogleAdsCalloutsPanel.tsx:464  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignAssetsPanel/GoogleAdsCampaignAssetDetails.tsx:56  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignAssetsPanel/GoogleAdsCampaignAssetDetails.tsx:68  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignAssetsPanel/GoogleAdsCampaignAssetsPanel.tsx:45  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignAssetsPanel/GoogleAdsCampaignAssetsPanel.tsx:49  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignAssetsPanel/GoogleAdsCampaignAssetsPanel.tsx:94  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignAssetsPanel/GoogleAdsCampaignAssetsPanel.tsx:132  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignForm/GoogleAdsCampaignForm.tsx:998  primary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignForm/GoogleAdsCampaignForm.tsx:1006  default: (default) -> extraLarge
  components/ads/GoogleAdsCampaignSettingsEditor/GoogleAdsCampaignSettingsEditor.tsx:1070  default: (default) -> extraLarge
  components/ads/GoogleAdsCampaignSettingsEditor/GoogleAdsCampaignSettingsEditor.tsx:1172  primary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignSettingsEditor/GoogleAdsCampaignSettingsEditor.tsx:1180  default: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAccountSettings/GoogleAdsAccountSettings.tsx:87  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAccountSettings/GoogleAdsAccountSettings.tsx:109  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAccountSettings/GoogleAdsAccountSettings.tsx:130  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroupDetailPage/GoogleAdsAdGroupDetailContent/GoogleAdsAdGroupDetailContent.tsx:57  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroupDetailPage/GoogleAdsAdGroupDetailContent/GoogleAdsAdGroupDetailContent.tsx:68  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroupDetailPage/GoogleAdsAdGroupDetailPage.tsx:56  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroupDetailPage/GoogleAdsAdGroupDetailPage.tsx:67  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroupDetailPage/GoogleAdsAdGroupSettingsPanel/GoogleAdsAdGroupSettingsPanel.tsx:226  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroupDetailPage/GoogleAdsAdGroupSettingsPanel/GoogleAdsAdGroupSettingsPanel.tsx:279  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroupDetailPage/GoogleAdsAdGroupSettingsPanel/GoogleAdsAdGroupSettingsPanel.tsx:401  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroupDetailPage/GoogleAdsAdGroupSettingsPanel/GoogleAdsAdGroupSettingsPanel.tsx:411  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroupDetailPage/GoogleAdsAdGroupSettingsPanel/GoogleAdsAdGroupSettingsPanel.tsx:480  primary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroupDetailPage/GoogleAdsAdGroupSettingsPanel/GoogleAdsAdGroupSettingsPanel.tsx:486  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsAdGroupForm/GoogleAdsAdGroupForm.tsx:515  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsAdGroupSummary/GoogleAdsAdGroupSummary.tsx:442  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsAdGroupSummary/GoogleAdsAdGroupSummary.tsx:456  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsAdGroupSummary/GoogleAdsAdGroupSummary.tsx:503  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsAdGroupSummary/GoogleAdsAdGroupSummary.tsx:522  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsAdGroupsContent/GoogleAdsAdGroupsContent.tsx:113  primary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsAdGroupsContent/GoogleAdsAdGroupsContent.tsx:135  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsAdGroupsContent/GoogleAdsAdGroupsContent.tsx:155  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsAdGroupsContent/GoogleAdsAdGroupsContent.tsx:189  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsKeywordCriteria/GoogleAdsKeywordCriteria.tsx:143  primary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsKeywordCriteria/GoogleAdsKeywordCriteria.tsx:150  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsKeywordCriteria/GoogleAdsKeywordCriteria.tsx:177  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsKeywordCriteria/GoogleAdsKeywordCriteria.tsx:225  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsKeywordCriteria/GoogleAdsKeywordCriterionForm/GoogleAdsKeywordCriterionForm.tsx:102  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsKeywordCriteria/GoogleAdsKeywordSummary/GoogleAdsKeywordSummary.tsx:391  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsKeywordCriteria/GoogleAdsKeywordSummary/GoogleAdsKeywordSummary.tsx:397  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsKeywordCriteria/GoogleAdsKeywordSummary/GoogleAdsKeywordSummary.tsx:414  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsKeywordCriteria/GoogleAdsKeywordSummary/GoogleAdsKeywordSummary.tsx:450  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsKeywordCriteria/GoogleAdsKeywordSummary/GoogleAdsKeywordSummary.tsx:456  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsKeywordCriteria/GoogleAdsKeywordSummary/GoogleAdsKeywordSummary.tsx:473  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsKeywordCriteria/GoogleAdsKeywordSummary/GoogleAdsKeywordSummary.tsx:514  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsKeywordCriteria/GoogleAdsKeywordSummary/GoogleAdsKeywordSummary.tsx:536  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdEditPanel/GoogleAdsResponsiveSearchAdEditPanel.tsx:91  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdEditPanel/GoogleAdsResponsiveSearchAdEditPanel.tsx:162  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdEditPanel/GoogleAdsResponsiveSearchAdEditPanel.tsx:178  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdEditor/GoogleAdsResponsiveSearchAdEditor.tsx:386  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdEditor/GoogleAdsResponsiveSearchAdEditor.tsx:400  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdEditor/GoogleAdsResponsiveSearchAdEditor.tsx:478  primary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdEditor/GoogleAdsResponsiveSearchAdEditor.tsx:486  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdForm/GoogleAdsResponsiveSearchAdForm.tsx:224  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdSummary/GoogleAdsResponsiveSearchAdSummary.tsx:364  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdSummary/GoogleAdsResponsiveSearchAdSummary.tsx:370  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdSummary/GoogleAdsResponsiveSearchAdSummary.tsx:408  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdSummary/GoogleAdsResponsiveSearchAdSummary.tsx:432  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdSummary/GoogleAdsResponsiveSearchAdSummary.tsx:449  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdsContent/GoogleAdsResponsiveSearchAdsContent.tsx:266  primary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdsContent/GoogleAdsResponsiveSearchAdsContent.tsx:272  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdsContent/GoogleAdsResponsiveSearchAdsContent.tsx:298  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsAdGroups/GoogleAdsResponsiveSearchAds/GoogleAdsResponsiveSearchAdsContent/GoogleAdsResponsiveSearchAdsContent.tsx:348  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetAmountEditor.tsx:87  primary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetAmountEditor.tsx:90  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetConsumers.tsx:61  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetConsumers.tsx:79  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetConsumers.tsx:122  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetsPanelView.tsx:75  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetsPanelView.tsx:84  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetsPanelView.tsx:109  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetsPanelView.tsx:127  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetsPanelView.tsx:139  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetsPanelView.tsx:158  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetsPanelView.tsx:169  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetsPanelView.tsx:249  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetsPanelView.tsx:308  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetsPanelView.tsx:326  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsBudgetsPanel/GoogleAdsBudgetsPanelView.tsx:366  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsCampaignDetailPage/GoogleAdsCampaignDetailPage.tsx:59  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsCampaignDetailPage/GoogleAdsCampaignDetailPage.tsx:70  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsCampaignManagementPage/GoogleAdsCampaignManagementPage.tsx:110  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsCampaignSettingsPanel/GoogleAdsCampaignSettingsPanel.tsx:233  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsCampaignSettingsPanel/GoogleAdsCampaignSettingsPanel.tsx:279  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsCampaignSummary/GoogleAdsCampaignSummary.tsx:405  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsCampaignSummary/GoogleAdsCampaignSummary.tsx:421  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsCampaignSummary/GoogleAdsCampaignSummary.tsx:469  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsCampaignSummary/GoogleAdsCampaignSummary.tsx:494  secondary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsCampaignsList/GoogleAdsCampaignsList.tsx:74  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsCampaignsProjectPage.tsx:126  primary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsCampaignsProjectPage.tsx:138  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsCampaignsProjectPage.tsx:156  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsCampaignsProjectPage.tsx:165  primary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsCampaignsProjectPage.tsx:231  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignNegativeKeywords/GoogleAdsCampaignNegativeKeywordForm/GoogleAdsCampaignNegativeKeywordForm.tsx:160  primary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignNegativeKeywords/GoogleAdsCampaignNegativeKeywordForm/GoogleAdsCampaignNegativeKeywordForm.tsx:169  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignNegativeKeywords/GoogleAdsCampaignNegativeKeywordForm/GoogleAdsCampaignNegativeKeywordForm.tsx:174  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignNegativeKeywords/GoogleAdsCampaignNegativeKeywordForm/GoogleAdsCampaignNegativeKeywordForm.tsx:178  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignNegativeKeywords/GoogleAdsCampaignNegativeKeywordSummary/GoogleAdsCampaignNegativeKeywordSummary.tsx:107  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignNegativeKeywords/GoogleAdsCampaignNegativeKeywordSummary/GoogleAdsCampaignNegativeKeywordSummary.tsx:118  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignNegativeKeywords/GoogleAdsCampaignNegativeKeywordSummary/GoogleAdsCampaignNegativeKeywordSummary.tsx:128  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignNegativeKeywords/GoogleAdsCampaignNegativeKeywordSummary/GoogleAdsCampaignNegativeKeywordSummary.tsx:138  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignNegativeKeywords/GoogleAdsCampaignNegativeKeywordSummary/GoogleAdsCampaignNegativeKeywordSummary.tsx:145  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignNegativeKeywords/GoogleAdsCampaignNegativeKeywords.tsx:232  primary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignNegativeKeywords/GoogleAdsCampaignNegativeKeywords.tsx:278  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignNegativeKeywords/GoogleAdsCampaignNegativeKeywords.tsx:322  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignTargetForm/GoogleAdsCampaignTargetForm.tsx:308  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignTargetForm/GoogleAdsCampaignTargetForm.tsx:338  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignTargetForm/GoogleAdsCampaignTargetForm.tsx:499  primary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignTargetForm/GoogleAdsCampaignTargetForm.tsx:509  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignTargetForm/GoogleAdsCampaignTargetForm.tsx:514  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignTargetForm/GoogleAdsCampaignTargetForm.tsx:518  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignTargetSummary/GoogleAdsCampaignTargetSummary.tsx:174  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignTargetSummary/GoogleAdsCampaignTargetSummary.tsx:185  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignTargetSummary/GoogleAdsCampaignTargetSummary.tsx:195  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignTargetSummary/GoogleAdsCampaignTargetSummary.tsx:205  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignTargetSummary/GoogleAdsCampaignTargetSummary.tsx:212  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignTargeting.tsx:239  primary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignTargeting.tsx:290  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsCampaignTargeting/GoogleAdsCampaignTargeting.tsx:342  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsGeoTargetPicker/GoogleAdsGeoTargetPicker.tsx:93  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsGeography/GoogleAdsGeoTargetPicker/GoogleAdsGeoTargetPicker.tsx:149  secondary: (default) -> extraLarge
  components/ads/GoogleAdsCampaignsPage/GoogleAdsNavigationLayout/_GoogleAdsNavigationLayout.stories.tsx:26  primary: small -> medium
  components/ads/GoogleAdsCampaignsPage/GoogleAdsNavigationLayout/_GoogleAdsNavigationLayout.stories.tsx:33  primary: small -> medium
  components/ads/GoogleAdsConversionsPanel/GoogleAdsConversionCreateForm/GoogleAdsConversionCreateForm.tsx:225  secondary: (default) -> extraLarge
  components/ads/GoogleAdsConversionsPanel/GoogleAdsConversionCreateForm/GoogleAdsConversionCreateForm.tsx:235  primary: (default) -> extraLarge
  components/ads/GoogleAdsConversionsPanel/GoogleAdsConversionsPanel.tsx:58  secondary: (default) -> extraLarge
  components/ads/GoogleAdsConversionsPanel/GoogleAdsConversionsPanel.tsx:132  secondary: (default) -> extraLarge
  components/ads/GoogleAdsConversionsPanel/GoogleAdsConversionsPanel.tsx:177  primary: (default) -> extraLarge
  components/ads/GoogleAdsConversionsPanel/GoogleAdsConversionsPanel.tsx:181  secondary: (default) -> extraLarge
  components/ads/GoogleAdsConversionsPanel/GoogleAdsConversionsPanel.tsx:185  secondary: (default) -> extraLarge
  components/ads/GoogleAdsConversionsPanel/GoogleAdsConversionsPanel.tsx:222  secondary: (default) -> extraLarge
  components/ads/GoogleAdsConversionsPanel/GoogleAdsConversionsPanel.tsx:248  secondary: (default) -> extraLarge
  components/ads/GoogleAdsConversionsPanel/GoogleAdsConversionsPanel.tsx:269  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssetSetsPanel/GoogleAdsLocationAssetSetMembersView/GoogleAdsLocationAssetSetMembersView.tsx:37  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssetSetsPanel/GoogleAdsLocationAssetSetMembersView/GoogleAdsLocationAssetSetMembersView.tsx:58  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssetSetsPanel/GoogleAdsLocationAssetSetMembersView/GoogleAdsLocationAssetSetMembersView.tsx:97  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssetSetsPanel/GoogleAdsLocationAssetSetsPanelView/GoogleAdsLocationAssetSetsPanelView.tsx:95  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssetSetsPanel/GoogleAdsLocationAssetSetsPanelView/GoogleAdsLocationAssetSetsPanelView.tsx:104  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssetSetsPanel/GoogleAdsLocationAssetSetsPanelView/GoogleAdsLocationAssetSetsPanelView.tsx:113  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssetSetsPanel/GoogleAdsLocationAssetSetsPanelView/GoogleAdsLocationAssetSetsPanelView.tsx:122  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssetSetsPanel/GoogleAdsLocationAssetSetsPanelView/GoogleAdsLocationAssetSetsPanelView.tsx:205  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssetSetsPanel/GoogleAdsLocationAssetSetsPanelView/GoogleAdsLocationAssetSetsPanelView.tsx:224  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssetSetsPanel/GoogleAdsLocationAssetSetsPanelView/GoogleAdsLocationAssetSetsPanelView.tsx:249  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssetsPanel/GoogleAdsLocationAssetsPanelView/GoogleAdsLocationAssetsPanelView.tsx:45  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssetsPanel/GoogleAdsLocationAssetsPanelView/GoogleAdsLocationAssetsPanelView.tsx:54  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssetsPanel/GoogleAdsLocationAssetsPanelView/GoogleAdsLocationAssetsPanelView.tsx:127  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssetsPanel/GoogleAdsLocationAssetsPanelView/GoogleAdsLocationAssetsPanelView.tsx:144  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssetsPanel/GoogleAdsLocationAssetsPanelView/GoogleAdsLocationAssetsPanelView.tsx:213  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssociationsPanel/GoogleAdsLocationAssociationsPanelView/GoogleAdsLocationAssociationsPanelView.tsx:85  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssociationsPanel/GoogleAdsLocationAssociationsPanelView/GoogleAdsLocationAssociationsPanelView.tsx:94  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssociationsPanel/GoogleAdsLocationAssociationsPanelView/GoogleAdsLocationAssociationsPanelView.tsx:144  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssociationsPanel/GoogleAdsLocationAssociationsPanelView/GoogleAdsLocationAssociationsPanelView.tsx:161  secondary: (default) -> extraLarge
  components/ads/GoogleAdsLocationAssociationsPanel/GoogleAdsLocationAssociationsPanelView/GoogleAdsLocationAssociationsPanelView.tsx:180  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPerformancePage/GoogleAdsBiddingStrategyReport/GoogleAdsBiddingStrategyReport.tsx:89  secondary: small -> medium
  components/ads/GoogleAdsPerformancePage/GoogleAdsBiddingStrategyReport/GoogleAdsBiddingStrategyReport.tsx:106  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPerformancePage/GoogleAdsPerformanceDateRange/_GoogleAdsPerformanceDateRange.stories.tsx:58  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPerformancePage/GoogleAdsPerformanceReport/GoogleAdsCustomerSelectedMetrics/GoogleAdsCustomerSelectedMetrics.tsx:82  secondary: small -> medium
  components/ads/GoogleAdsPerformancePage/GoogleAdsPerformanceReport/GoogleAdsCustomerSelectedMetrics/GoogleAdsCustomerSelectedMetrics.tsx:99  secondary: small -> medium
  components/ads/GoogleAdsPerformancePage/GoogleAdsPerformanceReport/GoogleAdsCustomerSelectedMetrics/GoogleAdsCustomerSelectedMetrics.tsx:108  secondary: small -> medium
  components/ads/GoogleAdsPerformancePage/GoogleAdsPerformanceReport/GoogleAdsPerformanceReport.tsx:406  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPerformancePage/GoogleAdsPerformanceReport/GoogleAdsPerformanceReport.tsx:513  secondary: small -> medium
  components/ads/GoogleAdsPerformancePage/GoogleAdsPerformanceReport/GoogleAdsPerformanceReport.tsx:530  secondary: small -> medium
  components/ads/GoogleAdsPerformancePage/GoogleAdsPerformanceReport/GoogleAdsPerformanceReport.tsx:539  secondary: small -> medium
  components/ads/GoogleAdsPerformancePage/GoogleAdsPerformanceReport/GoogleAdsPerformanceReport.tsx:563  secondary: small -> medium
  components/ads/GoogleAdsPerformancePage/GoogleAdsPerformanceReport/GoogleAdsPerformanceReport.tsx:567  secondary: small -> medium
  components/ads/GoogleAdsPerformancePage/GoogleAdsSelectedMetrics/GoogleAdsMetricColumnsSelector/GoogleAdsMetricColumnsSelector.tsx:90  secondary: small -> medium
  components/ads/GoogleAdsPerformancePage/GoogleAdsSelectedMetrics/GoogleAdsSelectedMetricsTable/GoogleAdsSelectedMetricsTable.tsx:63  secondary: small -> medium
  components/ads/GoogleAdsPmaxCampaignDetail/GoogleAdsAssetGroupNameEditor.tsx:160  primary: (default) -> extraLarge
  components/ads/GoogleAdsPmaxCampaignDetail/GoogleAdsAssetGroupNameEditor.tsx:164  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPmaxCampaignDetail/GoogleAdsPmaxCampaignDetail.tsx:242  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPmaxCampaignDetail/GoogleAdsPmaxCampaignDetail.tsx:305  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPmaxCampaignDetail/GoogleAdsPmaxSettingsEditor.tsx:413  primary: (default) -> extraLarge
  components/ads/GoogleAdsPmaxCampaignDetail/GoogleAdsPmaxSettingsEditor.tsx:421  default: (default) -> extraLarge
  components/ads/GoogleAdsPmaxCampaignDetail/GoogleAdsPmaxSettingsEditor.tsx:432  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:146  default: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:159  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:162  primary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:184  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:193  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:203  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:221  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:225  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:240  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:260  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:265  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:300  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:346  default: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:362  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:387  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioBiddingStrategiesPage.tsx:391  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioStrategyCreateModal/GoogleAdsPortfolioStrategyCreateModal.tsx:375  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioStrategyCreateModal/GoogleAdsPortfolioStrategyCreateModal.tsx:473  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioStrategyCreateModal/_GoogleAdsPortfolioStrategyCreateModal.stories.tsx:15  primary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioStrategyEditModal/GoogleAdsPortfolioStrategyEditModal.tsx:418  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioStrategyEditModal/GoogleAdsPortfolioStrategyEditModal.tsx:430  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioStrategyEditModal/GoogleAdsPortfolioStrategyEditModal.tsx:551  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioStrategyEditModal/GoogleAdsPortfolioStrategyEditModal.tsx:605  secondary: (default) -> extraLarge
  components/ads/GoogleAdsPortfolioBiddingStrategiesPage/GoogleAdsPortfolioStrategyEditModal/_GoogleAdsPortfolioStrategyEditModal.stories.tsx:72  primary: (default) -> extraLarge
  components/agent/Agent/AgentChatAdminSettingsModal/_AgentChatAdminSettingsModal.stories.tsx:62  primary: (default) -> extraLarge
  components/agent/Agent/AgentChatAdminSettingsModal/_AgentChatAdminSettingsModal.stories.tsx:69  primary: (default) -> extraLarge
  components/agent/Agent/AgentSettingsModal/_AgentSettingsModal.stories.tsx:64  primary: (default) -> extraLarge
  components/agent/Agent/AgentSettingsModal/_AgentSettingsModal.stories.tsx:76  primary: (default) -> extraLarge
  components/agent/AgentHistoryDrawer/_AgentHistoryDrawer.stories.tsx:40  primary: (default) -> extraLarge
  components/agent/AgentIncentiveBanner/AgentIncentiveBanner.tsx:98  secondary: medium -> extraLarge
  components/ai-conversations/conversation/ConversationErrorCard/ConversationErrorCard.tsx:115  shimmer: (default) -> extraLarge
  components/ai-conversations/conversation/ConversationErrorCard/ConversationErrorCard.tsx:120  shimmer: (default) -> extraLarge
  components/ai-conversations/widgets/_shared/CompleteProfilePhotoUploader/CompleteProfilePhotoUploader.tsx:166  shimmer: medium -> extraLarge
  components/ai-conversations/widgets/ai/MultiChoiceConversationWidget/MultiChoiceConversationWidget.tsx:162  shimmer: (default) -> extraLarge
  components/ai-conversations/widgets/mobile/MobileAppInviteConversationWidget/MobileAppInviteSheet/MobileAppInviteSheet.tsx:118  primary: large -> extraLarge
  components/ai-conversations/widgets/mobile/MobileAppInviteConversationWidget/MobileAppInviteSheet/MobileAppInviteSheet.tsx:128  primary: large -> extraLarge
  components/ai-conversations/widgets/presence/competitors/CompetitorSelectionConversationWidget/local/search/CompetitorSelectionSearch.tsx:152  primary: (default) -> extraLarge
  components/ai-conversations/widgets/presence/competitors/CompetitorSelectionConversationWidget/local/toast/CompetitorSelectionToast.tsx:106  primary: medium -> extraLarge
  components/ai-conversations/widgets/presence/competitors/ProposalSelectionConversationWidget/ProposalSelectionConversationWidget.tsx:224  shimmer: (default) -> extraLarge
  components/ai-conversations/widgets/presence/engagement/CampaignSeriesConversationWidget/ManagedCampaignSeriesWidget/ManagedCampaignSeriesWidget.tsx:332  shimmer: (default) -> extraLarge
  components/ai-conversations/widgets/presence/engagement/CampaignSeriesConversationWidget/ManagedCampaignSeriesWidget/ManagedCampaignSeriesWidget.tsx:340  shimmer: (default) -> extraLarge
  components/ai-conversations/widgets/presence/engagement/ImageGalleryConversationWidget/shared/GallerySelectionControls.tsx:46  default: (default) -> extraLarge
  components/ai-conversations/widgets/presence/engagement/ImageGalleryConversationWidget/shared/GallerySelectionControls.tsx:50  shimmer: (default) -> extraLarge
  components/ai-conversations/widgets/presence/profile/OpeningHoursEditorConversationWidget/OpeningHoursEditorConversationWidget.tsx:227  shimmer: (default) -> extraLarge
  components/ai-conversations/widgets/presence/profile/ProfileAttributeGroupConversationWidget/ProfileAttributeGroupConversationWidget.tsx:237  shimmer: (default) -> extraLarge
  components/ai-conversations/widgets/setup/AddressInputConversationWidget/AddressInputConversationWidget.tsx:300  shimmer: (default) -> extraLarge
  components/ai-conversations/widgets/setup/BusinessBasicsInputConversationWidget/BusinessBasicsInputConversationWidget.tsx:381  shimmer: (default) -> extraLarge
  components/ai-extensions/AIExtensionsLandingPage/AIExtensionsLandingPage.tsx:48  primary: (default) -> extraLarge
  components/ai-extensions/AIExtensionsLandingPage/AIExtensionsLandingPage.tsx:142  default: (default) -> extraLarge
  components/ai-extensions/AIExtensionsLandingPage/AIExtensionsLandingPage.tsx:200  primary: (default) -> extraLarge
  components/ai-extensions/AIExtensionsLandingPage/AIExtensionsLandingPage.tsx:221  default: (default) -> extraLarge
  components/ai-fte/AiFteAudit/AiFteAudit.tsx:196  primary: (default) -> extraLarge
  components/ai-fte/AiFteAudit/AiFteAudit.tsx:225  primary: (default) -> extraLarge
  components/ai-fte/AiFteLoading/AiFteLoading.tsx:115  primary: (default) -> extraLarge
  components/ai-fte/AiFtePrioritySection/AiFtePrioritySection.tsx:71  primary: (default) -> extraLarge
  components/ai-visibility/AiVisibilityCustomQueries/AiVisibilityCustomQueries.tsx:97  default: (default) -> extraLarge
  components/ai-visibility/AiVisibilityCustomQueries/AiVisibilityCustomQueries.tsx:125  default: (default) -> extraLarge
  components/ai-visibility/AiVisibilityCustomQueries/AiVisibilityCustomQueriesDrawer/AiVisibilityCustomQueriesDrawer.tsx:164  default: (default) -> extraLarge
  components/ai-visibility/AiVisibilityCustomQueries/AiVisibilityCustomQueriesDrawer/AiVisibilityCustomQueriesDrawer.tsx:230  primary: (default) -> extraLarge
  components/ai-visibility/AiVisibilityCustomQueries/AiVisibilityCustomQueriesEmpty/AiVisibilityCustomQueriesEmpty.tsx:31  default: small -> medium
  components/ai-visibility/AiVisibilityCustomQueries/AiVisibilityCustomQueryAddDrawer/AiVisibilityCustomQueryAddDrawer.tsx:103  default: (default) -> extraLarge
  components/ai-visibility/AiVisibilityCustomQueries/AiVisibilityCustomQueryAddDrawer/AiVisibilityCustomQueryAddDrawer.tsx:106  primary: (default) -> extraLarge
  components/ai-visibility/AiVisibilityCustomQueries/AiVisibilityCustomQueryDeleteConfirmationCard/AiVisibilityCustomQueryDeleteConfirmationCard.tsx:35  default: small -> medium
  components/ai-visibility/AiVisibilityCustomQueries/AiVisibilityCustomQueryDeleteConfirmationCard/AiVisibilityCustomQueryDeleteConfirmationCard.tsx:38  primary: small -> medium
  components/ai-visibility/AiVisibilityCustomQueries/AiVisibilityCustomQueryEditDrawer/AiVisibilityCustomQueryEditDrawer.tsx:196  default: (default) -> extraLarge
  components/ai-visibility/AiVisibilityCustomQueries/AiVisibilityCustomQueryEditDrawer/AiVisibilityCustomQueryEditDrawer.tsx:199  primary: (default) -> extraLarge
  components/ai-visibility/AiVisibilityOverview/AiVisibilityUpsellTrigger/AiVisibilityUpsellTrigger.tsx:49  secondary: medium -> extraLarge
  components/dev/EditorBridgeDevPage/EditorBridgeDevEnvironment.tsx:174  secondary: small -> medium
  components/dev/EditorBridgeDevPage/EditorBridgeDevEnvironment.tsx:262  secondary: small -> medium
  components/dev/EditorBridgeDevPage/EditorBridgeDevPage.tsx:44  primary: (default) -> extraLarge
  components/domainless/AddDomainTriggerADS/AddDomainTriggerADS.tsx:53  primary: medium -> extraLarge
  components/domainless/AddDomainTriggerOptimiser/AddDomainTriggerOptimiser.tsx:31  primary: (default) -> extraLarge
  components/domainless/AddDomainTriggerPresenceRankings/AddDomainTriggerPresenceRankings.tsx:51  secondary: small -> medium
  components/domainless/AddDomainTriggerSearchEngine/AddDomainTriggerSearchEngine.tsx:34  primary: (default) -> extraLarge
  components/domainless/AddDomainTriggerSearchEngineReports/AddDomainTriggerSearchEngineReports.tsx:23  primary: (default) -> extraLarge
  components/domainless/AddDomainTriggerSearchEngineTasks/AddDomainTriggerSearchEngineTasks.tsx:32  primary: (default) -> extraLarge
  components/domainless/AddDomainTriggerWebAnalytics/AddDomainTriggerWebAnalytics.tsx:30  primary: (default) -> extraLarge
  components/engagement/EngagementBoosts/BoostOverview/BoostOverviewDetails/BoostOverviewDetails.tsx:131  default: small -> medium
  components/engagement/EngagementBoosts/CreateBoostSetup/ActionAndPlacement/BoostGreetingAndFAQ/BoostQuestion/BoostQuestion.tsx:30  default: small -> medium
  components/engagement/EngagementBoosts/CreateBoostSetup/PostsToBoost/PostsToBoost.tsx:148  primary: (default) -> extraLarge
  components/engagement/EngagementBoosts/EngagementBoostsEmptyState/EngagementBoostsEmptyState.tsx:100  primary: (default) -> extraLarge
  components/engagement/EngagementBoosts/EngagementBoostsHeader/EngagementBoostsHeader.tsx:39  primary: (default) -> extraLarge
  components/engagement/EngagementBoosts/EngagementBoostsUpsellingTrigger/EngagementBoostsUpsellingTrigger.tsx:46  primary: (default) -> extraLarge
  components/engagement/EngagementChat/EngagementChatBody/EngagementChatMessagesList/EngagementChatMessagesList.tsx:28  secondary: small -> medium
  components/engagement/EngagementChat/EngagementChatBody/EngagementChatMessagesList/EngagementChatMessagesListInput/EngagementChatMessagesListInput.tsx:13  primary: (default) -> extraLarge
  components/engagement/EngagementDashboard/CreatePostSetup/CreatePostForm/CreatePostFormInput/CreatePostFormInputActions/CreatePostFormInputActions.tsx:57  secondary: (default) -> extraLarge
  components/engagement/EngagementDashboard/CreatePostSetup/CreatePostForm/CreatePostFormPhotos/CreatePostFormPhotos.tsx:184  secondary: (default) -> extraLarge
  components/engagement/EngagementDashboard/CreatePostSetup/_EditPostOverAdoAgentModal.stories.tsx:137  primary: (default) -> extraLarge
  components/engagement/EngagementInsights/EngagementInsightsDisconnected/EngagementInsightsDisconnected.tsx:57  primary: (default) -> extraLarge
  components/engagement/EngagementInsights/EngagementMetaInsights/EngagementInsightsMissingPermissions/EngagementInsightsMissingPermissions.tsx:58  primary: (default) -> extraLarge
  components/engagement/EngagementLinkPerformance/EngagementLinkPerformance.tsx:58  primary: (default) -> extraLarge
  components/engagement/EngagementPlanner/EngagementPlanner.tsx:128  primary: (default) -> extraLarge
  components/engagement/EngagementPlanner/EngagementPlanner.tsx:162  secondary: (default) -> extraLarge
  components/engagement/EngagementPlanner/EngagementPlannerCalendar/EngagementPlannerCalendarCreateEventPopover/EngagementPlannerCalendarCreateEventPopover.tsx:118  secondary: small -> medium
  components/engagement/EngagementPlanner/EngagementPlannerCalendar/EngagementPlannerCalendarCreateEventPopover/EngagementPlannerCalendarCreateEventPopover.tsx:128  secondary: small -> medium
  components/engagement/EngagementPlanner/EngagementPlannerCalendar/EngagementPlannerCalendarDraftsModal/EngagementPlannerCalendarDraftsModal.tsx:77  secondary: (default) -> extraLarge
  components/engagement/EngagementPlanner/EngagementPlannerCalendar/EngagementPlannerCalendarHeader/EngagementPlannerCalendarHeader.tsx:35  primary: (default) -> extraLarge
  components/engagement/EngagementPlanner/EngagementPlannerCalendar/EngagementPlannerCalendarHeader/EngagementPlannerCalendarHeader.tsx:42  primary: (default) -> extraLarge
  components/engagement/EngagementPlanner/EngagementPlannerCalendar/EngagementPlannerCalendarHeader/EngagementPlannerCalendarHeader.tsx:51  primary: (default) -> extraLarge
  components/engagement/EngagementPlanner/EngagementPlannerScheduleStepper/_stories/_EngagementPlannerScheduleStepper.stories.tsx:124  primary: (default) -> extraLarge
  components/engagement/EngagementPlanner/EngagementPlannerScheduleStepper/_stories/_EngagementPlannerScheduleStepper.stories.tsx:152  primary: (default) -> extraLarge
  components/engagement/EngagementPlanner/EngagementPlannerScheduleStepper/_stories/_EngagementPlannerScheduleStepper.stories.tsx:180  primary: (default) -> extraLarge
  components/engagement/EngagementPosts/EngagementPostsList/EngagementPostsList.tsx:255  default: small -> medium
  components/engagement/_common/BoostPreview/BoostPreview.tsx:90  default: (default) -> extraLarge
  components/engagement/_common/BoostPreview/BoostPreview.tsx:109  default: (default) -> extraLarge
  components/engagement/_common/EventsPreview/EventsPreviewGoogle/EventsPreviewGoogle.tsx:126  primary: (default) -> extraLarge
  components/engagement/_common/EventsPreview/EventsPreviewGoogle/EventsPreviewGoogle.tsx:194  primary: (default) -> extraLarge
  components/engagement/_common/GenerateImagesWithAiTrigger/GenerateImageWithAiModal/AIImageGenerationResults/AIImageGenerationResults.tsx:124  primary: (default) -> extraLarge
  components/engagement/_common/GenerateImagesWithAiTrigger/GenerateImageWithAiModal/AIImagePromptForm/AIImagePromptForm.tsx:122  primary: (default) -> extraLarge
  components/engagement/_common/GenerateImagesWithAiTrigger/GenerateImagesWithAiTrigger.tsx:67  shimmer: (default) -> extraLarge
  components/engagement/_common/UnsplashImagesLibraryTrigger/ImagesLibraryModal/ImagesLibraryModalHeader/ImagesLibraryModalHeader.tsx:115  primary: medium -> extraLarge
  components/ga/GAOverview/AccountOverview/AccountOverviewDetails/AccountOverviewDetailsActiveAds/AccountOverviewDetailsActiveAds.tsx:132  primary: (default) -> extraLarge
  components/ga/GAOverview/AccountOverview/AdGroupOverviewHeader/AdGroupOverviewHeader.tsx:68  default: (default) -> extraLarge
  components/ga/GAOverview/AccountOverview/AdsIDVerification/AdsIDVerification.tsx:120  primary: (default) -> extraLarge
  components/ga/GAOverview/AccountOverview/AdsIDVerification/AdsIDVerificationForm/IDVerificationFormBI/IDVerificationFormBIDocument/IDVerificationFormBIDocument.tsx:78  secondary: (default) -> extraLarge
  components/ga/GAOverview/AccountOverview/AdsIDVerification/AdsIDVerificationForm/IDVerificationFormBI/IDVerificationFormBIDocument/IDVerificationFormBIDocument.tsx:102  default: small -> medium
  components/ga/GAOverview/GANewCampaign/GANewCampaign.tsx:98  primary: medium -> extraLarge
  components/ga/GAOverview/GASetup/AdDescriptions/AdDescription/AdDescription.tsx:92  default: small -> medium
  components/ga/GAOverview/GASetup/AdDescriptions/AdDescriptions.tsx:226  default: (default) -> extraLarge
  components/ga/GAOverview/GASetup/AdHeadlines/AdHeadline/AdHeadline.tsx:94  default: small -> medium
  components/ga/GAOverview/GASetup/AdHeadlines/AdHeadlines.tsx:245  default: (default) -> extraLarge
  components/ga/GAOverview/GASetup/AdPackages/FAQs/SuspensionFAQs/SuspensionFAQs.tsx:82  secondary: (default) -> extraLarge
  components/ga/GAOverview/GASetup/AdPackages/FAQs/SuspensionFAQs/SuspensionFAQs.tsx:94  secondary: (default) -> extraLarge
  components/ga/GAOverview/GASetup/AdPackages/Suspension/Suspension.tsx:21  secondary: (default) -> extraLarge
  components/ga/GAOverview/GASetup/AdVersions/AdVersions.tsx:34  default: (default) -> extraLarge
  components/ga/GAOverview/GASetup/CompleteGACampaignModal/CompleteGaCampaignModalCampaignPreview/CompleteGaCampaignModalCampaignPreview.tsx:443  default: (default) -> extraLarge
  components/ga/GAOverview/GASetup/CompleteGACampaignModal/CompleteGaCampaignModalCampaignPreview/CompleteGaCampaignModalCampaignPreview.tsx:452  primary: (default) -> extraLarge
  components/ga/GAOverview/GASetup/CompleteGACampaignModal/CompleteGaCampaignModalCampaignPreview/CompleteGaCampaignModalCampaignPreview.tsx:468  default: (default) -> extraLarge
  components/ga/GAOverview/GASetup/CompleteGACampaignModal/CompleteGaCampaignModalCampaignPreview/CompleteGaCampaignModalCampaignPreview.tsx:477  primary: (default) -> extraLarge
  components/ga/_common/AdPackage/AdPackage.tsx:61  primary: small -> medium
  components/ga/_common/AssetsCard/EmptyAssetsCard/EmptyAssetsCard.tsx:35  secondary: small -> medium
  components/ga/_common/KeywordsTable/KeywordsTableHeader/KeywordsTableHeader.tsx:130  secondary: small -> medium
  components/ga/_common/KeywordsTable/KeywordsTableItem/EditMode/EditMode.tsx:139  primary: (default) -> extraLarge
  components/ga/_common/KeywordsTable/KeywordsTableItem/EditMode/EditMode.tsx:149  default: (default) -> extraLarge
  components/ga/_common/KeywordsTable/KeywordsTableItem/EditModeMobile/EditModeMobile.tsx:176  primary: (default) -> extraLarge
  components/ga/_common/ManageAssetsModal/ManageAsset/ManageAsset.tsx:107  secondary: (default) -> extraLarge
  components/ga/_common/StatusInfo/ReviewStatusNotice/ReviewStatusNotice.tsx:160  primary: (default) -> extraLarge
  components/ga/_common/StatusInfo/StatusInfo.tsx:161  secondary: (default) -> extraLarge
  components/location/Address/EditAddressDrawer/EditAddressDrawer.tsx:116  primary: (default) -> extraLarge
  components/location/Address/EditAddressDrawer/EditAddressDrawer.tsx:126  default: (default) -> extraLarge
  components/location/Categories/EditCategories/EditCategoriesBody.tsx:225  default: small -> medium
  components/location/ContactPerson/EditContactPersonForm/EditContactPersonForm.tsx:128  primary: (default) -> extraLarge
  components/location/ContactPerson/EditContactPersonForm/EditContactPersonForm.tsx:136  default: (default) -> extraLarge
  components/location/Description/EditDescriptionForm/EditDescriptionForm.tsx:93  primary: (default) -> extraLarge
  components/location/Description/EditDescriptionForm/EditDescriptionForm.tsx:103  default: (default) -> extraLarge
  components/location/Details/EditDetailsForm/EditDetailsForm.tsx:93  primary: (default) -> extraLarge
  components/location/Details/EditDetailsForm/EditDetailsForm.tsx:103  default: (default) -> extraLarge
  components/location/OpeningTimes/EditOpeningTimes/EditOpeningTimesDay/EditOpeningTimesDay.tsx:98  default: (default) -> extraLarge
  components/location/OpeningTimes/EditOpeningTimes/EditOpeningTimesDay/EditOpeningTimesDay.tsx:115  default: (default) -> extraLarge
  components/location/PhoneNumbers/EditPhoneNumbersForm/EditPhoneNumbersForm.tsx:127  default: (default) -> extraLarge
  components/location/PhoneNumbers/EditPhoneNumbersForm/EditPhoneNumbersForm.tsx:147  default: (default) -> extraLarge
  components/location/PhoneNumbers/EditPhoneNumbersForm/EditPhoneNumbersForm.tsx:167  default: (default) -> extraLarge
  components/location/PhoneNumbers/EditPhoneNumbersForm/EditPhoneNumbersForm.tsx:180  default: (default) -> extraLarge
  components/location/PhoneNumbers/EditPhoneNumbersForm/EditPhoneNumbersForm.tsx:191  default: (default) -> extraLarge
  components/location/PhoneNumbers/EditPhoneNumbersForm/EditPhoneNumbersForm.tsx:202  default: (default) -> extraLarge
  components/location/PhoneNumbers/EditPhoneNumbersForm/EditPhoneNumbersForm.tsx:233  default: (default) -> extraLarge
  components/location/PhoneNumbers/EditPhoneNumbersForm/EditPhoneNumbersForm.tsx:248  default: (default) -> extraLarge
  components/location/PhoneNumbers/EditPhoneNumbersForm/EditPhoneNumbersForm.tsx:262  default: (default) -> extraLarge
  components/location/PhoneNumbers/EditPhoneNumbersForm/EditPhoneNumbersForm.tsx:273  default: (default) -> extraLarge
  components/location/PhoneNumbers/EditPhoneNumbersForm/EditPhoneNumbersForm.tsx:289  primary: (default) -> extraLarge
  components/location/PhoneNumbers/EditPhoneNumbersForm/EditPhoneNumbersForm.tsx:298  default: (default) -> extraLarge
  components/location/ServiceAreas/EditServiceAreasForm/EditServiceAreasForm.tsx:292  primary: (default) -> extraLarge
  components/location/ServiceAreas/EditServiceAreasForm/EditServiceAreasForm.tsx:301  default: (default) -> extraLarge
  components/location/SocialMediaLinks/EditSocialMediaLinksForm/EditSocialMediaLinksForm.tsx:273  default: (default) -> extraLarge
  components/location/SocialMediaLinks/EditSocialMediaLinksForm/EditSocialMediaLinksForm.tsx:288  default: (default) -> extraLarge
  components/location/SocialMediaLinks/EditSocialMediaLinksForm/EditSocialMediaLinksForm.tsx:296  primary: (default) -> extraLarge
  components/location/SocialMediaLinks/EditSocialMediaLinksForm/EditSocialMediaLinksForm.tsx:305  default: (default) -> extraLarge
  components/location/Website/EditWebsiteForm/EditWebsiteForm.tsx:180  primary: (default) -> extraLarge
  components/location/Website/EditWebsiteForm/EditWebsiteForm.tsx:188  default: (default) -> extraLarge
  components/location/Website/Website.tsx:130  secondary: (default) -> extraLarge
  components/location/Website/Website.tsx:157  default: small -> medium
  components/main/MainDashboard/MainDashboardTabs/AdsTab/CreateFirstAd/CreateFirstAd.tsx:98  primary: (default) -> extraLarge
  components/main/MainDashboard/MainDashboardTabs/EngagementTab/BoostsOverview/AddFirstBoost/AddFirstBoost.tsx:38  secondary: (default) -> extraLarge
  components/main/MainDashboard/MainDashboardTabs/EngagementTab/BoostsOverview/BoostsOverview.tsx:178  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/EngagementTab/EngagementOverview/AddFirstPost/AddFirstPost.tsx:47  primary: (default) -> extraLarge
  components/main/MainDashboard/MainDashboardTabs/EngagementTab/EngagementOverview/EngagementOverview.tsx:140  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/EngagementTab/EngagementOverview/EngagementOverview.tsx:166  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/EngagementTab/EngagementOverview/EngagementOverview.tsx:206  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/EngagementTab/EngagementOverview/EngagementOverview.tsx:249  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/EngagementTab/EngagementOverview/EngagementOverview.tsx:290  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/EngagementTab/EngagementPlannerPreview/EngagementPlannerPreview.tsx:98  default: (default) -> extraLarge
  components/main/MainDashboard/MainDashboardTabs/EngagementTab/EngagementTabInsights/EngagementTabInsights.tsx:274  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/BusinessProfileCompleteness/BusinessProfileCompleteness.tsx:64  primary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/BusinessProfileCompleteness/BusinessProfileCompleteness.tsx:72  primary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/DirectoriesStatus/BusinessDirectories/BusinessDirectories.tsx:304  secondary: medium -> extraLarge
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/DirectoriesStatus/BusinessDirectories/BusinessDirectories.tsx:333  secondary: medium -> extraLarge
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/DirectoriesStatus/Facebook/Facebook.tsx:154  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/DirectoriesStatus/Facebook/Facebook.tsx:169  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/DirectoriesStatus/Facebook/Facebook.tsx:183  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/DirectoriesStatus/Facebook/Facebook.tsx:199  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/DirectoriesStatus/Facebook/Facebook.tsx:215  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/DirectoriesStatus/Facebook/Facebook.tsx:230  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/DirectoriesStatus/GBP/GBP.tsx:180  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/DirectoriesStatus/GBP/GBP.tsx:195  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/DirectoriesStatus/GBP/GBP.tsx:209  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/DirectoriesStatus/GBP/GBP.tsx:234  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/DirectoriesStatus/GBP/GBP.tsx:250  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/OnlinePresenceTab/DirectoriesStatus/GBP/GBP.tsx:265  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/SeoTab/GA4Row/ConnectYourGA4/ConnectYourGA4.tsx:58  primary: (default) -> extraLarge
  components/main/MainDashboard/MainDashboardTabs/WebReputationTab/LatestReview/LatestReview.tsx:41  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/WebReputationTab/ReviewsOverview/ReviewsOverview.tsx:191  secondary: small -> medium
  components/main/MainDashboard/MainDashboardTabs/WebReputationTab/ReviewsOverview/ReviewsOverview.tsx:232  secondary: small -> medium
  components/main/MainDashboard/NextRecommendedStep/DashboardStepperCard/DashboardStepperCard.tsx:107  primary: (default) -> extraLarge
  components/main/MainDashboard/_common/ReputationUpsellTrigger/ReputationUpsellTrigger.tsx:64  shimmer: (default) -> extraLarge
  components/main/MainDashboard/_common/SocialUpsellTrigger/SocialUpsellTrigger.tsx:48  primary: (default) -> extraLarge
  components/main/MainDashboard/_common/ViewInsightsBtn/ViewInsightsBtn.tsx:14  secondary: small -> medium
  components/partner/ImportUsers/ImportUsers.tsx:599  secondary: medium -> extraLarge
  components/partner/ImportUsers/ImportUsers.tsx:607  primary: medium -> extraLarge
  components/partner/ImportUsers/ImportUsers.tsx:784  primary: medium -> extraLarge
  components/partner/ImportUsers/ImportUsers.tsx:794  secondary: medium -> extraLarge
  components/partner/ImportUsers/ImportUsers.tsx:803  secondary: medium -> extraLarge
  components/partner/ImportUsers/ImportUsers.tsx:813  secondary: medium -> extraLarge
  components/partner/PartnerLayout/PartnerLayout.tsx:137  secondary: small -> medium
  components/partner/ResellerAccounts/ResellerAccountsBulkActionBar.tsx:37  secondary: small -> medium
  components/partner/UberallExport/UberallExportPage.tsx:176  secondary: (default) -> extraLarge
  components/partner/UberallExport/UberallExportPage.tsx:207  primary: (default) -> extraLarge
  components/partner/UberallExport/UberallExportPage.tsx:212  secondary: (default) -> extraLarge
  components/partner/UberallExport/UberallExportPage.tsx:220  secondary: (default) -> extraLarge
  components/presence/BusinessProfile/BusinessProfileBody/BusinessProfileBody.tsx:85  primary: medium -> extraLarge
  components/presence/BusinessProfile/BusinessProfileIncentives/BusinessProfileIncentives.tsx:27  primary: (default) -> extraLarge
  components/presence/Competitors/AddCompetitorDrawer/AddCompetitorDrawerFooter/AddCompetitorDrawerFooter.tsx:90  default: (default) -> extraLarge
  components/presence/Competitors/AddCompetitorDrawer/AddCompetitorDrawerFooter/AddCompetitorDrawerFooter.tsx:98  primary: (default) -> extraLarge
  components/presence/FineTuning/FineTuningAttributes/FineTuningCard/FineTuningCard.tsx:36  secondary: small -> medium
  components/presence/FineTuning/FineTuningServices/FineTuningServicesCard/FineTuningServicesCard.tsx:41  secondary: small -> medium
  components/presence/FineTuning/FineTuningServices/FineTuningServicesCard/FineTuningServicesItem/FineTuningServicesItem.tsx:94  default: small -> medium
  components/presence/FineTuning/FineTuningServices/FineTuningServicesModalAdd/FineTuningServicesModalAdd.tsx:162  default: small -> medium
  components/presence/FineTuning/FineTuningServices/FineTuningServicesModalAdd/FineTuningServicesModalItem/FineTuningServicesModalItem.tsx:76  secondary: small -> medium
  components/presence/FineTuning/FineTuningServices/FineTuningServicesModalAdd/FineTuningServicesModalItem/FineTuningServicesModalItem.tsx:92  secondary: small -> medium
  components/presence/GBP/BPSetup/BPVerificationMethods/BPNoVerificationMethods/BPNoVerificationMethods.tsx:47  primary: (default) -> extraLarge
  components/presence/GBP/BPSetup/BPVerificationMethods/BPNoVerificationMethods/BPNoVerificationMethods.tsx:68  primary: (default) -> extraLarge
  components/presence/GBP/ConnectGBPListingModal/ConnectGBPListingModal.tsx:123  default: small -> medium
  components/presence/GBP/ConnectGBPListingModal/ConnectGBPListingModal.tsx:171  primary: (default) -> extraLarge
  components/presence/GBP/_helpers/use-get-location-card-cta.tsx:101  primary: (default) -> extraLarge
  components/presence/GBP/_helpers/use-get-location-card-cta.tsx:142  secondary: (default) -> extraLarge
  components/presence/GBP/_helpers/use-get-location-card-cta.tsx:176  secondary: (default) -> extraLarge
  components/presence/GBP/_helpers/use-get-location-card-cta.tsx:210  primary: (default) -> extraLarge
  components/presence/GBP/_helpers/use-get-location-card-cta.tsx:231  primary: (default) -> extraLarge
  components/presence/ListingsAndPublishing/BusinessDirectoriesList/BusinessDirectoriesCard/BusinessDirectoriesCard.tsx:36  default: small -> medium
  components/presence/ListingsAndPublishing/BusinessDirectoriesList/BusinessDirectoriesCard/DirectoriesCardCollapsible/DirectoriesCardCollapsible.tsx:226  default: (default) -> extraLarge
  components/presence/ListingsAndPublishing/PublishingBoard/PublishingBoardFB/FBAndIGConnectedModal/FBAndIGConnectedModal.tsx:142  primary: (default) -> extraLarge
  components/presence/ListingsAndPublishing/PublishingBoard/_common/CTA/PublishingBoardCTA.tsx:29  secondary: (default) -> extraLarge
  components/presence/PresenceDashboard/PresenceDashboardBody/EngagementBox/EngagementBox.tsx:44  primary: (default) -> extraLarge
  components/presence/PresenceInsights/PresenceInsightsBody/PresenceKeywordsReport/PresenceKeywordsReport.tsx:229  secondary: medium -> extraLarge
  components/presence/PresenceInsights/PresenceInsightsBody/PresenceKeywordsReport/PresenceKeywordsReport.tsx:237  secondary: medium -> extraLarge
  components/presence/WebsiteBuilder/BuildingProgress/BuildStatusPanel/BuildStatusPanel.tsx:43  secondary: small -> medium
  components/presence/WebsiteBuilder/BuildingProgress/BuildStatusPanel/BuildStatusPanel.tsx:56  default: small -> medium
  components/presence/WebsiteBuilder/Onboarding/steps/FileUploadStep/FileUploadStep.tsx:62  shimmer: (default) -> extraLarge
  components/presence/WebsiteBuilder/Onboarding/steps/FileUploadStep/MediaContentGrid/MediaContentGrid.tsx:40  secondary: (default) -> extraLarge
  components/presence/WebsiteBuilder/Onboarding/steps/ImageAnalyzerStep/ImageReviewQuestion/ImageReviewQuestion.tsx:76  primary: (default) -> extraLarge
  components/presence/WebsiteBuilder/Preview/Preview.tsx:53  secondary: medium -> extraLarge
  components/presence/WebsiteBuilder/Preview/Preview.tsx:65  secondary: medium -> extraLarge
  components/presence/WebsiteBuilder/Preview/Preview.tsx:76  primary: medium -> extraLarge
  components/presence/WebsiteBuilder/Preview/PreviewEditInChat/PreviewEditInChat.tsx:29  primary: (default) -> extraLarge
  components/presence/WebsiteBuilder/ThemeManager/WebsiteLogoSection/WebsiteLogoSection.tsx:70  default: small -> medium
  components/presence/WebsiteBuilder/ThemeManager/WebsiteLogoSection/WebsiteLogoSection.tsx:82  default: small -> medium
  components/presence/WebsiteBuilder/ThemeManager/WebsiteThemeManagerPanel/WebsiteThemeManagerPanel.tsx:374  primary: (default) -> extraLarge
  components/presence/WebsiteBuilder/ThemeManager/WebsiteThemeManagerPanel/WebsiteThemeManagerPanel.tsx:383  default: (default) -> extraLarge
  components/presence/WebsiteBuilder/WebsiteActivityDrawer/WebsiteActivityFilters/WebsiteActivityFilters.tsx:77  default: small -> medium
  components/presence/WebsiteBuilder/WebsiteBuilderLanding/WebsiteBuilderLandingDashboard/WebsiteActivityList/WebsiteActivityList.tsx:85  default: small -> medium
  components/presence/WebsiteBuilder/WebsiteBuilderLanding/WebsiteBuilderLandingDashboard/WebsiteActivityList/WebsiteActivityList.tsx:99  default: (default) -> extraLarge
  components/presence/WebsiteBuilder/WebsiteBuilderLanding/WebsiteBuilderLandingDashboard/YourFiles/YourFiles.tsx:54  secondary: (default) -> extraLarge
  components/presence/WebsiteBuilder/WebsiteBuilderLanding/WebsiteBuilderLandingDashboard/YourFiles/YourFiles.tsx:57  shimmer: (default) -> extraLarge
  components/presence/WebsiteBuilder/WebsiteBuilderLanding/WebsiteBuilderLandingDashboard/YourWebsiteCard/YourWebsiteCard.tsx:256  primary: (default) -> extraLarge
  components/presence/WebsiteBuilder/WebsiteBuilderLanding/WebsiteBuilderLandingDashboard/YourWebsiteCard/YourWebsiteCard.tsx:268  primary: (default) -> extraLarge
  components/presence/WebsiteBuilder/WebsiteBuilderLanding/WebsiteBuilderLandingDashboard/YourWebsiteCard/YourWebsiteCard.tsx:282  primary: (default) -> extraLarge
  components/presence/WebsiteBuilder/WebsiteBuilderLanding/WebsiteBuilderLandingDashboard/YourWebsiteCard/YourWebsiteCard.tsx:294  primary: (default) -> extraLarge
  components/presence/WebsiteBuilder/WebsiteVersionsDrawer/WebsiteVersionsDrawer.tsx:158  secondary: small -> medium
  components/presence/WebsiteBuilder/_common/MediaLibraryCard/MediaLibraryCard.tsx:51  primary: medium -> extraLarge
  components/presence/WebsiteBuilder/_common/QuestionPrompt/QuestionPrompt.tsx:149  primary: (default) -> extraLarge
  components/presence/WebsiteBuilder/_common/WebsiteActivityRow/WebsiteActivityRow.tsx:128  default: small -> medium
  components/presence/WebsiteBuilder/_common/WebsiteActivityRow/WebsiteActivityRow.tsx:138  default: small -> medium
  components/presence/WebsiteBuilder/_common/WebsiteActivityRow/WebsiteActivityRow.tsx:165  default: small -> medium
  components/projects/AgentSetup/AgentSetupPage.tsx:148  primary: (default) -> extraLarge
  components/projects/AgentSetup/AgentSetupPage.tsx:151  secondary: (default) -> extraLarge
  components/projects/AgentSetup/AgentSetupProjectDetailsModal/_AgentSetupProjectDetailsModal.stories.tsx:57  primary: (default) -> extraLarge
  components/projects/ProjectsOverview/ProjectsOverviewPage.tsx:455  primary: (default) -> extraLarge
  components/projects/ProjectsOverview/_ProjectAddConfirmationModal.stories.tsx:45  primary: (default) -> extraLarge
  components/projects/ProjectsOverview/settings/ProjectEmailRecipientsEditor.tsx:103  secondary: small -> medium
  components/projects/ProjectsOverview/settings/ProjectNotificationSettingsTab.tsx:97  primary: (default) -> extraLarge
  components/projects/ProjectsOverview/settings/ProjectReportSettingsTab.tsx:268  secondary: (default) -> extraLarge
  components/projects/ProjectsOverview/settings/ProjectReportSettingsTab.tsx:276  secondary: (default) -> extraLarge
  components/projects/ProjectsOverview/settings/ProjectReportSettingsTab.tsx:286  secondary: (default) -> extraLarge
  components/projects/ProjectsOverview/settings/ProjectReportSettingsTab.tsx:295  primary: (default) -> extraLarge
  components/projects/ProjectsOverview/settings/ProjectTimeTrackingTab.tsx:132  secondary: small -> medium
  components/projects/ProjectsOverview/settings/ProjectTimeTrackingTab.tsx:140  primary: small -> medium
  components/public/Login/Login.tsx:57  primary: (default) -> extraLarge
  components/public/Login/Login.tsx:71  primary: (default) -> extraLarge
  components/public/Login/Login.tsx:81  primary: (default) -> extraLarge
  components/registration/AffiliateLandingPage/AffiliateContent/AffiliateContent.tsx:125  primary: (default) -> extraLarge
  components/registration/AffiliateLandingPage/AffiliateContent/AffiliateContent.tsx:142  primary: (default) -> extraLarge
  components/registration/AffiliateLandingPage/AffiliateFooter/AffiliateFooter.tsx:41  primary: (default) -> extraLarge
  components/registration/AffiliateLandingPage/AffiliateHeader/AffiliateHeader.tsx:85  secondary: (default) -> extraLarge
  components/registration/AffiliateLandingPage/AffiliateNav/AffiliateNav.tsx:17  default: (default) -> extraLarge
  components/registration/AffiliateLandingPage/AffiliateNav/AffiliateNav.tsx:20  primary: (default) -> extraLarge
  components/reputation/ReputationDashboard/ReputationDashboardBody/ReputationRatingAndReviews/ReputationRatingAndReviews.tsx:90  primary: (default) -> extraLarge
  components/reputation/ReputationDashboard/ReputationDashboardBody/ReputationReviewStatusReport/ReputationReviewStatusReport.tsx:173  primary: (default) -> extraLarge
  components/reputation/ReputationInsights/ReputationInsightsBody/ReputationAtGlanceReport/ReputationAtGlanceReport.tsx:206  primary: (default) -> extraLarge
  components/reputation/ReputationInsights/ReputationInsightsBody/ReputationAtGlanceReport/ReputationAtGlanceTable/ReputationAtGlanceTable.tsx:161  primary: (default) -> extraLarge
  components/reputation/ReputationInsights/ReputationInsightsBody/ReputationSummary/ReputationSummary.tsx:78  primary: (default) -> extraLarge
  components/reputation/ReputationMentions/ReputationMentionsSettings/ReputationMentionsSettingsAiSuggestions/ReputationMentionsSettingsAiSuggestions.tsx:86  primary: (default) -> extraLarge
  components/reputation/ReputationMentions/ReputationMentionsSettings/ReputationMentionsSettingsAiSuggestions/ReputationMentionsSettingsAiSuggestions.tsx:89  default: (default) -> extraLarge
  components/reputation/ReputationMentions/ReputationMentionsSettings/ReputationMentionsSettingsEdit/ReputationMentionsSettingsEdit.tsx:135  secondary: (default) -> extraLarge
  components/reputation/ReputationMentions/ReputationMentionsSettings/ReputationMentionsSettingsEdit/ReputationMentionsSettingsEdit.tsx:151  primary: (default) -> extraLarge
  components/reputation/ReputationMentions/ReputationMentionsSettings/ReputationMentionsSettingsEdit/ReputationMentionsSettingsEdit.tsx:159  secondary: (default) -> extraLarge
  components/reputation/ReputationMentions/ReputationMentionsSettings/ReputationMentionsSettingsList/ReputationMentionsSettingsList.tsx:94  primary: (default) -> extraLarge
  components/reputation/ReputationMentions/ReputationMentionsSettings/ReputationMentionsSettingsList/ReputationMentionsSettingsList.tsx:102  secondary: (default) -> extraLarge
  components/reputation/ReputationReviewBooster/ReputationReviewBoosterInvitationCard/ReputationReviewBoosterInvitationCard.tsx:79  primary: (default) -> extraLarge
  components/reputation/ReputationReviewBooster/ReputationReviewBoosterInvitationSummaryCard/ReputationReviewBoosterInvitationSummaryCard.tsx:60  primary: (default) -> extraLarge
  components/reputation/ReputationReviewBooster/ReputationReviewBoosterInvitationUpgradeCard/ReputationReviewBoosterInvitationUpgradeCard.tsx:44  primary: (default) -> extraLarge
  components/reputation/ReputationReviewBooster/ReputationReviewBoosterPrintMaterialsCard/ReputationReviewBoosterPrintMaterialsCard.tsx:33  default: (default) -> extraLarge
  components/reputation/ReputationReviewBooster/ReputationReviewBoosterPrintMaterialsUpgradeCard/ReputationReviewBoosterPrintMaterialsUpgradeCard.tsx:36  primary: (default) -> extraLarge
  components/reputation/ReputationReviewBooster/ReputationReviewBoosterShareReviewCard/ReputationReviewBoosterShareReviewCard.tsx:39  primary: (default) -> extraLarge
  components/reputation/ReputationReviewSources/ReputationReviewSources.tsx:62  secondary: small -> medium
  components/reputation/ReputationReviewSources/ReputationReviewSourcesList/ReputationReviewSourcesListItem/ReputationReviewSourcesListItem.tsx:114  default: small -> medium
  components/reputation/ReputationReviewSources/ReputationReviewSourcesSelectDrawer/ReputationReviewSourcesSelectDrawer.tsx:132  secondary: small -> medium
  components/reputation/ReputationReviewSources/ReputationReviewSourcesSelectDrawer/ReputationReviewSourcesSelectDrawer.tsx:157  primary: (default) -> extraLarge
  components/reputation/ReputationReviewSources/ReputationReviewSourcesSelectDrawer/ReputationReviewSourcesSelectDrawer.tsx:165  default: (default) -> extraLarge
  components/reputation/ReputationWidget/ReputationWidget.tsx:464  primary: (default) -> extraLarge
  components/reputation/ReputationWidget/ReputationWidget.tsx:833  primary: (default) -> extraLarge
  components/reputation/ReputationWidget/ReputationWidget.tsx:838  primary: (default) -> extraLarge
  components/reputation/ReputationWidget/empty-states/EmptyStateNotEnoughPositiveReviews/EmptyStateNotEnoughPositiveReviews.tsx:36  primary: (default) -> extraLarge
  components/reputation/ReviewWidget/ReviewWidget.tsx:424  primary: (default) -> extraLarge
  components/reputation/ReviewWidget/ReviewWidget.tsx:432  primary: (default) -> extraLarge
  components/reputation/ReviewWidget/ReviewWidget.tsx:678  primary: (default) -> extraLarge
  components/reputation/ReviewWidget/ReviewWidgetCarousel/ReviewWidgetCarouselControls/ReviewWidgetCarouselControls.tsx:29  default: small -> medium
  components/reputation/ReviewWidget/ReviewWidgetCarousel/ReviewWidgetCarouselControls/ReviewWidgetCarouselControls.tsx:37  default: small -> medium
  components/reputation/_common/EmptyStateAccountsNotConnected/EmptyStateAccountsNotConnected.tsx:26  primary: (default) -> extraLarge
  components/reputation/empty-states/ReputationEmptyStateAccountsNotConnected/ReputationEmptyStateAccountsNotConnected.tsx:42  primary: (default) -> extraLarge
  components/reputation/modals/ReputationReviewBoosterSendInvitationModal/ReputationReviewBoosterSendInvitationModalForm/ReputationReviewBoosterSendInvitationModalFormSettings/ReputationReviewBoosterSendInvitationModalFormSettings.tsx:100  secondary: small -> medium
  components/seo/BusinessSetup/steps/BusinessProjectSetup/BusinessLocationsList/BusinessLocationsList.tsx:124  secondary: (default) -> extraLarge
  components/seo/BusinessSetup/steps/BusinessProjectSetup/BusinessProjectSetup.tsx:361  secondary: small -> medium
  components/seo/BusinessSetup/steps/BusinessProjectSetup/BusinessProjectSetup.tsx:371  secondary: small -> medium
  components/seo/BusinessSetup/steps/BusinessProjectSetup/BusinessProjectSetup.tsx:396  secondary: (default) -> extraLarge
  components/seo/BusinessSetup/steps/BusinessProjectSetup/NoBusinessSuggestions/NoBusinessSuggestions.tsx:64  secondary: (default) -> extraLarge
  components/seo/BusinessSetup/steps/BusinessProjectSetup/NoBusinessSuggestions/NoBusinessSuggestions.tsx:86  secondary: (default) -> extraLarge
  components/seo/BusinessSetup/steps/BusinessProjectSetup/modals/TailorYourExperienceModal/TailorYourExperienceModal.tsx:26  default: (default) -> extraLarge
  components/seo/BusinessSetup/steps/BusinessSummary/BusinessSummaryBody/BSConnections/BSConnections.tsx:108  secondary: (default) -> extraLarge
  components/seo/BusinessSetup/steps/BusinessSummary/BusinessSummaryBody/BSConnections/BSConnections.tsx:123  secondary: (default) -> extraLarge
  components/seo/BusinessSetup/steps/BusinessSummary/BusinessSummaryBody/BSConnections/BSConnections.tsx:144  secondary: (default) -> extraLarge
  components/seo/BusinessSetup/steps/BusinessSummary/BusinessSummaryBody/_common/BSWidgetCard/BSWidgetCard.tsx:50  secondary: small -> medium
  components/seo/BusinessSetup/steps/BusinessSummary/BusinessSummaryBody/_common/BSWidgetCard/BSWidgetCard.tsx:72  secondary: small -> medium
  components/seo/GoogleAnalytics/GoogleAnalyticsDisconnected/GoogleAnalyticsDisconnected.tsx:67  primary: (default) -> extraLarge
  components/seo/Optimiser/OptimiserCard/OptimiserCard.tsx:37  primary: (default) -> extraLarge
  components/seo/Optimiser/OptimiserKeywordsSelect/OptimiserKeywordsSelect.tsx:50  default: small -> medium
  components/seo/Optimiser/OptimiserSetup/OptimiserSetup.tsx:173  secondary: small -> medium
  components/seo/Optimiser/OptimiserSetup/OptimiserSetup.tsx:201  default: (default) -> extraLarge
  components/seo/Optimiser/OptimiserSetup/OptimiserSetup.tsx:257  default: (default) -> extraLarge
  components/seo/Optimiser/OptimiserSetup/OptimiserSetupContent/OptimiserSetupContent.tsx:83  primary: (default) -> extraLarge
  components/seo/Optimiser/OptimiserSetup/OptimiserSetupContent/OptimiserSetupContent.tsx:128  primary: (default) -> extraLarge
  components/seo/Optimiser/OptimiserSetup/OptimiserSetupContent/OptimiserSetupContent.tsx:137  secondary: (default) -> extraLarge
  components/seo/Optimiser/OptimiserSetup/OptimiserSetupContentUrl/OptimiserSetupContentUrl.tsx:124  primary: (default) -> extraLarge
  components/seo/Optimiser/OptimiserSetup/OptimiserSetupHeader/OptimiserSetupHeader.tsx:42  default: small -> medium
  components/seo/Optimiser/OptimiserUrlInput/OptimiserUrlInput.tsx:81  primary: (default) -> extraLarge
  components/seo/VayuGoogleBusiness/VayuGoogleBusiness.tsx:128  primary: (default) -> extraLarge
  components/seo/VayuListingsAndPublishing/VayuListingsAndPublishingDirectories/VayuListingsAndPublishingDirectories.tsx:85  default: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/AgentPhoneAccess/AgentPhoneCallsDrawer/AgentPhoneCallsDrawer.tsx:133  default: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/AgentPhoneAccess/AgentPhoneCallsDrawer/AgentPhoneCallsDrawer.tsx:167  default: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/AgentPhoneSettingsTab/AgentPhoneNumberCard/AgentPhoneNumberCard.tsx:170  primary: medium -> extraLarge
  components/settings/AssistantSettings/AssistantSettingsPage/AgentPhoneSettingsTab/AgentPhoneNumberCard/AgentPhoneNumberCard.tsx:229  primary: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/AgentPhoneSettingsTab/RecentCallsCard/RecentCallsCard.tsx:132  default: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/AgentPhoneSettingsTab/RecentCallsCard/RecentCallsCard.tsx:145  default: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/AgentPhoneSettingsTab/SecurityPinCard/SecurityPinCard.tsx:82  secondary: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/AgentPhoneSettingsTab/SecurityPinCard/SecurityPinCard.tsx:112  default: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/AgentPhoneSettingsTab/SecurityPinCard/SecurityPinCard.tsx:122  default: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/AgentPhoneSettingsTab/SecurityPinCard/SecurityPinCard.tsx:126  default: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/AiMemories/AiMemoriesDrawer/AiMemoriesDrawer.tsx:238  secondary: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/Automations/AutomationsHeaderBand/AutomationsHeaderBand.tsx:34  primary: medium -> extraLarge
  components/settings/AssistantSettings/AssistantSettingsPage/Automations/ScheduleCard/ScheduleCard.tsx:332  primary: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/BudgetUsage/MonthlyBudgetCard/MonthlyBudgetCardView.tsx:97  primary: (default) -> extraLarge
  components/settings/AssistantSettings/AssistantSettingsPage/CallMeInTheApp/CallMeInTheApp.tsx:89  primary: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/Chronicle/ChronicleEntry/ChronicleEntry.tsx:186  default: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/ContactChannels/ContactChannelEmptyState/ContactChannelEmptyState.tsx:54  primary: medium -> extraLarge
  components/settings/AssistantSettings/AssistantSettingsPage/ContactChannels/ContactEmailAddressesCard/ContactEmailAddressesCard.tsx:232  secondary: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/ContactChannels/ContactPhoneNumbersCard/ContactPhoneNumbersCard.tsx:291  secondary: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/DrawerEmptyState/DrawerEmptyState.tsx:42  secondary: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/Mandates/MandateCard/MandateCard.tsx:215  primary: small -> medium
  components/settings/AssistantSettings/AssistantSettingsPage/Mandates/MandatesDrawer/MandatesDrawer.tsx:231  secondary: small -> medium
  components/settings/CompetitorsSettings/CompetitorsSettingsPage/CompetitorsSettingsPage.tsx:142  primary: (default) -> extraLarge
  components/settings/MediaLibrary/MediaGenerateModal/MediaGenerateModal.tsx:162  primary: (default) -> extraLarge
  components/settings/MediaLibrary/MediaItemModal/MediaItemActions/sessions/EnhanceActionSession.tsx:75  shimmer: (default) -> extraLarge
  components/settings/MediaLibrary/MediaLibraryPage/MediaLibraryGenerate/MediaLibraryGenerate.tsx:54  primary: (default) -> extraLarge
  components/settings/MediaLibrary/MediaLibraryPage/MediaLibraryItem/MediaLibraryItem.tsx:122  primary: (default) -> extraLarge
  components/settings/MediaLibrary/MediaLibraryPage/MediaLibraryPage.tsx:565  shimmer: (default) -> extraLarge
  components/settings/MediaLibrary/MediaLibraryPage/MediaLibraryPage.tsx:569  shimmer: (default) -> extraLarge
  components/settings/MediaLibrary/MediaLibraryPage/MediaLibraryPage.tsx:591  secondary: (default) -> extraLarge
  components/settings/MediaLibrary/MediaLibraryPage/MediaLibraryPage.tsx:594  primary: (default) -> extraLarge
  components/settings/MediaLibrary/MediaLibraryPage/MediaLibraryUpload/MediaLibraryUploadModal.tsx:316  secondary: (default) -> extraLarge
  components/settings/MediaLibrary/MediaLibraryPage/MediaLibraryUpload/MediaLibraryUploadModal.tsx:319  primary: (default) -> extraLarge
  components/settings/MediaLibrary/MediaLogoGenerateModal/MediaLogoGenerateModal.tsx:439  primary: (default) -> extraLarge
  components/settings/MediaLibrary/MediaLogoGenerateModal/MediaLogoGenerateModal.tsx:449  primary: (default) -> extraLarge
  components/settings/MediaLibrary/MediaLogoGenerateModal/MediaLogoGenerateModal.tsx:462  secondary: (default) -> extraLarge
  components/setup/AutoActivationSetupWait/AutoActivationSetupWaitModal.tsx:39  primary: (default) -> extraLarge
  components/social-migration-wizard/BusinessMigrationSetup/steps/BusinessReviewScheduledPosts/ScheduledPost/ConnectAccountTrigger/ConnectAccountTrigger.tsx:55  primary: small -> medium
  components/upselling-links/ConvertPartnerToDC/ConvertPartnerToDCFooter/ConvertPartnerToDCFooter.tsx:39  primary: (default) -> extraLarge
  components/upselling-links/ConvertPartnerToDC/ConvertPartnerToDCHeader/ConvertPartnerToDCHeader.tsx:196  primary: (default) -> extraLarge
  components/upselling-links/ConvertPartnerToDC/ConvertPartnerToDCHeader/ConvertPartnerToDCHeader.tsx:265  primary: (default) -> extraLarge
  components/upselling-links/ReactivateSubscription/ActivateSubscription/ActivateSubscriptionPricingBox/ActivateSubscriptionPricingBox.tsx:291  secondary: (default) -> extraLarge
  components/upselling-links/ReactivateSubscription/ReactivateSubscriptionDetails/ReactivateSubscriptionDetails.tsx:404  primary: (default) -> extraLarge
  components/upselling-links/UpsellingMonthlyYearlyLandingPage/ContentLandingPage/ContentLandingPage.tsx:180  primary: (default) -> extraLarge
  components/upselling-links/UpsellingMonthlyYearlyLandingPage/FooterLandingPage/FooterLandingPage.tsx:16  default: small -> medium
  components/upselling-links/UpsellingMonthlyYearlyLandingPage/NavBarLandingPage/NavBarLandingPage.tsx:15  default: small -> medium
  components/upsellings/LandingPage/models/CardBasedModel/CardBasedBenefits/CardBasedBenefits.tsx:516  primary: large -> extraLarge
  components/upsellings/LandingPage/models/CardBasedModel/CardBasedHeader/BundleModal/BundleModal.tsx:89  default: (default) -> extraLarge
  components/upsellings/LandingPage/models/CardBasedModel/CardBasedHeader/BundleModal/BundleModal.tsx:101  primary: (default) -> extraLarge
  components/upsellings/LandingPage/models/CardBasedModel/CardBasedHeader/UpsellingCard/UpsellingCard.tsx:210  primary: large -> extraLarge
  components/upsellings/LandingPage/models/PackageBasedModel/LandingPageNav/LandingPageNav.tsx:36  default: small -> medium
  components/upsellings/LandingPage/models/PackageBasedModel/UpsellingPackages/UpsellingPackage/UpsellingPackage.tsx:186  primary: medium -> extraLarge
  components/upsellings/LandingPage/models/PackageBasedModel/UpsellingPackages/UpsellingPackageModal/UpsellingPackageModal.tsx:38  primary: medium -> extraLarge
  components/upsellings/LandingPage/models/SpaceshipModel/SpaceshipUpsellCard/SpaceshipUpsellCard.tsx:95  primary: large -> extraLarge
  components/vision/VisionFeed/VisionFeed.tsx:76  primary: (default) -> extraLarge
  components/vision/VisionFeed/components/FeedFilterMenu/FeedFilterMenu.tsx:73  primary: (default) -> extraLarge
  components/vision/VisionFeed/components/FeedFilterMenu/FeedFilterMenu.tsx:82  default: (default) -> extraLarge
  components/wordpress/EditOnMap/EditOnMap.tsx:306  default: small -> medium
  components/wordpress/EditOnMap/EditOnMap.tsx:366  primary: (default) -> extraLarge
  components/wordpress/EditOnMap/EditOnMap.tsx:480  primary: (default) -> extraLarge

Check by hand (39): type or size computed at runtime, or spread props
  components/_common/BusinessListItemWithConnections/BusinessListItemWithConnections.tsx:58  type={btnType ?? ButtonTypes.primary}
  components/_common/HoverableCard/HoverableCard.tsx:143  spread props
  components/_common/LandingPage/CarouselSection/CarouselSection.tsx:45  type={cta.type ?? ButtonTypes.primary}
  components/_common/LandingPage/FeatureSection/FeatureSection.tsx:104  type={cta?.type ?? ButtonTypes.primary}
  components/_common/LandingPage/FinalCTA/FinalCTA.tsx:37  type={cta.type ?? ButtonTypes.primary}
  components/_common/LandingPage/Hero/Hero.tsx:47  type={resolvedButtonType}
  components/_common/LandingPage/StatsSection/StatsSection.tsx:26  type={cta.type ?? ButtonTypes.primary}
  components/_common/SectionMissing/SectionMissing.tsx:66  type={buttonType}
  components/admin/PartnerApiTester/PartnerApiTesterLoginForm.tsx:54  type={authScheme === "basic" ? ButtonTypes.primary : ButtonTypes.default}
  components/admin/PartnerApiTester/PartnerApiTesterLoginForm.tsx:61  type={authScheme === "basicOnly" ? ButtonTypes.primary : ButtonTypes.default}
  components/admin/PartnerApiTester/PartnerApiTesterLoginForm.tsx:68  type={authScheme === "admin" ? ButtonTypes.primary : ButtonTypes.default}
  components/admin/PartnerApiTester/PartnerApiTesterLoginForm.tsx:75  type={authScheme === "bearer" ? ButtonTypes.primary : ButtonTypes.default}
  components/admin/agent/ControlPanel/AgentControlPanel.tsx:199  type={topConversationsOrderBy === orderBy ? ButtonTypes.primary : ButtonTypes.muted}
  components/admin/agent/ControlPanel/AgentControlPanel.tsx:218  type={bucket === granularity ? ButtonTypes.primary : ButtonTypes.muted}
  components/admin/agent/ControlPanel/AgentControlPanel.tsx:229  type={days === rangeDays ? ButtonTypes.primary : ButtonTypes.muted}
  components/admin/agent/Schedules/AgentSchedulesList.tsx:744  type={dangerous ? ButtonTypes.default : ButtonTypes.primary}
  components/admin/website-builder/Templates/WebsiteTemplateExportButton.tsx:35  default, size={size}
  components/ado/AdoDashboard/measurements/DashboardMeasurements/DashboardMeasurements.tsx:35  type={group.id === groupId ? ButtonTypes.primary : ButtonTypes.muted}
  components/ado/AdoDashboardPage/WidgetSetControls/WidgetSetControls.tsx:28  type={selected === set.id ? ButtonTypes.primary : ButtonTypes.muted}
  components/ai-conversations/conversation/ConversationMessageInput/ConversationMessageInput.tsx:418  type={hasSendableContent && !isMessageTooLong && !sendDisabled ? ButtonTypes.shimmer : ButtonTypes.muted}
  components/ai-conversations/widgets/_shared/ConversationWidgetButton.tsx:8  spread props
  components/ai-extensions/AIExtensionsTrigger/AIExtensionsTrigger.tsx:135  spread props
  components/ai-visibility/AiVisibilityCustomQueries/AiVisibilityCustomQueries.tsx:110  type={hasSearched ? ButtonTypes.default : ButtonTypes.primary}
  components/ai-visibility/AiVisibilityOverview/AiVisibilityUpsellTriggerSmall/AiVisibilityUpsellTriggerSmall.tsx:50  secondary, size={isMobile ? ButtonSizes.medium : ButtonSizes.small}
  components/ga/_common/StatusInfo/StatusInfo.tsx:149  type={status === "ACTIVE" ? ButtonTypes.secondary : ButtonTypes.primary}
  components/presence/ListingsAndPublishing/PublishingBoard/_common/CTA/PublishingBoardCTA.tsx:21  spread props
  components/presence/WebsiteBuilder/ThemeManager/WebsiteThemeManagerPanel/WebsiteThemeManagerPanel.tsx:181  type={draft.mood === preset.key ? ButtonTypes.secondary : ButtonTypes.default}
  components/presence/WebsiteBuilder/WebsiteBuilderLanding/WebsiteBuilderLandingDashboard/WebsiteBuildProgressCard/WebsiteBuildProgressCard.tsx:127  type={awaitingInput ? ButtonTypes.primary : ButtonTypes.secondary}
  components/presence/WebsiteBuilder/WebsiteBuilderLanding/WebsiteBuilderLandingDashboard/YourWebsiteCard/YourWebsiteCard.tsx:407  type={primaryButton ? ButtonTypes.default : ButtonTypes.secondary}
  components/presence/WebsiteBuilder/_common/WebsiteLookReviewInvitation/WebsiteLookReviewInvitation.tsx:70  primary, size={size}
  components/presence/WebsiteBuilder/_common/WebsiteLookReviewInvitation/WebsiteLookReviewInvitation.tsx:80  default, size={size}
  components/presence/WebsiteBuilder/_common/WebsiteLookReviewInvitation/WebsiteLookReviewInvitation.tsx:90  default, size={size}
  components/presence/WebsiteBuilder/_common/WebsiteReleaseStateLine/WebsiteReleaseStateLine.tsx:94  type={primaryButtonType}
  components/presence/WebsiteBuilder/_common/WebsiteReleaseStateLine/WebsiteReleaseStateLine.tsx:108  default, size={compact ? ButtonSizes.small : undefined}
  components/presence/WebsiteBuilder/_common/WebsiteReleaseStateLine/WebsiteReleaseStateLine.tsx:120  default, size={compact ? ButtonSizes.small : undefined}
  components/presence/WebsiteBuilder/_common/WebsiteReleaseStateLine/WebsiteReleaseStateLine.tsx:132  type={primaryButtonType}
  components/settings/MediaLibrary/MediaItemModal/MediaItemActions/MediaItemActions.tsx:106  type={action.buttonType}
  components/settings/MediaLibrary/MediaLibraryPage/MediaLibraryUpload/MediaLibraryUpload.tsx:47  type={buttonType}
  components/settings/MediaLibrary/MediaPromptInput/MediaPromptInput.tsx:85  type={canSubmit ? ButtonTypes.shimmer : ButtonTypes.muted}
```
