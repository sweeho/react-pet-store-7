import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderApp } from "./shell-helpers";

const json = (body: unknown, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("site-shell", () => {
  // case: SWHR6-C-0295@v1
  it("SWHR6-C-0295 page content renders inside shared header, navigation and footer", () => {
    renderApp("/users");

    const header = screen.getByRole("banner");
    const footer = screen.getByRole("contentinfo");
    const main = screen.getByRole("main");
    const content = within(main).getByRole("heading", { level: 1, name: /users list/i });

    expect(within(header).getByRole("navigation", { name: "Global" })).toBeInTheDocument();
    expect(header.contains(content)).toBe(false);
    expect(footer.contains(content)).toBe(false);
    // content sits between the header and the footer in document order
    expect(header.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(content.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  // case: SWHR6-C-0296@v1
  it("SWHR6-C-0296 page with no data renders the shared empty frame", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => json([])),
    );

    renderApp("/shopping-cart");

    const frame = await screen.findByTestId("empty-frame");
    expect(within(screen.getByRole("main")).getByTestId("empty-frame")).toBe(frame);
    expect(screen.queryByTestId("error-frame")).not.toBeInTheDocument();
  });

  // case: SWHR6-C-0297@v1
  it("SWHR6-C-0297 page load failure renders the shared error frame with retry", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn<() => Promise<Response>>()
      .mockImplementationOnce(() => json({ error: "boom" }, 500))
      .mockImplementation(() => json([{ id: 1, name: "Rex" }]));
    vi.stubGlobal("fetch", fetchMock);

    renderApp("/catalog-browsing");

    const frame = await screen.findByTestId("error-frame");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await user.click(within(frame).getByRole("button", { name: /retry/i }));

    await waitFor(() => expect(screen.queryByTestId("error-frame")).not.toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.queryByTestId("empty-frame")).not.toBeInTheDocument();
  });
});
