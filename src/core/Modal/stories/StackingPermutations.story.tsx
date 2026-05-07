import React from "react";
import { userEvent, within, expect, screen } from "storybook/test";
import { ModalService } from "@vanguard/Modal/ModalService";
import { Modal } from "@vanguard/Modal/Modal";
import { Button } from "@vanguard/Button/Button";
import { ModalHeader } from "@vanguard/Modal/Modalheader/ModalHeader";
import { ModalTransition } from "@vanguard/Modal/ModalRoot/ModalTransition/ModalTransition";
import { Story, closeAllModals } from "./_Modal.default";

type StackOpts = {
  animA: ModalTransition;
  animB: ModalTransition;
  fullA?: boolean;
  fullB?: boolean;
};

const label = (id: string, full: boolean) => `${full ? 'BIG' : 'Normal'} Modal ${id}`;

const StackModal = ({
  id,
  fullscreen,
  close,
  children,
}: {
  id: string;
  fullscreen?: boolean;
  close: () => void;
  children?: React.ReactNode;
}) => (
  <Modal fullscreen={fullscreen} minHeight={fullscreen ? undefined : '300px'}>
    <ModalHeader closeFn={close}>{label(id, !!fullscreen)}</ModalHeader>
    <div style={{ padding: "40px", fontSize: "32px" }}>
      <p>This is {fullscreen ? 'BIG fullscreen' : 'normal'} modal {id}</p>
      {children}
    </div>
  </Modal>
);

const renderOpener = ({ animA, animB, fullA = true, fullB = true }: StackOpts) => () => {
  const openB = () =>
    ModalService.open(<StackModal id={'B'} fullscreen={fullB} close={() => {}} />, {
      animation: animB,
      fullscreen: fullB,
    });

  const openA = () =>
    ModalService.open(
      <StackModal id={'A'} fullscreen={fullA} close={() => {}}>
        <Button onClick={openB}>{`Open Modal B (${animB})`}</Button>
      </StackModal>,
      { animation: animA, fullscreen: fullA },
    );

  return (
    <Button onClick={openA}>{`Open Modal A (${animA})`}</Button>
  );
};

const playAssertSecondOnTop = ({ animA, animB, fullA = true, fullB = true }: StackOpts) =>
  async ({ canvasElement }: any) => {
    const canvas = within(canvasElement);
    await closeAllModals();

    const labelA = label('A', fullA);
    const labelB = label('B', fullB);

    // Open A from canvas button
    await userEvent.click(canvas.getByRole('button', { name: new RegExp(`open modal a \\(${animA}\\)`, 'i') }));
    await expect(screen.getByText(labelA)).toBeInTheDocument();

    // Open B from a button rendered INSIDE Modal A
    await userEvent.click(screen.getByRole('button', { name: new RegExp(`open modal b \\(${animB}\\)`, 'i') }));

    // Wait for slowest animation (slide = 400ms)
    await new Promise((resolve) => setTimeout(resolve, 500));

    await expect(screen.getByText(labelA)).toBeInTheDocument();
    await expect(screen.getByText(labelB)).toBeInTheDocument();

    const modalB = screen.getByText(labelB).closest('.modalRoot') as HTMLElement;
    await expect(modalB).toBeTruthy();

    // Hit-test inside Modal B's bounding box (normal modals don't fill the viewport)
    const rect = modalB.getBoundingClientRect();
    const topEl = document.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    ) as HTMLElement | null;
    await expect(topEl).toBeTruthy();
    await expect(modalB.contains(topEl)).toBe(true);

    await closeAllModals();
  };

const makeStory = (opts: StackOpts): Story => ({
  args: {},
  render: renderOpener(opts),
  play: playAssertSecondOnTop(opts),
});

// Same-animation pairs
export const StackGrowGrow = makeStory({ animA: 'grow', animB: 'grow' });
export const StackSlideSlide = makeStory({ animA: 'slide', animB: 'slide' });
export const StackPopPop = makeStory({ animA: 'pop', animB: 'pop' });

// Cross-animation pairs
export const StackGrowSlide = makeStory({ animA: 'grow', animB: 'slide' });
export const StackSlideGrow = makeStory({ animA: 'slide', animB: 'grow' });
export const StackGrowPop = makeStory({ animA: 'grow', animB: 'pop' });
export const StackPopGrow = makeStory({ animA: 'pop', animB: 'grow' });
export const StackSlidePop = makeStory({ animA: 'slide', animB: 'pop' });
export const StackPopSlide = makeStory({ animA: 'pop', animB: 'slide' });

// Mixed fullscreen + normal stacking
export const StackFullscreenOverNormal = makeStory({ animA: 'grow', animB: 'grow', fullA: false, fullB: true });
export const StackNormalOverFullscreen = makeStory({ animA: 'grow', animB: 'grow', fullA: true, fullB: false });
export const StackFullscreenSlideOverNormalGrow = makeStory({ animA: 'grow', animB: 'slide', fullA: false, fullB: true });
export const StackNormalSlideOverFullscreenGrow = makeStory({ animA: 'grow', animB: 'slide', fullA: true, fullB: false });
export const StackNormalPopOverFullscreenSlide = makeStory({ animA: 'slide', animB: 'pop', fullA: true, fullB: false });
