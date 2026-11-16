# Styled component preservation audit before Popover reruns

Read-only comparison completed before any new suite invocation, against installed Material7.3.11 and preserved isolated6.5.0 at /tmp/mui-upgrade/s3-bridge-peers/node_modules/@mui/material. Line numbers below refer to component/component.js in those packages. No frozen changes or additional migration fix identified beyond Tooltip.

| Migration boundary | Installed source evidence (6.5 → 7.3) | Disposition |
|---|---|---|
| Tooltip PopperComponent → slots.popper | 6.5 Tooltip:651 elementType TooltipPopper,676 as PopperComponentProp;7.3 Tooltip:44–145 styled variants,675 useSlot default, slots replaces it | Confirmed style loss. Remove custom slot, supply Vanguard/dark classes on default styled popper. No custom as/component or duplicated CSS. |
| Autocomplete PopperComponent / PaperComponent | 6.5 Autocomplete:556/562 useSlot Paper/Popper,707/710 outer styled AutocompletePopper/AutocompletePaper render as selected slots;7.3:612/618,789/792 same outer styled wrappers | Preserved: outer styled wrappers remain in both versions. N/A for lost default wrapper; selected inner Paper/Popper has same replacement behavior. |
| Accordion transition | 6.5 Accordion:177 legacy component enters slots.transition,209 default Collapse;7.3:185,214 same | N/A: legacy already selected transition slot; no additional styled transition wrapper replaced. Vanguard does not forward ignored transition aliases. |
| Menu / Popover transition | 6.5 Popover:289 legacy component enters slots.transition,299 default Grow;7.3:297,307 same | N/A: Grow is selected transition implementation; no styled ancestor lost. Menu passes transition into Popover. |
| Drawer transition | 6.5 Drawer:229 legacy component enters slots.transition,287 Slide;7.3:246,311 same | N/A: legacy and slots already select same transition boundary; no extra styled wrapper. |
| Backdrop transition | 6.5 Backdrop:78 legacy component selects transition,97 Fade;7.3:85,105 same | N/A for transition: same Fade replacement boundary. Styled BackdropRoot remains. |
| Snackbar transition | 6.5 Snackbar:178 legacy component selects transition,224 Grow;7.3:183,233 same | N/A: same transition boundary, no styled wrapper outside implementation. Stable compatibility adapter/context retains component, ref and events. |
| Menu paper/list | 6.5 Menu:166/173 MenuPaper/MenuMenuList and shouldForwardComponentProp true;7.3:170/177 and172/178 same | No component alias is changed to replacement slot by Vanguard here; mapped legacy PaperProps/MenuListProps are props. Styled defaults retained unless consumer explicitly supplied slots already. |
| Popover paper/root | 6.5 Popover:332/356 styled defaults,337/358 shouldForwardComponentProp true;7.3:340/364,345/366 same | Props mapping only. Explicit consumer slots retain pre-existing selection behavior. |
| Modal root/backdrop | 6.5 Modal:172 styled root,184 BackdropComponent selected as elementType;7.3:175/187 same | N/A: backdrop legacy already selected same default boundary; no new component alias migration in Vanguard Modal. |
| Drawer paper/backdrop | 6.5 Drawer:246/268 styled defaults;7.3:263/286 same | PaperProps/backdrop props converted to slotProps only; no replacement slot inserted, styled defaults remain. |
| TextField slots | 6.5 TextField:183–204 InputComponent/InputLabel/native input/FormHelperText/Select;7.3:189–210 same | Only legacy props converted to slotProps, no replacement components introduced. Input component remains chosen by variant. |
| Input/InputBase | 6.5 InputBase:502 as InputComponent;7.3:543 same; Input slots flow into InputBase with same styled root/input | No InputComponent → replacement slot conversion introduced. Required native/component props remain on existing styled input path. |
| Select | Select clones variant Input; MenuProps flows into existing Menu | No replacement styled slot introduced; nested Menu props conversion covered above. |

S3 core repairs used public heading div and callbacks/sx/transition adapter; no other legacy styled-default-to-replacement conversion found. Existing explicit consumer slots retain their original replacement semantics. No new production audit fix besides Popover is required by this source comparison.
