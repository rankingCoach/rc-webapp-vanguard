# Menu

- Kind: component
- Import: `import { Menu } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/Menu/Menu.tsx`

> Internals pending rebuild: this component still renders MUI internally. Its DOM contract (data-slot parts) is not final yet; style it through the props and classes it documents.

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `BackdropComponent` | `React.ElementType<BackdropProps, keyof React.JSX.IntrinsicElements>` | no |  |
| `BackdropProps` | `Partial<BackdropProps>` | no |  |
| `children` | `React.ReactNode` | no |  |
| `components` | `{ Root?: React.ElementType<any, keyof React.JSX.IntrinsicElements>; Backdrop?: React.Eleme \| …` | no |  |
| `componentsProps` | `Pick<{ root?: SlotComponentProps<"div", ModalComponentsPropsOverrides, ModalOwnerState>; b \| …` | no |  |
| `disableEscapeKeyDown` | `boolean` | no |  |
| `height` | `Property.Height<string \| number>` | no |  |
| `items` | `MenuItemConfig[]` | no |  |
| `maxHeight` | `Property.MaxHeight<string \| number>` | no |  |
| `maxWidth` | `Property.MaxWidth<string \| number>` | no |  |
| `MenuListProps` | `Partial<MenuListProps>` | no |  |
| `PaperProps` | `Partial<PaperProps<React.ElementType<any, keyof React.JSX.IntrinsicElements>>>` | no |  |
| `testId` | `string` | no |  |
| `TransitionComponent` | `React.JSXElementConstructor<TransitionProps & { children: React.ReactElement<unknown, any> \| …` | no |  |
| `TransitionProps` | `TransitionProps` | no |  |
| `width` | `Property.Width<string \| number>` | no |  |

Also accepts: 32 MUI props, 277 React DOM attributes (not listed).
