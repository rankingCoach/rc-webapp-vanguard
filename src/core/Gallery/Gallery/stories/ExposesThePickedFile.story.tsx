import React, { useState } from "react";
import { expect } from "storybook/test";
import { Story } from "./_Gallery.default";
import { Gallery, MediaItemFile } from "../Gallery";

const formatKilobytes = (sizeInBytes?: number): string =>
  sizeInBytes === undefined ? "?" : `${Math.round(sizeInBytes / 1024)} KB`;

const GalleryThatListsThePickedFiles = () => {
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
        }}
      />

      <p>
        Pick images to see both files of each item: <code>originalFile</code> is the file as picked,{" "}
        <code>file</code> is what the compressor made of it.
      </p>

      <ul data-testid="gallery-picked-files">
        {mediaItems.map((mediaItem) => (
          <li key={mediaItem.uuid}>
            {mediaItem.originalFile instanceof File ? mediaItem.originalFile.name : "image"}: picked{" "}
            {formatKilobytes(mediaItem.originalFile?.size)}, added {formatKilobytes(mediaItem.file?.size)},{" "}
            {mediaItem.file === mediaItem.originalFile ? "the compressor kept the picked file" : "compressed"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ExposesThePickedFile: Story = {
  render: () => <GalleryThatListsThePickedFiles />,
  play: async () => {
    const galleryContainer = document.querySelector(".gallery-container");
    await expect(galleryContainer).toBeInTheDocument();
  },
};
