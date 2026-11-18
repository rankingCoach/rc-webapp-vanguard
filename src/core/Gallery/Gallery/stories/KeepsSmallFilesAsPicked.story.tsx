import React, { useState } from "react";
import { expect } from "storybook/test";
import { Story } from "./_Gallery.default";
import { Gallery, MediaItemFile } from "../Gallery";

/** Files up to this size are kept as picked; larger ones go through the compressor. */
const KEEP_AS_PICKED_UP_TO_BYTES = 500 * 1024;

const formatKilobytes = (sizeInBytes?: number): string =>
  sizeInBytes === undefined ? "?" : `${Math.round(sizeInBytes / 1024)} KB`;

const GalleryThatKeepsSmallFilesAsPicked = () => {
  const [mediaItems, setMediaItems] = useState<MediaItemFile[]>([]);

  return (
    <div>
      <Gallery
        mediaItems={mediaItems}
        editMode={true}
        onChange={(_type, _modified, allMediaItems) => setMediaItems(allMediaItems)}
        placeholderConfig={{ text: "Add photos" }}
        config={{
          useCompressor: true,
          showFeedbackModal: false,
          // The app decides per picked file. `false` keeps the file byte for byte, metadata included.
          shouldCompress: (file) => file.size > KEEP_AS_PICKED_UP_TO_BYTES,
        }}
      />

      <p>Pick images below and above {formatKilobytes(KEEP_AS_PICKED_UP_TO_BYTES)} to see both outcomes.</p>

      <ul data-testid="gallery-keeps-small-files-results">
        {mediaItems.map((mediaItem) => (
          <li key={mediaItem.uuid}>
            {mediaItem.file instanceof File ? mediaItem.file.name : "image"}: picked{" "}
            {formatKilobytes(mediaItem.originalFile?.size)}, added {formatKilobytes(mediaItem.file?.size)},{" "}
            {mediaItem.file === mediaItem.originalFile ? "kept as picked" : "compressed"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const KeepsSmallFilesAsPicked: Story = {
  render: () => <GalleryThatKeepsSmallFilesAsPicked />,
  play: async () => {
    const galleryContainer = document.querySelector(".gallery-container");
    await expect(galleryContainer).toBeInTheDocument();
  },
};
