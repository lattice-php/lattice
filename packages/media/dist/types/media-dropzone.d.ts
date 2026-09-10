import { RendererComponent } from '@lattice-php/core/types';
/**
 * Single-file, upload-only picker whose whole face is the file. The library
 * node it embeds only contributes the upload action and the accept list; a
 * pdf viewer template (when composed) previews documents and carries the
 * remove control in its toolbar.
 */
declare const MediaDropzoneComponent: RendererComponent<"field.media-dropzone">;
export default MediaDropzoneComponent;
