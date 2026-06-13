import type { RendererComponent } from "@lattice-php/lattice/core/types";

export const FileUploadComponent: RendererComponent<"form.file-upload"> = ({ node }) => {
  return <div data-test="file-upload-placeholder">{node.props.name}</div>;
};
