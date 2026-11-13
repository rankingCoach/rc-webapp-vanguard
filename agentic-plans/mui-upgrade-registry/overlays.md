# Registry: overlays group (Popover, PopoverPopper, PopoverModal, Menu, MenuItem, DropdownMenu, Drawer)

Files (all S0, under `src/core/`):
`Popover/_Popover.mui.spec.tsx`, `Popover/PopoverPopper/_PopoverPopper.mui.spec.tsx`, `PopoverModal/_PopoverModal.mui.spec.tsx`,
`Menu/_Menu.mui.spec.tsx`, `MenuItem/_MenuItem.mui.spec.tsx`, `DropdownMenu/_DropdownMenu.mui.spec.tsx`, `Drawer/_Drawer.mui.spec.tsx`,
`Popover/_PopoverMuiContract.stories.tsx`, `Menu/_MenuMuiContract.stories.tsx`, `Drawer/_DrawerMuiContract.stories.tsx`,
`PopoverModal/_PopoverModalMuiContract.stories.tsx`, `DropdownMenu/_DropdownMenuMuiContract.stories.tsx`.
Story test titles are the story `name` (tagged) or the de-camel-cased export name.

## A. Expected reds

An expected red is a diagnostic prediction, NOT permission to skip/xfail/delete/edit the test after the bump.

