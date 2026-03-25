import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders app chrome", () => {
  render(<App />);
  expect(screen.getByText(/Defect Management/i)).toBeInTheDocument();
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
});
