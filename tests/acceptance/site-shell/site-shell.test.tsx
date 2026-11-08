import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { findShared } from "./shell-helpers";

const Layout = () => findShared(/layout/i);
const EmptyFrame = () => findShared(/empty/i);
const ErrorFrame = () => findShared(/error/i);

describe("site-shell", () => {
  // case: SWHR6-C-0295@v1
  it("SWHR6-C-0295 page content renders inside shared header, navigation and footer", () => {
    const AppLayout = Layout();
    render(
      <MemoryRouter>
        <AppLayout>
          <p data-testid="sample-page">Sample page content</p>
        </AppLayout>
      </MemoryRouter>,
    );

    const header = screen.getByRole("banner");
    const nav = screen.getAllByRole("navigation")[0];
    const footer = screen.getByRole("contentinfo");
    const content = screen.getByTestId("sample-page");

    expect(header).toBeInTheDocument();
    expect(nav).toBeInTheDocument();
    expect(footer).toBeInTheDocument();
    expect(header.contains(content)).toBe(false);
    expect(footer.contains(content)).toBe(false);
    const main = screen.getByRole("main");
    expect(within(main).getByTestId("sample-page")).toBe(content);
    // content sits between the header and the footer in document order
    expect(header.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(content.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  // case: SWHR6-C-0296@v1
  it("SWHR6-C-0296 page with no data renders the shared empty frame", async () => {
    const Empty = EmptyFrame();
    const loadItems = vi.fn().mockResolvedValue([] as string[]);

    const SamplePage = () => {
      const [items, setItems] = useState<string[] | null>(null);
      useEffect(() => {
        void loadItems().then(setItems);
      }, []);
      if (items === null) return <p>loading</p>;
      return items.length === 0 ? (
        <div data-testid="empty-slot">
          <Empty />
        </div>
      ) : (
        <ul data-testid="data">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      );
    };

    render(
      <MemoryRouter>
        <SamplePage />
      </MemoryRouter>,
    );

    const slot = await screen.findByTestId("empty-slot");
    expect(slot.textContent?.trim().length).toBeGreaterThan(0);
    expect(screen.queryByTestId("data")).not.toBeInTheDocument();
  });

  // case: SWHR6-C-0297@v1
  it("SWHR6-C-0297 page load failure renders the shared error frame with retry", async () => {
    const user = userEvent.setup();
    const Error_ = ErrorFrame();
    const load = vi
      .fn<() => Promise<string[]>>()
      .mockRejectedValueOnce(new Error("500"))
      .mockResolvedValue(["Rex"]);

    const SamplePage = () => {
      const [state, setState] = useState<"loading" | "error" | { items: string[] }>("loading");
      const run = () => {
        load().then(
          (items) => setState({ items }),
          () => setState("error"),
        );
      };
      useEffect(run, []);
      const retryLoad = () => {
        setState("loading");
        run();
      };
      if (state === "loading") return <p>loading</p>;
      if (state === "error")
        return <Error_ onRetry={retryLoad} retry={retryLoad} onReload={retryLoad} />;
      return (
        <ul data-testid="data">
          {state.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      );
    };

    render(
      <MemoryRouter>
        <SamplePage />
      </MemoryRouter>,
    );

    const retry = await screen.findByRole("button", { name: /retry|try again|reload/i });
    expect(load).toHaveBeenCalledTimes(1);

    await user.click(retry);

    await waitFor(() => expect(screen.getByTestId("data")).toBeInTheDocument());
    expect(screen.getByText("Rex")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /retry|try again|reload/i }),
    ).not.toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
  });
});