| file | test title | expected red at | production dependency (file:line) | observable contract | planned production fix to return it to green |
|---|---|---|---|---|---|
| Menu/_Menu.mui.spec.tsx | [v5-quirk] open: the backdrop element carries aria-hidden="true" | S5 core9 | none (MUI Backdrop default) | backdrop hidden from AT | pass `aria-hidden` explicitly via `slotProps.backdrop` in Menu.tsx, or approved contract change |
| Drawer/_Drawer.mui.spec.tsx | [v5-quirk] the backdrop element carries aria-hidden="true" | S5 core9 | none (MUI Backdrop default) | backdrop hidden from AT | pass `aria-hidden` via `slotProps.backdrop` in Drawer.tsx:77-82 (replacing `ModalProps.BackdropProps`), or approved contract change |
| PopoverModal/_PopoverModal.mui.spec.tsx | [v5-quirk] the backdrop element carries aria-hidden="true" | S5 core9 | none (MUI Backdrop default) | backdrop hidden from AT | add `aria-hidden` to the `<Backdrop>` Vanguard renders itself (PopoverModal.tsx:178), or approved contract change |
| Menu/_Menu.mui.spec.tsx | [v5-quirk] tabindex does NOT follow focus while arrowing (not roving) | S5 core9 | none | tab stop stays on initial item | approved contract change (adopt v9 roving tabindex, better a11y) |
| Menu/_MenuMuiContract.stories.tsx | [v5-quirk] tabindex does not follow focus while arrowing | S5 core9 | none | same, real browser | approved contract change (same as above) |
| Menu/_Menu.mui.spec.tsx | [v5-quirk] Enter: onClick receives the keydown event and no click reaches ancestors | S5 core9 | none (DropdownMenu.tsx:139 ignores the event) | keyboard activation event shape + propagation | approved contract change; first grep consumers for `event.type`/`stopPropagation` in onClick handlers |
| Menu/_Menu.mui.spec.tsx | [v5-quirk] Space: onClick receives the keyup event and no click reaches ancestors | S5 core9 | none | same | approved contract change (same) |
| MenuItem/_MenuItem.mui.spec.tsx | [v5-quirk] Enter: onClick receives the keydown KeyboardEvent; no click bubbles to ancestors | S5 core9 | none | same | approved contract change (same) |
| MenuItem/_MenuItem.mui.spec.tsx | [v5-quirk] Space: onClick receives the keyup KeyboardEvent; no click bubbles to ancestors | S5 core9 | none | same | approved contract change (same) |
| MenuItem/_MenuItem.mui.spec.tsx | [v5-quirk] disabled: a dispatched click still reaches onClick | S5 core9 | none | disabled item handler behaviour | approved contract change (v9 behaviour is the desired one) |
| MenuItem/_MenuItem.mui.spec.tsx | [v5-quirk] renders an <li role="menuitem" tabindex="-1"> without a Menu/MenuList and logs no error | S5 core9 (throws) | public export `src/index.ts:72` (consumers may render standalone) | standalone MenuItem renders | approved contract change (breaking for consumers, document in release notes); also the 9 existing `_MenuItem.stories.tsx` stories go red: give them a MenuList decorator |
| MenuItem/_MenuItem.mui.spec.tsx | [v5-quirk] click on a standalone item calls onClick with the click event | S5 core9 (throws) | same | same | same |
| Popover/_Popover.mui.spec.tsx | dark theme (default): popper has vanguard-popover + MuiTooltip-popper + MuiTooltip-popper-dark, arrow inside the surface | S5 core9 | Popover.tsx:129 `PopperComponent`, :132 `PopperProps.className`; PopoverPopper.tsx:18; PopoverPopper.scss:2/91 | themed tooltip styling hooks | move to `slots.popper` + `slotProps.popper` in Popover.tsx (possible already in S1) |
| Popover/_Popover.mui.spec.tsx | default theme: popper has no MuiTooltip-popper-dark class | S5 core9 | Popover.tsx:129/132 | same | same |
| Popover/_Popover.mui.spec.tsx | className (TooltipClasses) is forwarded as MUI `classes` to popper, tooltip and arrow | S5 core9 | Popover.tsx:129 (`vanguard-popover` via PopperComponent) | caller classes + vanguard class | same |
| Popover/_Popover.mui.spec.tsx | maxWidth is applied inline to both the popper and the tooltip surface | S5 core9 | Popover.tsx:135 `PopperProps.style`, :140 `componentsProps.tooltip` | maxWidth prop | `slotProps.popper.style` / `slotProps.tooltip.style` |
| Popover/_Popover.mui.spec.tsx | open registers a popover slot and applies its z-index to the popper; close releases it | S5 core9 | Popover.tsx:135 `PopperProps.style.zIndex` | stacking above modals | `slotProps.popper.style.zIndex` |
| Popover/_Popover.mui.spec.tsx | stacks above a modal that raised the stacking floor | S5 core9 | Popover.tsx:135 | same | same |
| Popover/_PopoverMuiContract.stories.tsx | Placement Top / Placement Bottom / Placement Left / Placement Right | S5 core9 | PopoverPopper.scss:32-82 (needs `vanguard-popover` on the popper) | 18px gap, arrow geometry/centring | `slots.popper` = PopoverPopper |
| Popover/_PopoverMuiContract.stories.tsx | Dark Theme Surface Styles / Default Theme Surface Styles / No Arrow | S5 core9 | PopoverPopper.scss:90-165, Popover.tsx:136 | surface colours, padding, radius | `slots.popper` + `slotProps.popper.className` |
| Popover/_PopoverMuiContract.stories.tsx | Non Interactive Pointer Events And Z Index | S5 core9 | Popover.tsx:135 | z-index above modals | `slotProps.popper.style.zIndex` |
| Popover (all Popover tests, type level only) | `tsc` on Popover.tsx: `@mui/material/Tooltip/tooltipClasses` deep import | S4 core7 (tsc, not vitest: the import is type-only and esbuild elides it) | Popover.tsx:4 | public type `PopoverProps.className` | import `TooltipClasses` from `@mui/material` (S1) |
| Menu/_Menu.mui.spec.tsx | legacy MenuListProps (v9 -> slotProps.list) reach the list | S5 core9 | public type: MenuProps extends MuiMenuProps (Menu.tsx:20) | legacy prop passthrough | Vanguard shim mapping `MenuListProps` -> `slotProps.list` in Menu.tsx, or approved public-API removal |
| Menu/_Menu.mui.spec.tsx | legacy PaperProps (v9 -> slotProps.paper) reach the paper when slotProps.paper is absent | S5 core9 | same | same | shim `PaperProps` -> `slotProps.paper`, or approved removal |
| Drawer/_Drawer.mui.spec.tsx | paper background-image is none (dark-theme elevation overlay dropped) | S5 core9 | Drawer.tsx:72 `PaperProps.sx` | dark-aware flat surface | `slotProps.paper.sx` |
| Drawer/_DrawerMuiContract.stories.tsx | Paper Surface And Backdrop Paint | S5 core9 | Drawer.tsx:72 | surface colour, no overlay | `slotProps.paper.sx` |
| Drawer/_Drawer.mui.spec.tsx | zIndex prop: applied inline on the Modal root (ModalProps.style) and via sx | S5 core9 if `ModalProps` is removed (UNVERIFIED) | Drawer.tsx:82 | DrawerRoot z-index | `slotProps.root.style` |
| Drawer/_Drawer.mui.spec.tsx | disableEnforceFocus: focus can leave the drawer and stays outside | S5 core9 if `ModalProps` is removed (UNVERIFIED) | Drawer.tsx:88 | inputs on higher overlays typable | pass `disableEnforceFocus` directly on Drawer (Modal prop) |
| Drawer/_DrawerMuiContract.stories.tsx | Focus Can Leave Drawer | S5 core9 if `ModalProps` removed (UNVERIFIED) | Drawer.tsx:88 | same | same |
| DropdownMenu/_DropdownMenuMuiContract.stories.tsx | [bug-lock] module .menu horizontal padding is overridden by MUI List padding 0 | S3 core6 / later, low confidence (CSS injection order / MUI List styles) | DropdownMenu.module.scss:7 | list padding | if it flips to 8px that is the intended SCSS: approved bug-lock retirement |

