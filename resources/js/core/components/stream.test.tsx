import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fakeNode } from "@lattice-php/lattice/test-support";

const sendMock = vi.fn<(body: Record<string, unknown>) => void>();
const cancelMock = vi.fn<() => void>();
let hookState = { data: "", isFetching: false, isStreaming: false };

vi.mock("@laravel/stream-react", () => ({
  useStream: () => ({
    data: hookState.data,
    isFetching: hookState.isFetching,
    isStreaming: hookState.isStreaming,
    send: sendMock,
    cancel: cancelMock,
    id: "stream-1",
  }),
}));

import { StreamComponent } from "./stream";

afterEach(() => {
  sendMock.mockClear();
  cancelMock.mockClear();
  hookState = { data: "", isFetching: false, isStreaming: false };
});

describe("Stream component", () => {
  it("calls send on mount and renders streamed data when auto", () => {
    hookState = { data: "Streamed text", isFetching: false, isStreaming: false };

    render(
      <StreamComponent node={fakeNode({ type: "stream", props: { endpoint: "/x", auto: true } })}>
        {null}
      </StreamComponent>,
    );

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith({});
    expect(screen.getByText("Streamed text")).toBeVisible();
  });

  it("does not call send until the Start button is clicked when auto is false", () => {
    hookState = { data: "", isFetching: false, isStreaming: false };

    render(
      <StreamComponent
        node={fakeNode({
          type: "stream",
          props: { endpoint: "/x", auto: false, placeholder: "Nothing yet" },
        })}
      >
        {null}
      </StreamComponent>,
    );

    expect(screen.getByText("Nothing yet")).toBeVisible();
    expect(sendMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Start" }));

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith({});
  });

  it("renders the streamed output in the output region", () => {
    hookState = { data: "Hello world", isFetching: false, isStreaming: false };

    render(
      <StreamComponent node={fakeNode({ type: "stream", props: { endpoint: "/x", auto: false } })}>
        {null}
      </StreamComponent>,
    );

    expect(screen.getByText("Hello world")).toBeVisible();
  });

  it("shows a streaming status and a Stop button that cancels", () => {
    hookState = { data: "partial", isFetching: false, isStreaming: true };

    render(
      <StreamComponent node={fakeNode({ type: "stream", props: { endpoint: "/x", auto: false } })}>
        {null}
      </StreamComponent>,
    );

    expect(screen.getByText("Streaming…")).toBeVisible();
    expect(screen.getByRole("button", { name: "Regenerate" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));

    expect(cancelMock).toHaveBeenCalledTimes(1);
  });

  it("shows a connecting status with a Stop button while fetching", () => {
    hookState = { data: "", isFetching: true, isStreaming: false };

    render(
      <StreamComponent node={fakeNode({ type: "stream", props: { endpoint: "/x", auto: false } })}>
        {null}
      </StreamComponent>,
    );

    expect(screen.getByText("Connecting…")).toBeVisible();
    expect(screen.getByRole("button", { name: "Stop" })).toBeVisible();
  });

  it("labels the action Regenerate and reports Done once there is output", () => {
    hookState = { data: "result text", isFetching: false, isStreaming: false };

    render(
      <StreamComponent node={fakeNode({ type: "stream", props: { endpoint: "/x", auto: false } })}>
        {null}
      </StreamComponent>,
    );

    expect(screen.getByRole("button", { name: "Regenerate" })).toBeVisible();
    expect(screen.getByText("Done")).toBeVisible();
  });
});