## B. Baseline characterization (`[bug-lock]` / `[v5-quirk]`)

| file | test title | tag | what it locks | why it is suspect |
|---|---|---|---|---|
| Popover/_Popover.mui.spec.tsx | [bug-lock] keyboard focus on the trigger does NOT open the tooltip | bug-lock | controlled `open` only toggled by mouseenter/leave | keyboard users never get the tooltip (a11y) |
| Popover/_Popover.mui.spec.tsx | [bug-lock] Escape does not close an open tooltip (no Escape handling while controlled) | bug-lock | Escape ignored | hover content must be dismissible (WCAG 1.4.13) |
| Popover/_Popover.mui.spec.tsx | [v5-quirk] touch start alone does not open the tooltip (open is controlled by mouseenter only) | v5-quirk | MUI touch listener bypassed | touch-only users never see it |
| Popover/_Popover.mui.spec.tsx | [v5-quirk] non-string title is ignored when message is a string | v5-quirk | `title` ReactNode dropped | type accepts ReactNode |
| Popover/_Popover.mui.spec.tsx | [v5-quirk] ReactNode message is rendered as-is and title is ignored | v5-quirk | title dropped with node message | silent prop loss |
| Popover/_Popover.mui.spec.tsx | [bug-lock] interactive: moving the pointer from the anchor onto the tooltip closes it | bug-lock | Vanguard onMouseLeave closes immediately | `interactive` is documented to let users hover the tooltip |
| Popover/_Popover.mui.spec.tsx | [bug-lock] a child's own onMouseEnter overrides Popover's opener -> tooltip never opens | bug-lock | MUI spreads children.props after Tooltip props (wrapChildren=false) | consumer handler silently disables the tooltip |
| PopoverModal/_PopoverModal.mui.spec.tsx | [bug-lock] isOpen=true without anchorEl renders nothing | bug-lock | `if (!anchorEl) return null` | `isOpen` ignored |
| PopoverModal/_PopoverModal.mui.spec.tsx | [bug-lock] isOpen=false with an anchorEl still renders the popper open | bug-lock | `open = isOpen \|\| Boolean(anchorEl)` | controlled prop not source of truth |
| PopoverModal/_PopoverModal.mui.spec.tsx | [bug-lock] after backdrop mousedown popper and backdrop disappear while the parent keeps isOpen=true | bug-lock | internal anchor cleared on close | parent state and UI diverge |
| PopoverModal/_PopoverModal.mui.spec.tsx | [v5-quirk] Escape does nothing (no keyboard close) | v5-quirk | no keyboard dismissal | modal-like surface without Escape |
| PopoverModal/_PopoverModal.mui.spec.tsx | [v5-quirk] the backdrop element carries aria-hidden="true" | v5-quirk | MUI v5 Backdrop default | removed in v9; Vanguard does not depend on it |
| Menu/_Menu.mui.spec.tsx | [v5-quirk] open: the backdrop element carries aria-hidden="true" | v5-quirk | MUI v5 Backdrop default | removed in v9 |
| Menu/_Menu.mui.spec.tsx | [bug-lock] caller className is dropped; only the module class is applied to the root | bug-lock | `className={styles.menu}` after `{...rest}` | public prop silently ignored |
| Menu/_Menu.mui.spec.tsx | [bug-lock] caller slotProps.paper.style replaces the size style (no merge) | bug-lock | spread order in Menu.tsx:52 | width/height props lost |
| Menu/_Menu.mui.spec.tsx | [v5-quirk] tabindex does NOT follow focus while arrowing (not roving) | v5-quirk | MUI v5 MenuList tabindex | v9 roving tabindex |
| Menu/_Menu.mui.spec.tsx | [v5-quirk] Enter: onClick receives the keydown event and no click reaches ancestors | v5-quirk | ButtonBase v5 keyboard activation | v9 dispatches a bubbling MouseEvent click |
| Menu/_Menu.mui.spec.tsx | [v5-quirk] Space: onClick receives the keyup event and no click reaches ancestors | v5-quirk | same | same |
| Menu/_MenuMuiContract.stories.tsx | [v5-quirk] tabindex does not follow focus while arrowing | v5-quirk | same as spec, real browser | v9 roving tabindex |
| MenuItem/_MenuItem.mui.spec.tsx | [v5-quirk] renders an <li role="menuitem" tabindex="-1"> without a Menu/MenuList and logs no error | v5-quirk | standalone MenuItem allowed | v9 throws |
| MenuItem/_MenuItem.mui.spec.tsx | [v5-quirk] click on a standalone item calls onClick with the click event | v5-quirk | same | same |
| MenuItem/_MenuItem.mui.spec.tsx | [v5-quirk] disabled: a dispatched click still reaches onClick | v5-quirk | ButtonBase keeps onClick on disabled non-native element | handler runs for a disabled item |
| MenuItem/_MenuItem.mui.spec.tsx | [v5-quirk] Enter: onClick receives the keydown KeyboardEvent; no click bubbles to ancestors | v5-quirk | ButtonBase v5 | v9 MouseEvent + bubbling |
| MenuItem/_MenuItem.mui.spec.tsx | [v5-quirk] Space: onClick receives the keyup KeyboardEvent; no click bubbles to ancestors | v5-quirk | same | same |
| DropdownMenu/_DropdownMenu.mui.spec.tsx | [bug-lock] after Escape focus is NOT returned to the anchor | bug-lock | no focus restore | focus lost to <body> (a11y) |
| DropdownMenu/_DropdownMenuMuiContract.stories.tsx | [bug-lock] focus is not returned to the anchor after close | bug-lock | same, real browser | same |
| DropdownMenu/_DropdownMenuMuiContract.stories.tsx | [bug-lock] module .menu horizontal padding is overridden by MUI List padding 0 | bug-lock | CSS order: MUI List `padding: 0` beats `.menu { padding: 8px }` | SCSS intent not applied |
| Drawer/_Drawer.mui.spec.tsx | [v5-quirk] the backdrop element carries aria-hidden="true" | v5-quirk | MUI v5 Backdrop default | removed in v9 |
| Drawer/_Drawer.mui.spec.tsx | [bug-lock] anchor=left / top / bottom -> inner wrapper has styles.left | bug-lock | `anchor === right ? styles.right : styles.left` | top/bottom drawers get side-panel layout |
| Drawer/_Drawer.mui.spec.tsx | [bug-lock] showCloseButton -> button calls onClose with the click event (not a ModalResponse) | bug-lock | `onClick={onClose}` | onClose contract is `ModalResponse` |
